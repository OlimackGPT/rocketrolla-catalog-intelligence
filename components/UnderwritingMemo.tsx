'use client';

import { useState } from 'react';
import type { UnderwritingMemo as Memo } from '@/lib/underwritingMemo';
import type { UnderwritingResult } from '@/lib/underwritingEngine';

export function UnderwritingMemoCard({
  memo,
  underwriting,
}: {
  memo: Memo;
  underwriting: UnderwritingResult;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(memo.fullParagraph);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
            Underwriting Memo
          </p>
          <h3 className="text-xl font-black tracking-tight text-white">
            What this catalog is really worth
          </h3>
          <p className="mt-1 text-sm text-white/45">
            Plain-English narrative built from the multi-method engine. Designed for finance-committee memos and partner intros.
          </p>
        </div>
        <button
          onClick={copy}
          className="rounded-xl border border-purple-500/25 bg-purple-500/[0.08] px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-purple-200 hover:bg-purple-500/15 transition-all"
        >
          {copied ? 'Copied ✓' : 'Copy Memo'}
        </button>
      </div>

      <p className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 text-sm leading-relaxed text-white/75">
        {memo.fullParagraph}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Block label="What the Data Says" body={memo.whatTheDataSays} />
        <Block label="Revenue Model" body={memo.whatRevenueModelSays} />
        <Block label="Historical Comp" body={memo.whatHistoricalCompSays} />
        <Block label="Attention Signal" body={memo.whatAttentionSuggests} />
        <Block label="Partner Lens" body={memo.whatPartnersMaySee} />
        <Block label="Recommended Route" body={memo.recommendedRoute} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock
          label="Why This May Be Worth More Than NTM Suggests"
          accent="emerald"
          items={underwriting.whyHigherThanNtm}
        />
        <ListBlock
          label="What Could Reduce the Offer"
          accent="red"
          items={underwriting.whatCouldReduce}
        />
      </div>

      <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.06] p-5">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
          Recommended Ask
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{memo.suggestedAsk}</p>
      </div>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/35">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-white/65">{body}</p>
    </div>
  );
}

function ListBlock({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: 'emerald' | 'red';
}) {
  const map = {
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.04]', text: 'text-emerald-300/80', dot: 'bg-emerald-400' },
    red: { border: 'border-red-500/20', bg: 'bg-red-500/[0.04]', text: 'text-red-300/80', dot: 'bg-red-400' },
  } as const;
  const s = map[accent];
  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
      <p className={`mb-2 text-[10px] font-black tracking-[0.3em] uppercase ${s.text}`}>{label}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-white/65">
            <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${s.dot}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
