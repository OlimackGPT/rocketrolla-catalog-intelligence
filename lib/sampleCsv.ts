// Sample CSV with the full extended schema, including optional attention columns.
// Numbers are realistic and parse cleanly through parseCsv().
export const sampleCsvFilename = 'rocketrolla-sample-catalog.csv';

export const sampleCsvContent = [
  'track_title,isrc,artist,platform,country,month,streams,revenue,tiktok_views,tiktok_videos,reels_uses,youtube_views,shazam_count,playlist_adds',
  'Midnight Tape,US-RR1-24-00001,Nova Pines,Spotify,US,2025-09,82000,328.00,4.2M,1240,380,880k,22000,14',
  'Midnight Tape,US-RR1-24-00001,Nova Pines,Apple Music,US,2025-09,21000,168.00,,,,,,',
  'Midnight Tape,US-RR1-24-00001,Nova Pines,YouTube Music,US,2025-09,38000,76.00,,,,,,',
  'Midnight Tape,US-RR1-24-00001,Nova Pines,Spotify,BR,2025-09,45000,90.00,,,,,,',
  'Fever Coast,US-RR1-24-00002,Nova Pines,Spotify,US,2025-09,52000,208.00,950k,320,120,540k,9400,8',
  'Fever Coast,US-RR1-24-00002,Nova Pines,Apple Music,UK,2025-09,11000,77.00,,,,,,',
  'Honey Spill,US-RR1-25-00005,Nova Pines,Spotify,MX,2025-09,38000,114.00,2.7M,540,210,615k,11500,9',
  'Honey Spill,US-RR1-25-00005,Nova Pines,YouTube Music,US,2025-09,24000,48.00,,,,,,',
  'Silver Smoke,US-RR1-24-00004,Nova Pines,Spotify,US,2025-09,18000,72.00,220k,90,45,260k,5200,6',
  'Neon Marigold,US-RR1-24-00003,Nova Pines,Spotify,US,2025-09,12000,48.00,180k,65,30,410k,4800,3',
  'Velvet Shore,US-RR1-25-00006,Nova Pines,Spotify,US,2025-09,7000,28.00,110k,40,18,180k,2400,4',
  // A few extra months for trend signal.
  'Midnight Tape,US-RR1-24-00001,Nova Pines,Spotify,US,2025-10,91000,364.00,,,,,,',
  'Midnight Tape,US-RR1-24-00001,Nova Pines,Spotify,US,2025-11,104000,416.00,,,,,,',
  'Fever Coast,US-RR1-24-00002,Nova Pines,Spotify,US,2025-10,54000,216.00,,,,,,',
  'Fever Coast,US-RR1-24-00002,Nova Pines,Spotify,US,2025-11,56000,224.00,,,,,,',
  'Honey Spill,US-RR1-25-00005,Nova Pines,Spotify,MX,2025-10,46000,138.00,,,,,,',
  'Honey Spill,US-RR1-25-00005,Nova Pines,Spotify,MX,2025-11,61000,183.00,,,,,,',
].join('\n');

export const expectedColumnSchema = [
  { key: 'track_title', label: 'Track / Song Title', required: true, group: 'core' },
  { key: 'month', label: 'Date / Month', required: true, group: 'core' },
  { key: 'revenue', label: 'Revenue / Earnings (USD)', required: true, group: 'core' },
  { key: 'isrc', label: 'ISRC', required: false, group: 'core' },
  { key: 'artist', label: 'Primary Artist', required: false, group: 'core' },
  { key: 'platform', label: 'Platform / DSP', required: false, group: 'core' },
  { key: 'country', label: 'Country / Territory', required: false, group: 'core' },
  { key: 'streams', label: 'Streams / Plays', required: false, group: 'core' },
  { key: 'tiktok_views', label: 'TikTok Views', required: false, group: 'attention' },
  { key: 'tiktok_videos', label: 'TikTok Videos / Sound Uses', required: false, group: 'attention' },
  { key: 'reels_uses', label: 'Instagram Reels Using Sound', required: false, group: 'attention' },
  { key: 'youtube_views', label: 'YouTube + Shorts Views', required: false, group: 'attention' },
  { key: 'shazam_count', label: 'Shazam Count', required: false, group: 'attention' },
  { key: 'playlist_adds', label: 'Playlist Adds', required: false, group: 'attention' },
] as const;
