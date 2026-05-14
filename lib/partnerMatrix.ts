import { PartnerValuation, PartnerModelId } from './partnerModels';

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
  snafu: 'purple',
  acrylic: 'purple',
  'third-chair': 'blue',
  'copyright-delta': 'blue',
  rightshub: 'blue',
  strommar: 'blue',
  aamf: 'rose',
  meteor: 'rose',
  streamfic: 'amber',
  'next-chapter': 'rose',
  melino: 'rose',
};

function prepForPartner(p: PartnerValuation): string[] {
  return p.requiredProof;
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
