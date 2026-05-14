import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';
import { DealReadiness } from './dealReadiness';
import { MomentumInputs, computeMomentumSignals } from './momentum';
import { TrackMomentum } from './trackMomentum';
import { AttentionAdjustedValuation } from './attentionValuation';
import { buildHistoricalComp, HistoricalComp } from './historicalComp';

// The Underwriting Engine produces a blended, multi-method valuation that
// reflects how a real partner thinks: not a single multiple, but several
// lenses (revenue floor, historical comp, reliable annualized, momentum,
// track-level upside) reconciled through risk discounts and capped
// strategic premiums.

export type ValueRange = { low: number; base: number; high: number };

export type RiskDiscount = { name: string; pct: number; detail: string };
export type StrategicPremium = { name: string; pct: number; detail: string };

export type UnderwritingResult = {
  // Each lens as a range.
  methods: {
    revenueOnlyFloor: ValueRange;
    historicalComp: HistoricalComp;
    reliableAnnualized: ValueRange;
    momentumAdjusted: ValueRange;
    trackLevelUpside: ValueRange;
  };
  // Discounts + premiums that shape the final range.
  riskDiscounts: RiskDiscount[];
  strategicPremiums: StrategicPremium[];
  totalRiskDiscountPct: number; // capped
  totalStrategicPremiumPct: number; // capped
  // Final risk-adjusted range and ask.
  finalRange: ValueRange;
  suggestedAsk: number;
  confidence: number;
  // Narrative explanations.
  whyHigherThanNtm: string[];
  whatCouldReduce: string[];
  methodAgreement: number; // 0..1 — high when methods cluster
  qualityFactor: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round100 = (n: number) => Math.round(Math.max(0, n) / 100) * 100;
const round1 = (n: number) => Math.round(n * 100) / 100;

export function buildUnderwriting(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  readiness: DealReadiness;
  momentum: MomentumInputs;
  trackMomentum: TrackMomentum[];
  attentionVal: AttentionAdjustedValuation;
}): UnderwritingResult {
  const { metrics, valuation, readiness, momentum, trackMomentum, attentionVal } = input;
  const signals = computeMomentumSignals(momentum);

  // --- METHOD A: Revenue-only floor (NTM multiples, capped to defensible) ---
  const revenueOnlyFloor: ValueRange = {
    low: round100(valuation.conservative),
    base: round100(valuation.base),
    // Aggressive ceiling is capped to a more defensible 6.5× rather than the
    // 8× headline used elsewhere — this prevents NTM from creating fantasy
    // valuations when the catalog has no other supporting signals.
    high: round100(valuation.base * 1.3),
  };

  // --- METHOD B: Historical earnings comp ---
  const historicalComp = buildHistoricalComp({ metrics, readiness, signals });

  // --- METHOD C: Reliable annualized earnings ---
  // Smooth recent revenue across L3M, L6M, L12M with consistency weighting.
  const l3 = metrics.last3Months / Math.max(1, Math.min(3, metrics.monthlyRevenue.length));
  const l6 = metrics.last6Months / Math.max(1, Math.min(6, metrics.monthlyRevenue.length));
  const l12 = metrics.last12Months / Math.max(1, Math.min(12, metrics.monthlyRevenue.length));
  const smoothedMonthly = l3 * 0.5 + l6 * 0.3 + l12 * 0.2;
  const stability = clamp(readiness.components.revenueConsistency / 100, 0.5, 1);
  const reliableAnnual = smoothedMonthly * 12 * stability;
  const reliableAnnualized: ValueRange = {
    low: round100(reliableAnnual * 2.5),
    base: round100(reliableAnnual * 3.5),
    high: round100(reliableAnnual * 5.0),
  };

  // --- METHOD D: Momentum-adjusted ---
  // Reuses the attention-adjusted layer as the base, but applies a stricter
  // upside cap when attention is unsupported by revenue conversion.
  const momentumAdjusted: ValueRange = {
    low: round100(attentionVal.final.conservative),
    base: round100(attentionVal.final.base),
    high: round100(attentionVal.final.aggressive),
  };

  // --- METHOD E: Track-level asset value ---
  // Sum of per-track contributions: revenue × track multiplier + attention value.
  const trackBaseMultiplier = 4.0; // anchored against base revenue valuation
  const trackHighMultiplier = 6.0;
  const trackLowMultiplier = 2.5;
  let trackLow = 0;
  let trackBase = 0;
  let trackHigh = 0;
  trackMomentum.forEach((tm) => {
    const isAnchor = tm.tags.includes('Catalog Anchor') || tm.tags.includes('Revenue Driver');
    const isAttention = tm.tags.includes('Attention Driver') || tm.tags.includes('Under-Monetized Asset');
    const revLow = tm.revenue * trackLowMultiplier;
    const revBase = tm.revenue * trackBaseMultiplier * (isAnchor ? 1.2 : 1);
    const revHigh = tm.revenue * trackHighMultiplier * (isAnchor ? 1.3 : 1);
    const attentionContribution =
      attentionVal.attentionUpside.perTrack.find((p) => p.track === tm.track)?.value ?? 0;
    const attLow = attentionContribution * (isAttention ? 0.4 : 0.15);
    const attBase = attentionContribution * (isAttention ? 0.7 : 0.3);
    const attHigh = attentionContribution * (isAttention ? 1.1 : 0.5);
    trackLow += revLow + attLow;
    trackBase += revBase + attBase;
    trackHigh += revHigh + attHigh;
  });
  const trackLevelUpside: ValueRange = {
    low: round100(trackLow),
    base: round100(trackBase),
    high: round100(trackHigh),
  };

  // --- Risk Discount Layer ---
  const riskDiscounts: RiskDiscount[] = [];
  if (readiness.components.trackDiversification < 45) {
    riskDiscounts.push({
      name: 'Concentration risk',
      pct: 8,
      detail: 'Top track represents a large share of revenue — buyers price single-asset risk.',
    });
  }
  if (readiness.components.metadataCompleteness < 60) {
    riskDiscounts.push({
      name: 'Metadata gaps',
      pct: 6,
      detail: 'Missing ISRC, artist tags, or split sheets will slow diligence and compress the offer.',
    });
  }
  if (readiness.components.ownershipClarity < 60) {
    riskDiscounts.push({
      name: 'Unclear ownership',
      pct: 7,
      detail: 'Splits or sample clearances not yet documented.',
    });
  }
  if (readiness.components.platformDiversification < 50) {
    riskDiscounts.push({
      name: 'Platform overdependence',
      pct: 4,
      detail: 'Revenue concentrated on a single DSP increases volatility risk.',
    });
  }
  if (readiness.components.territoryDiversification < 45) {
    riskDiscounts.push({
      name: 'Territory overdependence',
      pct: 3,
      detail: 'One country drives the majority of revenue — narrows the buyer universe.',
    });
  }
  if (readiness.components.recentGrowth < 40) {
    riskDiscounts.push({
      name: 'Declining trajectory',
      pct: 6,
      detail: 'Last 90 days underperforms the prior period — terms tighten when growth is negative.',
    });
  }
  if (metrics.monthlyRevenue.length < 6) {
    riskDiscounts.push({
      name: 'Limited history',
      pct: 5,
      detail: 'Fewer than 6 months of data makes any projection directional.',
    });
  }
  if (valuation.confidence < 55) {
    riskDiscounts.push({
      name: 'Low data confidence',
      pct: 4,
      detail: 'Valuation confidence is below the acceptable underwriting threshold.',
    });
  }
  if (!metrics.hasAttention) {
    riskDiscounts.push({
      name: 'No attention proof',
      pct: 3,
      detail: 'Without attention columns, momentum-driven upside cannot be defended.',
    });
  }

  // --- Strategic Premium Layer (capped) ---
  const strategicPremiums: StrategicPremium[] = [];
  if (signals.socialScore >= 60 && attentionVal.flags.attentionLiftsConfidence) {
    strategicPremiums.push({
      name: 'Converting social momentum',
      pct: 7,
      detail: 'Strong social signal that is already converting into revenue — partners pay for this.',
    });
  } else if (signals.socialScore >= 60) {
    strategicPremiums.push({
      name: 'Strong social momentum',
      pct: 4,
      detail: 'Social signal is real but conversion to revenue is still unproven.',
    });
  }
  if (readiness.components.syncReadiness >= 65) {
    strategicPremiums.push({
      name: 'Sync-ready catalog',
      pct: 5,
      detail: 'Catalog has stems-ready / instrumental tracks suitable for sync placements.',
    });
  }
  if (signals.pipelineScore >= 50) {
    strategicPremiums.push({
      name: 'Forward release pipeline',
      pct: 3,
      detail: 'Confirmed upcoming releases or collaborations improve forward visibility.',
    });
  }
  if (metrics.revenueByPlatform.length >= 4 && readiness.components.platformDiversification >= 70) {
    strategicPremiums.push({
      name: 'Healthy DSP spread',
      pct: 2,
      detail: 'Revenue spans 4+ DSPs with no single-platform overdependence.',
    });
  }
  if (
    trackMomentum.filter((t) => t.tags.includes('Revenue Driver') || t.tags.includes('Catalog Anchor'))
      .length >= 2
  ) {
    strategicPremiums.push({
      name: 'Multiple revenue drivers',
      pct: 3,
      detail: 'At least two tracks anchor the catalog — reduces single-track dependency.',
    });
  }
  if (
    metrics.revenueByCountry
      .filter((c) => ['MX', 'BR', 'AR', 'ES', 'CO', 'CL'].includes(c.country))
      .reduce((s, c) => s + c.revenue, 0) /
      Math.max(1, metrics.totalRevenue) >
    0.25
  ) {
    strategicPremiums.push({
      name: 'Regional momentum (Latin)',
      pct: 2,
      detail: 'Meaningful Latin-market footprint — adds a culturally relevant pathway.',
    });
  }

  // Caps protect against runaway adjustments.
  const totalRiskDiscountPct = Math.min(30, riskDiscounts.reduce((s, r) => s + r.pct, 0));
  const totalStrategicPremiumPct = Math.min(20, strategicPremiums.reduce((s, p) => s + p.pct, 0));

  // --- Method reconciliation ---
  // Collect base values from each applicable method, then blend.
  const methodBases: { name: string; value: number; weight: number }[] = [
    { name: 'revenue-only', value: revenueOnlyFloor.base, weight: 1.0 },
    { name: 'reliable-annualized', value: reliableAnnualized.base, weight: 0.85 },
    { name: 'momentum-adjusted', value: momentumAdjusted.base, weight: 0.9 },
    { name: 'track-level', value: trackLevelUpside.base, weight: 0.7 },
  ];
  if (historicalComp.applicable) {
    // Historical comp is heavily weighted — it's the anchor that prevents
    // unfair undervaluation when NTM is depressed.
    methodBases.push({ name: 'historical-comp', value: historicalComp.range.base, weight: 1.2 });
  }

  // The blended base uses a weighted average of methods, but biases toward
  // the higher methods when data quality + attention support it, and biases
  // toward the lower methods when risks pile up.
  const qualityBias = (totalStrategicPremiumPct - totalRiskDiscountPct) / 100; // -0.30..+0.20

  const weightedBase =
    methodBases.reduce((s, m) => s + m.value * m.weight, 0) /
    methodBases.reduce((s, m) => s + m.weight, 0);

  // Pull the blend toward the max method when quality bias is positive,
  // toward the min method when negative.
  const sortedBases = [...methodBases].sort((a, b) => b.value - a.value);
  const maxBase = sortedBases[0]?.value ?? weightedBase;
  const minBase = sortedBases[sortedBases.length - 1]?.value ?? weightedBase;
  const pull = qualityBias > 0 ? maxBase - weightedBase : weightedBase - minBase;
  const blendedBase = weightedBase + qualityBias * pull;

  // Apply risk + premium adjustments.
  const finalBase = blendedBase * (1 + totalStrategicPremiumPct / 100) * (1 - totalRiskDiscountPct / 100);
  const finalLow = finalBase * 0.78;
  const finalHigh = finalBase * 1.25;

  const finalRange: ValueRange = {
    low: round100(finalLow),
    base: round100(finalBase),
    high: round100(finalHigh),
  };

  // Method agreement: tighter spread → higher confidence.
  const ranges = methodBases.map((m) => m.value).filter((v) => v > 0);
  const minR = Math.min(...ranges);
  const maxR = Math.max(...ranges);
  const methodAgreement =
    minR > 0 && maxR > 0 ? clamp(1 - (maxR - minR) / Math.max(maxR, 1), 0, 1) : 0.5;

  // Confidence: start from valuation.confidence, lift when methods agree and
  // premiums outweigh discounts, drop when discounts dominate.
  let confidence = valuation.confidence;
  confidence += (methodAgreement - 0.5) * 20;
  confidence += (totalStrategicPremiumPct - totalRiskDiscountPct) / 3;
  confidence = clamp(Math.round(confidence), 20, 95);

  // Suggested ask: upper-middle of the final range, slightly above base.
  const suggestedAsk = round100(finalBase * 1.08);

  // Narrative.
  const whyHigherThanNtm: string[] = [];
  if (historicalComp.applicable && historicalComp.range.base > revenueOnlyFloor.base) {
    whyHigherThanNtm.push(
      `Historical comp method values the catalog at ~$${Math.round(historicalComp.range.base).toLocaleString()} — well above the NTM-only base of $${Math.round(revenueOnlyFloor.base).toLocaleString()}. This catches catalogs where current run-rate underestimates true earning history.`,
    );
  }
  if (attentionVal.flags.underMonetizedAttention) {
    whyHigherThanNtm.push(
      'Track-level attention is meaningfully under-monetized — a partner with optimization capability sees upside the run rate misses.',
    );
  }
  if (attentionVal.flags.attentionLiftsConfidence) {
    whyHigherThanNtm.push(
      'Attention is already converting into revenue. That cuts buyer underwriting risk and supports a richer multiple.',
    );
  }
  const drivers = trackMomentum.filter((t) =>
    t.tags.includes('Catalog Anchor') || t.tags.includes('Revenue Driver'),
  );
  if (drivers.length >= 2) {
    whyHigherThanNtm.push(
      `${drivers.length} tracks already anchor the catalog — reduces single-asset risk that buyers usually discount.`,
    );
  }
  if (strategicPremiums.length >= 3) {
    whyHigherThanNtm.push(
      'Multiple strategic premiums apply (social, sync, pipeline, diversification) — capped but compounding.',
    );
  }
  if (whyHigherThanNtm.length === 0) {
    whyHigherThanNtm.push(
      'Revenue-only model is the primary anchor here — no historical comp or attention signals to lift the range yet.',
    );
  }

  const whatCouldReduce: string[] = [];
  riskDiscounts.forEach((r) => whatCouldReduce.push(`${r.name}: ${r.detail}`));
  if (!metrics.hasAttention) {
    whatCouldReduce.push(
      'No attention columns in the CSV. Adding TikTok / Reels / YouTube / Shazam / playlist data unlocks the attention-adjusted lens.',
    );
  }
  if (whatCouldReduce.length === 0) {
    whatCouldReduce.push('No material risks flagged — terms should hold under standard diligence.');
  }

  return {
    methods: {
      revenueOnlyFloor,
      historicalComp,
      reliableAnnualized,
      momentumAdjusted,
      trackLevelUpside,
    },
    riskDiscounts,
    strategicPremiums,
    totalRiskDiscountPct: round1(totalRiskDiscountPct),
    totalStrategicPremiumPct: round1(totalStrategicPremiumPct),
    finalRange,
    suggestedAsk,
    confidence,
    whyHigherThanNtm,
    whatCouldReduce,
    methodAgreement: round1(methodAgreement),
    qualityFactor: round1(historicalComp.qualityFactor),
  };
}
