import { RevenueRow, TrackAttention } from './types';

type Track = {
  title: string;
  isrc: string;
  artist: string;
  share: number;
  trajectory: 'rising' | 'stable' | 'declining' | 'sleeper' | 'late-release';
  syncFriendly: boolean;
  attention: TrackAttention;
};

const TRACKS: Track[] = [
  {
    title: 'Midnight Tape',
    isrc: 'US-RR1-24-00001',
    artist: 'Nova Pines',
    share: 0.32,
    trajectory: 'rising',
    syncFriendly: true,
    attention: {
      tiktokViews: 4_200_000,
      tiktokVideos: 1_240,
      reelsUses: 380,
      youtubeViews: 880_000,
      shazamCount: 22_000,
      playlistAdds: 14,
      socialViews: 5_500_000,
      engagement: 0,
    },
  },
  {
    title: 'Fever Coast',
    isrc: 'US-RR1-24-00002',
    artist: 'Nova Pines',
    share: 0.22,
    trajectory: 'stable',
    syncFriendly: false,
    attention: {
      tiktokViews: 950_000,
      tiktokVideos: 320,
      reelsUses: 120,
      youtubeViews: 540_000,
      shazamCount: 9_400,
      playlistAdds: 8,
      socialViews: 1_700_000,
      engagement: 0,
    },
  },
  {
    title: 'Neon Marigold',
    isrc: 'US-RR1-24-00003',
    artist: 'Nova Pines',
    share: 0.16,
    trajectory: 'declining',
    syncFriendly: true,
    attention: {
      tiktokViews: 180_000,
      tiktokVideos: 65,
      reelsUses: 30,
      youtubeViews: 410_000,
      shazamCount: 4_800,
      playlistAdds: 3,
      socialViews: 700_000,
      engagement: 0,
    },
  },
  {
    title: 'Silver Smoke',
    isrc: 'US-RR1-24-00004',
    artist: 'Nova Pines',
    share: 0.12,
    trajectory: 'stable',
    syncFriendly: true,
    attention: {
      tiktokViews: 220_000,
      tiktokVideos: 90,
      reelsUses: 45,
      youtubeViews: 260_000,
      shazamCount: 5_200,
      playlistAdds: 6,
      socialViews: 600_000,
      engagement: 0,
    },
  },
  {
    title: 'Honey Spill',
    isrc: 'US-RR1-25-00005',
    artist: 'Nova Pines',
    share: 0.10,
    trajectory: 'late-release',
    syncFriendly: false,
    attention: {
      tiktokViews: 2_700_000,
      tiktokVideos: 540,
      reelsUses: 210,
      youtubeViews: 615_000,
      shazamCount: 11_500,
      playlistAdds: 9,
      socialViews: 3_400_000,
      engagement: 0,
    },
  },
  {
    title: 'Velvet Shore',
    isrc: 'US-RR1-25-00006',
    artist: 'Nova Pines',
    share: 0.08,
    trajectory: 'sleeper',
    syncFriendly: true,
    attention: {
      tiktokViews: 110_000,
      tiktokVideos: 40,
      reelsUses: 18,
      youtubeViews: 180_000,
      shazamCount: 2_400,
      playlistAdds: 4,
      socialViews: 320_000,
      engagement: 0,
    },
  },
];

const PLATFORM_MIX: { name: string; share: number }[] = [
  { name: 'Spotify', share: 0.54 },
  { name: 'Apple Music', share: 0.21 },
  { name: 'YouTube Music', share: 0.13 },
  { name: 'Amazon Music', share: 0.07 },
  { name: 'Tidal', share: 0.03 },
  { name: 'SoundCloud', share: 0.02 },
];

const COUNTRY_MIX: { name: string; share: number }[] = [
  { name: 'US', share: 0.42 },
  { name: 'BR', share: 0.14 },
  { name: 'MX', share: 0.09 },
  { name: 'UK', share: 0.08 },
  { name: 'DE', share: 0.07 },
  { name: 'CA', share: 0.05 },
  { name: 'AU', share: 0.05 },
  { name: 'FR', share: 0.04 },
  { name: 'NL', share: 0.03 },
  { name: 'ES', share: 0.03 },
];

function trajectoryMultiplier(trajectory: Track['trajectory'], monthIndex: number, totalMonths: number): number {
  const t = monthIndex / Math.max(1, totalMonths - 1);
  switch (trajectory) {
    case 'rising':
      return 0.55 + 0.95 * t;
    case 'declining':
      return 1.35 - 0.75 * t;
    case 'sleeper':
      return 0.7 + 0.5 * Math.sin(t * Math.PI);
    case 'late-release':
      return t < 0.45 ? 0 : 0.5 + 1.6 * (t - 0.45);
    case 'stable':
    default:
      return 0.9 + 0.2 * Math.sin(t * Math.PI * 2);
  }
}

function buildMockRows(): RevenueRow[] {
  const rows: RevenueRow[] = [];
  const monthlyBase = 4200;
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  months.forEach((month, mi) => {
    const monthGrowth = 1 + 0.04 * mi;
    const monthRev = monthlyBase * monthGrowth;

    TRACKS.forEach((track) => {
      const traj = trajectoryMultiplier(track.trajectory, mi, months.length);
      if (traj <= 0) return;
      const trackRev = monthRev * track.share * traj;
      if (trackRev < 1) return;

      PLATFORM_MIX.forEach((platform) => {
        const platformRev = trackRev * platform.share;
        if (platformRev < 0.5) return;
        COUNTRY_MIX.forEach((country) => {
          const cellRev = platformRev * country.share;
          if (cellRev < 0.2) return;
          const streams = Math.round((cellRev / 0.003) * (0.85 + Math.random() * 0.3));
          const isFirstRowForTrack = mi === 0 && platform === PLATFORM_MIX[0] && country === COUNTRY_MIX[0];
          rows.push({
            trackTitle: track.title,
            isrc: track.isrc,
            artist: track.artist,
            platform: platform.name,
            country: country.name,
            month,
            streams,
            revenueUsd: Number(cellRev.toFixed(2)),
            currency: 'USD',
            // Attach attention only once per track to keep rows lean.
            attention: isFirstRowForTrack ? track.attention : undefined,
          });
        });
      });
    });
  });

  return rows;
}

export const mockRows: RevenueRow[] = buildMockRows();

export const mockTracksMeta = TRACKS;
