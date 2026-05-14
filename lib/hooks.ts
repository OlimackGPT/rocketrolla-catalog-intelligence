'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RevenueRow } from './types';
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

const ROWS_KEY = 'rr_rows';
const MOMENTUM_KEY = 'rr_momentum';
const ARTISTS_KEY = 'rr_artists';

export function useCatalogData() {
  const [rows, setRows] = useState<RevenueRow[]>(mockRows);
  const [hasUserData, setHasUserData] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(ROWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRows(parsed);
          setHasUserData(true);
        }
      }
    } catch {}
  }, []);

  const metrics = useMemo(() => computeMetrics(rows), [rows]);
  const valuation = useMemo(() => buildValuation(metrics), [metrics]);

  return { rows, metrics, valuation, hasUserData, hydrated };
}

export function useMomentum() {
  const [momentum, setMomentum] = useState<MomentumInputs>(mockMomentum);
  const [usingMock, setUsingMock] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(MOMENTUM_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MomentumInputs;
        setMomentum({ ...defaultMomentum, ...parsed });
        setUsingMock(false);
      }
    } catch {}
  }, []);

  const update = useCallback((patch: Partial<MomentumInputs>) => {
    setMomentum((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(MOMENTUM_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setUsingMock(false);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(MOMENTUM_KEY);
    } catch {}
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
    try {
      const raw = localStorage.getItem(ARTISTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setArtists(parsed);
      }
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
        rows: catalog.rows,
        metrics: catalog.metrics,
        valuation: catalog.valuation,
        momentum: momentumState.momentum,
      }),
    [catalog.rows, catalog.metrics, catalog.valuation, momentumState.momentum],
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

  // Underwriting Brain — runs all methods and produces the blended range.
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
