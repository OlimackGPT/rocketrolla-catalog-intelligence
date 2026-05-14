'use client';

import { useDealAnalysis } from '@/lib/hooks';
import { DemoDataBadge } from '@/components/DemoDataBadge';
import { UnderwritingSummary } from '@/components/UnderwritingSummary';
import { UnderwritingMemoCard } from '@/components/UnderwritingMemo';
import { AttentionValuationCard } from '@/components/AttentionValuationCard';
import { ForecastScenarios } from '@/components/ForecastScenarios';
import { TrackDealContribution } from '@/components/TrackDealContribution';
import { TrackMomentumTable } from '@/components/TrackMomentumTable';

export function ValuationView() {
  const {
    valuation,
    underwriting,
    attentionVal,
    forecasts,
    trackContributions,
    trackMomentum,
    metrics,
    memo,
    hasUserData,
    hydrated,
  } = useDealAnalysis();

  return (
    <div className="space-y-8">
      <DemoDataBadge visible={hydrated && !hasUserData} />

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">
        <span className="mt-0.5 text-amber-400" aria-hidden="true">⚠</span>
        <p className="text-xs leading-relaxed text-amber-300/70">
          <strong className="font-bold text-amber-300">Internal estimate only.</strong> The
          underwriting engine blends multiple methods (NTM, historical comp, momentum, track-level).
          No output here is a binding offer, appraisal, or formal financial advice.
        </p>
      </div>

      {/* Underwriting Brain — headline */}
      <UnderwritingSummary underwriting={underwriting} />

      {/* Underwriting memo */}
      <UnderwritingMemoCard memo={memo} underwriting={underwriting} />

      {/* Attention layer */}
      <section className="space-y-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-300/90">
            Attention-Adjusted Layer
          </p>
          <p className="text-sm text-white/55">
            One of the five methods that feeds the underwriting brain — shown standalone for transparency.
          </p>
        </div>
        <AttentionValuationCard attentionVal={attentionVal} />
      </section>

      {/* Forecast scenarios */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
          Forecast Scenarios
        </p>
        <ForecastScenarios scenarios={forecasts} />
      </section>

      {/* Track-level deal contribution */}
      {metrics.hasAttention && trackContributions.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            Track-Level Deal Contribution
          </p>
          <p className="text-xs text-white/45">
            How each track is contributing to the attention-adjusted base. Partners often price specific tracks differently.
          </p>
          <TrackDealContribution contributions={trackContributions} limit={6} />
        </section>
      )}

      {/* Track momentum */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
          Track Momentum
        </p>
        <p className="text-xs text-white/45">
          Per-track scoring of revenue, attention, and concentration. Tags surface Revenue Drivers, Attention Drivers, Catalog Anchors, Sync Candidates, Under-Monetized Assets, and Long-Tail Assets.
        </p>
        <TrackMomentumTable tracks={trackMomentum} limit={6} />
      </section>

      {/* Underwriting risk + premium detail */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
          Underwriting Detail · Risk Discounts &amp; Strategic Premiums
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-red-300/80">
              Risk Discounts ({underwriting.totalRiskDiscountPct.toFixed(0)}% total, capped −30%)
            </p>
            {underwriting.riskDiscounts.length === 0 ? (
              <p className="mt-2 text-xs text-white/40">No risk discounts triggered.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {underwriting.riskDiscounts.map((r) => (
                  <li key={r.name} className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-white/75">{r.name}</span>
                      <span className="text-xs font-black tabular-nums text-red-300/80">−{r.pct}%</span>
                    </div>
                    <p className="text-[11px] text-white/45">{r.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-300/80">
              Strategic Premiums ({underwriting.totalStrategicPremiumPct.toFixed(0)}% total, capped +20%)
            </p>
            {underwriting.strategicPremiums.length === 0 ? (
              <p className="mt-2 text-xs text-white/40">No strategic premiums triggered.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {underwriting.strategicPremiums.map((r) => (
                  <li key={r.name} className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-white/75">{r.name}</span>
                      <span className="text-xs font-black tabular-nums text-emerald-300">+{r.pct}%</span>
                    </div>
                    <p className="text-[11px] text-white/45">{r.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Confidence */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
            Blended Underwriting Confidence
          </p>
          <span
            className={`text-2xl font-black tabular-nums ${underwriting.confidence >= 70 ? 'text-emerald-400' : underwriting.confidence >= 45 ? 'text-purple-300' : 'text-red-400'}`}
          >
            {underwriting.confidence}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all ${underwriting.confidence >= 70 ? 'bg-emerald-400' : underwriting.confidence >= 45 ? 'bg-purple-400' : 'bg-red-400'}`}
            style={{ width: `${underwriting.confidence}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/30">
          Methods agreement: {(underwriting.methodAgreement * 100).toFixed(0)}/100 · Pure NTM-only confidence: {valuation.confidence}%
        </p>
      </div>

      {/* Assumptions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
        <p className="mb-3 text-[10px] font-bold tracking-[0.25em] uppercase text-white/20">
          Model Assumptions
        </p>
        <ul className="space-y-1.5">
          {[
            'Five lenses are computed independently: revenue floor, historical comp, reliable annualized, momentum, track-level upside.',
            'Historical comp uses 1.2×–2.4× historical revenue, scaled by a quality factor (rights, diversification, attention, growth).',
            'Reliable annualized smooths L3 / L6 / L12 monthly revenue, weighted by consistency.',
            'Attention values are log-scaled per metric and capped when ownership / metadata are weak.',
            'Risk discounts cap at 30% total. Strategic premiums cap at 20% total.',
            'The final base biases toward higher methods when premiums outweigh discounts, and toward lower methods when risks dominate.',
            'Suggested ask sits at upper-mid of the final range (~8% above base).',
          ].map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white/30">
              <span className="mt-0.5 text-white/15">·</span>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
