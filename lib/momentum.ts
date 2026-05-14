export type MomentumInputs = {
  spotifyMonthlyListeners?: number;
  spotifyFollowers?: number;
  youtubeSubscribers?: number;
  youtubeMonthlyViews?: number;
  tiktokFollowers?: number;
  tiktokVideosUsingSound?: number;
  tiktokViewsOnSound?: number;
  instagramFollowers?: number;
  reelsUsage?: number;
  shazamCount?: number;
  playlistAdds?: number;
  upcomingReleases?: number;
  confirmedCollaborations?: number;
  recentPressOrCosigns?: number;
  notes?: string;
};

export const defaultMomentum: MomentumInputs = {};

export const mockMomentum: MomentumInputs = {
  spotifyMonthlyListeners: 245000,
  spotifyFollowers: 38500,
  youtubeSubscribers: 12400,
  youtubeMonthlyViews: 880000,
  tiktokFollowers: 65000,
  tiktokVideosUsingSound: 1240,
  tiktokViewsOnSound: 4200000,
  instagramFollowers: 41000,
  reelsUsage: 380,
  shazamCount: 22000,
  playlistAdds: 14,
  upcomingReleases: 2,
  confirmedCollaborations: 1,
  recentPressOrCosigns: 3,
};

export type MomentumGroup = {
  id: 'streaming' | 'social' | 'pipeline';
  label: string;
  fields: { key: keyof MomentumInputs; label: string; hint?: string; unit?: string }[];
};

export const momentumGroups: MomentumGroup[] = [
  {
    id: 'streaming',
    label: 'Streaming Footprint',
    fields: [
      { key: 'spotifyMonthlyListeners', label: 'Spotify monthly listeners' },
      { key: 'spotifyFollowers', label: 'Spotify followers' },
      { key: 'youtubeSubscribers', label: 'YouTube subscribers' },
      { key: 'youtubeMonthlyViews', label: 'YouTube monthly views' },
      { key: 'shazamCount', label: 'Shazam count' },
      { key: 'playlistAdds', label: 'Recent editorial playlist adds' },
    ],
  },
  {
    id: 'social',
    label: 'Social Momentum',
    fields: [
      { key: 'tiktokFollowers', label: 'TikTok followers' },
      { key: 'tiktokVideosUsingSound', label: 'TikTok videos using the sound' },
      { key: 'tiktokViewsOnSound', label: 'TikTok views on the sound' },
      { key: 'instagramFollowers', label: 'Instagram followers' },
      { key: 'reelsUsage', label: 'Reels using the sound' },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline & Cosigns',
    fields: [
      { key: 'upcomingReleases', label: 'Confirmed upcoming releases (next 6 mo)' },
      { key: 'confirmedCollaborations', label: 'Confirmed collaborations' },
      { key: 'recentPressOrCosigns', label: 'Recent press / major cosigns' },
    ],
  },
];

export type MomentumSignals = {
  hasInputs: boolean;
  streamingScore: number;
  socialScore: number;
  pipelineScore: number;
  overall: number;
  syncReady: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function scoreFromLog(value: number | undefined, target: number): number {
  if (!value || value <= 0) return 0;
  const ratio = Math.log10(value + 1) / Math.log10(target + 1);
  return Math.min(100, ratio * 100);
}

export function computeMomentumSignals(m: MomentumInputs): MomentumSignals {
  const hasInputs = Object.values(m).some(
    (v) => typeof v === 'number' && v > 0,
  );

  const streamingScore = clamp(
    (scoreFromLog(m.spotifyMonthlyListeners, 1_000_000) * 0.45 +
      scoreFromLog(m.youtubeMonthlyViews, 5_000_000) * 0.25 +
      scoreFromLog(m.spotifyFollowers, 200_000) * 0.15 +
      scoreFromLog(m.shazamCount, 200_000) * 0.10 +
      scoreFromLog(m.playlistAdds, 30) * 0.05),
  );

  const socialScore = clamp(
    (scoreFromLog(m.tiktokViewsOnSound, 20_000_000) * 0.4 +
      scoreFromLog(m.tiktokVideosUsingSound, 10_000) * 0.25 +
      scoreFromLog(m.tiktokFollowers, 500_000) * 0.15 +
      scoreFromLog(m.instagramFollowers, 500_000) * 0.1 +
      scoreFromLog(m.reelsUsage, 5_000) * 0.1),
  );

  const pipelineScore = clamp(
    (scoreFromLog(m.upcomingReleases, 6) * 0.4 +
      scoreFromLog(m.confirmedCollaborations, 5) * 0.3 +
      scoreFromLog(m.recentPressOrCosigns, 8) * 0.3),
  );

  const overall = clamp(streamingScore * 0.45 + socialScore * 0.4 + pipelineScore * 0.15);

  const syncReady = clamp(
    scoreFromLog(m.shazamCount, 100_000) * 0.4 +
      scoreFromLog(m.tiktokViewsOnSound, 5_000_000) * 0.4 +
      scoreFromLog(m.playlistAdds, 20) * 0.2,
  );

  return { hasInputs, streamingScore, socialScore, pipelineScore, overall, syncReady };
}
