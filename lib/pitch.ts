import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';
import { DealReadiness, StrategyRecommendation } from './dealReadiness';
import { PartnerEntry } from './partnerMatrix';
import { PartnerModelId, PartnerValuation } from './partnerModels';
import { AttentionAdjustedValuation } from './attentionValuation';
import { UnderwritingResult } from './underwritingEngine';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

const fmtPct = (v: number) => `${Math.round(v * 100)}%`;

export type Snapshot = {
  artistName: string;
  catalogStage: string;
  topTrack: string;
  topPlatform: string;
  topCountry: string;
  monthsOfData: number;
  totalRevenue: number;
  runRate: number;
  projectedNtm: number;
  conservative: number;
  base: number;
  aggressive: number;
  confidence: number;
  readinessScore: number;
  readinessLabel: string;
  strategy: string;
  topPartner: string;
  // Underwriting layer
  underwritingFinalLow: number;
  underwritingFinalBase: number;
  underwritingFinalHigh: number;
  underwritingSuggestedAsk: number;
  underwritingConfidence: number;
};

export function buildSnapshot(input: {
  artistName?: string;
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  readiness: DealReadiness;
  strategy: StrategyRecommendation;
  partners: PartnerEntry[];
  underwriting: UnderwritingResult;
}): Snapshot {
  const { metrics, valuation, readiness, strategy, partners, underwriting } = input;
  const top = partners[0];
  return {
    artistName: input.artistName ?? '[Artist Name]',
    catalogStage: readiness.label,
    topTrack: metrics.revenueByTrack[0]?.track ?? '—',
    topPlatform: metrics.revenueByPlatform[0]?.platform ?? '—',
    topCountry: metrics.revenueByCountry[0]?.country ?? '—',
    monthsOfData: metrics.monthlyRevenue.length,
    totalRevenue: metrics.totalRevenue,
    runRate: metrics.runRate,
    projectedNtm: metrics.projectedNtm,
    conservative: valuation.conservative,
    base: valuation.base,
    aggressive: valuation.aggressive,
    confidence: valuation.confidence,
    readinessScore: readiness.total,
    readinessLabel: readiness.label,
    strategy: strategy.headline,
    topPartner: top?.name ?? '—',
    underwritingFinalLow: underwriting.finalRange.low,
    underwritingFinalBase: underwriting.finalRange.base,
    underwritingFinalHigh: underwriting.finalRange.high,
    underwritingSuggestedAsk: underwriting.suggestedAsk,
    underwritingConfidence: underwriting.confidence,
  };
}

export type PartnerPitch = {
  subject: string;
  body: string;
  internalSummary: string;
};

type AngleInput = {
  snapshot: Snapshot;
  partner: PartnerEntry;
  partnerValuation?: PartnerValuation;
  readiness: DealReadiness;
  strategy: StrategyRecommendation;
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  attentionVal: AttentionAdjustedValuation;
  underwriting: UnderwritingResult;
};

function topAttentionLine(attentionVal: AttentionAdjustedValuation): string {
  const top = attentionVal.attentionUpside.perTrack.find((p) => p.value > 0);
  if (!top) return 'No attention signals captured yet.';
  return `Top attention asset: ${top.track} (~${fmtUsd(top.value)} attention-driven contribution).`;
}

function rangeLine(pv?: PartnerValuation): string {
  if (!pv?.range) return '';
  return `Estimated internal range: ${fmtUsd(pv.range.low)}–${fmtUsd(pv.range.high)} (midpoint ${fmtUsd(pv.range.midpoint)}).`;
}

function commonOpener(snapshot: Snapshot, partner: PartnerEntry): string {
  return `Hi [Name],\n\nI'll keep this simple. We ran ${snapshot.artistName}'s catalog through RocketRolla's internal Catalog Intelligence Engine and ${partner.name} came out as a strong fit based on revenue profile, momentum, and attention signal.`;
}

function commonClose(): string {
  return `Happy to share the full data package and walk through the model.\n\n— [Your Name]\nRocketRolla · Infrastructure for independent artists`;
}

function angleDuetti(i: AngleInput): string {
  const { snapshot, partner, partnerValuation, attentionVal, metrics, underwriting } = i;
  const topTrackShare =
    metrics.totalRevenue > 0
      ? (metrics.revenueByTrack[0]?.revenue ?? 0) / metrics.totalRevenue
      : 0;
  const comp = underwriting.methods.historicalComp;
  return [
    commonOpener(snapshot, partner),
    '',
    `Why Duetti fits here:`,
    `· ${snapshot.monthsOfData} months of data · ${fmtUsd(snapshot.totalRevenue)} historical revenue · ${fmtUsd(snapshot.runRate)}/mo run rate.`,
    `· Pure NTM base puts the catalog at ${fmtUsd(snapshot.base)}, but ${comp.applicable ? `the historical comp method values it at ${fmtUsd(comp.range.low)}–${fmtUsd(comp.range.high)}` : 'the historical earning base supports a stronger floor'}.`,
    `· ${topAttentionLine(attentionVal)}`,
    `· Lead track ${snapshot.topTrack} is ${fmtPct(topTrackShare)} of revenue.`,
    `· Final internal range (blended, risk-adjusted): ${fmtUsd(snapshot.underwritingFinalLow)}–${fmtUsd(snapshot.underwritingFinalHigh)} at ${snapshot.underwritingConfidence}% confidence.`,
    '',
    rangeLine(partnerValuation),
    '',
    `Suggested structure: partial-catalog or selected-tracks deal that captures the upside on the lead assets while leaving the rest of the catalog untouched. Open to royalty share / master-side participation on the strongest tracks.`,
    '',
    commonClose(),
  ]
    .filter(Boolean)
    .join('\n');
}

function angleBeatBread(i: AngleInput): string {
  const { snapshot, partner, partnerValuation } = i;
  const termsLine = partnerValuation?.termOptions
    ?.map((t) => `${t.term}: ${fmtUsd(t.estimate)}`)
    .join(' · ');
  return [
    commonOpener(snapshot, partner),
    '',
    `Why BeatBread:`,
    `· Term-based advance — artist retains ownership of masters and copyrights.`,
    `· Last 12-mo revenue: ${fmtUsd(snapshot.totalRevenue)}, NTM forecast ${fmtUsd(snapshot.projectedNtm)}.`,
    `· Trajectory is the lever: distributor reports + upcoming releases will move the offer.`,
    '',
    termsLine ? `Internal term estimates: ${termsLine}.` : '',
    rangeLine(partnerValuation),
    '',
    `Suggested ask: pull the freshest distributor reports and negotiate on current momentum. Open to 12 / 24 / 36-month term options depending on terms.`,
    '',
    commonClose(),
  ]
    .filter(Boolean)
    .join('\n');
}

function angleSoundRoyalties(i: AngleInput): string {
  const { snapshot, partner, partnerValuation, metrics } = i;
  return [
    commonOpener(snapshot, partner),
    '',
    `Why Sound Royalties:`,
    `· Royalty-backed funding. Artist retains all copyrights.`,
    `· Reliable annualized royalty stream: ${fmtUsd(Math.min(metrics.projectedNtm, metrics.last12Months || metrics.projectedNtm))}.`,
    `· Multi-platform distribution and clean publishing setup support recoupment.`,
    '',
    rangeLine(partnerValuation),
    '',
    `Suggested ask: frame as a temporary liquidity event, not a sale. Open to recoupment-rate negotiation in exchange for tighter timing.`,
    '',
    commonClose(),
  ]
    .filter(Boolean)
    .join('\n');
}

function angleAcrylic(i: AngleInput): string {
  const { snapshot, partner, attentionVal, metrics } = i;
  const topTracks = metrics.revenueByTrack.slice(0, 4).map((t) => t.track);
  return [
    commonOpener(snapshot, partner),
    '',
    `Why Acrylic:`,
    `· Sync / sports / brand placement opportunity, not a catalog sale.`,
    `· ${topAttentionLine(attentionVal)}`,
    `· Sync-curation candidates: ${topTracks.join(', ')}.`,
    '',
    `Suggested ask: a placement-pipeline review against a tight 5–15 track curation. If stems aren't available yet, we'll prep with AudioShake before sending.`,
    '',
    commonClose(),
  ].join('\n');
}

function angleThirdChair(i: AngleInput): string {
  const { snapshot, partner } = i;
  return [
    commonOpener(snapshot, partner),
    '',
    `Why Third Chair:`,
    `· Catalog likely has rights leakage from UGC, venues, hotels, or events.`,
    `· We're confirming ISRC + ownership splits to maximize claim recovery.`,
    '',
    `Suggested ask: a baseline claims scan, with ongoing monitoring conditional on recovery vs admin cost.`,
    '',
    commonClose(),
  ].join('\n');
}

function angleStrategic(i: AngleInput, opener: string, asks: string[]): string {
  const { snapshot, partner } = i;
  return [
    commonOpener(snapshot, partner),
    '',
    opener,
    '',
    `Suggested ask:`,
    ...asks.map((a) => `· ${a}`),
    '',
    commonClose(),
  ].join('\n');
}

const ANGLE_BY_PARTNER: Record<PartnerModelId, (i: AngleInput) => string> = {
  duetti: angleDuetti,
  beatbread: angleBeatBread,
  'sound-royalties': angleSoundRoyalties,
  acrylic: angleAcrylic,
  'third-chair': angleThirdChair,
  strommar: (i) =>
    angleStrategic(
      i,
      `Why Strommar:\n· Distribution + release ops migration to unlock cleaner reports and broader platform mix.\n· Better infrastructure produces the financial story partners want.`,
      [
        'Audit current distributor coverage',
        'Migrate before any major partner outreach',
        'Set up release-ops cadence for the next 12 months',
      ],
    ),
  aamf: (i) =>
    angleStrategic(
      i,
      `Why AAMF:\n· Strategic capital + advisory. Backed when there is a credible team and growth story.\n· This is a 12–18 month conversation, not a transaction.`,
      [
        'Bring the team / management',
        'Pitch a 12–18 month plan and use-of-funds',
        'Show what capital + advisory unlocks',
      ],
    ),
  meteor: (i) =>
    angleStrategic(
      i,
      `Why Meteor:\n· Cultural and collaboration potential, particularly in independent Latin music.\n· Lead with narrative, regional story, and realistic collaboration shortlist.`,
      [
        'Share a one-page artistic + cultural thesis',
        'Propose 1–2 collaboration ideas within the next 6 months',
      ],
    ),
  streamfic: (i) =>
    angleStrategic(
      i,
      `Why Streamfic:\n· Creator campaign infrastructure for short-form / UGC activation.\n· Catalog has tracks tagged as Attention Drivers that map to TikTok / Reels.`,
      [
        'Pick the lead Attention Driver track',
        'Pitch a 60-day creator activation campaign',
        'Define campaign budget range and creative concept',
      ],
    ),
  'next-chapter': (i) =>
    angleStrategic(
      i,
      `Why Next Chapter:\n· International expansion / market-entry support.\n· Existing traction in adjacent markets supports the next-chapter story.`,
      [
        'Bring a 12-month international plan',
        'Define which markets and why now',
        'Specify whether the ask is intros, capital, or operating support',
      ],
    ),
  melino: (i) =>
    angleStrategic(
      i,
      `Why Melino:\n· Multi-layer infrastructure partner (advisory + funding + catalog ops).\n· Useful when the artist needs operating leverage, not a single tactical service.`,
      [
        'Pitch a year-1 operating plan',
        'Name the specific gaps Melino fills',
        'Define an engagement structure that compounds over time',
      ],
    ),
};

export function buildPartnerPitch(input: AngleInput): PartnerPitch {
  const { snapshot, partner, partnerValuation, readiness, strategy, metrics, valuation, underwriting } = input;

  const subject = `${snapshot.artistName} · ${partner.categoryLabel} fit — RocketRolla intro`;
  const angleBuilder = ANGLE_BY_PARTNER[partner.id as PartnerModelId];
  const body = angleBuilder ? angleBuilder(input) : angleDuetti(input);

  const internalSummary = [
    `Catalog: ${snapshot.artistName} · ${snapshot.monthsOfData} mo of data`,
    `Revenue: ${fmtUsd(metrics.totalRevenue)} total · ${fmtUsd(metrics.runRate)}/mo run rate`,
    `Revenue-only base: ${fmtUsd(snapshot.base)} (conf ${valuation.confidence}%)`,
    `Underwriting final range: ${fmtUsd(underwriting.finalRange.low)}–${fmtUsd(underwriting.finalRange.high)} · suggested ask ${fmtUsd(underwriting.suggestedAsk)} · confidence ${underwriting.confidence}%`,
    underwriting.methods.historicalComp.applicable
      ? `Historical comp lens: ${fmtUsd(underwriting.methods.historicalComp.range.low)}–${fmtUsd(underwriting.methods.historicalComp.range.high)}`
      : `Historical comp: not applicable (insufficient history)`,
    `Readiness: ${snapshot.readinessScore}/100 (${snapshot.readinessLabel})`,
    `Strategy: ${strategy.headline}`,
    `Top partner fit: ${partner.name} (${partner.fit}/100)`,
    partnerValuation?.range
      ? `${partner.name} estimated range: ${fmtUsd(partnerValuation.range.low)}–${fmtUsd(partnerValuation.range.high)}`
      : `${partner.name}: strategic pathway, no dollar range`,
    '',
    `Top 3 fixes before outreach:`,
    ...readiness.fixesNeeded.slice(0, 3).map((f, i) => `${i + 1}. ${f}`),
  ].join('\n');

  return { subject, body, internalSummary };
}
