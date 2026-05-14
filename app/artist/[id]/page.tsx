'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Artist {
  id: number;
  name: string;
  genre: string;
  label: string;
  createdAt: string;
}

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    const all: Artist[] = JSON.parse(localStorage.getItem('rr_artists') ?? '[]');
    const found = all.find((a) => String(a.id) === id);
    setArtist(found ?? null);
  }, [id]);

  if (!artist) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-white/40">Artist not found.</p>
        <Link href="/" className="text-xs text-purple-300 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">
          Artist Profile
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">{artist.name}</h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        {[
          { label: 'Genre', value: artist.genre || '—' },
          { label: 'Label / Distributor', value: artist.label || '—' },
          { label: 'Added', value: new Date(artist.createdAt).toLocaleDateString() },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-white/[0.05] pb-4 last:border-0 last:pb-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">{row.label}</p>
            <p className="text-sm font-semibold text-white/70">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/upload"
          className="rounded-xl bg-purple-500/15 border border-purple-500/25 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-500/25 transition-all"
        >
          Upload CSV →
        </Link>
        <Link
          href="/analytics"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/50 hover:text-white/80 transition-all"
        >
          View Analytics
        </Link>
      </div>
    </div>
  );
}