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
};

export type RevenueMetrics = {
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  revenueByTrack: { name: string; revenue: number }[];
  platformBreakdown: { name: string; revenue: number }[];
  countryBreakdown: { name: string; revenue: number }[];
  runRate: number;
  projectedNtm: number;
  last3Months: number;
  last6Months: number;
  last12Months: number;
};
