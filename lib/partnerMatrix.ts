import { PartnerValuation, PartnerModelId } from './partnerModels';

// Lightweight presentation type kept for components that only need quick
// fit + accent info. The full per-partner valuation lives in partnerModels.ts.
export type PartnerAccent = 'purple' | 'emerald' | 'blue' | 'amber' | 'rose';

export type PartnerEntry = {
  id: PartnerModelId;
  name: string;
  category: string;
  categoryLabel: string;
  fit: number;
  whyFit: string;
  whyNotFit: string;
  requiredPrep: string[];
  pitchAngle: string;
  accent: PartnerAccent;
};

const ACCENT_BY_PARTNER: Record<PartnerModelId, PartnerAccent> = {
  duetti: 'purple',
  beatbread: 'purple',
  'sound-royalties': 'emerald',
  acrylic: 'purple',
  'third-chair': 'blue',
  strommar: 'blue',
  aamf: 'rose',
  meteor: 'rose',
  streamfic: 'amber',
  'next-chapter': 'rose',
  melino: 'rose',
};

function prepForPartner(p: PartnerValuation): string[] {
  switch (p.id) {
    case 'duetti':
      return [
        '12 months of revenue CSV with platform + country split',
        'Full ISRC list with confirmed primary-artist tagging',
        'No-issue statement on sample clearances',
        'Optional attention CSV columns (TikTok / Reels / YouTube / Shazam)',
      ];
    case 'beatbread':
      return [
        'Latest distributor reports (CSV)',
        'List of upcoming releases (next 6 mo)',
        'Spotify For Artists / Apple For Artists audience screenshots',
      ];
    case 'sound-royalties':
      return [
        'Royalty statements from the last 12 months',
        'Documented split sheets and publisher confirmation',
        'Confirmation no outstanding advances are in place',
      ];
    case 'acrylic':
      return [
        'Curated 5–15 track sync reel (instrumentals priority)',
        'Confirmation all samples are cleared',
        'Stems available or AudioShake-prep planned',
      ];
    case 'third-chair':
      return ['Confirmed ownership splits', 'ISRC list', 'PRO registration confirmed'];
    case 'strommar':
      return ['Current distributor + agreements', 'Release schedule for next 6 mo'];
    case 'aamf':
      return ['12–18 month plan', 'Team / management overview', 'Use-of-funds memo'];
    case 'meteor':
      return ['Artistic narrative / one-pager', 'Realistic collaboration shortlist'];
    case 'streamfic':
      return ['Lead Attention Driver track and concept', 'Campaign budget range', 'Creative direction'];
    case 'next-chapter':
      return ['Target market thesis + traction', '12-month expansion roadmap'];
    case 'melino':
      return ['Year-1 operating plan', 'Specific service gaps to close'];
  }
}

export function buildPartnerMatrix(partnerValuations: PartnerValuation[]): PartnerEntry[] {
  return partnerValuations.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    categoryLabel: p.category,
    fit: p.fitScore,
    whyFit: p.whyFit,
    whyNotFit: p.whyNotFit,
    requiredPrep: prepForPartner(p),
    pitchAngle: p.suggestedAsk,
    accent: ACCENT_BY_PARTNER[p.id] ?? 'purple',
  }));
}
