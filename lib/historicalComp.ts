import { RevenueMetrics } from './types';
import { DealReadiness } from './dealReadiness';
import { MomentumSignals } from './momentum';

// Historical Earnings Floor — protects catalogs from being undervalued when
// recent NTM is depressed but historical revenue is meaningful.
//
// The comp multiple adapts from 1.2× (low quality, declining catalog, single
// track, weak rights) to 2.4× (clean rights, diversified platforms + territories,
// attention conversion, multiple revenue-driving tracks).
//
// This is calibrated so a $11.8k / ~24-month catalog with reasonable signals
// lands around $20k–$25k at the comp method — high enough to anchor a
// Duetti-style acquisition conversation without forcing every $11k catalog
// to become $22k.

export type HistoricalComp = {
  historicalRevenue: number;
  monthsCovered: number;
  qualityFactor: number; // 0..1, drives the multiple
  multipleLow: number;
  multipleBase: number;
  multipleHigh: number;
  range: { low: number; base: number; high: number };
  applicable: boolean; // false if not enough history to use this method
  notes: string[];
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function computeQualityFactor(input: {
  readiness: DealReadiness;
  signals: MomentumSignals;
  metrics: RevenueMetrics;
}): number {
  const { readiness, signals, metrics } = input;

  // Score each pillar 0..1.
  const concentration = clamp01(readiness.components.trackDiversification / 100);
  const platformDiversification = clamp01(readiness.components.platformDiversification / 100);
  const territoryDiversification = clamp01(readiness.components.territoryDiversification / 100);
  const consistency = clamp01(readiness.components.revenueConsistency / 100);
  const metadata = clamp01(readiness.components.metadataCompleteness / 100);
  const ownership = clamp01(readiness.components.ownershipClarity / 100);
  const recentGrowth = clamp01((readiness.components.recentGrowth + 30) / 130); // gentle bias toward neutral

  // Attention adds quality only when it converts or is meaningful.
  const attentionPillar = clamp01(
    (signals.streamingScore * 0.35 + signals.socialScore * 0.4 + signals.pipelineScore * 0.25) / 100,
  );
  const hasAttentionData = metrics.hasAttention ? 1 : 0.55;

  // Multiple revenue-driving tracks lift quality; one-track dependency drags it.
  const top = metrics.revenueByTrack[0]?.revenue ?? 0;
  const topShare = metrics.totalRevenue > 0 ? top / metrics.totalRevenue : 1;
  const multiTrack = clamp01(1 - (topShare - 0.25) * 1.5);

  // Weighted average. Tweaked so a clean, growing, attention-converting catalog
  // can hit ~0.95 while a single-track, no-attention catalog sits around 0.45.
  const raw =
    concentration * 0.10 +
    platformDiversification * 0.10 +
    territoryDiversification * 0.07 +
    consistency * 0.12 +
    metadata * 0.13 +
    ownership * 0.13 +
    recentGrowth * 0.10 +
    multiTrack * 0.10 +
    attentionPillar * 0.10 +
    hasAttentionData * 0.05;

  return Math.max(0.35, Math.min(1, raw));
}

export function buildHistoricalComp(input: {
  metrics: RevenueMetrics;
  readiness: DealReadiness;
  signals: MomentumSignals;
}): HistoricalComp {
  const { metrics } = input;
  const monthsCovered = metrics.monthlyRevenue.length;
  const historicalRevenue = metrics.totalRevenue;

  // Not enough history to anchor a comp.
  if (monthsCovered < 6 || historicalRevenue < 500) {
    return {
      historicalRevenue,
      monthsCovered,
      qualityFactor: 0,
      multipleLow: 0,
      multipleBase: 0,
      multipleHigh: 0,
      range: { low: 0, base: 0, high: 0 },
      applicable: false,
      notes: [
        monthsCovered < 6
          ? 'Catalog has fewer than 6 months of revenue history — historical comp method not yet applicable.'
          : 'Historical revenue is too small to anchor a comp method reliably.',
      ],
    };
  }

  const qualityFactor = computeQualityFactor(input);

  // Comp multiple band moves with quality.
  //   qualityFactor 0.35 → 1.2× / 1.4× / 1.6×
  //   qualityFactor 1.00 → 1.7× / 2.0× / 2.4×
  const multipleLow = 1.2 + qualityFactor * 0.5;
  const multipleBase = 1.4 + qualityFactor * 0.6;
  const multipleHigh = 1.6 + qualityFactor * 0.8;

  // Coverage-based confidence: less than 12 months gets a small discount,
  // more than 30 months saturates.
  const coverageFactor = Math.max(0.7, Math.min(1.1, monthsCovered / 24));

  const low = Math.round((historicalRevenue * multipleLow * coverageFactor) / 100) * 100;
  const base = Math.round((historicalRevenue * multipleBase * coverageFactor) / 100) * 100;
  const high = Math.round((historicalRevenue * multipleHigh * coverageFactor) / 100) * 100;

  const notes: string[] = [
    `Historical revenue across ${monthsCovered} months: $${Math.round(historicalRevenue).toLocaleString()}.`,
    `Quality factor ${(qualityFactor * 100).toFixed(0)}/100 — drives the comp multiple between ${multipleLow.toFixed(1)}× and ${multipleHigh.toFixed(1)}×.`,
    coverageFactor < 1
      ? 'Coverage discount applied (fewer than 24 months of history).'
      : 'Coverage is sufficient — no discount applied.',
  ];

  return {
    historicalRevenue,
    monthsCovered,
    qualityFactor,
    multipleLow,
    multipleBase,
    multipleHigh,
    range: { low, base, high },
    applicable: true,
    notes,
  };
}
