import { RevenueMetrics, RowStats } from './types';
import { buildValuation } from './valuation';
import { MomentumInputs, computeMomentumSignals } from './momentum';

export type ReadinessLabel = 'Not Ready' | 'Needs Cleanup' | 'Partner Ready' | 'High Priority';

export type ReadinessComponents = {
  revenueConsistency: number;
  recentGrowth: number;
  trackDiversification: number;
  platformDiversification: number;
  territoryDiversification: number;
  metadataCompleteness: number;
  ownershipClarity: number;
  valuationConfidence: number;
  partnerFit: number;
  syncReadiness: number;
};

export type DealReadiness = {
  total: number;
  label: ReadinessLabel;
  components: ReadinessComponents;
  strengths: string[];
  risks: string[];
  fixesNeeded: string[];
  bestNextMove: string;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function readinessLabel(total: number): ReadinessLabel {
  if (total < 40) return 'Not Ready';
  if (total < 60) return 'Needs Cleanup';
  if (total < 80) return 'Partner Ready';
  return 'High Priority';
}

function herfindahl(items: { revenue: number }[]): number {
  const total = items.reduce((s, i) => s + i.revenue, 0);
  if (total <= 0) return 1;
  return items.reduce((s, i) => s + Math.pow(i.revenue / total, 2), 0);
}

function consistency(monthly: { revenue: number }[]): number {
  if (monthly.length < 3) return 35;
  const values = monthly.map((m) => m.revenue);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean <= 0) return 0;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const cv = Math.sqrt(variance) / mean;
  return clamp(100 - cv * 80);
}

function recentGrowthScore(metrics: RevenueMetrics): number {
  const prev3 = metrics.last6Months - metrics.last3Months;
  if (prev3 <= 0) return metrics.last3Months > 0 ? 70 : 40;
  const ratio = metrics.last3Months / prev3;
  return clamp(50 + (ratio - 1) * 90);
}

function metadataCompleteness(stats: RowStats): number {
  if (!stats.totalRows) return 0;
  const withIsrcRatio = stats.rowsWithIsrc / stats.totalRows;
  const withArtistRatio = stats.rowsWithArtist / stats.totalRows;
  return clamp(withIsrcRatio * 70 + withArtistRatio * 30);
}

export function computeDealReadiness(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  momentum: MomentumInputs;
}): DealReadiness {
  const { metrics, valuation, momentum } = input;
  const signals = computeMomentumSignals(momentum);
  const stats = metrics.rowStats;

  const trackHHI = herfindahl(metrics.revenueByTrack.map((t) => ({ revenue: t.revenue })));
  const platformHHI = herfindahl(metrics.revenueByPlatform.map((p) => ({ revenue: p.revenue })));
  const countryHHI = herfindahl(metrics.revenueByCountry.map((c) => ({ revenue: c.revenue })));

  const components: ReadinessComponents = {
    revenueConsistency: consistency(metrics.monthlyRevenue),
    recentGrowth: recentGrowthScore(metrics),
    trackDiversification: clamp(100 - trackHHI * 100),
    platformDiversification: clamp(100 - platformHHI * 90),
    territoryDiversification: clamp(100 - countryHHI * 85),
    metadataCompleteness: metadataCompleteness(stats),
    ownershipClarity: stats.totalRows > 0 ? 70 : 30,
    valuationConfidence: valuation.confidence,
    partnerFit: valuation.scores.partnerFit,
    syncReadiness: clamp(valuation.scores.syncPotential * 0.6 + signals.syncReady * 0.4),
  };

  const weights: Record<keyof ReadinessComponents, number> = {
    revenueConsistency: 0.13,
    recentGrowth: 0.12,
    trackDiversification: 0.10,
    platformDiversification: 0.08,
    territoryDiversification: 0.07,
    metadataCompleteness: 0.10,
    ownershipClarity: 0.10,
    valuationConfidence: 0.12,
    partnerFit: 0.10,
    syncReadiness: 0.08,
  };

  const total = clamp(
    (Object.keys(components) as (keyof ReadinessComponents)[]).reduce(
      (sum, k) => sum + components[k] * weights[k],
      0,
    ),
  );

  const strengths: string[] = [];
  const risks: string[] = [];
  const fixes: string[] = [];

  if (components.recentGrowth >= 65) strengths.push('Revenue is accelerating over the last 90 days.');
  if (components.revenueConsistency >= 70) strengths.push('Monthly revenue is consistent, which buyers reward.');
  if (components.platformDiversification >= 70) strengths.push('Healthy spread across DSPs reduces single-platform risk.');
  if (components.territoryDiversification >= 65) strengths.push('Geographic mix is broad enough to be defensible.');
  if (components.metadataCompleteness >= 75) strengths.push('Metadata is clean — clears most diligence hurdles upfront.');
  if (signals.socialScore >= 60) strengths.push('Social momentum is meaningful and can lift valuation if framed well.');
  if (signals.pipelineScore >= 50) strengths.push('A real release/cosign pipeline gives partners forward visibility.');

  if (components.trackDiversification < 45) {
    risks.push('Top track concentration is high — buyers will discount aggressively.');
    fixes.push('Bring the next 2–3 tracks closer to the leader: marketing, sync push, or release strategy.');
  }
  if (components.metadataCompleteness < 60) {
    risks.push('Metadata gaps (ISRC, artist) will slow or block diligence.');
    fixes.push('Audit ISRCs, primary artist tags, and split sheets before any partner outreach.');
  }
  if (components.platformDiversification < 50) {
    risks.push('Single-DSP exposure makes the catalog more volatile than its run rate suggests.');
    fixes.push('Pitch for adds on the under-indexed DSPs to broaden the base.');
  }
  if (components.recentGrowth < 40) {
    risks.push('Trajectory is flat or declining — financing terms will be conservative.');
  }
  if (components.valuationConfidence < 55) {
    fixes.push('Add 60–90 more days of data before pricing — confidence is currently below acceptable threshold.');
  }
  if (components.ownershipClarity < 60) {
    risks.push('Ownership / split clarity needs to be documented before any deal.');
    fixes.push('Lock down split sheets and publisher confirmation in writing.');
  }
  if (components.syncReadiness < 45) {
    fixes.push('If sync is the target path, prep stems with AudioShake and a focused 5–15 track curation.');
  }

  let bestNextMove: string;
  if (total < 40) {
    bestNextMove = 'Hold off on partner outreach. Fix metadata and rebuild 60–90 days of clean data first.';
  } else if (total < 60) {
    bestNextMove = 'Run a cleanup sprint (rights + metadata) before sending the catalog to any partner.';
  } else if (total < 80) {
    bestNextMove = 'Package the data and approach 2–3 partners in parallel — competing offers protect terms.';
  } else {
    bestNextMove = 'Move fast. Multi-partner outreach with a clear ask and a tight diligence window.';
  }

  return {
    total,
    label: readinessLabel(total),
    components,
    strengths,
    risks,
    fixesNeeded: fixes,
    bestNextMove,
  };
}

export type StrategyDecision = 'sell-now' | 'royalty-advance' | 'sync-first' | 'rights-cleanup' | 'wait' | 'build-data' | 'advisory';

export type StrategyRecommendation = {
  decision: StrategyDecision;
  headline: string;
  body: string;
  supporting: string[];
};

export function recommendStrategy(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  momentum: MomentumInputs;
  readiness: DealReadiness;
}): StrategyRecommendation {
  const { metrics, valuation, readiness } = input;
  const signals = computeMomentumSignals(input.momentum);
  const supporting: string[] = [];

  const stable = readiness.components.revenueConsistency >= 60;
  const growth = readiness.components.recentGrowth;
  const concentrated = readiness.components.trackDiversification < 45;
  const lowMetadata = readiness.components.metadataCompleteness < 60;
  const lowOwnership = readiness.components.ownershipClarity < 60;
  const highSocial = signals.socialScore >= 60;
  const highSync = readiness.components.syncReadiness >= 65;
  const lowConfidence = valuation.confidence < 55;
  const lowRevenue = metrics.runRate < 750;

  if (lowOwnership || lowMetadata) {
    supporting.push('Metadata or ownership gaps block clean diligence.');
    return {
      decision: 'rights-cleanup',
      headline: 'Clean up rights before pitching',
      body: 'Partners will discount or pass on catalogs with unclear ownership or missing metadata. Fix this layer first — it has the highest ROI per hour of work.',
      supporting,
    };
  }

  if (lowConfidence) {
    supporting.push(`Valuation confidence is only ${valuation.confidence}%.`);
    return {
      decision: 'build-data',
      headline: 'Build 60–90 more days of data',
      body: 'There is not enough signal yet to price the catalog with conviction. Continue distribution, log monthly numbers, and revisit pricing once trajectory is clearer.',
      supporting,
    };
  }

  if (lowRevenue && highSocial) {
    supporting.push('Run rate is modest but social momentum is strong.');
    return {
      decision: 'advisory',
      headline: 'Route through RocketRolla advisory first',
      body: 'Revenue is underpriced relative to attention. A brand / sync / creator campaign cycle will lift the catalog before any deal conversation.',
      supporting,
    };
  }

  if (growth >= 70 && highSocial) {
    supporting.push('Trajectory is strong; locking in now likely underprices the catalog.');
    return {
      decision: 'wait',
      headline: 'Do not sell yet — momentum is underpriced',
      body: 'A 90–180 day hold while momentum compounds will materially shift pricing. Use the time to pre-clear rights and prepare a clean data room.',
      supporting,
    };
  }

  if (highSync) {
    supporting.push('Sync readiness is high; positioning for placements yields stronger optionality.');
    return {
      decision: 'sync-first',
      headline: 'Prepare for sync first',
      body: 'Sync revenue improves the multiple on financing later. Push a focused curation to Acrylic and prep stems with AudioShake before pricing for advance.',
      supporting,
    };
  }

  if (concentrated) {
    supporting.push('Top track concentration is high — buyers will price it as single-asset risk.');
    return {
      decision: 'royalty-advance',
      headline: 'Pursue a royalty-backed advance',
      body: 'A royalty-backed advance (Sound Royalties / BeatBread) protects upside on the lead track while unlocking capital today. Avoid full catalog sale until concentration drops.',
      supporting,
    };
  }

  if (stable && growth >= 45) {
    supporting.push('Stable revenue with moderate growth is the sweet spot for catalog financing.');
    return {
      decision: 'sell-now',
      headline: 'Seek catalog financing now',
      body: 'The catalog is in financing-ready shape. Approach Duetti and BeatBread in parallel with a clean data package and aim for competitive term sheets within 30 days.',
      supporting,
    };
  }

  supporting.push('No single dominant signal yet — proceed deliberately.');
  return {
    decision: 'advisory',
    headline: 'Route through RocketRolla advisory first',
    body: 'The catalog has potential but no clear forcing function. A short advisory cycle will sharpen positioning before any external outreach.',
    supporting,
  };
}

export const strategyMeta: Record<StrategyDecision, { color: string; chip: string }> = {
  'sell-now': { color: 'emerald', chip: 'Financing Ready' },
  'royalty-advance': { color: 'emerald', chip: 'Advance Path' },
  'sync-first': { color: 'purple', chip: 'Sync First' },
  'rights-cleanup': { color: 'amber', chip: 'Cleanup' },
  wait: { color: 'purple', chip: 'Hold' },
  'build-data': { color: 'amber', chip: 'Build Data' },
  advisory: { color: 'blue', chip: 'Advisory' },
};
