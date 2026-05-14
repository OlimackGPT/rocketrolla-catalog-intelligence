import { RevenueMetrics, TrackAttention, emptyAttention } from './types';
import { buildValuation } from './valuation';
import { DealReadiness } from './dealReadiness';
import { TrackMomentum } from './trackMomentum';

// Per-attention-unit dollar coefficients. Calibrated against operator anchors:
//  - ~600k YouTube + strong TikTok ≈ $8–9k attention-driven component
//  - ~2.7M social views w/ moderate TikTok ≈ $6–7k attention-driven component
// These are log-scaled so they don't explode at high inputs.
const ATTENTION_COEFFS = {
  youtubeBase: 800, // per log10(views)
  tiktokViewsBase: 400, // per log10(views)
  tiktokVideosPerUnit: 2, // per video
  reelsPerUnit: 4, // per reel
  shazamPerUnit: 0.01, // per shazam
  playlistPerUnit: 300, // per editorial add
  socialViewsBase: 250, // per log10(views) — only if no platform-specific number is present
};

export function estimatePerTrackAttentionValue(a: TrackAttention): number {
  if (!a) return 0;
  let value = 0;
  if (a.youtubeViews > 0) value += Math.log10(a.youtubeViews + 1) * ATTENTION_COEFFS.youtubeBase;
  if (a.tiktokViews > 0) value += Math.log10(a.tiktokViews + 1) * ATTENTION_COEFFS.tiktokViewsBase;
  if (a.tiktokVideos > 0) value += a.tiktokVideos * ATTENTION_COEFFS.tiktokVideosPerUnit;
  if (a.reelsUses > 0) value += a.reelsUses * ATTENTION_COEFFS.reelsPerUnit;
  if (a.shazamCount > 0) value += a.shazamCount * ATTENTION_COEFFS.shazamPerUnit;
  if (a.playlistAdds > 0) value += a.playlistAdds * ATTENTION_COEFFS.playlistPerUnit;
  // Only credit social_views if no platform-specific number was reported — otherwise it would double count.
  if (a.socialViews > 0 && a.youtubeViews === 0 && a.tiktokViews === 0) {
    value += Math.log10(a.socialViews + 1) * ATTENTION_COEFFS.socialViewsBase;
  }
  return Math.max(0, value);
}

export type AttentionAdjustedValuation = {
  // Pure revenue-based scenarios (kept identical to /lib/valuation for backwards compat).
  revenue: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  attentionUpside: {
    raw: number;
    perTrack: { track: string; value: number }[];
    capApplied: boolean;
  };
  final: {
    conservative: number;
    base: number;
    aggressive: number;
  };
  confidence: number;
  conversionRatio: number; // historic revenue vs attention proxy — high = attention is converting
  flags: {
    underMonetizedAttention: boolean;
    attentionLiftsConfidence: boolean;
    unclearOwnershipBlocks: boolean;
  };
  notes: string[];
};

export function buildAttentionValuation(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  readiness: DealReadiness;
  trackMomentum: TrackMomentum[];
}): AttentionAdjustedValuation {
  const { metrics, valuation, readiness, trackMomentum } = input;

  // Raw attention dollar value summed across tracks.
  const perTrack = trackMomentum.map((tm) => ({
    track: tm.track,
    value: estimatePerTrackAttentionValue(tm.attention ?? emptyAttention()),
  }));
  const rawAttention = perTrack.reduce((s, x) => s + x.value, 0);

  // Conversion ratio: how much historic revenue per dollar of attention value.
  // 1.0 = revenue and attention are aligned. <0.5 = attention is under-monetized.
  // >1.5 = revenue is already converting (the catalog is cashing in the attention).
  const conversionRatio = rawAttention > 0 ? metrics.totalRevenue / rawAttention : 1;
  const underMonetized = rawAttention > 5_000 && conversionRatio < 0.6;
  const converting = conversionRatio > 1.0;

  // Quality + confidence caps. If data confidence is shaky, we discount the upside.
  const dataQuality =
    (readiness.components.metadataCompleteness +
      readiness.components.ownershipClarity +
      valuation.confidence) /
    3;
  // qualityFactor ranges roughly 0.4 (very rough data) → 1.0 (clean catalog).
  const qualityFactor = Math.max(0.4, Math.min(1, dataQuality / 80));
  const adjustedAttention = rawAttention * qualityFactor;

  // Cap the upside relative to revenue base so we don't blindly value pure attention.
  // The cap rises with conversionRatio (markets that are converting deserve more credit).
  const attentionCapMultiplier = converting ? 2.0 : underMonetized ? 0.9 : 1.4;
  const upsideCap = Math.max(valuation.base * attentionCapMultiplier, valuation.aggressive * 0.6);
  const capApplied = adjustedAttention > upsideCap;
  const cappedAttention = Math.min(adjustedAttention, upsideCap);

  const final = {
    conservative: valuation.conservative + cappedAttention * 0.1,
    base: valuation.base + cappedAttention * (converting ? 0.45 : underMonetized ? 0.2 : 0.3),
    aggressive: valuation.aggressive + cappedAttention * (converting ? 0.7 : 0.5),
  };

  // Confidence: attention-converting catalogs get a lift; unclear ownership pulls confidence down.
  let confidence = valuation.confidence;
  if (converting && rawAttention > 5_000) confidence = Math.min(95, confidence + 8);
  if (underMonetized) confidence = Math.max(30, confidence - 5);
  if (readiness.components.ownershipClarity < 50) confidence = Math.max(25, confidence - 10);

  const notes: string[] = [];
  if (rawAttention <= 0) {
    notes.push('No attention signals provided — final range equals the revenue-based range.');
  } else {
    if (underMonetized) {
      notes.push('Attention is high relative to current revenue. This is under-monetized — partners may price the upside, not the run rate.');
    }
    if (converting) {
      notes.push('Attention is already converting into revenue. Confidence is lifted.');
    }
    if (capApplied) {
      notes.push('Attention upside was capped to keep the range defensible to a buyer.');
    }
    if (qualityFactor < 0.7) {
      notes.push('Data quality discount applied (incomplete metadata, low valuation confidence, or unclear ownership).');
    }
  }

  return {
    revenue: {
      conservative: valuation.conservative,
      base: valuation.base,
      aggressive: valuation.aggressive,
    },
    attentionUpside: {
      raw: rawAttention,
      perTrack: perTrack.sort((a, b) => b.value - a.value),
      capApplied,
    },
    final,
    confidence: Math.round(confidence),
    conversionRatio,
    flags: {
      underMonetizedAttention: underMonetized,
      attentionLiftsConfidence: converting && rawAttention > 5_000,
      unclearOwnershipBlocks: readiness.components.ownershipClarity < 50,
    },
    notes,
  };
}

// Per-track contribution to the final valuation. Combines revenue contribution + attention contribution.
export type TrackContribution = {
  track: string;
  revenue: number;
  attentionValue: number;
  estimatedDealContribution: number;
  share: number;
  tags: string[];
};

export function computeTrackContributions(input: {
  trackMomentum: TrackMomentum[];
  attentionVal: AttentionAdjustedValuation;
  totalBase: number;
  totalRevenue: number;
}): TrackContribution[] {
  const { trackMomentum, attentionVal, totalBase, totalRevenue } = input;

  // For each track: contribution = (revenue share × revenue base) + attention value × scaling.
  // Scaling lines up with how much of the final base is attention-driven vs revenue-driven.
  const totalAttention = attentionVal.attentionUpside.raw;
  const attentionInBase = attentionVal.final.base - attentionVal.revenue.base;
  const attentionScaling = totalAttention > 0 ? attentionInBase / totalAttention : 0;

  return trackMomentum.map((tm) => {
    const revShare = totalRevenue > 0 ? tm.revenue / totalRevenue : 0;
    const revenueContrib = revShare * attentionVal.revenue.base;
    const attentionContrib =
      attentionVal.attentionUpside.perTrack.find((p) => p.track === tm.track)?.value ?? 0;
    const estimated = revenueContrib + attentionContrib * attentionScaling;
    return {
      track: tm.track,
      revenue: tm.revenue,
      attentionValue: attentionContrib,
      estimatedDealContribution: estimated,
      share: totalBase > 0 ? estimated / totalBase : 0,
      tags: tm.tags,
    };
  });
}
