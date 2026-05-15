'use client';

import { useMemo, useState, type ComponentType } from 'react';
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Download,
  FileSignature,
  Film,
  Handshake,
  Headphones,
  ListChecks,
  Search,
  ShieldCheck,
  Tags,
  TrendingUp,
  Users,
} from 'lucide-react';

const ROCKETROLLA_APP_URL = 'https://rocketrolla-catalog-intelligence.vercel.app/';

type Category =
  | 'All'
  | 'Rights & Splits'
  | 'Releases'
  | 'Catalog Financing'
  | 'Sync'
  | 'Business';

type Level = 'Essential' | 'Pro' | 'Advanced';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

type Template = {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'All'>;
  fileType: string;
  level: Level;
  available: boolean;
  icon: IconType;
  href: string;
};

const TEMPLATES: Template[] = [
  {
    id: 'split-sheet',
    title: 'Split Sheet Template',
    description:
      'Clarify ownership, songwriter shares, publisher details, PRO information, and signatures before the song is released.',
    category: 'Rights & Splits',
    fileType: 'PDF',
    level: 'Essential',
    available: true,
    icon: Users,
    href: '/downloads/rocketrolla-split-sheet-template.pdf',
  },
  {
    id: 'work-for-hire',
    title: 'Work For Hire Agreement',
    description:
      'Document producer, engineer, designer, or contributor services clearly so ownership and payment terms are understood.',
    category: 'Rights & Splits',
    fileType: 'PDF',
    level: 'Essential',
    available: true,
    icon: FileSignature,
    href: '/downloads/rocketrolla-work-for-hire-agreement.pdf',
  },
  {
    id: 'producer-agreement',
    title: 'Producer Agreement Template',
    description:
      'Structure producer engagement: master share, royalty split, advance, points, deliverables, credit, and dispute terms.',
    category: 'Rights & Splits',
    fileType: 'PDF',
    level: 'Pro',
    available: true,
    icon: Headphones,
    href: '/downloads/rocketrolla-producer-agreement.pdf',
  },
  {
    id: 'song-release',
    title: 'Song Release Checklist',
    description:
      'Prepare your release with the right metadata, assets, credits, registrations, and rollout steps before distribution.',
    category: 'Releases',
    fileType: 'PDF',
    level: 'Essential',
    available: true,
    icon: ListChecks,
    href: '/downloads/rocketrolla-song-release-checklist.pdf',
  },
  {
    id: 'metadata',
    title: 'Metadata Checklist',
    description:
      'Prepare ISRCs, primary artists, featured artists, songwriters, producers, publishers, PROs, language, and explicit tags before release.',
    category: 'Releases',
    fileType: 'PDF',
    level: 'Essential',
    available: true,
    icon: Tags,
    href: '/downloads/rocketrolla-metadata-checklist.pdf',
  },
  {
    id: 'catalog-valuation',
    title: 'Catalog Valuation Prep Sheet',
    description:
      'Organize the documents partners ask for before pricing a catalog: revenue history, ownership splits, links, and attention signals.',
    category: 'Catalog Financing',
    fileType: 'PDF',
    level: 'Advanced',
    available: true,
    icon: TrendingUp,
    href: '/downloads/rocketrolla-catalog-valuation-prep-sheet.pdf',
  },
  {
    id: 'sync-submission',
    title: 'Sync Submission Checklist',
    description:
      'Prepare clean music submissions for brands, sports, film, TV, games, and content partners.',
    category: 'Sync',
    fileType: 'PDF',
    level: 'Pro',
    available: true,
    icon: Film,
    href: '/downloads/rocketrolla-sync-submission-checklist.pdf',
  },
  {
    id: 'advance-readiness',
    title: 'Artist Advance Readiness Checklist',
    description:
      'Understand what funding partners usually need before reviewing an artist, catalog, or royalty-backed opportunity.',
    category: 'Catalog Financing',
    fileType: 'PDF',
    level: 'Advanced',
    available: true,
    icon: Banknote,
    href: '/downloads/rocketrolla-artist-advance-readiness-checklist.pdf',
  },
  {
    id: 'royalty-registration',
    title: 'Royalty Registration Checklist',
    description:
      'Track key registrations across PROs, publishing, neighboring rights, SoundExchange-style royalties, and distributor metadata.',
    category: 'Business',
    fileType: 'PDF',
    level: 'Pro',
    available: true,
    icon: ShieldCheck,
    href: '/downloads/rocketrolla-royalty-registration-checklist.pdf',
  },
  {
    id: 'collab-agreement',
    title: 'Collaboration Agreement Template',
    description:
      'Set clear expectations between artists, producers, writers, managers, and collaborators before work begins.',
    category: 'Business',
    fileType: 'PDF',
    level: 'Pro',
    available: true,
    icon: Handshake,
    href: '/downloads/rocketrolla-collaboration-agreement.pdf',
  },
];

const CATEGORIES: Category[] = [
  'All',
  'Rights & Splits',
  'Releases',
  'Catalog Financing',
  'Sync',
  'Business',
];

const LEVEL_STYLES: Record<Level, string> = {
  Essential: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300',
  Pro: 'border-purple-500/25 bg-purple-500/[0.08] text-purple-200',
  Advanced: 'border-amber-500/25 bg-amber-500/[0.08] text-amber-300',
};

export default function ArtistToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Count per category for the filter chips (gives the page real metadata
  // signal instead of marketing fluff).
  const counts = useMemo(() => {
    const map: Record<Category, number> = {
      All: TEMPLATES.length,
      'Rights & Splits': 0,
      Releases: 0,
      'Catalog Financing': 0,
      Sync: 0,
      Business: 0,
    };
    for (const t of TEMPLATES) map[t.category]++;
    return map;
  }, []);

  return (
    <div className="space-y-7">
      {/* Compact header — no logo, no marketing fluff */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
            Artist Templates · Free
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Templates for independent artists.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Split sheets, work-for-hire agreements, release checklists, sync submissions, and deal
            prep documents. All ready to download. All free.
          </p>
        </div>
        <a
          href={ROCKETROLLA_APP_URL}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold tracking-widest uppercase text-white/70 transition-all hover:bg-white/[0.07] hover:text-white"
        >
          Open RocketRolla App
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </header>

      {/* Quick stats line */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 text-xs">
        <span className="flex items-center gap-2 text-white/65">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          {TEMPLATES.filter((t) => t.available).length} templates ready
        </span>
        <span className="text-white/30">·</span>
        <span className="text-white/65">5 categories</span>
        <span className="text-white/30">·</span>
        <span className="text-white/65">PDF format · download direct</span>
        <span className="text-white/30">·</span>
        <span className="text-white/65">No signup required</span>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">
              Library
            </p>
            <p className="text-sm font-semibold text-white/80">
              {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
              {selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}
              {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : ''}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates…"
              aria-label="Search templates"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/25"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              aria-pressed={selectedCategory === c}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-all ${
                selectedCategory === c
                  ? 'border-purple-500/35 bg-purple-500/15 text-purple-200 shadow-[0_0_12px_rgba(167,139,250,0.15)]'
                  : 'border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              {c}
              <span
                className={`tabular-nums ${selectedCategory === c ? 'text-purple-200/80' : 'text-white/30'}`}
              >
                {counts[c]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] p-10 text-center">
          <p className="text-sm font-bold text-white/70">No templates match your search.</p>
          <p className="mt-1 text-xs text-white/40">
            Try a different keyword or clear the category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-white/65 hover:bg-white/[0.07] hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}

      {/* Legal disclaimer */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">
          Legal disclaimer
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          These templates are provided for educational and organizational purposes only and do not
          constitute legal advice. Artists should consult a qualified attorney before signing or
          relying on any agreement.
        </p>
      </section>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const Icon = template.icon;
  return (
    <div className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 transition-all group-hover:ring-purple-500/30">
          <Icon className="h-5 w-5 text-purple-200" aria-hidden="true" />
        </div>
        {template.available && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-[9px] font-black tracking-widest uppercase text-emerald-300">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Ready
          </span>
        )}
      </div>

      <p className="text-[10px] font-bold tracking-widest uppercase text-purple-300/80">
        {template.category}
      </p>
      <h3 className="mt-1 text-base font-black tracking-tight text-white">{template.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-white/50">{template.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-lg border px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase ${LEVEL_STYLES[template.level]}`}
        >
          {template.level}
        </span>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-white/55">
          {template.fileType}
        </span>
      </div>

      <a
        href={template.href}
        download
        aria-label={`Download ${template.title} (PDF)`}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 px-3 py-2.5 text-[11px] font-bold tracking-widest uppercase text-purple-200 hover:bg-purple-500/25 transition-all"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Download PDF
      </a>
    </div>
  );
}
