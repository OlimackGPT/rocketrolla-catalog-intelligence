'use client';

import { useMemo, useState } from 'react';
import { buildPartnerPitch, buildSnapshot } from '@/lib/pitch';
import type { PartnerEntry } from '@/lib/partnerMatrix';
import type { PartnerModelId, PartnerValuation } from '@/lib/partnerModels';
import type { DealReadiness, StrategyRecommendation } from '@/lib/dealReadiness';
import type { RevenueMetrics } from '@/lib/types';
import type { AttentionAdjustedValuation } from '@/lib/attentionValuation';
import type { UnderwritingResult } from '@/lib/underwritingEngine';
import type { buildValuation } from '@/lib/valuation';

type Valuation = ReturnType<typeof buildValuation>;

export function PitchGenerator({
  metrics,
  valuation,
  readiness,
  strategy,
  partners,
  partnerValuations,
  attentionVal,
  underwriting,
}: {
  metrics: RevenueMetrics;
  valuation: Valuation;
  readiness: DealReadiness;
  strategy: StrategyRecommendation;
  partners: PartnerEntry[];
  partnerValuations: PartnerValuation[];
  attentionVal: AttentionAdjustedValuation;
  underwriting: UnderwritingResult;
}) {
  const [artistName, setArtistName] = useState('');
  const [partnerId, setPartnerId] = useState<PartnerModelId | ''>(partners[0]?.id ?? '');
  const [copied, setCopied] = useState<'subject' | 'body' | 'internal' | null>(null);

  const partner = useMemo(
    () => partners.find((p) => p.id === partnerId) ?? partners[0],
    [partners, partnerId],
  );

  const partnerValuation = useMemo(
    () => partnerValuations.find((p) => p.id === partner.id),
    [partnerValuations, partner],
  );

  const snapshot = useMemo(
    () =>
      buildSnapshot({
        artistName: artistName.trim() || undefined,
        metrics,
        valuation,
        readiness,
        strategy,
        partners,
        underwriting,
      }),
    [artistName, metrics, valuation, readiness, strategy, partners, underwriting],
  );

  const pitch = useMemo(
    () =>
      buildPartnerPitch({
        snapshot,
        partner,
        partnerValuation,
        readiness,
        strategy,
        metrics,
        valuation,
        attentionVal,
        underwriting,
      }),
    [snapshot, partner, partnerValuation, readiness, strategy, metrics, valuation, attentionVal, underwriting],
  );

  const copy = async (text: string, label: 'subject' | 'body' | 'internal') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  return (
    <div className="space-y-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7">
      <div>
        <p className="mb-1 text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
          Partner Pitch Generator
        </p>
        <h3 className="text-xl font-black tracking-tight text-white">
          Partner-specific email + internal notes
        </h3>
        <p className="mt-1 text-sm text-white/45">
          Email body adapts to the selected partner (Duetti / BeatBread / Sound Royalties / Acrylic / Third Chair / strategic partners) using the current data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest uppercase text-white/35">
            Artist Name
          </label>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="e.g. Nova Pines"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest uppercase text-white/35">
            Target Partner
          </label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value as PartnerModelId)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
          >
            {partners.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0a061a]">
                {p.name} · {p.categoryLabel} · fit {p.fit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/35">
            Subject
          </p>
          <button
            onClick={() => copy(pitch.subject, 'subject')}
            className="text-[10px] font-bold tracking-widest uppercase text-purple-300 hover:text-purple-200"
          >
            {copied === 'subject' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80">
          {pitch.subject}
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/35">
            Email Body
          </p>
          <button
            onClick={() => copy(pitch.body, 'body')}
            className="text-[10px] font-bold tracking-widest uppercase text-purple-300 hover:text-purple-200"
          >
            {copied === 'body' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-5 text-xs leading-relaxed text-white/65 font-sans">
          {pitch.body}
        </pre>
      </div>

      {/* Internal summary */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/35">
            Internal Notes (Not for Partner)
          </p>
          <button
            onClick={() => copy(pitch.internalSummary, 'internal')}
            className="text-[10px] font-bold tracking-widest uppercase text-purple-300 hover:text-purple-200"
          >
            {copied === 'internal' ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-5 text-xs leading-relaxed text-white/55 font-sans">
          {pitch.internalSummary}
        </pre>
      </div>
    </div>
  );
}
