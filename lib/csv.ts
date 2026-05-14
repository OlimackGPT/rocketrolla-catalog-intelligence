import Papa from 'papaparse';
import { RevenueMetrics, RevenueRow, TrackAttention, emptyAttention } from './types';
import { parseCompactNumber } from './compactNumber';

// Header aliases for required + optional fields. Matching is case-insensitive substring.
const aliases: Record<string, string[]> = {
  trackTitle: ['track', 'song', 'title'],
  isrc: ['isrc'],
  artist: ['artist', 'primary artist'],
  platform: ['platform', 'service', 'dsp', 'store'],
  country: ['territory', 'country', 'market', 'region'],
  month: ['date', 'month', 'period', 'report period'],
  streams: ['streams', 'stream count', 'plays'],
  revenue: ['revenue', 'payout', 'amount', 'earnings', 'net'],
  currency: ['currency', 'ccy'],
  // Attention fields (all optional).
  tiktokViews: ['tiktok view', 'tt view', 'tiktok play', 'sound video views', 'tiktok sound views'],
  tiktokVideos: ['tiktok video', 'tiktok creation', 'tiktok post', 'tiktok sound video', 'tiktok sound use', 'sound use', 'ugc video'],
  reelsUses: ['reels', 'instagram reel'],
  youtubeViews: ['youtube view', 'yt view', 'shorts view', 'youtube short'],
  shazamCount: ['shazam'],
  playlistAdds: ['playlist add', 'playlist count', 'playlist place'],
  socialViews: ['social view', 'total view'],
  engagement: ['engagement', 'comment', 'share'],
};

// Note: platform/store column values like "TikTok" / "YouTube" represent revenue
// from those DSPs and are kept strictly separate from attention metrics. Attention
// only ever comes from dedicated columns (tiktok_views, youtube_views, etc.).

function pickHeader(headers: string[], key: keyof typeof aliases): string | undefined {
  const candidates = aliases[key];
  return headers.find((h) => candidates.some((a) => h.toLowerCase().includes(a)));
}

export type CsvParseResult = {
  rows: RevenueRow[];
  detectedColumns: string[];
  attentionColumnsFound: string[];
};

export function parseCsv(text: string): RevenueRow[] {
  return parseCsvDetailed(text).rows;
}

export function parseCsvDetailed(text: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  const headers = parsed.meta.fields ?? [];

  const map = {
    track: pickHeader(headers, 'trackTitle'),
    isrc: pickHeader(headers, 'isrc'),
    artist: pickHeader(headers, 'artist'),
    platform: pickHeader(headers, 'platform'),
    country: pickHeader(headers, 'country'),
    month: pickHeader(headers, 'month'),
    streams: pickHeader(headers, 'streams'),
    revenue: pickHeader(headers, 'revenue'),
    currency: pickHeader(headers, 'currency'),
    tiktokViews: pickHeader(headers, 'tiktokViews'),
    tiktokVideos: pickHeader(headers, 'tiktokVideos'),
    reelsUses: pickHeader(headers, 'reelsUses'),
    youtubeViews: pickHeader(headers, 'youtubeViews'),
    shazamCount: pickHeader(headers, 'shazamCount'),
    playlistAdds: pickHeader(headers, 'playlistAdds'),
    socialViews: pickHeader(headers, 'socialViews'),
    engagement: pickHeader(headers, 'engagement'),
  };

  if (!map.track || !map.month || !map.revenue) {
    throw new Error('Missing required columns for track, month/date, or revenue');
  }

  const attentionColumnsFound = Object.entries(map)
    .filter(([k, v]) => v && ['tiktokViews', 'tiktokVideos', 'reelsUses', 'youtubeViews', 'shazamCount', 'playlistAdds', 'socialViews', 'engagement'].includes(k))
    .map(([, v]) => v as string);

  const rows: RevenueRow[] = parsed.data.map((row) => {
    const rawMonth = row[map.month!] ?? '';
    const date = new Date(rawMonth);
    const month = Number.isNaN(date.getTime())
      ? rawMonth.slice(0, 7)
      : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const revenue = Number(row[map.revenue!] ?? 0);

    const attention: Partial<TrackAttention> = {};
    if (map.tiktokViews) attention.tiktokViews = parseCompactNumber(row[map.tiktokViews]);
    if (map.tiktokVideos) attention.tiktokVideos = parseCompactNumber(row[map.tiktokVideos]);
    if (map.reelsUses) attention.reelsUses = parseCompactNumber(row[map.reelsUses]);
    if (map.youtubeViews) attention.youtubeViews = parseCompactNumber(row[map.youtubeViews]);
    if (map.shazamCount) attention.shazamCount = parseCompactNumber(row[map.shazamCount]);
    if (map.playlistAdds) attention.playlistAdds = parseCompactNumber(row[map.playlistAdds]);
    if (map.socialViews) attention.socialViews = parseCompactNumber(row[map.socialViews]);
    if (map.engagement) attention.engagement = parseCompactNumber(row[map.engagement]);

    return {
      trackTitle: row[map.track!] ?? 'Unknown',
      isrc: map.isrc ? row[map.isrc] ?? '' : '',
      artist: map.artist ? row[map.artist] ?? '' : '',
      platform: map.platform ? row[map.platform] ?? 'Unknown' : 'Unknown',
      country: map.country ? row[map.country] ?? 'Unknown' : 'Unknown',
      month,
      streams: map.streams ? parseCompactNumber(row[map.streams]) : 0,
      revenueUsd: Number.isFinite(revenue) ? revenue : 0,
      currency: map.currency ? row[map.currency] ?? 'USD' : 'USD',
      attention: Object.keys(attention).length > 0 ? attention : undefined,
    };
  });

  return { rows, detectedColumns: headers, attentionColumnsFound };
}

function mergeAttention(existing: TrackAttention, incoming?: Partial<TrackAttention>): TrackAttention {
  if (!incoming) return existing;
  // Take the max per metric across rows for a given track — attention metrics
  // are typically reported once per track, not summed per row.
  return {
    tiktokViews: Math.max(existing.tiktokViews, incoming.tiktokViews ?? 0),
    tiktokVideos: Math.max(existing.tiktokVideos, incoming.tiktokVideos ?? 0),
    reelsUses: Math.max(existing.reelsUses, incoming.reelsUses ?? 0),
    youtubeViews: Math.max(existing.youtubeViews, incoming.youtubeViews ?? 0),
    shazamCount: Math.max(existing.shazamCount, incoming.shazamCount ?? 0),
    playlistAdds: Math.max(existing.playlistAdds, incoming.playlistAdds ?? 0),
    socialViews: Math.max(existing.socialViews, incoming.socialViews ?? 0),
    engagement: Math.max(existing.engagement, incoming.engagement ?? 0),
  };
}

function attentionHasSignal(a: TrackAttention): boolean {
  return (
    a.tiktokViews > 0 ||
    a.tiktokVideos > 0 ||
    a.reelsUses > 0 ||
    a.youtubeViews > 0 ||
    a.shazamCount > 0 ||
    a.playlistAdds > 0 ||
    a.socialViews > 0 ||
    a.engagement > 0
  );
}

export function computeMetrics(rows: RevenueRow[]): RevenueMetrics {
  const monthMap = new Map<string, number>();
  const trackRev = new Map<string, number>();
  const trackStreams = new Map<string, number>();
  const platformMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const trackAttention: Record<string, TrackAttention> = {};
  let hasAttention = false;

  for (const r of rows) {
    monthMap.set(r.month, (monthMap.get(r.month) ?? 0) + r.revenueUsd);
    trackRev.set(r.trackTitle, (trackRev.get(r.trackTitle) ?? 0) + r.revenueUsd);
    trackStreams.set(r.trackTitle, (trackStreams.get(r.trackTitle) ?? 0) + r.streams);
    platformMap.set(r.platform, (platformMap.get(r.platform) ?? 0) + r.revenueUsd);
    countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + r.revenueUsd);

    if (r.attention) {
      const prior = trackAttention[r.trackTitle] ?? emptyAttention();
      trackAttention[r.trackTitle] = mergeAttention(prior, r.attention);
      if (attentionHasSignal(trackAttention[r.trackTitle])) hasAttention = true;
    }
  }

  const monthlyRevenue = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const revenueByTrack = [...trackRev.entries()]
    .map(([track, revenue]) => ({ track, revenue, streams: trackStreams.get(track) ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueByPlatform = [...platformMap.entries()]
    .map(([platform, revenue]) => ({ platform, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const revenueByCountry = [...countryMap.entries()]
    .map(([country, revenue]) => ({ country, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = rows.reduce((sum, r) => sum + r.revenueUsd, 0);
  const last = monthlyRevenue.slice(-12);
  const last12Months = last.reduce((s, x) => s + x.revenue, 0);
  const last6Months = last.slice(-6).reduce((s, x) => s + x.revenue, 0);
  const last3Months = last.slice(-3).reduce((s, x) => s + x.revenue, 0);
  const runRate = last3Months / Math.max(1, Math.min(3, last.length));
  const projectedNtm = runRate * 12;

  return {
    totalRevenue,
    monthlyRevenue,
    revenueByTrack,
    revenueByPlatform,
    revenueByCountry,
    runRate,
    projectedNtm,
    last3Months,
    last6Months,
    last12Months,
    trackAttention,
    hasAttention,
  };
}
