'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useDealAnalysis, useArtists } from '@/lib/hooks';
import { DemoDataBadge } from '@/components/DemoDataBadge';

const fmtUsd = (v: number) =>
  v >= 1000
    ? `$${(v / 1000).toFixed(v >= 10_000 ? 0 : 1)}k`
    : `$${v.toFixed(0)}`;

const workflow: { step: string; title: string; desc: string; href: Route; accent: string }[] = [
  {
    step: '01',
    title: 'Upload CSV',
    desc: 'Import a raw revenue CSV from any DSP dashboard. Flexible column matching handles messy exports.',
    href: '/upload',
    accent: 'purple',
  },
  {
    step: '02',
    title: 'Analytics',
    desc: 'Inspect platform breakdown, monthly run rate, top tracks, and geographic diversification.',
    href: '/analytics',
    accent: 'purple',
  },
  {
    step: '03',
    title: 'Valuation',
    desc: 'Conservative, base, and aggressive multiples with risk scoring and confidence rating.',
    href: '/valuation',
    accent: 'emerald',
  },
  {
    step: '04',
    title: 'Readiness',
    desc: 'Deal Readiness Score, manual momentum inputs, and the sell / wait / clean up recommendation.',
    href: '/readiness',
    accent: 'purple',
  },
  {
    step: '05',
    title: 'Partner Fit',
    desc: 'Fit-scored partner matrix and an editable email pitch generator for outreach.',
    href: '/recommendation',
    accent: 'emerald',
  },
  {
    step: '06',
    title: 'Report',
    desc: 'Print-ready confidential report packaging the full analysis for internal review.',
    href: '/report',
    accent: 'purple',
  },
];

const partners = [
  { name: 'Duetti', type: 'Catalog Acquisition', color: 'purple' },
  { name: 'BeatBread', type: 'Advance Funding', color: 'purple' },
  { name: 'Sound Royalties', type: 'Royalty-Backed Advance', color: 'emerald' },
  { name: 'Acrylic', type: 'Sync / Sports / Brand', color: 'purple' },
  { name: 'Third Chair', type: 'Rights Recovery', color: 'blue' },
  { name: 'Strommar', type: 'Distribution Infra', color: 'blue' },
  { name: 'AAMF', type: 'Strategic Funding', color: 'rose' },
  { name: 'Meteor', type: 'Culture / Latin', color: 'rose' },
  { name: 'Streamfic', type: 'Creator Campaigns', color: 'amber' },
  { name: 'Next Chapter', type: 'International Expansion', color: 'rose' },
  { name: 'Melino', type: 'Music Business Infra', color: 'rose' },
];

export default function Home() {
  const { metrics, valuation, readiness, hasUserData, hydrated } = useDealAnalysis();
  const { artists } = useArtists();

  const liveMetrics = [
    {
      label: 'Artists Onboarded',
      value: hydrated ? String(artists.length) : '—',
      delta: hydrated && artists.length === 0 ? 'Add your first artist' : 'Local session',
    },
    {
      label: hasUserData ? 'Catalog Months' : 'Demo Months',
      value: String(metrics.monthlyRevenue.length),
      delta: hasUserData ? 'Live data' : 'Mock data',
    },
    {
      label: 'Monthly Run Rate',
      value: fmtUsd(metrics.runRate),
      delta: `NTM ${fmtUsd(metrics.projectedNtm)}`,
    },
    {
      label: 'Readiness',
      value: hydrated ? `${readiness.total}/100` : '—',
      delta: readiness.label,
    },
    {
      label: 'Base Valuation',
      value: fmtUsd(valuation.base),
      delta: `Conf ${valuation.confidence}%`,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] px-8 py-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 100% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
              RocketRolla OS · Internal Command Center
            </p>
            <DemoDataBadge visible={hydrated && !hasUserData} />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white">
            Catalog Intelligence
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #a78bfa 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Engine
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/55">
            Analyze catalog revenue, estimate valuation ranges, score deal readiness, and identify the
            best-fit partner pathway for each independent artist.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-purple-400 hover:shadow-[0_0_24px_rgba(167,139,250,0.35)]"
            >
              Upload Catalog CSV
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/readiness"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold tracking-wide text-white/75 transition-all hover:bg-white/[0.07] hover:text-white"
            >
              Run Readiness Analysis
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold tracking-wide text-white/65 transition-all hover:bg-white/[0.07] hover:text-white"
            >
              View Report
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section>
        <p className="mb-4 text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30">
          Platform Overview
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {liveMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all hover:border-purple-500/25 hover:bg-white/[0.05]"
            >
              <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/35">
                {m.label}
              </p>
              <p className="mb-1 text-2xl font-black tracking-tight text-white tabular-nums">
                {m.value}
              </p>
              <p className="truncate text-xs text-purple-300/70">{m.delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section>
        <p className="mb-4 text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30">
          Analysis Workflow
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflow.map((w) => (
            <Link
              key={w.step}
              href={w.href}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex items-start justify-between">
                <span
                  className={`text-[10px] font-black tracking-[0.3em] uppercase ${
                    w.accent === 'purple' ? 'text-purple-300/70' : 'text-emerald-400/70'
                  }`}
                >
                  {w.step}
                </span>
                <span className="text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white/60">
                  →
                </span>
              </div>
              <h3 className="mb-2 text-base font-bold text-white/90">{w.title}</h3>
              <p className="text-sm leading-relaxed text-white/45">{w.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Partner Layers */}
      <section>
        <p className="mb-4 text-[10px] font-semibold tracking-[0.25em] uppercase text-white/30">
          Partner Ecosystem
        </p>
        <div className="flex flex-wrap gap-2">
          {partners.map((p) => {
            const colorMap: Record<string, string> = {
              emerald: 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300',
              purple: 'border-purple-500/25 bg-purple-500/[0.08] text-purple-200',
              blue: 'border-blue-500/20 bg-blue-500/[0.07] text-blue-300',
              amber: 'border-amber-500/20 bg-amber-500/[0.07] text-amber-300',
              rose: 'border-rose-500/20 bg-rose-500/[0.07] text-rose-300',
            };
            return (
              <div
                key={p.name}
                className={`rounded-xl border px-4 py-2.5 ${colorMap[p.color]}`}
              >
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-[10px] tracking-widest uppercase opacity-60">{p.type}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
