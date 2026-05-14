import type { ForecastScenario } from '@/lib/forecasts';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const accentByScenario: Record<string, { border: string; chip: string; label: string }> = {
  'current-run-rate': {
    border: 'border-white/[0.07]',
    chip: 'bg-white/[0.05] text-white/60',
    label: 'text-white/40',
  },
  'growth-adjusted': {
    border: 'border-purple-500/25',
    chip: 'bg-purple-500/15 text-purple-200',
    label: 'text-purple-300/80',
  },
  'attention-conversion': {
    border: 'border-emerald-500/25 shadow-[0_0_30px_rgba(52,211,153,0.07)]',
    chip: 'bg-emerald-500/15 text-emerald-300',
    label: 'text-emerald-300/80',
  },
  'conservative-downside': {
    border: 'border-amber-500/25',
    chip: 'bg-amber-500/15 text-amber-300',
    label: 'text-amber-300/80',
  },
};

export function ForecastScenarios({ scenarios }: { scenarios: ForecastScenario[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {scenarios.map((s) => {
        const accent = accentByScenario[s.id] ?? accentByScenario['current-run-rate'];
        return (
          <div
            key={s.id}
            className={`rounded-2xl border bg-white/[0.02] p-6 ${accent.border}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${accent.label}`}>
                  Scenario
                </p>
                <h3 className="text-base font-black text-white">{s.name}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${accent.chip}`}>
                Conf {s.confidence}%
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-white/55">{s.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Projected 12-mo Revenue" value={fmtUsd(s.projected12mRevenue)} />
              <Stat label="Valuation Low" value={fmtUsd(s.valuationLow)} />
              <Stat label="Valuation High" value={fmtUsd(s.valuationHigh)} />
            </div>

            <ul className="mt-4 space-y-1.5">
              {s.assumptions.map((a, i) => (
                <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-white/45">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/30" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/30 p-3">
      <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</p>
      <p className="mt-1 text-base font-black text-white tabular-nums">{value}</p>
    </div>
  );
}
