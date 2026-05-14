import type { TrackContribution } from '@/lib/attentionValuation';
import type { TrackTag } from '@/lib/trackMomentum';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const tagStyle: Record<TrackTag, string> = {
  'Revenue Driver': 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300',
  'Attention Driver': 'border-purple-500/25 bg-purple-500/[0.08] text-purple-200',
  'Sync Candidate': 'border-blue-500/25 bg-blue-500/[0.08] text-blue-300',
  'Rights Cleanup Needed': 'border-rose-500/25 bg-rose-500/[0.08] text-rose-300',
  'Under-Monetized Asset': 'border-amber-500/25 bg-amber-500/[0.08] text-amber-300',
  'Concentration Risk': 'border-red-500/25 bg-red-500/[0.08] text-red-300',
  'Catalog Anchor': 'border-emerald-500/30 bg-emerald-500/[0.10] text-emerald-200',
  'Long-Tail Asset': 'border-white/15 bg-white/[0.04] text-white/55',
};

export function TrackDealContribution({
  contributions,
  limit = 6,
}: {
  contributions: TrackContribution[];
  limit?: number;
}) {
  const visible = contributions
    .filter((c) => c.estimatedDealContribution > 0)
    .sort((a, b) => b.estimatedDealContribution - a.estimatedDealContribution)
    .slice(0, limit);

  if (visible.length === 0) return null;

  const max = Math.max(...visible.map((c) => c.estimatedDealContribution));

  return (
    <div className="space-y-3">
      {visible.map((c) => {
        const pct = max > 0 ? (c.estimatedDealContribution / max) * 100 : 0;
        return (
          <div
            key={c.track}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="text-base font-black text-white">{c.track}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  Revenue {fmtUsd(c.revenue)} · Attention {fmtUsd(c.attentionValue)}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                  Est. Contribution
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {fmtUsd(c.estimatedDealContribution)}
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                  {(c.share * 100).toFixed(0)}% of base
                </p>
              </div>
            </div>

            {c.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${tagStyle[tag as TrackTag]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
