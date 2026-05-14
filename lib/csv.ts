import Papa from 'papaparse';
import { RevenueMetrics, RevenueRow } from './types';

const aliases: Record<string, string[]> = {
  trackTitle: ['track', 'track title', 'song', 'title'],
  isrc: ['isrc'],
  artist: ['artist', 'primary artist'],
  platform: ['platform', 'service', 'dsp'],
  country: ['territory', 'country', 'market'],
  month: ['date', 'month', 'period'],
  streams: ['streams', 'stream count'],
  revenue: ['revenue', 'payout', 'amount'],
  currency: ['currency', 'ccy']
};

const pickKey = (headers: string[], key: keyof typeof aliases) => headers.find((h) => aliases[key].some((a) => h.toLowerCase().includes(a)));

export function parseCsv(text: string): RevenueRow[] {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) throw new Error(parsed.errors[0].message);
  const headers = parsed.meta.fields ?? [];
  const map = {
    track: pickKey(headers, 'trackTitle'), isrc: pickKey(headers, 'isrc'), artist: pickKey(headers, 'artist'),
    platform: pickKey(headers, 'platform'), country: pickKey(headers, 'country'), month: pickKey(headers, 'month'),
    streams: pickKey(headers, 'streams'), revenue: pickKey(headers, 'revenue'), currency: pickKey(headers, 'currency')
  };
  if (!map.track || !map.month || !map.revenue) throw new Error('Missing required columns for track, month/date, or revenue');

  return parsed.data.map((row) => {
    const rawMonth = row[map.month!] ?? '';
    const date = new Date(rawMonth);
    const month = Number.isNaN(date.getTime()) ? rawMonth.slice(0, 7) : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const revenue = Number(row[map.revenue!] ?? 0);
    return {
      trackTitle: row[map.track!] ?? 'Unknown',
      isrc: map.isrc ? row[map.isrc] ?? '' : '',
      artist: map.artist ? row[map.artist] ?? '' : '',
      platform: map.platform ? row[map.platform] ?? 'Unknown' : 'Unknown',
      country: map.country ? row[map.country] ?? 'Unknown' : 'Unknown',
      month,
      streams: map.streams ? Number(row[map.streams] ?? 0) : 0,
      revenueUsd: Number.isFinite(revenue) ? revenue : 0,
      currency: map.currency ? row[map.currency] ?? 'USD' : 'USD'
    };
  });
}

export function computeMetrics(rows: RevenueRow[]): RevenueMetrics {
  const monthMap = new Map<string, number>();
  const trackMap = new Map<string, number>();
  const platformMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  for (const r of rows) {
    monthMap.set(r.month, (monthMap.get(r.month) ?? 0) + r.revenueUsd);
    trackMap.set(r.trackTitle, (trackMap.get(r.trackTitle) ?? 0) + r.revenueUsd);
    platformMap.set(r.platform, (platformMap.get(r.platform) ?? 0) + r.revenueUsd);
    countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + r.revenueUsd);
  }
  const monthlyRevenue = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, revenue]) => ({ month, revenue }));
  const top = (m: Map<string, number>) => [...m.entries()].map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenueUsd, 0);
  const last = monthlyRevenue.slice(-12);
  const last12Months = last.reduce((s, x) => s + x.revenue, 0);
  const last6Months = last.slice(-6).reduce((s, x) => s + x.revenue, 0);
  const last3Months = last.slice(-3).reduce((s, x) => s + x.revenue, 0);
  const runRate = last3Months / 3;
  const projectedNtm = runRate * 12;

  return { totalRevenue, monthlyRevenue, revenueByTrack: top(trackMap), platformBreakdown: top(platformMap), countryBreakdown: top(countryMap), runRate, projectedNtm, last3Months, last6Months, last12Months };
}
