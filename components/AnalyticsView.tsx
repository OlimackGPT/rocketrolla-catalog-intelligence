'use client';

import { useMemo } from 'react';
import { useCatalogData } from '@/lib/hooks';
import { checkDataQuality } from '@/lib/dataQuality';
import { DemoDataBadge } from '@/components/DemoDataBadge';
import { DataQualityWarnings } from '@/components/DataQualityWarnings';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const fmt = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`;

const PURPLE = '#a78bfa';
const EMERALD = '#34d399';
const COLORS = [PURPLE, EMERALD, '#60a5fa', '#fb923c', '#f472b6', '#facc15'];

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a061a] px-3 py-2 text-xs shadow-2xl">
      <p className="mb-1 text-white/40">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-purple-300">
          {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsView() {
  const { rows, metrics, valuation, hasUserData, hydrated } = useCatalogData();

  const warnings = useMemo(
    () => checkDataQuality({ rows, metrics, valuation, hasUserData }),
    [rows, metrics, valuation, hasUserData],
  );

  const topMetrics = [
    { label: 'Total Revenue', value: fmt(metrics.totalRevenue), sub: 'All time' },
    { label: 'Monthly Run Rate', value: fmt(metrics.runRate), sub: 'L3M avg' },
    { label: 'Projected NTM', value: fmt(metrics.projectedNtm), sub: '12-mo forecast' },
    {
      label: 'Top Track Rev',
      value: fmt(metrics.revenueByTrack[0]?.revenue ?? 0),
      sub: metrics.revenueByTrack[0]?.track ?? '—',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <DemoDataBadge visible={hydrated && !hasUserData} />
      </div>

      <DataQualityWarnings warnings={warnings} />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topMetrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
          >
            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
              {m.label}
            </p>
            <p className="mb-1 text-2xl font-black tracking-tight text-white tabular-nums">
              {m.value}
            </p>
            <p className="truncate text-xs text-white/35">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <p className="mb-5 text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
          Monthly Revenue
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.monthlyRevenue} barCategoryGap="30%">
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => fmt(v)}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {metrics.monthlyRevenue.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      idx === metrics.monthlyRevenue.length - 1
                        ? PURPLE
                        : 'rgba(167,139,250,0.35)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: top tracks + platform + country */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Tracks */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
            Top Tracks
          </p>
          <div className="space-y-3">
            {metrics.revenueByTrack.slice(0, 6).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 text-right text-[10px] font-bold text-white/20">
                  {i + 1}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-semibold text-white/70">{t.track}</p>
                  <div
                    className="mt-1 h-1 rounded-full bg-purple-500/40"
                    style={{
                      width: `${
                        metrics.revenueByTrack[0]?.revenue
                          ? (t.revenue / metrics.revenueByTrack[0].revenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white/50 tabular-nums">
                  {fmt(t.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
            Platform Breakdown
          </p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.revenueByPlatform.slice(0, 6)}
                  dataKey="revenue"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={56}
                  paddingAngle={2}
                >
                  {metrics.revenueByPlatform.slice(0, 6).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {metrics.revenueByPlatform.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 truncate text-xs text-white/50">{p.platform}</span>
                <span className="text-xs font-semibold text-white/50 tabular-nums">
                  {fmt(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Country breakdown */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
            Top Markets
          </p>
          <div className="space-y-3">
            {metrics.revenueByCountry.slice(0, 6).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 text-right text-[10px] font-bold text-white/20">
                  {i + 1}
                </span>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-semibold text-white/70">{c.country}</p>
                  <div
                    className="mt-1 h-1 rounded-full bg-emerald-500/40"
                    style={{
                      width: `${
                        metrics.revenueByCountry[0]?.revenue
                          ? (c.revenue / metrics.revenueByCountry[0].revenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white/50 tabular-nums">
                  {fmt(c.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
