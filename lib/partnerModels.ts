import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';
import { DealReadiness } from './dealReadiness';
import { AttentionAdjustedValuation } from './attentionValuation';
import { TrackMomentum } from './trackMomentum';
import { UnderwritingResult } from './underwritingEngine';

export type PartnerModelId =
  | 'duetti'
  | 'beatbread'
  | 'sound-royalties'
  | 'acrylic'
  | 'third-chair'
  | 'strommar'
  | 'aamf'
  | 'meteor'
  | 'streamfic'
  | 'next-chapter'
  | 'melino';

export type PartnerValuationKind = 'dollar' | 'strategic';

export type PartnerValuation = {
  id: PartnerModelId;
  name: string;
  category: string;
  structure: string;
  kind: PartnerValuationKind;
  range?: { low: number; high: number; midpoint: number };
  termOptions?: { term: string; estimate: number }[];
  ownershipImpact: string;
  bestFor: string;
  mainRisk: string;
  whyFit: string;
  whyNotFit: string;
  whatPartnerLikes: string;
  whatPartnerQuestions: string;
  suggestedAsk: string;
  fitScore: number;
  disclaimer: string;
  requiredProof: string[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const round = (n: number) => Math.max(0, Math.round(n / 100) * 100);

const DISCLAIMER_OFFER = (name: string) =>
  `Internal RocketRolla estimate. Not a real ${name} offer. Final terms depend on diligence, ownership, and partner approval.`;
const DISCLAIMER_STRATEGIC = (name: string) =>
  `Internal RocketRolla pathway score. Not a ${name} commitment. Real engagements require partner review.`;

function annualizedRevenue(metrics: RevenueMetrics): number {
  return Math.min(metrics.projectedNtm, metrics.last12Months || metrics.projectedNtm);
}

// Duetti is the most upside-sensitive financing/acquisition model. It blends
// the underwriting engine's historical comp, momentum, and track-level lenses,
// and is the model most likely to value future optimization (master-side
// participation, selected-track acquisition, royalty share).
function buildDuetti(input: PartnerInput): PartnerValuation {
  const { metrics, valuation, readiness, attentionVal, underwriting } = input;
  const comp = underwriting.methods.historicalComp;

  // Pull the Duetti range from the underwriting blend, biased slightly toward
  // the upper half because Duetti specifically prices upside (acquisition,
  // royalty share). If historical comp is applicable, anchor low/high around
  // the comp + strategic premiums.
  const final = underwriting.finalRange;
  const compRange = comp.applicable ? comp.range : final;

  // Duetti's natural floor: max of (final.low, compRange.low).
  // Duetti's natural ceiling: final.high boosted by attention upside cap when converting.
  const floor = Math.max(final.low, compRange.low);
  const upsideBoost = attentionVal.flags.attentionLiftsConfidence ? 1.18 : 1.05;
  const ceiling = Math.max(final.high, compRange.high) * upsideBoost;
  const midpoint = (floor + ceiling) / 2;

  const low = round(floor);
  const high = round(ceiling);
  const mid = round(midpoint);

  const fit = clamp(
    readiness.components.revenueConsistency * 0.25 +
      readiness.components.metadataCompleteness * 0.2 +
      valuation.confidence * 0.15 +
      readiness.components.recentGrowth * 0.15 +
      (attentionVal.flags.attentionLiftsConfidence ? 85 : 55) * 0.15 +
      (comp.applicable ? comp.qualityFactor * 100 : 50) * 0.1,
  );

  return {
    id: 'duetti',
    name: 'Duetti',
    category: 'Catalog Acquisition / Master-Side Participation',
    structure: 'Partial catalog sale · royalty share · selected tracks · master-side opportunity',
    kind: 'dollar',
    range: { low, high, midpoint: mid },
    ownershipImpact: 'Partial ownership transfer or master-side participation on selected tracks. Remainder of catalog stays with artist.',
    bestFor: 'Catalogs where historical earnings + track-level upside justify pricing future optimization, not just current run rate.',
    mainRisk: 'Single-track concentration or unclear publishing splits compresses the offer; clean rights are essential.',
    whyFit:
      'Duetti looks past current NTM to historical earning base and track-level upside. They are the most likely partner to price under-monetized attention and selected-track acquisition.',
    whyNotFit:
      'They pass when revenue is too lumpy, metadata is dirty, or ownership is unclear. They are not the right call for pure-advance / artist-keeps-everything structures.',
    whatPartnerLikes:
      'Historical earnings base, track-level revenue + attention upside, multi-platform earnings, ISRC-clean ownership.',
    whatPartnerQuestions:
      'Sample clearances, ownership splits, sustainability of the lead track, any outstanding advances, what is being sold vs retained.',
    suggestedAsk: `Frame as a partial-catalog or selected-tracks deal at ~$${mid.toLocaleString()}. Anchor on historical earnings and attention upside, not NTM alone. Open to royalty share on master-side participation.`,
    fitScore: fit,
    disclaimer: DISCLAIMER_OFFER('Duetti'),
    requiredProof: [
      '12+ months of revenue CSV with platform + country breakdown',
      'Full ISRC list with confirmed primary-artist tagging',
      'No-issue statement on sample clearances',
      'Track-level attention numbers (TikTok / Reels / YouTube / Shazam) if available',
      'Publishing splits and PRO registration confirmation',
    ],
  };
}

// BeatBread is term-based funding (12 / 24 / 36 months), artist keeps ownership.
// It is NOT a catalog purchase — values should be lower than Duetti when Duetti
// is modeled as acquisition.
function buildBeatBread(input: PartnerInput): PartnerValuation {
  const { metrics, valuation, readiness, attentionVal } = input;
  const annualized = annualizedRevenue(metrics);

  // Term-based discounting against reliable annualized.
  const stabilityFactor = Math.max(0.7, readiness.components.revenueConsistency / 100 + 0.2);
  const growthFactor = 1 + Math.max(0, (readiness.components.recentGrowth - 50) / 200);
  const attentionConfidenceFactor = attentionVal.flags.attentionLiftsConfidence ? 1.08 : 1.0;
  const dataPenalty = readiness.components.metadataCompleteness < 50 ? 0.8 : 1;
  const monthly = (annualized / 12) * stabilityFactor * growthFactor * attentionConfidenceFactor * dataPenalty;

  // Term × monthly × recoupment discount. Longer terms accept more risk → pay less per month.
  const term12 = round(monthly * 12 * 0.62);
  const term24 = round(monthly * 24 * 0.55);
  const term36 = round(monthly * 36 * 0.5);
  const low = Math.min(term12, term24, term36);
  const high = Math.max(term12, term24, term36);
  const mid = term24;

  const fit = clamp(
    readiness.components.recentGrowth * 0.3 +
      readiness.components.revenueConsistency * 0.25 +
      valuation.confidence * 0.2 +
      readiness.components.metadataCompleteness * 0.15 +
      readiness.components.ownershipClarity * 0.1,
  );

  return {
    id: 'beatbread',
    name: 'BeatBread',
    category: 'Term-Based Advance Funding · Artist Retains Ownership',
    structure: 'Term advance (12 / 24 / 36 mo) against future royalties',
    kind: 'dollar',
    range: { low, high, midpoint: mid },
    termOptions: [
      { term: '12 months', estimate: term12 },
      { term: '24 months', estimate: term24 },
      { term: '36 months', estimate: term36 },
    ],
    ownershipImpact: 'No ownership transfer. Artist keeps copyrights and masters; future royalties recoup the advance over the chosen term.',
    bestFor: 'Catalogs with growth signal and forthcoming releases that lift forward earnings.',
    mainRisk: 'Long-term agreements compress per-month value; short terms maximize per-month but limit total advance.',
    whyFit:
      'BeatBread\'s algorithmic model rewards growth + forward visibility. Fresh distributor reports and release roadmap directly move the offer.',
    whyNotFit:
      'Not the right tool when the goal is to sell or partially acquire. Static catalogs underperform here.',
    whatPartnerLikes:
      'Trend reports, upcoming releases, audience growth on Spotify For Artists / Apple For Artists, distributor migration plans.',
    whatPartnerQuestions:
      'Any planned signings, outstanding advances, distribution changes that could disrupt forward royalties.',
    suggestedAsk: `Upload latest distributor reports and negotiate on current momentum. 24-month term is the natural middle at ~$${mid.toLocaleString()}.`,
    fitScore: fit,
    disclaimer: DISCLAIMER_OFFER('BeatBread'),
    requiredProof: [
      'Latest 6 months of distributor reports (CSV)',
      'List of upcoming releases (next 6 months)',
      'Audience trend screenshots (Spotify / Apple For Artists)',
    ],
  };
}

// Sound Royalties is a royalty-backed advance — artist keeps all copyrights.
// Less sensitive to social attention than Duetti; cares about royalty reliability.
function buildSoundRoyalties(input: PartnerInput): PartnerValuation {
  const { metrics, valuation, readiness } = input;
  const annualized = annualizedRevenue(metrics);
  const stabilityFactor = Math.min(1, readiness.components.revenueConsistency / 100 + 0.15);
  const ownershipFactor = Math.min(1, readiness.components.ownershipClarity / 100 + 0.1);
  const concentrationFactor = Math.min(1, readiness.components.trackDiversification / 100 + 0.25);

  // Conservative band: 1.8×–2.5× annualized × stability × ownership × concentration.
  const lowMult = 1.8 * stabilityFactor * ownershipFactor * concentrationFactor;
  const highMult = 2.5 * stabilityFactor * ownershipFactor * concentrationFactor;
  const low = round(annualized * lowMult);
  const high = round(annualized * highMult);
  const mid = round((low + high) / 2);

  const fit = clamp(
    readiness.components.revenueConsistency * 0.4 +
      readiness.components.ownershipClarity * 0.3 +
      valuation.confidence * 0.2 +
      (100 - readiness.components.trackDiversification) * 0.1,
  );

  return {
    id: 'sound-royalties',
    name: 'Sound Royalties',
    category: 'Royalty-Backed Advance · Artist Keeps Copyrights',
    structure: 'Advance against existing royalty streams · no ownership transfer',
    kind: 'dollar',
    range: { low, high, midpoint: mid },
    ownershipImpact: 'No ownership transfer. Artist retains copyrights and masters.',
    bestFor: 'Catalogs with consistent royalty streams and clean publishing setup.',
    mainRisk: 'Unstable monthly revenue or unrecouped prior advances reduce the offer materially. Attention alone does not move this lender.',
    whyFit:
      'Recoupment risk is what they price. Predictable, multi-platform royalties are the strongest signal in their underwriting.',
    whyNotFit:
      'Less competitive on aggressive valuations or full catalog sales. Attention-heavy / revenue-light catalogs are not the natural fit.',
    whatPartnerLikes:
      'Predictable royalty flow, clean PRO/publishing setup, documented split sheets, no outstanding advances.',
    whatPartnerQuestions:
      'Any outstanding advances, holds, claims, or pending issues that could interrupt royalty flow.',
    suggestedAsk: `Frame as a temporary liquidity event, not a sale. Anchor at ~$${mid.toLocaleString()} against the reliable royalty base.`,
    fitScore: fit,
    disclaimer: DISCLAIMER_OFFER('Sound Royalties'),
    requiredProof: [
      'Royalty statements from the last 12 months',
      'Documented split sheets and publisher confirmation',
      'Confirmation no outstanding advances are in place',
    ],
  };
}

function buildAcrylic(input: PartnerInput): PartnerValuation {
  const { readiness, trackMomentum } = input;
  const syncCandidates = trackMomentum.filter(
    (t) => t.tags.includes('Sync Candidate') || t.tags.includes('Attention Driver'),
  );
  const syncReadiness = readiness.components.syncReadiness;
  const fit = clamp(syncReadiness * 0.6 + (syncCandidates.length > 0 ? 70 : 30) * 0.4);
  return {
    id: 'acrylic',
    name: 'Acrylic',
    category: 'Sync / Sports / Brand Placements',
    structure: 'Placement revenue · no advance · per-use licensing',
    kind: 'strategic',
    ownershipImpact: 'No ownership transfer. Per-placement license fees.',
    bestFor: 'Catalogs with sync-ready, instrumental, or genre-flexible tracks.',
    mainRisk: 'Without stems or cleared masters, the catalog is invisible to supervisors.',
    whyFit:
      "Strong sync potential and attention signal map to Acrylic's pipelines (sports, branded content, campaigns).",
    whyNotFit:
      'Wrong fit if the catalog is vocal-forward with uncleared samples or no instrumentals.',
    whatPartnerLikes:
      'Tight curation (5–15 tracks), instrumental versions, clean masters, quick clearance answers.',
    whatPartnerQuestions:
      'Are stems available? Any sample clearance issues? Any exclusivity in place?',
    suggestedAsk:
      'Lead with a sports/brand reel of the strongest sync candidates. If stems are missing, prep with AudioShake first.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Acrylic'),
    requiredProof: [
      'Curated 5–15 track sync reel (instrumental priority)',
      'Confirmation all samples are cleared',
      'Stems available or AudioShake-prep planned',
    ],
  };
}

function buildThirdChair(input: PartnerInput): PartnerValuation {
  const { readiness, metrics } = input;
  const rightsLeakage =
    (100 - readiness.components.metadataCompleteness) * 0.4 +
    (100 - readiness.components.ownershipClarity) * 0.4 +
    Math.min(
      100,
      Math.log10(
        (metrics.trackAttention[Object.keys(metrics.trackAttention)[0]]?.tiktokViews ?? 0) + 1,
      ) * 20,
    ) *
      0.2;
  const fit = clamp(rightsLeakage);
  return {
    id: 'third-chair',
    name: 'Third Chair',
    category: 'Rights Recovery · Claims · Unlicensed Usage',
    structure: 'Claims revenue · venue / hotel / event / UGC detection',
    kind: 'strategic',
    ownershipImpact: 'No ownership transfer. Passive claims-based revenue.',
    bestFor: 'Catalogs with UGC exposure or unclear public-performance reporting.',
    mainRisk: "No usable signal if metadata + ownership aren't locked first.",
    whyFit:
      'Detects unmonetized public-performance and venue/hotel/event uses. Most indie catalogs leave revenue on the table here.',
    whyNotFit:
      'Diminishing returns once metadata + publishing admin are already clean.',
    whatPartnerLikes:
      'Confirmed ISRCs, clear ownership splits, active touring / venue footprint.',
    whatPartnerQuestions:
      'Are PRO registrations current? Any venue performance data available?',
    suggestedAsk:
      'Run a baseline claims scan. Commit to ongoing monitoring only if recovery > admin cost.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Third Chair'),
    requiredProof: ['Confirmed ownership splits', 'ISRC list', 'PRO registration confirmed'],
  };
}

function buildStrommar(input: PartnerInput): PartnerValuation {
  const { metrics, readiness } = input;
  const platformConcentration = 100 - readiness.components.platformDiversification;
  const fit = clamp(
    platformConcentration * 0.45 +
      (metrics.monthlyRevenue.length < 6 ? 70 : 40) * 0.2 +
      (100 - readiness.components.metadataCompleteness) * 0.35,
  );
  return {
    id: 'strommar',
    name: 'Strommar',
    category: 'Distribution Infrastructure · Release Ops · Migration',
    structure: 'Distribution migration + release ops + team structure',
    kind: 'strategic',
    ownershipImpact: 'No ownership transfer. Distribution stack only.',
    bestFor: 'Catalogs with messy distributor reports, single-platform exposure, or migration needs.',
    mainRisk: 'Migrating mid-deal can disrupt royalty flow timing — schedule carefully.',
    whyFit:
      'Better release ops widen the platform mix and produce the clean reports financing partners want.',
    whyNotFit:
      'Already-clean stacks with diversified DSPs see less marginal benefit.',
    whatPartnerLikes:
      'Catalogs ready to consolidate distribution and willing to invest in long-term infrastructure.',
    whatPartnerQuestions:
      'Existing distributor contracts and release schedule conflicts.',
    suggestedAsk:
      'Audit current distribution coverage and migrate before any major partner outreach.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Strommar'),
    requiredProof: ['Current distributor + agreements', 'Release schedule for next 6 mo'],
  };
}

function buildAamf(input: PartnerInput): PartnerValuation {
  const { readiness, valuation } = input;
  const fit = clamp(
    readiness.components.recentGrowth * 0.35 +
      readiness.components.partnerFit * 0.25 +
      valuation.confidence * 0.2 +
      readiness.components.syncReadiness * 0.2,
  );
  return {
    id: 'aamf',
    name: 'Albany Avenue Music Fund (AAMF)',
    category: 'Strategic Funding · Advisory · Fund-Style Opportunity',
    structure: 'Strategic capital + team backing',
    kind: 'strategic',
    ownershipImpact: 'Negotiable — usually structured as equity / advisory + capital.',
    bestFor: 'Artists with a growth story, team potential, and strategic upside — not static catalogs.',
    mainRisk: 'Requires a credible team narrative; a pure catalog play is the wrong frame.',
    whyFit:
      'Strong when there is forward narrative: upcoming releases, audience growth, cultural relevance.',
    whyNotFit:
      'Bad fit when the catalog is static and the goal is short-term liquidity.',
    whatPartnerLikes:
      'Compelling team, active release roadmap, and a clear thesis on what 18 months looks like.',
    whatPartnerQuestions:
      'Who is on the team, what is the next release, what is the use of funds?',
    suggestedAsk:
      'Pitch a 12–18 month plan and what capital + advisory unlocks. Bring the team.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('AAMF'),
    requiredProof: ['12–18 month plan', 'Team / management overview', 'Use-of-funds memo'],
  };
}

function buildMeteor(input: PartnerInput): PartnerValuation {
  const { metrics, readiness } = input;
  const latinShare =
    metrics.revenueByCountry
      .filter((c) =>
        ['MX', 'BR', 'AR', 'ES', 'CO', 'CL', 'PE', 'UY', 'VE', 'EC'].includes(c.country),
      )
      .reduce((s, c) => s + c.revenue, 0) / Math.max(1, metrics.totalRevenue);
  const fit = clamp(
    latinShare * 100 * 0.5 +
      readiness.components.recentGrowth * 0.3 +
      readiness.components.syncReadiness * 0.2,
  );
  return {
    id: 'meteor',
    name: 'Meteor',
    category: 'Culture · Independent Latin · Strategic Artist Partner',
    structure: 'Collaboration · cultural strategy · regional positioning',
    kind: 'strategic',
    ownershipImpact: 'No ownership transfer. Strategic engagement only.',
    bestFor: 'Artists with cultural fit, regional story, or collaboration potential.',
    mainRisk: 'Soft commitments — value compounds over time, not in a single deal.',
    whyFit:
      'High-level independent Latin and culture-driven catalogs benefit from collaboration and strategic positioning.',
    whyNotFit: 'Pure financial transactions, no cultural angle.',
    whatPartnerLikes:
      'A genuine artistic identity, clear collaboration ideas, and a regional thesis.',
    whatPartnerQuestions: 'What collaborations are realistic in the next 6 months?',
    suggestedAsk:
      'Lead with culture and collaboration intent. Money follows narrative here.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Meteor'),
    requiredProof: ['Artistic narrative / one-pager', 'Realistic collaboration shortlist'],
  };
}

function buildStreamfic(input: PartnerInput): PartnerValuation {
  const { trackMomentum } = input;
  const totalTiktok = trackMomentum.reduce((s, t) => s + (t.attention.tiktokViews ?? 0), 0);
  const totalReels = trackMomentum.reduce((s, t) => s + (t.attention.reelsUses ?? 0), 0);
  const ugcSignal = Math.log10(totalTiktok + totalReels * 1000 + 1) * 12;
  const fit = clamp(ugcSignal + 10);
  return {
    id: 'streamfic',
    name: 'Streamfic',
    category: 'Creator Campaigns · Short-Form · UGC Activation',
    structure: 'Creator activation · short-form campaigns · streamer/UGC infra',
    kind: 'strategic',
    ownershipImpact: 'No ownership transfer. Performance-marketing style engagement.',
    bestFor: 'Tracks with TikTok / Reels / streamer / UGC potential.',
    mainRisk: 'Without an attention-friendly track, campaign returns are noisy.',
    whyFit:
      'When the catalog has tracks that move in short-form, a structured creator campaign compounds reach into revenue.',
    whyNotFit:
      'Wrong fit for traditional album-cycle artists with no short-form footprint.',
    whatPartnerLikes:
      'A breakout track or attention-driver, a budget for activations, and a creative concept.',
    whatPartnerQuestions: 'What is the breakout track? What is the campaign budget?',
    suggestedAsk:
      'Pick the strongest Attention Driver and pitch a 60-day creator activation campaign.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Streamfic'),
    requiredProof: [
      'Lead Attention Driver track and concept',
      'Campaign budget range',
      'Creative direction',
    ],
  };
}

function buildNextChapter(input: PartnerInput): PartnerValuation {
  const { readiness } = input;
  const fit = clamp(
    readiness.components.partnerFit * 0.35 +
      readiness.components.recentGrowth * 0.25 +
      readiness.components.territoryDiversification * 0.2 +
      readiness.components.valuationConfidence * 0.2,
  );
  return {
    id: 'next-chapter',
    name: 'Next Chapter',
    category: 'International Expansion · Strategic Partner · Dubai / Global',
    structure: 'Advisory · funding · market-entry support',
    kind: 'strategic',
    ownershipImpact: 'Structured per engagement — usually strategic, not ownership.',
    bestFor: 'Artists with global expansion or market-entry potential.',
    mainRisk: 'Slower-moving than a financing deal; expect a strategic horizon.',
    whyFit:
      'Strong when the catalog is gaining traction in a new market and needs operational support to convert.',
    whyNotFit: 'Not the right fit for short-term liquidity needs.',
    whatPartnerLikes:
      'A clear expansion thesis (which markets, why now) and existing traction in those markets.',
    whatPartnerQuestions:
      'What is the next market, and what does the engagement need to look like?',
    suggestedAsk:
      'Bring a 12-month international plan and explicit asks (introductions, capital, ops).',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Next Chapter'),
    requiredProof: [
      'Target market thesis + traction',
      '12-month expansion roadmap',
    ],
  };
}

function buildMelino(input: PartnerInput): PartnerValuation {
  const { readiness, valuation } = input;
  const fit = clamp(
    readiness.components.partnerFit * 0.3 +
      readiness.components.recentGrowth * 0.25 +
      valuation.confidence * 0.25 +
      readiness.components.syncReadiness * 0.2,
  );
  return {
    id: 'melino',
    name: 'Melino',
    category: 'Strategic Music Business Partner',
    structure: 'Advisory · funding · catalog ops · rights / growth pathway',
    kind: 'strategic',
    ownershipImpact: 'Structured per engagement — strategic vs ownership negotiable.',
    bestFor: 'Artists/catalogs that need a multi-layer infrastructure partner.',
    mainRisk: 'Engagement requires a real plan; not the right call without one.',
    whyFit:
      'Wraps several functions (advisory, funding, catalog ops) into a single relationship. Helpful when the artist needs operating leverage.',
    whyNotFit: 'Too heavy if the only need is one tactical service.',
    whatPartnerLikes: 'A holistic plan and willingness to engage long-term.',
    whatPartnerQuestions: 'What is broken today, and what does year 1 look like?',
    suggestedAsk: 'Pitch a year-1 operating plan and the specific gaps Melino fills.',
    fitScore: fit,
    disclaimer: DISCLAIMER_STRATEGIC('Melino'),
    requiredProof: ['Year-1 operating plan', 'Specific service gaps to close'],
  };
}

type PartnerInput = {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  readiness: DealReadiness;
  attentionVal: AttentionAdjustedValuation;
  trackMomentum: TrackMomentum[];
  underwriting: UnderwritingResult;
};

export function buildPartnerValuations(input: PartnerInput): PartnerValuation[] {
  return [
    buildDuetti(input),
    buildBeatBread(input),
    buildSoundRoyalties(input),
    buildAcrylic(input),
    buildThirdChair(input),
    buildStrommar(input),
    buildAamf(input),
    buildMeteor(input),
    buildStreamfic(input),
    buildNextChapter(input),
    buildMelino(input),
  ].sort((a, b) => b.fitScore - a.fitScore);
}
