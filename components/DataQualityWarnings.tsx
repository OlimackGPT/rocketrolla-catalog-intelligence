import type { DataWarning } from '@/lib/dataQuality';

const severityMap: Record<
  DataWarning['severity'],
  { dot: string; border: string; bg: string; label: string }
> = {
  info: {
    dot: 'bg-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/[0.05]',
    label: 'text-purple-300',
  },
  warn: {
    dot: 'bg-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/[0.06]',
    label: 'text-amber-300',
  },
  error: {
    dot: 'bg-red-400',
    border: 'border-red-500/25',
    bg: 'bg-red-500/[0.06]',
    label: 'text-red-300',
  },
};

export function DataQualityWarnings({ warnings }: { warnings: DataWarning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const s = severityMap[w.severity];
        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl border ${s.border} ${s.bg} px-4 py-3`}
          >
            <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
            <div className="flex-1">
              <p className={`text-xs font-bold ${s.label}`}>{w.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/45">{w.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
