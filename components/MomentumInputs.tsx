'use client';

import { MomentumInputs as MomentumInputsType, momentumGroups, computeMomentumSignals } from '@/lib/momentum';

function NumberField({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      min="0"
      inputMode="numeric"
      value={value === undefined || value === null || Number.isNaN(value) ? '' : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') return onChange(undefined);
        const n = Number(raw);
        onChange(Number.isFinite(n) ? n : undefined);
      }}
      placeholder={placeholder ?? '—'}
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white tabular-nums placeholder-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
    />
  );
}

export function MomentumInputsPanel({
  values,
  onUpdate,
  onReset,
  usingMock,
}: {
  values: MomentumInputsType;
  onUpdate: (patch: Partial<MomentumInputsType>) => void;
  onReset: () => void;
  usingMock: boolean;
}) {
  const signals = computeMomentumSignals(values);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
            Momentum Signals
          </p>
          <p className="text-sm text-white/55">
            Manual inputs — no API required. These signals influence valuation confidence, sync readiness, and the partner fit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usingMock && (
            <span className="rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-300">
              Sample inputs
            </span>
          )}
          <button
            onClick={onReset}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white/50 hover:bg-white/[0.07] hover:text-white/80"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Signal summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Streaming', value: signals.streamingScore, color: 'bg-purple-400' },
          { label: 'Social', value: signals.socialScore, color: 'bg-purple-400' },
          { label: 'Pipeline', value: signals.pipelineScore, color: 'bg-emerald-400' },
          { label: 'Overall', value: signals.overall, color: 'bg-emerald-400' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
              {s.label}
            </p>
            <p className="my-1 text-2xl font-black text-white tabular-nums">{s.value}</p>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-4 lg:grid-cols-3">
        {momentumGroups.map((group) => (
          <div
            key={group.id}
            className="space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
          >
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/35">
              {group.label}
            </p>
            <div className="space-y-2.5">
              {group.fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[10px] font-bold tracking-widest uppercase text-white/35">
                    {f.label}
                  </label>
                  <NumberField
                    value={values[f.key] as number | undefined}
                    onChange={(n) => onUpdate({ [f.key]: n } as Partial<MomentumInputsType>)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
