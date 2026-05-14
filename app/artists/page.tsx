'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useArtists } from '@/lib/hooks';

export default function ArtistsPage() {
  const { artists, hydrated } = useArtists();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
            Roster
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Artists</h1>
          <p className="mt-2 text-sm text-white/45">
            Local roster stored in this session. Add an artist, then upload their revenue CSV to
            run the full analysis.
          </p>
        </div>
        <Link
          href="/artists/new"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]"
        >
          + New Artist
        </Link>
      </div>

      {!hydrated ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-white/35">Loading roster…</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] p-10 text-center">
          <p className="mb-2 text-sm font-bold text-white/70">No artists yet</p>
          <p className="mb-5 text-xs text-white/40">
            Create an artist profile to track catalogs separately and route them to partners.
          </p>
          <Link
            href="/artists/new"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 px-4 py-2 text-xs font-bold tracking-widest uppercase text-purple-200 transition-all hover:bg-purple-500/25"
          >
            Add First Artist
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((a) => (
            <Link
              key={a.id}
              href={`/artist/${a.id}` as Route}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all hover:border-purple-500/25 hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
                  Artist
                </p>
                <span className="text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white/60">
                  →
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight text-white">{a.name}</h3>
              <p className="mt-1 text-xs text-white/45">
                {a.genre || '—'}
                {a.label ? ` · ${a.label}` : ''}
              </p>
              <p className="mt-3 text-[10px] tracking-widest uppercase text-white/25">
                Added {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
