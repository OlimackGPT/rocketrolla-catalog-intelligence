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
