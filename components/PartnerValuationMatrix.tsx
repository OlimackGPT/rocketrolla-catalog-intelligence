import type { PartnerValuation } from '@/lib/partnerModels';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function PartnerValuationMatrix({
  partnerValuations,
}: {
  partnerValuations: PartnerValuation[];
}) {
  return (
    <div className="space-y-3">
      {partnerValuations.map((p, idx) => {
        const isTop = idx === 0;
        return (
          <div
            key={p.id}
            className={`rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 ${
              isTop ? 'ring-1 ring-purple-500/25 shadow-[0_0_40px_rgba(167,139,250,0.10)]' : ''
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-black text-white">{p.name}</h3>
                  {isTop && (
                    <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-purple-200">
                      Top Match
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-white/60">
                    {p.kind === 'dollar' ? 'Dollar Estimate' : 'Strategic Pathway'}
                  </span>
                </div>
                <p className="text-xs text-white/40">{p.category}</p>
                <p className="text-xs text-white/35">{p.structure}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Fit</p>
                <p className="text-2xl font-black text-white tabular-nums">{p.fitScore}</p>
              </div>
            </div>

            {/* Dollar layer */}
            {p.kind === 'dollar' && p.range && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.07] bg-black/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Range Low</p>
                  <p className="mt-1 text-lg font-black text-white tabular-nums">{fmtUsd(p.range.low)}</p>
                </div>
                <div className="rounded-xl border border-purple-500/25 bg-black/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-purple-300/90">Midpoint</p>
                  <p className="mt-1 text-lg font-black text-white tabular-nums">{fmtUsd(p.range.midpoint)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-black/30 p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Range High</p>
                  <p className="mt-1 text-lg font-black text-white tabular-nums">{fmtUsd(p.range.high)}</p>
                </div>
              </div>
            )}

            {/* Term options for BeatBread-style */}
            {p.termOptions && p.termOptions.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {p.termOptions.map((t) => (
                  <div
                    key={t.term}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                      {t.term}
                    </p>
                    <p className="text-base font-black text-white tabular-nums">{fmtUsd(t.estimate)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Narrative */}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <NarrativeBlock label="Why It Fits" body={p.whyFit} accent="emerald" />
              <NarrativeBlock label="Why It May Not" body={p.whyNotFit} accent="amber" />
              <NarrativeBlock label="What Partner Likes" body={p.whatPartnerLikes} accent="purple" />
              <NarrativeBlock label="What Partner Questions" body={p.whatPartnerQuestions} accent="red" />
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-300/80">
                Suggested Ask
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{p.suggestedAsk}</p>
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-white/35">{p.disclaimer}</p>
          </div>
        );
      })}
    </div>
  );
}

function NarrativeBlock({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: 'emerald' | 'amber' | 'purple' | 'red';
}) {
  const map: Record<'emerald' | 'amber' | 'purple' | 'red', string> = {
    emerald: 'text-emerald-300/80',
    amber: 'text-amber-300/80',
    purple: 'text-purple-200/90',
    red: 'text-red-300/80',
  };
  return (
    <div>
      <p className={`mb-1.5 text-[10px] font-black tracking-[0.3em] uppercase ${map[accent]}`}>
        {label}
      </p>
      <p className="text-xs leading-relaxed text-white/60">{body}</p>
    </div>
  );
}
