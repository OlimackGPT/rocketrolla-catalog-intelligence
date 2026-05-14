import { DealReadiness } from './dealReadiness';
import { PartnerValuation, PartnerModelId, Vertical } from './partnerModels';
import { AttentionAdjustedValuation } from './attentionValuation';
import { UnderwritingResult } from './underwritingEngine';

// The Routing Plan is the operational layer of RocketRolla — it converts
// the underwriting brain's static partner fit scores into a sequenced,
// multi-partner 30 / 60 / 90 day action plan. This is what makes the app
// behave as a "routing layer" rather than a calculator.

export type RoutingPhase = 'now' | '30-day' | '60-day' | '90-day';

export type RoutingPriority = 'critical' | 'primary' | 'parallel' | 'optional';

export type RoutingStep = {
  id: string;
  phase: RoutingPhase;
  vertical: Vertical;
  title: string;
  description: string;
  partnerIds: PartnerModelId[];
  priority: RoutingPriority;
  doneCriteria: string;
};

export type RoutingPlan = {
  headline: string;
  rationale: string;
  steps: RoutingStep[];
};

export const PHASE_LABELS: Record<RoutingPhase, string> = {
  now: 'Now',
  '30-day': '30 Days',
  '60-day': '60 Days',
  '90-day': '90 Days',
};

const PHASE_ORDER: RoutingPhase[] = ['now', '30-day', '60-day', '90-day'];

function partnerById(partners: PartnerValuation[], id: PartnerModelId): PartnerValuation | undefined {
  return partners.find((p) => p.id === id);
}

function topPartnerInVertical(
  partners: PartnerValuation[],
  vertical: Vertical,
): PartnerValuation | undefined {
  return partners.find((p) => p.verticals.includes(vertical));
}

export function buildRoutingPlan(input: {
  readiness: DealReadiness;
  attentionVal: AttentionAdjustedValuation;
  underwriting: UnderwritingResult;
  partners: PartnerValuation[];
}): RoutingPlan {
  const { readiness, attentionVal, underwriting, partners } = input;
  const steps: RoutingStep[] = [];

  const needsRightsCleanup =
    readiness.components.metadataCompleteness < 60 || readiness.components.ownershipClarity < 60;
  const needsDataBuild = underwriting.confidence < 55 || readiness.components.revenueConsistency < 50;
  const isPartnerReady = readiness.total >= 60;
  const isHighPriority = readiness.total >= 80;
  const hasConvertingAttention = attentionVal.flags.attentionLiftsConfidence;
  const hasUnderMonetizedAttention = attentionVal.flags.underMonetizedAttention;
  const lowSync = readiness.components.syncReadiness < 50;
  const highSync = readiness.components.syncReadiness >= 65;
  const platformConcentration = readiness.components.platformDiversification < 55;

  const topFunding = topPartnerInVertical(partners, 'funding');
  const secondFunding = partners.filter((p) => p.verticals.includes('funding'))[1];
  const topRights = topPartnerInVertical(partners, 'rights');
  const topSync = topPartnerInVertical(partners, 'sync');
  const topDistribution = topPartnerInVertical(partners, 'distribution');
  const topMarketing = partners.find(
    (p) => p.verticals.includes('marketing') && p.id !== 'snafu' && p.id !== 'strommar',
  ) ?? topPartnerInVertical(partners, 'marketing');
  const snafu = partnerById(partners, 'snafu');
  const topCreator = topPartnerInVertical(partners, 'creator');

  // --- NOW (this week) ---
  if (needsRightsCleanup && topRights) {
    steps.push({
      id: 'now-rights',
      phase: 'now',
      vertical: 'rights',
      title: 'Lock down rights + metadata',
      description: `Run a diagnostic scan with ${topRights.name}. Confirm ISRCs, ownership splits, and PRO registration before any partner sees the data room. Cleanup at this stage compounds — every later partner conversation hits a higher floor.`,
      partnerIds: [topRights.id, 'copyright-delta', 'rightshub'].filter((id, idx, arr) => arr.indexOf(id) === idx) as PartnerModelId[],
      priority: 'critical',
      doneCriteria:
        'ISRCs confirmed for top tracks, split sheets documented, sample clearances stated, no open claims.',
    });
  } else {
    steps.push({
      id: 'now-data-room',
      phase: 'now',
      vertical: 'data',
      title: 'Package the data room',
      description:
        'Catalog is clean enough to start outreach prep. Assemble the data package: 12+ months of revenue CSV with platform + country splits, ISRC list, ownership confirmation, attention numbers (TikTok / Reels / YouTube / Shazam).',
      partnerIds: [],
      priority: 'primary',
      doneCriteria:
        'Single shared folder/data-room link with revenue CSV, ISRC list, ownership doc, attention snapshot, release roadmap.',
    });
  }

  if (needsDataBuild) {
    steps.push({
      id: 'now-data-build',
      phase: 'now',
      vertical: 'data',
      title: 'Continue building revenue history',
      description: `Underwriting confidence is at ${underwriting.confidence}%. Continue distribution and log monthly data before any partner pricing — confidence below 55% compresses every offer.`,
      partnerIds: [],
      priority: 'critical',
      doneCriteria: '60–90 more days of clean monthly revenue data captured.',
    });
  }

  if (platformConcentration && topDistribution) {
    steps.push({
      id: 'now-distribution',
      phase: 'now',
      vertical: 'distribution',
      title: 'Tighten distribution stack',
      description: `Single-DSP exposure compresses pricing. Engage ${topDistribution.name} for a quick distribution audit — better reports + broader platform mix produce the financial story funding partners want.`,
      partnerIds: [topDistribution.id],
      priority: 'parallel',
      doneCriteria: 'Distribution audit done, migration plan or status-quo confirmation in writing.',
    });
  }

  // --- 30 DAYS — primary funding outreach ---
  if (isPartnerReady && topFunding) {
    const secondaryPartnersText = secondFunding ? ` Run a parallel pitch to ${secondFunding.name} to protect terms.` : '';
    const isSnafu = topFunding.id === 'snafu';
    steps.push({
      id: '30-funding-primary',
      phase: '30-day',
      vertical: 'funding',
      title: `Primary funding outreach: ${topFunding.name}`,
      description:
        `${topFunding.whyFit}${secondaryPartnersText}` +
        (isSnafu
          ? ' Snafu sits across funding AND marketing — pitch the marketing thesis alongside the capital ask.'
          : ''),
      partnerIds: secondFunding ? [topFunding.id, secondFunding.id] : [topFunding.id],
      priority: 'primary',
      doneCriteria:
        topFunding.range
          ? `Non-binding indication of interest within ~$${Math.round(topFunding.range.midpoint / 1000)}k range.`
          : 'Non-binding indication of interest from primary funding partner.',
    });
  } else if (!isPartnerReady) {
    steps.push({
      id: '30-no-outreach',
      phase: '30-day',
      vertical: 'data',
      title: 'Hold funding outreach until readiness ≥ 60',
      description: `Readiness sits at ${readiness.total}/100 — partners will discount or pass at this level. Use the 30-day window to fix the highest-impact gaps from the Readiness page before any outreach.`,
      partnerIds: [],
      priority: 'critical',
      doneCriteria: 'Deal Readiness Score raised above 60/100.',
    });
  }

  // --- 60 DAYS — sync + secondary partners + marketing layer ---
  if (highSync && topSync) {
    steps.push({
      id: '60-sync',
      phase: '60-day',
      vertical: 'sync',
      title: `Sync pipeline: ${topSync.name}`,
      description:
        'Catalog scores high on sync readiness. Curate a 5–15 track sync reel (instrumentals priority), confirm sample clearances, prep stems with AudioShake if missing.',
      partnerIds: [topSync.id],
      priority: 'parallel',
      doneCriteria: 'Sync reel submitted, stem prep complete, first placement conversations open.',
    });
  } else if (lowSync && hasUnderMonetizedAttention) {
    steps.push({
      id: '60-sync-prep',
      phase: '60-day',
      vertical: 'sync',
      title: 'Prep sync readiness layer',
      description:
        'Attention is high but sync readiness is low — stem prep and a curated reel unlock the sync pathway. Once unlocked, sync revenue widens every other partner conversation.',
      partnerIds: ['acrylic'],
      priority: 'optional',
      doneCriteria: 'Stems prepared for top 10 tracks, curated reel drafted.',
    });
  }

  if (snafu && hasUnderMonetizedAttention && !isHighPriority) {
    steps.push({
      id: '60-snafu',
      phase: '60-day',
      vertical: 'marketing',
      title: 'Marketing + capital pitch: Snafu Records',
      description:
        'Attention is high relative to revenue — Snafu underwrites on streaming + social data and brings marketing capital alongside funding. Pitch the marketing thesis with the catalog data, not just the catalog data alone.',
      partnerIds: ['snafu'],
      priority: 'parallel',
      doneCriteria: 'Snafu pitch sent with growth thesis, marketing plan, and revenue data.',
    });
  }

  if (topMarketing && topMarketing.fitScore >= 55) {
    steps.push({
      id: '60-marketing',
      phase: '60-day',
      vertical: 'marketing',
      title: `Strategic positioning: ${topMarketing.name}`,
      description: topMarketing.whyFit,
      partnerIds: [topMarketing.id],
      priority: 'optional',
      doneCriteria: 'Engagement scoped, narrative + collaboration shortlist drafted.',
    });
  }

  // --- 90 DAYS — strategic / creator / longer-horizon ---
  if (topCreator && topCreator.fitScore >= 45) {
    steps.push({
      id: '90-creator',
      phase: '90-day',
      vertical: 'creator',
      title: `Creator activation: ${topCreator.name}`,
      description:
        'Pick the strongest Attention Driver track and pitch a 60-day creator campaign. Short-form activation compounds reach into revenue when paired with the funding + marketing layer.',
      partnerIds: [topCreator.id],
      priority: 'parallel',
      doneCriteria: 'Lead track + concept + budget defined, campaign live.',
    });
  }

  // Final ongoing rights layer if we did a one-time scan earlier.
  if (needsRightsCleanup) {
    steps.push({
      id: '90-rights-ongoing',
      phase: '90-day',
      vertical: 'rights',
      title: 'Activate ongoing rights layer',
      description:
        'After the diagnostic scan, plug in an always-on rights stack (RightsHub) for automated PRO registration and claim filing. Pairs with Third Chair for periodic recovery sweeps.',
      partnerIds: ['rightshub', 'third-chair'],
      priority: 'optional',
      doneCriteria: 'RightsHub configured, recurring claim monitoring scheduled.',
    });
  }

  // Sort by phase order for predictable rendering.
  steps.sort((a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase));

  const headline = isHighPriority
    ? `High-priority catalog. Compress the plan: parallel outreach + concurrent prep.`
    : isPartnerReady
    ? `Partner-ready catalog. Sequenced outreach over the next 90 days.`
    : needsRightsCleanup
    ? `Rights cleanup first. No partner outreach until the metadata + ownership floor is solid.`
    : `Build a defensible foundation, then route to partners.`;

  const rationale = isHighPriority
    ? 'Readiness score is in the High Priority band. Move fast across funding + sync + creator in parallel rather than waiting for sequential answers.'
    : isPartnerReady
    ? 'Readiness is partner-ready. Sequence the outreach to protect terms and avoid spreading attention too thin.'
    : 'Outreach now would compress every offer. Spend the next 30 days fixing the floor — every later conversation hits a higher number.';

  return { headline, rationale, steps };
}
