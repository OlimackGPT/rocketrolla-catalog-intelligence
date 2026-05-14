import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';
import { DealReadiness, StrategyRecommendation } from './dealReadiness';
import { UnderwritingResult } from './underwritingEngine';
import { PartnerValuation } from './partnerModels';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

export type UnderwritingMemo = {
  whatTheDataSays: string;
  whatRevenueModelSays: string;
  whatHistoricalCompSays: string;
  whatAttentionSuggests: string;
  whatPartnersMaySee: string;
  whyWorthMoreThanNtm: string;
  whatCouldReduce: string;
  recommendedRoute: string;
  suggestedAsk: string;
  fullParagraph: string;
};

export function buildUnderwritingMemo(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  readiness: DealReadiness;
  strategy: StrategyRecommendation;
  underwriting: UnderwritingResult;
  topPartner: PartnerValuation | undefined;
  artistName?: string;
}): UnderwritingMemo {
  const { metrics, valuation, readiness, strategy, underwriting, topPartner, artistName } = input;
  const name = artistName?.trim() || 'this catalog';

  const monthsCovered = metrics.monthlyRevenue.length;
  const ntm = metrics.projectedNtm;
  const historic = metrics.totalRevenue;
  const final = underwriting.finalRange;
  const comp = underwriting.methods.historicalComp;
  const att = underwriting.methods.momentumAdjusted;

  const whatTheDataSays = `${name} has ${monthsCovered} months of revenue history totaling ${fmtUsd(historic)}, with a current monthly run rate of ${fmtUsd(metrics.runRate)} and a projected NTM of ${fmtUsd(ntm)}. Deal readiness score: ${readiness.total}/100 (${readiness.label}).`;

  const whatRevenueModelSays = `Pure NTM-only model puts the base valuation at ${fmtUsd(valuation.base)} (range ${fmtUsd(valuation.conservative)}–${fmtUsd(underwriting.methods.revenueOnlyFloor.high)}). This method is conservative — it can underestimate catalogs where the historical earning base is stronger than the recent run rate.`;

  const whatHistoricalCompSays = comp.applicable
    ? `Historical comp method applies a ${comp.multipleLow.toFixed(1)}×–${comp.multipleHigh.toFixed(1)}× multiple to ${fmtUsd(historic)} of historical revenue, anchored by a quality factor of ${(comp.qualityFactor * 100).toFixed(0)}/100. Comp range: ${fmtUsd(comp.range.low)}–${fmtUsd(comp.range.high)}.`
    : 'Historical comp method is not applicable — fewer than 6 months of history or insufficient historical revenue to anchor a multiple.';

  const whatAttentionSuggests = metrics.hasAttention
    ? `Attention-adjusted lens reads ${fmtUsd(att.low)}–${fmtUsd(att.high)} with a base of ${fmtUsd(att.base)}. ${
        underwriting.strategicPremiums.some((p) => p.name.includes('Converting'))
          ? 'Attention is converting into revenue — this supports a richer multiple.'
          : underwriting.strategicPremiums.some((p) => p.name.includes('social'))
          ? 'Social signal is real but conversion is still being established.'
          : 'Attention signals are modest — they protect the floor but do not yet justify a premium.'
      }`
    : 'No attention columns provided. Adding TikTok / Reels / YouTube / Shazam / playlist data would unlock the attention-adjusted lens.';

  const whatPartnersMaySee = topPartner
    ? `${topPartner.name} is the highest-fit partner at ${topPartner.fitScore}/100. ${topPartner.whyFit}${
        topPartner.range
          ? ` Internal estimate range for ${topPartner.name}: ${fmtUsd(topPartner.range.low)}–${fmtUsd(topPartner.range.high)} (midpoint ${fmtUsd(topPartner.range.midpoint)}).`
          : ''
      }`
    : 'No partner has surfaced as a clear top-fit yet — run the readiness sprint first.';

  const whyWorthMoreThanNtm = underwriting.whyHigherThanNtm.length > 0
    ? underwriting.whyHigherThanNtm.join(' ')
    : 'The revenue-only model is the primary anchor here — no historical comp or attention signals are lifting the range.';

  const whatCouldReduce = underwriting.whatCouldReduce.length > 0
    ? underwriting.whatCouldReduce.slice(0, 4).join(' ')
    : 'No material risks flagged.';

  const recommendedRoute = `Strategy: ${strategy.headline}. ${strategy.body}`;

  const suggestedAsk = `RocketRolla suggested ask is ${fmtUsd(underwriting.suggestedAsk)} — anchored at the upper-mid of the final range (${fmtUsd(final.low)}–${fmtUsd(final.high)}) with ${underwriting.confidence}% blended confidence.`;

  const fullParagraph = [
    `The revenue-only model values ${name} at ${fmtUsd(valuation.base)} (NTM × 5), but it ${comp.applicable ? `under-anchors the catalog because the historical earning base of ${fmtUsd(historic)} over ${monthsCovered} months supports a comp range of ${fmtUsd(comp.range.low)}–${fmtUsd(comp.range.high)}` : 'does not yet have enough historical depth to anchor a comp method'}.`,
    metrics.hasAttention && (underwriting.strategicPremiums.length > 0)
      ? `Attention signals and a ${underwriting.strategicPremiums.length}-factor strategic premium support pulling the band upward.`
      : '',
    `After ${underwriting.totalRiskDiscountPct.toFixed(0)}% in risk discounts and ${underwriting.totalStrategicPremiumPct.toFixed(0)}% in strategic premiums, the final internal range lands at ${fmtUsd(final.low)}–${fmtUsd(final.high)}, with a suggested ask of ${fmtUsd(underwriting.suggestedAsk)} at ${underwriting.confidence}% confidence.`,
    topPartner && topPartner.range
      ? `${topPartner.name}-style structure can underwrite this near ${fmtUsd(topPartner.range.low)}–${fmtUsd(topPartner.range.high)} assuming clean rights and verified attention.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    whatTheDataSays,
    whatRevenueModelSays,
    whatHistoricalCompSays,
    whatAttentionSuggests,
    whatPartnersMaySee,
    whyWorthMoreThanNtm,
    whatCouldReduce,
    recommendedRoute,
    suggestedAsk,
    fullParagraph,
  };
}
