'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewArtistPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [label, setLabel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    // Store artist in localStorage for session use
    const existing = JSON.parse(localStorage.getItem('rr_artists') ?? '[]');
    existing.push({ id: Date.now(), name, genre, label, createdAt: new Date().toISOString() });
    localStorage.setItem('rr_artists', JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(() => router.push('/upload'), 1200);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
          Onboarding
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">Add New Artist</h1>
        <p className="mt-2 text-sm text-white/40">
          Create an artist profile before uploading their catalog CSV.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] px-6 py-8 text-center">
          <p className="text-lg font-black text-emerald-300">Artist saved.</p>
          <p className="mt-1 text-sm text-white/40">Redirecting to CSV upload…</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <Field label="Artist Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luna Voss"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
            />
          </Field>
          <Field label="Primary Genre">
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Indie Pop, R&B, Hip-Hop"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
            />
          </Field>
          <Field label="Label / Distributor">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. DistroKid, TuneCore, Independent"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
            />
          </Field>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="mt-2 w-full rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Save Artist &amp; Continue to Upload →
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white/35">
        {label}
        {required && <span className="text-purple-400">*</span>}
      </label>
      {children}
    </div>
  );
}