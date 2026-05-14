import type { DealReadiness, ReadinessComponents, ReadinessLabel } from '@/lib/dealReadiness';

const labelStyle: Record<ReadinessLabel, { ring: string; chip: string; bar: string; dot: string }> = {
  'Not Ready': {
    ring: 'ring-red-500/30 shadow-[0_0_50px_rgba(248,113,113,0.07)]',
    chip: 'bg-red-500/15 text-red-300',
    bar: 'bg-red-400',
    dot: 'bg-red-400',
  },
  'Needs Cleanup': {
    ring: 'ring-amber-500/30 shadow-[0_0_50px_rgba(251,191,36,0.07)]',
    chip: 'bg-amber-500/15 text-amber-300',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
  },
  'Partner Ready': {
    ring: 'ring-purple-500/30 shadow-[0_0_50px_rgba(167,139,250,0.10)]',
    chip: 'bg-purple-500/15 text-purple-300',
    bar: 'bg-purple-400',
    dot: 'bg-purple-400',
  },
  'High Priority': {
    ring: 'ring-emerald-500/40 shadow-[0_0_60px_rgba(52,211,153,0.12)]',
    chip: 'bg-emerald-500/15 text-emerald-300',
    bar: 'bg-emerald-400',
    dot: 'bg-emerald-400',
  },
};

const componentLabels: Record<keyof ReadinessComponents, string> = {
  revenueConsistency: 'Revenue Consistency',
  recentGrowth: 'Recent Growth',
  trackDiversification: 'Track Diversification',
  platformDiversification: 'Platform Diversification',
  territoryDiversification: 'Territory Diversification',
  metadataCompleteness: 'Metadata Completeness',
  ownershipClarity: 'Ownership Clarity',
  valuationConfidence: 'Valuation Confidence',
  partnerFit: 'Partner Fit',
  syncReadiness: 'Sync Readiness',
};

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function DealReadinessCard({ readiness }: { readiness: DealReadiness }) {
  const style = labelStyle[readiness.label];

  return (
    <div className={`rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 ring-1 ${style.ring}`}>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Score column */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-black/30 p-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            Deal Readiness
          </p>
          <p className="text-6xl font-black tracking-tight text-white tabular-nums">
            {readiness.total}
            <span className="text-2xl text-white/30">/100</span>
          </p>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${style.chip}`}
          >
            {readiness.label}
          </span>
          <p className="text-xs leading-relaxed text-white/45">{readiness.bestNextMove}</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            Scoring Components
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(componentLabels) as (keyof ReadinessComponents)[]).map((key) => {
              const v = readiness.components[key];
              const color =
                v >= 70 ? 'bg-emerald-400' : v >= 45 ? 'bg-purple-400' : v >= 25 ? 'bg-amber-400' : 'bg-red-400';
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold text-white/60">
                      {componentLabels[key]}
                    </p>
                    <span className="text-[11px] font-bold text-white/40 tabular-nums">
                      {v}
                    </span>
                  </div>
                  <ScoreBar value={v} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strengths / risks / fixes */}
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
          <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400/80">
            Strengths
          </p>
          <ul className="space-y-1.5">
            {readiness.strengths.length === 0 ? (
              <li className="text-xs text-white/35">No standout strengths surfaced yet.</li>
            ) : (
              readiness.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/65">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400/70" />
                  {s}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
          <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase text-red-400/80">
            Risks
          </p>
          <ul className="space-y-1.5">
            {readiness.risks.length === 0 ? (
              <li className="text-xs text-white/35">No material risks flagged.</li>
            ) : (
              readiness.risks.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/65">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400/70" />
                  {s}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.04] p-4">
          <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase text-purple-400/90">
            Fix Before Outreach
          </p>
          <ul className="space-y-1.5">
            {readiness.fixesNeeded.length === 0 ? (
              <li className="text-xs text-white/35">No prerequisite fixes — proceed to outreach.</li>
            ) : (
              readiness.fixesNeeded.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/65">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400/70" />
                  {s}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
