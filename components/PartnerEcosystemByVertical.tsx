import type { PartnerValuation, Vertical } from '@/lib/partnerModels';
import { VERTICAL_LABELS, VERTICAL_ORDER } from '@/lib/partnerModels';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const VERTICAL_STYLE: Record<Vertical, { border: string; accent: string; dot: string }> = {
  funding: { border: 'border-purple-500/25', accent: 'text-purple-200/90', dot: 'bg-purple-400' },
  marketing: { border: 'border-emerald-500/20', accent: 'text-emerald-300/80', dot: 'bg-emerald-400' },
  distribution: { border: 'border-blue-500/20', accent: 'text-blue-300/80', dot: 'bg-blue-400' },
  sync: { border: 'border-purple-500/25', accent: 'text-purple-200/90', dot: 'bg-purple-400' },
  rights: { border: 'border-blue-500/20', accent: 'text-blue-300/80', dot: 'bg-blue-400' },
  creator: { border: 'border-amber-500/20', accent: 'text-amber-300/80', dot: 'bg-amber-400' },
  data: { border: 'border-rose-500/20', accent: 'text-rose-300/80', dot: 'bg-rose-400' },
};

export function PartnerEcosystemByVertical({
  partnersByVertical,
}: {
  partnersByVertical: Record<Vertical, PartnerValuation[]>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-300/90">
          Partner Ecosystem · 7 Verticals
        </p>
        <p className="text-sm text-white/55">
          RocketRolla&apos;s routing layer organizes partners by vertical. The same partner may
          appear in multiple verticals (Snafu sits in Funding + Marketing, Strommar in Distribution + Marketing).
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {VERTICAL_ORDER.map((v) => {
          const partners = partnersByVertical[v] ?? [];
          if (partners.length === 0) {
            // Data vertical doesn't have partners — that's RocketRolla itself.
            if (v === 'data') {
              return (
                <div
                  key={v}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-rose-300/80">
                      {VERTICAL_LABELS[v]}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white">RocketRolla Catalog Intelligence Engine</p>
                  <p className="mt-1 text-xs text-white/45">
                    Native layer. Multi-method underwriting, partner routing, and pitch
                    generation — this app.
                  </p>
                </div>
              );
            }
            return null;
          }
          const s = VERTICAL_STYLE[v];
          return (
            <div key={v} className={`rounded-2xl border ${s.border} bg-white/[0.02] p-5`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${s.accent}`}>
                  {VERTICAL_LABELS[v]}
                </p>
              </div>
              <div className="space-y-2.5">
                {partners.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`rounded-xl border bg-black/30 p-3 ${idx === 0 ? 'border-white/15' : 'border-white/[0.06]'}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <span className={`text-xs font-black tabular-nums ${s.accent}`}>
                        {p.fitScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">{p.category}</p>
                    {p.range && (
                      <p className="mt-1 text-[10px] font-bold tabular-nums text-white/60">
                        {fmtUsd(p.range.low)} – {fmtUsd(p.range.high)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
