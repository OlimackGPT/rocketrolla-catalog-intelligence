import type { TrackMomentum, TrackMomentumLabel, TrackTag } from '@/lib/trackMomentum';
import { formatCompactNumber } from '@/lib/compactNumber';

const labelStyle: Record<TrackMomentumLabel, { chip: string; dot: string; bar: string }> = {
  'Low Signal': { chip: 'bg-red-500/15 text-red-300', dot: 'bg-red-400', bar: 'bg-red-400' },
  Developing: { chip: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  'Strong Signal': { chip: 'bg-purple-500/15 text-purple-200', dot: 'bg-purple-400', bar: 'bg-purple-400' },
  'High Upside': { chip: 'bg-emerald-500/15 text-emerald-300', dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
};

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

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function TrackMomentumTable({
  tracks,
  limit = 6,
}: {
  tracks: TrackMomentum[];
  limit?: number;
}) {
  const visible = tracks.slice(0, limit);
  return (
    <div className="space-y-3">
      {visible.map((t) => {
        const style = labelStyle[t.label];
        return (
          <div
            key={t.track}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  <p className="text-base font-black text-white">{t.track}</p>
                </div>
                <p className="mt-0.5 text-xs text-white/40">
                  {fmtUsd(t.revenue)} revenue · {(t.revenueShare * 100).toFixed(0)}% of catalog
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                  Momentum
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tabular-nums">{t.overall}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase ${style.chip}`}>
                    {t.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Attention numbers */}
            <div className="mt-4 grid gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
              <AttentionStat label="TikTok views" value={t.attention.tiktokViews} />
              <AttentionStat label="TikTok videos" value={t.attention.tiktokVideos} />
              <AttentionStat label="Reels uses" value={t.attention.reelsUses} />
              <AttentionStat label="YouTube views" value={t.attention.youtubeViews} />
              <AttentionStat label="Shazam" value={t.attention.shazamCount} />
              <AttentionStat label="Playlist adds" value={t.attention.playlistAdds} />
            </div>

            {/* Score mini-bars */}
            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <ScoreMini label="Revenue" value={t.scores.revenue} color="bg-emerald-400" />
              <ScoreMini label="TikTok" value={t.scores.tiktok} color="bg-purple-400" />
              <ScoreMini label="YouTube" value={t.scores.youtube} color="bg-purple-400" />
              <ScoreMini label="Shazam" value={t.scores.shazam} color="bg-blue-400" />
              <ScoreMini label="Concentration" value={t.scores.concentrationRisk} color="bg-amber-400" />
            </div>

            {/* Tags */}
            {t.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${tagStyle[tag]}`}
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

function AttentionStat({ label, value }: { label: string; value: number }) {
  const provided = value > 0;
  return (
    <div className={`rounded-lg border px-3 py-2 ${provided ? 'border-white/10 bg-white/[0.03]' : 'border-white/[0.04] bg-white/[0.01]'}`}>
      <p className="text-[9px] font-bold tracking-widest uppercase text-white/30">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${provided ? 'text-white/80' : 'text-white/25'}`}>
        {provided ? formatCompactNumber(value) : 'Not provided'}
      </p>
    </div>
  );
}

function ScoreMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</p>
        <span className="text-xs font-bold text-white/55 tabular-nums">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
