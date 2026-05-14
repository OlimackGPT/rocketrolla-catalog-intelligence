'use client';

import { useDealAnalysis } from '@/lib/hooks';
import { DemoDataBadge } from '@/components/DemoDataBadge';
import { RoutingPlanCard } from '@/components/RoutingPlan';
import { PartnerEcosystemByVertical } from '@/components/PartnerEcosystemByVertical';
import { PartnerValuationMatrix } from '@/components/PartnerValuationMatrix';
import { PartnerPathwayTable } from '@/components/PartnerPathwayTable';
import { PartnerOfferSimulator } from '@/components/PartnerOfferSimulator';
import { PitchGenerator } from '@/components/PitchGenerator';
import { StrategyRecommendationCard } from '@/components/StrategyRecommendation';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export default function RecommendationPage() {
  const {
    metrics,
    valuation,
    attentionVal,
    underwriting,
    readiness,
    strategy,
    partners,
    partnerValuations,
    partnersByVertical,
    routingPlan,
    hasUserData,
    hydrated,
  } = useDealAnalysis();

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
            Routing Layer
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Partner Fit + 30/60/90 Plan</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            RocketRolla&apos;s routing layer scores 14 partners across 7 verticals against this catalog,
            then sequences them into an executable plan.
          </p>
        </div>
        <DemoDataBadge visible={hydrated && !hasUserData} />
      </div>

      {/* Strategy callout */}
      <StrategyRecommendationCard strategy={strategy} />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          {
            label: 'Final Internal Range',
            value: `${fmtUsd(underwriting.finalRange.low)} – ${fmtUsd(underwriting.finalRange.high)}`,
            note: `Suggested ask ${fmtUsd(underwriting.suggestedAsk)}`,
          },
          { label: 'Underwriting Conf', value: `${underwriting.confidence}%`, note: 'Blended across methods' },
          { label: 'Deal Readiness', value: `${readiness.total}/100`, note: readiness.label },
          { label: 'Top Partner', value: partners[0]?.name ?? '—', note: `Fit ${partners[0]?.fit ?? 0}/100` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
              {s.label}
            </p>
            <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
            <p className="text-[10px] tracking-widest uppercase text-white/35">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Routing Plan — the operational layer */}
      <RoutingPlanCard plan={routingPlan} partners={partners} />

      {/* Partner Ecosystem by Vertical */}
      <PartnerEcosystemByVertical partnersByVertical={partnersByVertical} />

      {/* Pathway Table */}
      <section className="space-y-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-300/90">
            Estimated Partner Pathway Ranges
          </p>
          <p className="text-sm text-white/45">
            Side-by-side: structure, range, ownership impact, main risk, next step. Dollar ranges are internal underwriting estimates, not guaranteed offers.
          </p>
        </div>
        <PartnerPathwayTable partnerValuations={partnerValuations} />
      </section>

      {/* Offer Simulator */}
      <PartnerOfferSimulator partnerValuations={partnerValuations} />

      {/* Detailed valuation matrix */}
      <section className="space-y-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            Partner Underwriting Matrix
          </p>
          <p className="text-sm text-white/45">
            Detail view per partner — fit drivers, what the partner likes vs. questions, and the suggested ask. Each partner&apos;s estimate is built from the underwriting brain.
          </p>
        </div>
        <PartnerValuationMatrix partnerValuations={partnerValuations} />
      </section>

      {/* Pitch generator */}
      <PitchGenerator
        metrics={metrics}
        valuation={valuation}
        readiness={readiness}
        strategy={strategy}
        partners={partners}
        partnerValuations={partnerValuations}
        attentionVal={attentionVal}
        underwriting={underwriting}
      />
    </div>
  );
}
