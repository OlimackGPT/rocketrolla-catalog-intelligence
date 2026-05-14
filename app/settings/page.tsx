'use client';

import { safeRemoveItem } from '@/lib/safeStorage';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">
          Configuration
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-white/40">
          Internal configuration for the RocketRolla Catalog Intelligence Engine.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Data Mode', value: 'Mock / Local', desc: 'Using locally parsed CSV data. No external API calls.' },
          { label: 'Valuation Model', value: 'v1.0 — NTM Multiples', desc: 'Conservative 3× · Base 5× · Aggressive 8×' },
          { label: 'Partner Database', value: 'Static (Hardcoded)', desc: 'Partner list is curated manually. Not live.' },
          { label: 'Export Format', value: 'Print / PDF via Browser', desc: 'Use the Print button on the Report page.' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-start justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-4"
          >
            <div>
              <p className="text-sm font-bold text-white/80">{s.label}</p>
              <p className="text-xs text-white/30">{s.desc}</p>
            </div>
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono text-white/50">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] px-6 py-5">
        <p className="mb-1 text-[10px] font-bold tracking-widest uppercase text-white/20">
          Clear Session Data
        </p>
        <p className="mb-3 text-xs text-white/30">
          Removes the persisted catalog summary from local storage. Mock data will be used until a new CSV is uploaded.
        </p>
        <button
          onClick={() => {
            safeRemoveItem('rr_catalog');
            safeRemoveItem('rr_rows'); // legacy key cleanup
            alert('Session data cleared. Reload the page.');
          }}
          className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10"
        >
          Clear CSV Data
        </button>
      </div>
    </div>
  );
}