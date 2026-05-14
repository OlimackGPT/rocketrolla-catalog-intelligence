import type { UnderwritingResult } from '@/lib/underwritingEngine';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function UnderwritingSummary({ underwriting }: { underwriting: UnderwritingResult }) {
  const { methods, finalRange, suggestedAsk, confidence, totalRiskDiscountPct, totalStrategicPremiumPct } = underwriting;
  return (
    <div className="space-y-5">
      {/* Hero — Final RocketRolla Internal Range */}
      <div className="rounded-3xl border border-purple-500/30 bg-white/[0.02] p-7 ring-1 ring-purple-500/20 shadow-[0_0_60px_rgba(167,139,250,0.10)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
              RocketRolla Underwriting Brain
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Final Internal Range
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Blended across five methods (NTM floor, historical comp, reliable annualized, momentum, track-level), risk-adjusted, with capped strategic premiums.
            </p>
          </div>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-purple-200">
            Confidence {confidence}%
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Tier label="Range Low" value={finalRange.low} accent="amber" />
          <Tier label="Final Base" value={finalRange.base} accent="purple" featured />
          <Tier label="Range High" value={finalRange.high} accent="emerald" />
          <Tier label="Suggested Ask" value={suggestedAsk} accent="purple-ask" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-4">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-red-300/80">
              Risk Discount
            </p>
            <p className="mt-1 text-2xl font-black text-white tabular-nums">
              −{totalRiskDiscountPct.toFixed(0)}%
            </p>
            <p className="text-[10px] tracking-widest uppercase text-white/35">
              capped at −30%
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-300/80">
              Strategic Premium
            </p>
            <p className="mt-1 text-2xl font-black text-white tabular-nums">
              +{totalStrategicPremiumPct.toFixed(0)}%
            </p>
            <p className="text-[10px] tracking-widest uppercase text-white/35">
              capped at +20%
            </p>
          </div>
        </div>
      </div>

      {/* Five-method breakdown */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
          Method Breakdown
        </p>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <MethodCard
            label="A · Revenue-Only Floor"
            description="Pure NTM × multiples. Useful as a defensible floor."
            range={methods.revenueOnlyFloor}
            tone="amber"
          />
          {methods.historicalComp.applicable ? (
            <MethodCard
              label="B · Historical Comp"
              description={`${methods.historicalComp.multipleLow.toFixed(1)}×–${methods.historicalComp.multipleHigh.toFixed(1)}× of ${fmtUsd(methods.historicalComp.historicalRevenue)} over ${methods.historicalComp.monthsCovered} months. Quality factor ${(methods.historicalComp.qualityFactor * 100).toFixed(0)}/100.`}
              range={methods.historicalComp.range}
              tone="purple"
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                B · Historical Comp
              </p>
              <p className="mt-2 text-sm text-white/40">
                Not applicable — fewer than 6 months of history.
              </p>
            </div>
          )}
          <MethodCard
            label="C · Reliable Annualized"
            description="L3/L6/L12-smoothed annualized × stability-weighted multiples."
            range={methods.reliableAnnualized}
            tone="blue"
          />
          <MethodCard
            label="D · Momentum-Adjusted"
            description="Revenue + attention upside, capped by data quality and ownership clarity."
            range={methods.momentumAdjusted}
            tone="purple"
          />
          <MethodCard
            label="E · Track-Level Upside"
            description="Sum of per-track contributions: revenue × multiplier + attention contribution per track."
            range={methods.trackLevelUpside}
            tone="emerald"
          />
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
  accent: 'amber' | 'purple' | 'emerald' | 'purple-ask';
  featured?: boolean;
}) {
  const map: Record<typeof accent, { border: string; text: string }> = {
    amber: { border: 'border-amber-500/25', text: 'text-amber-300' },
    purple: { border: 'border-purple-500/35 ring-1 ring-purple-500/25', text: 'text-purple-200' },
    emerald: { border: 'border-emerald-500/25', text: 'text-emerald-300' },
    'purple-ask': { border: 'border-purple-500/35 bg-purple-500/[0.06]', text: 'text-purple-100' },
  };
  const s = map[accent];
  return (
    <div className={`relative rounded-2xl border bg-black/30 p-5 ${s.border}`}>
      {featured && (
        <span className="absolute right-3 top-3 rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-purple-200">
          Anchor
        </span>
      )}
      <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${s.text}`}>{label}</p>
      <p className="mt-2 text-2xl font-black text-white tabular-nums">{fmtUsd(value)}</p>
    </div>
  );
}

function MethodCard({
  label,
  description,
  range,
  tone,
}: {
  label: string;
  description: string;
  range: { low: number; base: number; high: number };
  tone: 'amber' | 'purple' | 'emerald' | 'blue';
}) {
  const toneMap: Record<typeof tone, { border: string; label: string }> = {
    amber: { border: 'border-amber-500/20', label: 'text-amber-300/80' },
    purple: { border: 'border-purple-500/25', label: 'text-purple-200/90' },
    emerald: { border: 'border-emerald-500/20', label: 'text-emerald-300/80' },
    blue: { border: 'border-blue-500/20', label: 'text-blue-300/80' },
  };
  const s = toneMap[tone];
  return (
    <div className={`rounded-2xl border bg-white/[0.02] p-5 ${s.border}`}>
      <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${s.label}`}>{label}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-white/45">{description}</p>
      <div className="mt-3 grid gap-1 text-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-white/40">Low</span>
          <span className="text-white/80 tabular-nums">{fmtUsd(range.low)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-white/40">Base</span>
          <span className="text-white font-bold tabular-nums">{fmtUsd(range.base)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-white/40">High</span>
          <span className="text-white/80 tabular-nums">{fmtUsd(range.high)}</span>
        </div>
      </div>
    </div>
  );
}
