'use client';

import { useMemo, useState } from 'react';
import type { PartnerValuation } from '@/lib/partnerModels';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const ACCENT_BY_PARTNER: Record<string, { border: string; chip: string; label: string }> = {
  duetti: { border: 'border-purple-500/30', chip: 'bg-purple-500/15 text-purple-200', label: 'text-purple-200' },
  beatbread: { border: 'border-purple-500/25', chip: 'bg-purple-500/15 text-purple-200', label: 'text-purple-200' },
  'sound-royalties': { border: 'border-emerald-500/25', chip: 'bg-emerald-500/15 text-emerald-300', label: 'text-emerald-300' },
  acrylic: { border: 'border-purple-500/25', chip: 'bg-purple-500/15 text-purple-200', label: 'text-purple-200' },
  'third-chair': { border: 'border-blue-500/25', chip: 'bg-blue-500/15 text-blue-300', label: 'text-blue-300' },
  strommar: { border: 'border-blue-500/25', chip: 'bg-blue-500/15 text-blue-300', label: 'text-blue-300' },
  streamfic: { border: 'border-amber-500/25', chip: 'bg-amber-500/15 text-amber-300', label: 'text-amber-300' },
  aamf: { border: 'border-rose-500/25', chip: 'bg-rose-500/15 text-rose-300', label: 'text-rose-300' },
  meteor: { border: 'border-rose-500/25', chip: 'bg-rose-500/15 text-rose-300', label: 'text-rose-300' },
  'next-chapter': { border: 'border-rose-500/25', chip: 'bg-rose-500/15 text-rose-300', label: 'text-rose-300' },
  melino: { border: 'border-rose-500/25', chip: 'bg-rose-500/15 text-rose-300', label: 'text-rose-300' },
};

export function PartnerOfferSimulator({
  partnerValuations,
}: {
  partnerValuations: PartnerValuation[];
}) {
  const [activeId, setActiveId] = useState(partnerValuations[0]?.id ?? '');
  const active = useMemo(
    () => partnerValuations.find((p) => p.id === activeId) ?? partnerValuations[0],
    [partnerValuations, activeId],
  );
  if (!active) return null;
  const accent = ACCENT_BY_PARTNER[active.id] ?? ACCENT_BY_PARTNER.duetti;

  return (
    <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7">
      <div>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
          Partner Offer Simulator
        </p>
        <h3 className="text-xl font-black tracking-tight text-white">
          Simulate what each partner could underwrite
        </h3>
        <p className="mt-1 text-sm text-white/45">
          Switch between partner-specific models and see the structure, range, required proof, and negotiation angle for each pathway.
        </p>
      </div>

      {/* Selector chips */}
      <div className="flex flex-wrap gap-2">
        {partnerValuations.map((p) => {
          const a = ACCENT_BY_PARTNER[p.id] ?? ACCENT_BY_PARTNER.duetti;
          const isActive = p.id === active.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`rounded-xl border px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${
                isActive
                  ? `${a.border} bg-white/[0.05] text-white`
                  : 'border-white/10 bg-white/[0.02] text-white/45 hover:text-white/80'
              }`}
            >
              {p.name}
              <span className="ml-1.5 text-[9px] text-white/40">·{p.fitScore}</span>
            </button>
          );
        })}
      </div>

      {/* Active partner detail */}
      <div className={`rounded-2xl border bg-black/30 p-6 ${accent.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${accent.label}`}>
              {active.kind === 'dollar' ? 'Estimated Range' : 'Strategic Pathway'}
            </p>
            <h4 className="text-lg font-black text-white">{active.name}</h4>
            <p className="text-xs text-white/40">{active.category}</p>
            <p className="text-xs text-white/35">{active.structure}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Fit</p>
            <p className="text-3xl font-black text-white tabular-nums">{active.fitScore}</p>
          </div>
        </div>

        {active.range && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Box label="Low" value={fmtUsd(active.range.low)} />
            <Box label="Midpoint" value={fmtUsd(active.range.midpoint)} featured />
            <Box label="High" value={fmtUsd(active.range.high)} />
          </div>
        )}

        {active.termOptions && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {active.termOptions.map((t) => (
              <div key={t.term} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">{t.term}</p>
                <p className="text-base font-black text-white tabular-nums">{fmtUsd(t.estimate)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Block label="Required Proof" items={active.requiredProof} accent="purple" />
          <Block
            label="Negotiation Angle"
            items={[active.suggestedAsk]}
            accent="emerald"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Narrative title="Why It Fits" body={active.whyFit} />
          <Narrative title="Why It May Not" body={active.whyNotFit} />
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-white/35">{active.disclaimer}</p>
      </div>
    </div>
  );
}

function Box({ label, value, featured }: { label: string; value: string; featured?: boolean }) {
  return (
    <div
      className={`rounded-xl border bg-black/30 p-4 ${
        featured ? 'border-purple-500/30 ring-1 ring-purple-500/20' : 'border-white/[0.07]'
      }`}
    >
      <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">{label}</p>
      <p className="mt-1 text-lg font-black text-white tabular-nums">{value}</p>
    </div>
  );
}

function Block({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: 'purple' | 'emerald';
}) {
  const map = {
    purple: { border: 'border-purple-500/20', text: 'text-purple-200/90', dot: 'bg-purple-400' },
    emerald: { border: 'border-emerald-500/20', text: 'text-emerald-300/80', dot: 'bg-emerald-400' },
  } as const;
  const s = map[accent];
  return (
    <div className={`rounded-xl border ${s.border} bg-white/[0.02] p-4`}>
      <p className={`mb-2 text-[10px] font-black tracking-[0.3em] uppercase ${s.text}`}>{label}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/60">
            <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${s.dot}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Narrative({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-black tracking-[0.3em] uppercase text-white/30">{title}</p>
      <p className="text-xs leading-relaxed text-white/60">{body}</p>
    </div>
  );
}
