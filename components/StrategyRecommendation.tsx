import type { StrategyRecommendation as StrategyRec } from '@/lib/dealReadiness';
import { strategyMeta } from '@/lib/dealReadiness';

const accentMap: Record<string, { border: string; chip: string; glow: string; label: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    chip: 'bg-emerald-500/15 text-emerald-300',
    glow: 'shadow-[0_0_40px_rgba(52,211,153,0.08)]',
    label: 'text-emerald-300',
  },
  purple: {
    border: 'border-purple-500/30',
    chip: 'bg-purple-500/15 text-purple-300',
    glow: 'shadow-[0_0_40px_rgba(167,139,250,0.10)]',
    label: 'text-purple-300',
  },
  amber: {
    border: 'border-amber-500/30',
    chip: 'bg-amber-500/15 text-amber-300',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.07)]',
    label: 'text-amber-300',
  },
  blue: {
    border: 'border-blue-500/30',
    chip: 'bg-blue-500/15 text-blue-300',
    glow: 'shadow-[0_0_40px_rgba(96,165,250,0.07)]',
    label: 'text-blue-300',
  },
};

export function StrategyRecommendationCard({ strategy }: { strategy: StrategyRec }) {
  const meta = strategyMeta[strategy.decision];
  const accent = accentMap[meta.color] ?? accentMap.purple;

  return (
    <div className={`rounded-3xl border ${accent.border} bg-white/[0.02] p-7 ${accent.glow}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`mb-1 text-[10px] font-black tracking-[0.3em] uppercase ${accent.label}`}>
            Strategic Recommendation
          </p>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {strategy.headline}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${accent.chip}`}>
          {meta.chip}
        </span>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">{strategy.body}</p>

      {strategy.supporting.length > 0 && (
        <div className="mt-5 space-y-1.5">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25">
            Why this call
          </p>
          {strategy.supporting.map((s, i) => (
            <p key={i} className="flex gap-2 text-xs leading-relaxed text-white/50">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white/30" />
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
