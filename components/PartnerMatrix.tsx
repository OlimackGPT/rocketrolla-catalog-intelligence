import type { PartnerAccent, PartnerEntry } from '@/lib/partnerMatrix';

const accentMap: Record<PartnerAccent, { border: string; chip: string; bar: string; ring: string; label: string }> = {
  purple: {
    border: 'border-purple-500/25',
    chip: 'bg-purple-500/15 text-purple-300',
    bar: 'bg-purple-400',
    ring: 'ring-1 ring-purple-500/30 shadow-[0_0_40px_rgba(167,139,250,0.10)]',
    label: 'text-purple-300',
  },
  emerald: {
    border: 'border-emerald-500/25',
    chip: 'bg-emerald-500/15 text-emerald-300',
    bar: 'bg-emerald-400',
    ring: 'ring-1 ring-emerald-500/30 shadow-[0_0_40px_rgba(52,211,153,0.08)]',
    label: 'text-emerald-300',
  },
  blue: {
    border: 'border-blue-500/25',
    chip: 'bg-blue-500/15 text-blue-300',
    bar: 'bg-blue-400',
    ring: 'ring-1 ring-blue-500/25',
    label: 'text-blue-300',
  },
  amber: {
    border: 'border-amber-500/25',
    chip: 'bg-amber-500/15 text-amber-300',
    bar: 'bg-amber-400',
    ring: 'ring-1 ring-amber-500/25',
    label: 'text-amber-300',
  },
  rose: {
    border: 'border-rose-500/25',
    chip: 'bg-rose-500/15 text-rose-300',
    bar: 'bg-rose-400',
    ring: 'ring-1 ring-rose-500/25',
    label: 'text-rose-300',
  },
};

function FitBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function PartnerMatrix({ partners }: { partners: PartnerEntry[] }) {
  return (
    <div className="space-y-3">
      {partners.map((p, idx) => {
        const accent = accentMap[p.accent];
        const isTop = idx === 0;
        return (
          <div
            key={p.id}
            className={`rounded-2xl border bg-white/[0.02] p-6 transition-all ${accent.border} ${isTop ? accent.ring : ''}`}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${accent.bar}`} />
                <div>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base font-black text-white">{p.name}</h3>
                    {isTop && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.25em] uppercase ${accent.chip}`}>
                        Top Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35">{p.categoryLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                  Fit Score
                </p>
                <p className={`text-2xl font-black tabular-nums ${accent.label}`}>{p.fit}</p>
              </div>
            </div>

            <FitBar value={p.fit} color={accent.bar} />

            <div className="mt-5 grid gap-4 lg:grid-cols-4">
              <div>
                <p className="mb-1.5 text-[9px] font-black tracking-[0.3em] uppercase text-white/25">
                  Why It Fits
                </p>
                <p className="text-xs leading-relaxed text-white/55">{p.whyFit}</p>
              </div>
              <div>
                <p className="mb-1.5 text-[9px] font-black tracking-[0.3em] uppercase text-amber-400/70">
                  Why It May Not
                </p>
                <p className="text-xs leading-relaxed text-white/55">{p.whyNotFit}</p>
              </div>
              <div>
                <p className="mb-1.5 text-[9px] font-black tracking-[0.3em] uppercase text-purple-300/80">
                  Prep Required
                </p>
                <ul className="space-y-1">
                  {p.requiredPrep.map((prep, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/55">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400/60" />
                      {prep}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-[9px] font-black tracking-[0.3em] uppercase text-emerald-400/70">
                  Pitch Angle
                </p>
                <p className="text-xs leading-relaxed text-white/55">{p.pitchAngle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
