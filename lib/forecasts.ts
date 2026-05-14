import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';
import { AttentionAdjustedValuation } from './attentionValuation';
import { DealReadiness } from './dealReadiness';

export type ForecastScenarioId =
  | 'current-run-rate'
  | 'growth-adjusted'
  | 'attention-conversion'
  | 'conservative-downside';

export type ForecastScenario = {
  id: ForecastScenarioId;
  name: string;
  description: string;
  projected12mRevenue: number;
  valuationLow: number;
  valuationHigh: number;
  confidence: number;
  assumptions: string[];
};

const round = (n: number) => Math.max(0, Math.round(n / 100) * 100);
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function buildForecastScenarios(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  attentionVal: AttentionAdjustedValuation;
  readiness: DealReadiness;
}): ForecastScenario[] {
  const { metrics, valuation, attentionVal, readiness } = input;

  // 1) Current Run Rate — last 3-mo avg × 12, multiples 3×/8×.
  const runRate12 = metrics.runRate * 12;
  const current: ForecastScenario = {
    id: 'current-run-rate',
    name: 'Current Run Rate',
    description:
      'Last 90 days flat-lined for the next 12 months. No growth, no decline, no attention conversion.',
    projected12mRevenue: round(runRate12),
    valuationLow: round(runRate12 * 3),
    valuationHigh: round(runRate12 * 8),
    confidence: clamp(valuation.confidence),
    assumptions: [
      'Streaming, sync, and platform mix stay flat.',
      'No upcoming releases or campaigns considered.',
      'Useful as a defensible floor in negotiation.',
    ],
  };

  // 2) Growth-Adjusted — modulate by recent growth signal.
  const growthRatio = metrics.last6Months > 0 ? metrics.last3Months / (metrics.last6Months / 2) : 1;
  const growthAdjusted12 = runRate12 * Math.min(1.8, Math.max(0.6, growthRatio));
  const growth: ForecastScenario = {
    id: 'growth-adjusted',
    name: 'Growth-Adjusted',
    description:
      'Projects forward at the observed 90-day trajectory. Captures momentum but does not assume new releases.',
    projected12mRevenue: round(growthAdjusted12),
    valuationLow: round(growthAdjusted12 * 3.5),
    valuationHigh: round(growthAdjusted12 * 7),
    confidence: clamp(valuation.confidence * 0.95),
    assumptions: [
      `Observed L3M / prior-3M ratio: ${growthRatio.toFixed(2)}× (capped 0.6–1.8).`,
      'No assumption of viral attention conversion.',
      'Confidence discounted slightly to reflect trajectory uncertainty.',
    ],
  };

  // 3) Attention Conversion — credits a fraction of attention upside converting.
  const conversionFactor = attentionVal.flags.attentionLiftsConfidence ? 0.35 : 0.18;
  const attentionRevenueLift = attentionVal.attentionUpside.raw * conversionFactor * 0.5;
  const attentionAdj12 = growthAdjusted12 + attentionRevenueLift;
  const attentionScenario: ForecastScenario = {
    id: 'attention-conversion',
    name: 'Attention Conversion',
    description:
      'What if a fraction of current TikTok / Reels / YouTube / Shazam attention converts into streaming or sync revenue?',
    projected12mRevenue: round(attentionAdj12),
    valuationLow: round(attentionAdj12 * 4),
    valuationHigh: round(attentionAdj12 * 8.5),
    confidence: clamp(valuation.confidence * (attentionVal.flags.attentionLiftsConfidence ? 1 : 0.85)),
    assumptions: [
      `Assumes ${Math.round(conversionFactor * 100)}% of attention upside converts to revenue over the next 12 months.`,
      'Per-attention coefficients are log-scaled and capped — not literal CPM math.',
      'Confidence is lifted only when attention is already converting today.',
    ],
  };

  // 4) Conservative Downside — penalizes for risk signals.
  const downsideFactor = 0.65 - Math.max(0, (60 - readiness.components.revenueConsistency) / 200);
  const downside12 = runRate12 * Math.max(0.4, downsideFactor);
  const downside: ForecastScenario = {
    id: 'conservative-downside',
    name: 'Conservative Downside',
    description:
      'Models a soft decline plus a single concentration / metadata shock. Useful for stress-testing partner offers.',
    projected12mRevenue: round(downside12),
    valuationLow: round(downside12 * 2.5),
    valuationHigh: round(downside12 * 5),
    confidence: clamp(Math.max(30, valuation.confidence - 20)),
    assumptions: [
      'Assumes a ~35% revenue compression from a single risk (lead-track fade, metadata block, or platform shift).',
      'Useful as a worst-case floor when negotiating against an aggressive partner offer.',
      'Always present alongside the base case — never on its own.',
    ],
  };

  return [current, growth, attentionScenario, downside];
}
