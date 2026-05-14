import type { AttentionAdjustedValuation } from '@/lib/attentionValuation';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function AttentionValuationCard({
  attentionVal,
}: {
  attentionVal: AttentionAdjustedValuation;
}) {
  return (
    <div className="space-y-5">
      {/* Final RocketRolla range */}
      <div className="rounded-3xl border border-purple-500/25 bg-white/[0.02] p-7 shadow-[0_0_50px_rgba(167,139,250,0.10)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
              Final RocketRolla Internal Range
            </p>
            <p className="mt-1 text-sm text-white/55">
              Revenue base blended with attention upside, capped to a defensible level given data quality.
            </p>
          </div>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-purple-200">
            Confidence {attentionVal.confidence}%
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tier label="Conservative" value={attentionVal.final.conservative} accent="amber" />
          <Tier label="Base" value={attentionVal.final.base} accent="purple" featured />
          <Tier label="Aggressive" value={attentionVal.final.aggressive} accent="emerald" />
        </div>

        {attentionVal.notes.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {attentionVal.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/55">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400/60" />
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Breakdown row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
            Revenue Valuation Layer
          </p>
          <p className="mt-3 text-sm text-white/55">
            Pure NTM × multiples, untouched by attention.
          </p>
          <div className="mt-4 grid gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Conservative (3×)</span>
              <span className="text-white/80 tabular-nums">{fmtUsd(attentionVal.revenue.conservative)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Base (5×)</span>
              <span className="text-white/80 tabular-nums">{fmtUsd(attentionVal.revenue.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Aggressive (8×)</span>
              <span className="text-white/80 tabular-nums">{fmtUsd(attentionVal.revenue.aggressive)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-white/[0.02] p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-purple-300/80">
              Attention-Adjusted Upside
            </p>
            {attentionVal.flags.underMonetizedAttention && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-amber-300">
                Under-Monetized
              </span>
            )}
            {attentionVal.flags.attentionLiftsConfidence && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-emerald-300">
                Converting
              </span>
            )}
          </div>
          <p className="mt-3 text-2xl font-black text-white tabular-nums">
            {fmtUsd(attentionVal.attentionUpside.raw)}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Conversion ratio (revenue ÷ attention proxy): {attentionVal.conversionRatio.toFixed(2)}×
          </p>
          {attentionVal.attentionUpside.perTrack.filter((p) => p.value > 0).length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">
                Top attention contributors
              </p>
              {attentionVal.attentionUpside.perTrack
                .filter((p) => p.value > 0)
                .slice(0, 4)
                .map((p) => (
                  <div key={p.track} className="flex items-center justify-between text-xs">
                    <span className="truncate text-white/50">{p.track}</span>
                    <span className="text-white/75 tabular-nums">{fmtUsd(p.value)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tier({
  label,
  value,
  accent,
  featured,
}: {
  label: string;
  value: number;
  accent: 'amber' | 'purple' | 'emerald';
  featured?: boolean;
}) {
  const map: Record<'amber' | 'purple' | 'emerald', { border: string; text: string }> = {
    amber: { border: 'border-amber-500/25', text: 'text-amber-300' },
    purple: { border: 'border-purple-500/35 ring-1 ring-purple-500/25', text: 'text-purple-200' },
    emerald: { border: 'border-emerald-500/25', text: 'text-emerald-300' },
  };
  const s = map[accent];
  return (
    <div className={`relative rounded-2xl border bg-black/30 p-5 ${s.border}`}>
      {featured && (
        <span className="absolute right-3 top-3 rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-purple-200">
          Most Likely
        </span>
      )}
      <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${s.text}`}>{label}</p>
      <p className="mt-2 text-3xl font-black text-white tabular-nums">{fmtUsd(value)}</p>
    </div>
  );
}
