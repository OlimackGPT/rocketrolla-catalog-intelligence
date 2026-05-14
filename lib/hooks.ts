'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RevenueMetrics } from './types';
import { mockRows } from './mockData';
import { computeMetrics } from './csv';
import { buildValuation } from './valuation';
import { MomentumInputs, defaultMomentum, mockMomentum } from './momentum';
import { computeDealReadiness, recommendStrategy } from './dealReadiness';
import { buildPartnerMatrix } from './partnerMatrix';
import { computeTrackMomentum } from './trackMomentum';
import { buildAttentionValuation, computeTrackContributions } from './attentionValuation';
import { buildPartnerValuations } from './partnerModels';
import { buildForecastScenarios } from './forecasts';
import { buildUnderwriting } from './underwritingEngine';
import { buildUnderwritingMemo } from './underwritingMemo';
import { safeGetItem, safeRemoveItem } from './safeStorage';

// `rr_catalog` stores ONLY the aggregated catalog summary (RevenueMetrics).
// Raw parsed CSV rows are never persisted — they would blow past the
// localStorage quota on Vercel for large catalogs.
const CATALOG_KEY = 'rr_catalog';
// Legacy key from earlier versions that stored raw parsed rows.
const LEGACY_ROWS_KEY = 'rr_rows';
const MOMENTUM_KEY = 'rr_momentum';
const ARTISTS_KEY = 'rr_artists';

// Mock metrics, computed once at module load.
const MOCK_METRICS: RevenueMetrics = computeMetrics(mockRows);

type CatalogPayload = { metrics: RevenueMetrics };

function readPersistedCatalog(): RevenueMetrics | null {
  const raw = safeGetItem(CATALOG_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CatalogPayload;
    if (parsed && typeof parsed === 'object' && parsed.metrics) {
      return parsed.metrics;
    }
  } catch {}
  return null;
}

function migrateLegacyRowsIfAny(): RevenueMetrics | null {
  const legacy = safeGetItem(LEGACY_ROWS_KEY);
  if (!legacy) return null;
  try {
    const rows = JSON.parse(legacy);
    if (Array.isArray(rows) && rows.length > 0) {
      const m = computeMetrics(rows);
      // Best effort: drop the legacy key now that we have the summary.
      safeRemoveItem(LEGACY_ROWS_KEY);
      return m;
    }
  } catch {}
  // Corrupted legacy data — just remove it.
  safeRemoveItem(LEGACY_ROWS_KEY);
  return null;
}

export function useCatalogData() {
  const [metrics, setMetrics] = useState<RevenueMetrics>(MOCK_METRICS);
  const [hasUserData, setHasUserData] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const persisted = readPersistedCatalog();
    if (persisted) {
      setMetrics(persisted);
      setHasUserData(true);
      return;
    }
    const migrated = migrateLegacyRowsIfAny();
    if (migrated) {
      // Migration may have failed to write into the new key earlier — that's
      // fine; the in-memory metrics are still correct for this session.
      setMetrics(migrated);
      setHasUserData(true);
    }
  }, []);

  const valuation = useMemo(() => buildValuation(metrics), [metrics]);

  return { metrics, valuation, hasUserData, hydrated, setMetrics, setHasUserData };
}

export function useMomentum() {
  const [momentum, setMomentum] = useState<MomentumInputs>(mockMomentum);
  const [usingMock, setUsingMock] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const raw = safeGetItem(MOMENTUM_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as MomentumInputs;
      setMomentum({ ...defaultMomentum, ...parsed });
      setUsingMock(false);
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<MomentumInputs>) => {
    setMomentum((prev) => {
      const next = { ...prev, ...patch };
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(MOMENTUM_KEY, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
    setUsingMock(false);
  }, []);

  const reset = useCallback(() => {
    safeRemoveItem(MOMENTUM_KEY);
    setMomentum(mockMomentum);
    setUsingMock(true);
  }, []);

  return { momentum, update, reset, usingMock, hydrated };
}

export type Artist = {
  id: number;
  name: string;
  genre: string;
  label: string;
  createdAt: string;
};

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const raw = safeGetItem(ARTISTS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setArtists(parsed);
    } catch {}
  }, []);

  return { artists, hydrated };
}

export function useDealAnalysis() {
  const catalog = useCatalogData();
  const momentumState = useMomentum();

  const trackMomentum = useMemo(() => computeTrackMomentum(catalog.metrics), [catalog.metrics]);

  const readiness = useMemo(
    () =>
      computeDealReadiness({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        momentum: momentumState.momentum,
      }),
    [catalog.metrics, catalog.valuation, momentumState.momentum],
  );

  const strategy = useMemo(
    () =>
      recommendStrategy({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        momentum: momentumState.momentum,
        readiness,
      }),
    [catalog.metrics, catalog.valuation, momentumState.momentum, readiness],
  );

  const attentionVal = useMemo(
    () =>
      buildAttentionValuation({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        readiness,
        trackMomentum,
      }),
    [catalog.metrics, catalog.valuation, readiness, trackMomentum],
  );

  const underwriting = useMemo(
    () =>
      buildUnderwriting({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        readiness,
        momentum: momentumState.momentum,
        trackMomentum,
        attentionVal,
      }),
    [
      catalog.metrics,
      catalog.valuation,
      readiness,
      momentumState.momentum,
      trackMomentum,
      attentionVal,
    ],
  );

  const partnerValuations = useMemo(
    () =>
      buildPartnerValuations({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        readiness,
        attentionVal,
        trackMomentum,
        underwriting,
      }),
    [catalog.metrics, catalog.valuation, readiness, attentionVal, trackMomentum, underwriting],
  );

  const partners = useMemo(() => buildPartnerMatrix(partnerValuations), [partnerValuations]);

  const trackContributions = useMemo(
    () =>
      computeTrackContributions({
        trackMomentum,
        attentionVal,
        totalBase: attentionVal.final.base,
        totalRevenue: catalog.metrics.totalRevenue,
      }),
    [trackMomentum, attentionVal, catalog.metrics.totalRevenue],
  );

  const forecasts = useMemo(
    () =>
      buildForecastScenarios({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        attentionVal,
        readiness,
      }),
    [catalog.metrics, catalog.valuation, attentionVal, readiness],
  );

  const memo = useMemo(
    () =>
      buildUnderwritingMemo({
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        readiness,
        strategy,
        underwriting,
        topPartner: partnerValuations[0],
      }),
    [catalog.metrics, catalog.valuation, readiness, strategy, underwriting, partnerValuations],
  );

  return {
    ...catalog,
    momentum: momentumState,
    readiness,
    strategy,
    trackMomentum,
    attentionVal,
    underwriting,
    partnerValuations,
    partners,
    trackContributions,
    forecasts,
    memo,
  };
}
