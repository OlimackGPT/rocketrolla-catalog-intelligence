import { RevenueMetrics, TrackAttention, emptyAttention } from './types';

export type TrackMomentumLabel = 'Low Signal' | 'Developing' | 'Strong Signal' | 'High Upside';
export type TrackTag =
  | 'Revenue Driver'
  | 'Attention Driver'
  | 'Sync Candidate'
  | 'Rights Cleanup Needed'
  | 'Under-Monetized Asset'
  | 'Concentration Risk'
  | 'Catalog Anchor'
  | 'Long-Tail Asset';

export type TrackMomentum = {
  track: string;
  revenue: number;
  streams: number;
  attention: TrackAttention;
  revenueShare: number;
  scores: {
    revenue: number;
    growth: number;
    tiktok: number;
    reels: number;
    youtube: number;
    shazam: number;
    playlist: number;
    platformDiversification: number;
    concentrationRisk: number;
  };
  overall: number;
  label: TrackMomentumLabel;
  tags: TrackTag[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function logScore(value: number, target: number): number {
  if (!value || value <= 0) return 0;
  const ratio = Math.log10(value + 1) / Math.log10(target + 1);
  return Math.min(100, ratio * 100);
}

export function labelForMomentum(score: number): TrackMomentumLabel {
  if (score < 40) return 'Low Signal';
  if (score < 60) return 'Developing';
  if (score < 80) return 'Strong Signal';
  return 'High Upside';
}

export function computeTrackMomentum(metrics: RevenueMetrics): TrackMomentum[] {
  const totalRevenue = metrics.totalRevenue || 1;
  return metrics.revenueByTrack.map((t) => {
    const a = metrics.trackAttention[t.track] ?? emptyAttention();
    const share = t.revenue / totalRevenue;

    // Per-track scores. Targets are calibrated against realistic indie catalogs.
    const revenueScore = logScore(t.revenue, Math.max(5000, totalRevenue * 0.6));
    const tiktokScore = clamp(logScore(a.tiktokViews, 5_000_000) * 0.7 + logScore(a.tiktokVideos, 2_000) * 0.3);
    const reelsScore = logScore(a.reelsUses, 2_000);
    const youtubeScore = logScore(a.youtubeViews, 3_000_000);
    const shazamScore = logScore(a.shazamCount, 50_000);
    const playlistScore = logScore(a.playlistAdds, 25);
    // Growth proxy: tracks below 20% of #1 share are assumed developing; topping the chart penalizes growth headroom.
    const top = metrics.revenueByTrack[0]?.revenue || 1;
    const headroom = 1 - t.revenue / top;
    const growthScore = clamp(40 + headroom * 60);

    // Platform diversification uses streams as a weak proxy when per-track platform data is not exposed.
    // We approximate via revenue share + DSP count from the parent metric.
    const platformDiversification = clamp(
      100 - (metrics.revenueByPlatform[0]?.revenue ?? 0) / Math.max(metrics.totalRevenue, 1) * 90,
    );

    // Concentration risk: this track's share of total revenue. Higher share == higher risk.
    const concentrationRisk = clamp(share * 100);

    const attentionAggregate =
      tiktokScore * 0.35 +
      youtubeScore * 0.25 +
      reelsScore * 0.10 +
      shazamScore * 0.15 +
      playlistScore * 0.15;

    const overall = clamp(
      revenueScore * 0.4 +
        attentionAggregate * 0.45 +
        growthScore * 0.10 +
        platformDiversification * 0.05,
    );

    const tags: TrackTag[] = [];
    if (revenueScore >= 65 && share >= 0.18) tags.push('Revenue Driver');
    if (attentionAggregate >= 55 && revenueScore < 50) tags.push('Under-Monetized Asset');
    if (attentionAggregate >= 60) tags.push('Attention Driver');
    if (tiktokScore >= 55 || youtubeScore >= 55 || shazamScore >= 55) {
      if (!tags.includes('Attention Driver')) tags.push('Attention Driver');
    }
    if (share >= 0.45) tags.push('Concentration Risk');
    if (shazamScore >= 45 && playlistScore >= 30) tags.push('Sync Candidate');
    if (reelsScore >= 55 || tiktokScore >= 55) {
      if (revenueScore < 35) tags.push('Sync Candidate');
    }
    // Catalog Anchor: revenue driver with diversification + strong overall — the kind
    // of track a buyer would build the deal around.
    if (
      tags.includes('Revenue Driver') &&
      share >= 0.2 &&
      share <= 0.6 &&
      overall >= 60
    ) {
      tags.push('Catalog Anchor');
    }
    // Long-Tail Asset: small steady contributors — low share, low attention, but
    // they show up consistently and shouldn't be ignored.
    if (
      share < 0.08 &&
      revenueScore < 45 &&
      attentionAggregate < 35 &&
      t.revenue > 0
    ) {
      tags.push('Long-Tail Asset');
    }

    return {
      track: t.track,
      revenue: t.revenue,
      streams: t.streams,
      attention: a,
      revenueShare: share,
      scores: {
        revenue: clamp(revenueScore),
        growth: clamp(growthScore),
        tiktok: clamp(tiktokScore),
        reels: clamp(reelsScore),
        youtube: clamp(youtubeScore),
        shazam: clamp(shazamScore),
        playlist: clamp(playlistScore),
        platformDiversification: clamp(platformDiversification),
        concentrationRisk: clamp(concentrationRisk),
      },
      overall,
      label: labelForMomentum(overall),
      tags,
    };
  });
}

export function aggregateAttention(trackAttention: Record<string, TrackAttention>): TrackAttention {
  const sum = emptyAttention();
  Object.values(trackAttention).forEach((a) => {
    sum.tiktokViews += a.tiktokViews;
    sum.tiktokVideos += a.tiktokVideos;
    sum.reelsUses += a.reelsUses;
    sum.youtubeViews += a.youtubeViews;
    sum.shazamCount += a.shazamCount;
    sum.playlistAdds += a.playlistAdds;
    sum.socialViews += a.socialViews;
    sum.engagement += a.engagement;
  });
  return sum;
}
