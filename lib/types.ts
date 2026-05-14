export type TrackAttention = {
  tiktokViews: number;
  tiktokVideos: number;
  reelsUses: number;
  youtubeViews: number;
  shazamCount: number;
  playlistAdds: number;
  socialViews: number;
  engagement: number;
};

export type RevenueRow = {
  trackTitle: string;
  isrc: string;
  artist: string;
  platform: string;
  country: string;
  month: string;
  streams: number;
  revenueUsd: number;
  currency: string;
  attention?: Partial<TrackAttention>;
};

// Row-derived counts used by data quality + deal readiness. Stored alongside
// aggregated metrics so we never need to keep raw rows in localStorage.
export type RowStats = {
  totalRows: number;
  rowsWithRevenue: number;
  rowsWithMissingRevenue: number;
  rowsWithDate: number;
  rowsWithMissingDate: number;
  rowsWithIsrc: number;
  rowsWithMissingIsrc: number;
  rowsWithArtist: number;
};

export type RevenueMetrics = {
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  revenueByTrack: { track: string; revenue: number; streams: number }[];
  revenueByPlatform: { platform: string; revenue: number }[];
  revenueByCountry: { country: string; revenue: number }[];
  runRate: number;
  projectedNtm: number;
  last3Months: number;
  last6Months: number;
  last12Months: number;
  trackAttention: Record<string, TrackAttention>;
  hasAttention: boolean;
  rowStats: RowStats;
};

export const emptyAttention = (): TrackAttention => ({
  tiktokViews: 0,
  tiktokVideos: 0,
  reelsUses: 0,
  youtubeViews: 0,
  shazamCount: 0,
  playlistAdds: 0,
  socialViews: 0,
  engagement: 0,
});

export const emptyRowStats = (): RowStats => ({
  totalRows: 0,
  rowsWithRevenue: 0,
  rowsWithMissingRevenue: 0,
  rowsWithDate: 0,
  rowsWithMissingDate: 0,
  rowsWithIsrc: 0,
  rowsWithMissingIsrc: 0,
  rowsWithArtist: 0,
});
