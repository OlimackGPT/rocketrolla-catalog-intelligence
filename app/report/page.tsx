'use client';

import { useDealAnalysis } from '@/lib/hooks';
import { computeMomentumSignals } from '@/lib/momentum';
import { buildPartnerPitch, buildSnapshot } from '@/lib/pitch';
import { DemoDataBadge } from '@/components/DemoDataBadge';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

const PARTNER_LIST_FOR_DISCLAIMER =
  'Duetti, BeatBread, Sound Royalties, Acrylic, Third Chair, Strommar, AAMF, Meteor, Melino, Next Chapter, Streamfic';

export default function ReportPage() {
  const {
    metrics,
    valuation,
    underwriting,
    attentionVal,
    readiness,
    strategy,
    partners,
    partnerValuations,
    forecasts,
    trackContributions,
    memo,
    momentum,
    hasUserData,
    hydrated,
  } = useDealAnalysis();

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const signals = computeMomentumSignals(momentum.momentum);
  const topPartner = partners[0];
  const topPartnerValuation = partnerValuations.find((p) => p.id === topPartner?.id);
  const duetti = partnerValuations.find((p) => p.id === 'duetti');
  const beatbread = partnerValuations.find((p) => p.id === 'beatbread');
  const soundRoyalties = partnerValuations.find((p) => p.id === 'sound-royalties');

  const snapshot = buildSnapshot({
    metrics,
    valuation,
    readiness,
    strategy,
    partners,
    underwriting,
  });

  const pitch = buildPartnerPitch({
    snapshot,
    partner: topPartner,
    partnerValuation: topPartnerValuation,
    readiness,
    strategy,
    metrics,
    valuation,
    attentionVal,
    underwriting,
  });

  const comp = underwriting.methods.historicalComp;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
            Final Output
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Underwriting Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoDataBadge visible={hydrated && !hasUserData} />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/25 px-4 py-2 text-sm font-bold text-purple-200 transition-all hover:bg-purple-500/25"
          >
            Print / Export PDF
          </button>
        </div>
      </div>

      <div
        id="report-doc"
        className="rounded-3xl border border-white/[0.08] bg-white/[0.02] print:bg-white print:text-black print:border-none print:rounded-none"
      >
        <div
          className="relative overflow-hidden rounded-t-3xl border-b border-white/[0.06] px-10 py-10 print:px-8 print:py-8 print:border-gray-200"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 100% at 0% 50%, rgba(139,92,246,0.10) 0%, transparent 60%)',
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 print:bg-purple-100">
                  <span className="text-[9px] font-black text-purple-300 print:text-purple-700">RR</span>
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 print:text-gray-500">
                  RocketRolla
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white print:text-black">
                Catalog Underwriting Report
              </h2>
              <p className="mt-1 text-xs text-white/40 print:text-gray-500">
                Infrastructure for independent artists
              </p>
            </div>
            <div className="text-right print:text-right">
              <span className="inline-block rounded border border-red-500/20 bg-red-500/[0.06] px-3 py-1 text-[10px] font-black tracking-widest uppercase text-red-400 print:border-red-200 print:bg-red-50 print:text-red-700">
                Confidential · Internal Only
              </span>
              <p className="mt-2 text-xs text-white/30 print:text-gray-400">
                Generated {today}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/[0.05] print:divide-gray-100">
          {/* 01 — Underwriting Summary */}
          <Section title="RocketRolla Underwriting Summary" index="01">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Final Range Low" value={fmtUsd(underwriting.finalRange.low)} />
              <Stat label="Final Base" value={fmtUsd(underwriting.finalRange.base)} accent />
              <Stat label="Final Range High" value={fmtUsd(underwriting.finalRange.high)} />
              <Stat label="Suggested Ask" value={fmtUsd(underwriting.suggestedAsk)} accent />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65 print:text-gray-700">
              {memo.fullParagraph}
            </p>
          </Section>

          {/* 02 — Revenue Snapshot */}
          <Section title="Revenue Snapshot" index="02">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total Revenue" value={fmtUsd(metrics.totalRevenue)} />
              <Stat label="Monthly Run Rate" value={fmtUsd(metrics.runRate)} />
              <Stat label="Projected NTM" value={fmtUsd(metrics.projectedNtm)} />
              <Stat label="Months of Data" value={String(metrics.monthlyRevenue.length)} />
            </div>
          </Section>

          {/* 03 — Historical Earnings Floor */}
          <Section title="Historical Earnings Floor" index="03">
            {comp.applicable ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label={`Low (${comp.multipleLow.toFixed(1)}×)`} value={fmtUsd(comp.range.low)} />
                  <Stat label={`Base (${comp.multipleBase.toFixed(1)}×)`} value={fmtUsd(comp.range.base)} accent />
                  <Stat label={`High (${comp.multipleHigh.toFixed(1)}×)`} value={fmtUsd(comp.range.high)} />
                </div>
                <p className="mt-3 text-xs text-white/45 print:text-gray-600">
                  Quality factor: {(comp.qualityFactor * 100).toFixed(0)}/100. Historical revenue of{' '}
                  <strong>{fmtUsd(comp.historicalRevenue)}</strong> over {comp.monthsCovered} months.
                </p>
                <ul className="mt-2 space-y-1">
                  {comp.notes.map((n, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[11px] leading-relaxed text-white/50 print:text-gray-600"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400/60" />
                      {n}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-white/45 print:text-gray-600">
                Not applicable yet — fewer than 6 months of history or insufficient historical revenue.
              </p>
            )}
          </Section>

          {/* 04 — Why NTM May Undervalue */}
          <Section title="Why NTM May Undervalue This Catalog" index="04">
            <ul className="space-y-2">
              {underwriting.whyHigherThanNtm.map((w, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-white/65 print:text-gray-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  {w}
                </li>
              ))}
            </ul>
          </Section>

          {/* 05 — Track-Level Deal Contribution */}
          {trackContributions.length > 0 && (
            <Section title="Track-Level Deal Contribution" index="05">
              <div className="space-y-2">
                {trackContributions
                  .filter((c) => c.estimatedDealContribution > 0)
                  .slice(0, 6)
                  .map((c) => (
                    <div
                      key={c.track}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 print:border-gray-100 print:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white print:text-black">{c.track}</p>
                        <p className="text-xs text-white/40 print:text-gray-600">
                          Revenue {fmtUsd(c.revenue)} · Attention {fmtUsd(c.attentionValue)}
                        </p>
                        {c.tags.length > 0 && (
                          <p className="mt-1 text-[10px] tracking-widest uppercase text-purple-300/80 print:text-purple-700">
                            {c.tags.join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 print:text-gray-500">
                          Est. Contribution
                        </p>
                        <p className="text-base font-black text-white print:text-black tabular-nums">
                          {fmtUsd(c.estimatedDealContribution)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* 06 — Attention-Adjusted Upside */}
          <Section title="Attention-Adjusted Upside" index="06">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Conservative" value={fmtUsd(attentionVal.final.conservative)} />
              <Stat label="Base" value={fmtUsd(attentionVal.final.base)} accent />
              <Stat label="Aggressive" value={fmtUsd(attentionVal.final.aggressive)} />
            </div>
            <p className="mt-3 text-xs text-white/45 print:text-gray-600">
              Raw attention upside: <strong>{fmtUsd(attentionVal.attentionUpside.raw)}</strong> · Conversion ratio {attentionVal.conversionRatio.toFixed(2)}× · Confidence {attentionVal.confidence}%.
            </p>
            {attentionVal.notes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {attentionVal.notes.map((n, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/55 print:text-gray-700">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400/60" />
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* 07 — Partner Offer Simulator */}
          <Section title="Partner Offer Simulator" index="07">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-white/[0.06] print:border-gray-200">
                  <tr className="text-[10px] font-bold tracking-widest uppercase text-white/35 print:text-gray-500">
                    <th className="py-2 pr-3">Partner</th>
                    <th className="py-2 pr-3">Structure</th>
                    <th className="py-2 pr-3">Estimated Range</th>
                    <th className="py-2 pr-3">Fit</th>
                    <th className="py-2 pr-3">Main Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] print:divide-gray-100">
                  {partnerValuations.map((p, idx) => (
                    <tr key={p.id} className={idx === 0 ? 'bg-purple-500/[0.05] print:bg-purple-50' : ''}>
                      <td className="py-2 pr-3 align-top">
                        <p className="font-bold text-white print:text-black">{p.name}</p>
                        <p className="text-[10px] text-white/35 print:text-gray-500">{p.category}</p>
                      </td>
                      <td className="py-2 pr-3 align-top text-white/60 print:text-gray-600">{p.structure}</td>
                      <td className="py-2 pr-3 align-top">
                        {p.range ? (
                          <span className="font-bold text-white tabular-nums print:text-black">
                            {fmtUsd(p.range.low)} – {fmtUsd(p.range.high)}
                          </span>
                        ) : (
                          <span className="text-white/40 print:text-gray-500">Strategic pathway</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 align-top font-bold text-purple-300 print:text-purple-700 tabular-nums">
                        {p.fitScore}
                      </td>
                      <td className="py-2 pr-3 align-top text-amber-300/80 print:text-amber-700">{p.mainRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 08 — Duetti */}
          {duetti && (
            <Section title="Duetti-Style Estimate" index="08">
              {duetti.range && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Low" value={fmtUsd(duetti.range.low)} />
                  <Stat label="Midpoint" value={fmtUsd(duetti.range.midpoint)} accent />
                  <Stat label="High" value={fmtUsd(duetti.range.high)} />
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Structure:</strong> {duetti.structure}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Why it fits:</strong> {duetti.whyFit}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Suggested ask:</strong> {duetti.suggestedAsk}
              </p>
              <p className="mt-2 text-[10px] text-white/35 print:text-gray-500">{duetti.disclaimer}</p>
            </Section>
          )}

          {/* 09 — BeatBread */}
          {beatbread && (
            <Section title="BeatBread-Style Estimate" index="09">
              {beatbread.termOptions && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {beatbread.termOptions.map((t) => (
                    <Stat key={t.term} label={t.term} value={fmtUsd(t.estimate)} />
                  ))}
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Structure:</strong> {beatbread.structure}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Why it fits:</strong> {beatbread.whyFit}
              </p>
              <p className="mt-2 text-[10px] text-white/35 print:text-gray-500">{beatbread.disclaimer}</p>
            </Section>
          )}

          {/* 10 — Sound Royalties */}
          {soundRoyalties && (
            <Section title="Sound Royalties-Style Estimate" index="10">
              {soundRoyalties.range && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Low" value={fmtUsd(soundRoyalties.range.low)} />
                  <Stat label="Midpoint" value={fmtUsd(soundRoyalties.range.midpoint)} accent />
                  <Stat label="High" value={fmtUsd(soundRoyalties.range.high)} />
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Structure:</strong> {soundRoyalties.structure}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65 print:text-gray-700">
                <strong className="text-white print:text-black">Why it fits:</strong> {soundRoyalties.whyFit}
              </p>
              <p className="mt-2 text-[10px] text-white/35 print:text-gray-500">{soundRoyalties.disclaimer}</p>
            </Section>
          )}

          {/* 11 — Sync / Rights / Distribution / Creator Pathways */}
          <Section title="Sync / Rights / Distribution / Creator Pathways" index="11">
            <div className="space-y-2">
              {partnerValuations
                .filter((p) => p.kind === 'strategic')
                .map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 print:border-gray-100 print:bg-gray-50"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-white print:text-black">{p.name}</p>
                      <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-purple-300 print:bg-purple-50 print:text-purple-700">
                        Fit {p.fitScore}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 print:text-gray-500">{p.category}</p>
                    <p className="mt-1 text-xs text-white/65 print:text-gray-700">{p.whyFit}</p>
                  </div>
                ))}
            </div>
          </Section>

          {/* 12 — Forecast Scenarios */}
          <Section title="Forecast Scenarios" index="12">
            <div className="grid gap-2 sm:grid-cols-2">
              {forecasts.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 print:border-gray-100 print:bg-gray-50"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 print:text-gray-500">
                    {f.name} · Conf {f.confidence}%
                  </p>
                  <p className="text-sm font-black text-white tabular-nums print:text-black">
                    {fmtUsd(f.valuationLow)} – {fmtUsd(f.valuationHigh)}
                  </p>
                  <p className="text-[10px] text-white/40 print:text-gray-600">
                    Projected 12-mo revenue: {fmtUsd(f.projected12mRevenue)}
                  </p>
                  <p className="mt-1 text-[10px] text-white/35 print:text-gray-600">{f.description}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 13 — Deal Readiness */}
          <Section title="Deal Readiness Score" index="13">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.06] px-6 py-4 print:border-purple-200 print:bg-purple-50">
                <p className="text-[10px] font-bold tracking-widest uppercase text-purple-300/80 print:text-purple-700">
                  Total
                </p>
                <p className="text-3xl font-black text-white print:text-black tabular-nums">
                  {readiness.total}
                  <span className="text-base text-white/30 print:text-gray-500">/100</span>
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-purple-200/80 print:text-purple-800">
                  {readiness.label}
                </p>
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(readiness.components).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 print:border-gray-100 print:bg-gray-50"
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 print:text-gray-500">
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm font-black text-white tabular-nums print:text-black">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 14 — Momentum Signals */}
          <Section title="Momentum Signals" index="14">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: 'Streaming', value: signals.streamingScore },
                { label: 'Social', value: signals.socialScore },
                { label: 'Pipeline', value: signals.pipelineScore },
                { label: 'Overall', value: signals.overall },
              ].map((s) => (
                <Stat key={s.label} label={s.label} value={`${s.value}/100`} />
              ))}
            </div>
            <p className="mt-3 text-xs text-white/40 print:text-gray-500">
              {signals.hasInputs
                ? 'Computed from the manual momentum inputs captured on the Readiness page.'
                : 'No manual inputs captured yet — values reflect default sample signals.'}
            </p>
          </Section>

          {/* 15 — Recommended Ask */}
          <Section title="Recommended Ask" index="15">
            <p className="text-sm leading-relaxed text-white/70 print:text-gray-700">{memo.suggestedAsk}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65 print:text-gray-700">
              {memo.recommendedRoute}
            </p>
          </Section>

          {/* 16 — Negotiation Notes */}
          <Section title="Negotiation Notes" index="16">
            <div className="grid gap-3 md:grid-cols-2">
              <ListBlock label="Why This May Be Worth More" items={underwriting.whyHigherThanNtm} accent="emerald" />
              <ListBlock label="What Could Reduce" items={underwriting.whatCouldReduce} accent="red" />
            </div>
          </Section>

          {/* 17 — Partner Email Pitch */}
          <Section title="Partner Email Pitch" index="17">
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5 print:border-gray-200 print:bg-gray-50">
              <p className="mb-1 text-[10px] font-bold tracking-widest uppercase text-white/25 print:text-gray-400">
                Target Partner
              </p>
              <p className="mb-3 text-sm font-semibold text-white/75 print:text-black">
                {topPartner?.name} · {topPartner?.categoryLabel}
                {topPartnerValuation?.range &&
                  ` · Estimated range ${fmtUsd(topPartnerValuation.range.low)}–${fmtUsd(topPartnerValuation.range.high)}`}
              </p>
              <p className="mb-1 text-[10px] font-bold tracking-widest uppercase text-white/25 print:text-gray-400">
                Subject
              </p>
              <p className="mb-4 text-sm font-semibold text-white/75 print:text-black">
                {pitch.subject}
              </p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/55 font-sans print:text-gray-700">
                {pitch.body}
              </pre>
            </div>
          </Section>

          {/* 18 — Risk Warnings */}
          <Section title="Risk Warnings" index="18">
            {underwriting.riskDiscounts.length === 0 ? (
              <p className="text-xs text-white/40 print:text-gray-500">
                No material risk warnings flagged.
              </p>
            ) : (
              <ul className="space-y-2">
                {underwriting.riskDiscounts.map((r) => (
                  <li
                    key={r.name}
                    className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3 print:border-red-200 print:bg-red-50"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-white print:text-black">{r.name}</p>
                      <span className="text-xs font-black text-red-300 print:text-red-700">−{r.pct}%</span>
                    </div>
                    <p className="mt-1 text-xs text-white/55 print:text-gray-700">{r.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* 19 — Disclaimer */}
          <Section title="Disclaimer" index="19">
            <p className="text-xs leading-relaxed text-white/40 print:text-gray-600">
              These estimates are internal RocketRolla projections and do not represent guaranteed
              offers from {PARTNER_LIST_FOR_DISCLAIMER}, or any partner. Final offers depend on
              partner due diligence, rights ownership, revenue verification, deal terms, market
              conditions, approval, and negotiated structure. Figures are modelled from the data
              available at the time of generation and should not be interpreted as a binding offer,
              appraisal, or formal financial advice.
            </p>
          </Section>
        </div>

        <div className="rounded-b-3xl border-t border-white/[0.05] px-10 py-6 print:border-gray-100 print:px-8">
          <p className="text-[10px] text-white/20 print:text-gray-400">
            RocketRolla Catalog Intelligence Engine · Confidential Internal Report · Not for
            distribution · {today}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

function Section({
  title,
  index,
  children,
}: {
  title: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-10 py-7 print:px-8 print:py-6">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-[10px] font-black tracking-[0.25em] uppercase text-white/20 print:text-gray-400">
          {index}
        </span>
        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white/50 print:text-gray-600">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border bg-white/[0.02] p-4 print:bg-gray-50 ${
        accent ? 'border-purple-500/30 print:border-purple-200' : 'border-white/[0.07] print:border-gray-100'
      }`}
    >
      <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 print:text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white print:text-black tabular-nums">{value}</p>
    </div>
  );
}

function ListBlock({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: 'emerald' | 'red';
}) {
  const map = {
    emerald: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/[0.04]',
      text: 'text-emerald-300/80',
      dot: 'bg-emerald-400',
      print: 'print:border-emerald-200 print:bg-emerald-50 print:text-emerald-700',
    },
    red: {
      border: 'border-red-500/20',
      bg: 'bg-red-500/[0.04]',
      text: 'text-red-300/80',
      dot: 'bg-red-400',
      print: 'print:border-red-200 print:bg-red-50 print:text-red-700',
    },
  } as const;
  const s = map[accent];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 ${s.print}`}>
      <p className={`mb-2 text-[10px] font-black tracking-[0.3em] uppercase ${s.text}`}>{label}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/65 print:text-gray-700">
            <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${s.dot}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
