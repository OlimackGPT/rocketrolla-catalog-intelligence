'use client';
import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { computeMetrics } from '@/lib/csv';
import { mockRows } from '@/lib/mockData';
import { BrandCard, MetricCard, RiskWarning, SectionHeader } from './brand';

const colors = ['#37E67D', '#8B5CF6', '#60A5FA', '#F59E0B', '#F43F5E'];

export function AnalyticsView() {
  const metrics = useMemo(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('rr_rows') : null;
    return computeMetrics(raw ? JSON.parse(raw) : mockRows);
  }, []);
  const top10 = metrics.revenueByTrack.slice(0, 10);
  const concentration = Math.round(((top10[0]?.revenue ?? 0) / Math.max(metrics.totalRevenue, 1)) * 100);

  return (
    <div className="space-y-4">
      <BrandCard>
        <SectionHeader label="Analytics" title="Revenue Intelligence Dashboard" subtitle="This view shows leverage signals: consistency, concentration, and platform diversification." />
      </BrandCard>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Revenue" value={`$${metrics.totalRevenue.toFixed(2)}`} />
        <MetricCard label="Monthly Run Rate" value={`$${metrics.runRate.toFixed(2)}`} />
        <MetricCard label="Projected NTM" value={`$${metrics.projectedNtm.toFixed(2)}`} />
        <MetricCard label="Top Track Concentration" value={`${concentration}%`} />
      </div>
      <RiskWarning text="Higher concentration means weaker negotiation leverage and potentially lower valuation multiples." />
      <div className="grid gap-4 lg:grid-cols-2">
        <BrandCard className="h-80"><p className="text-sm uppercase tracking-[0.25em] text-primary">Monthly Revenue Trend</p><ResponsiveContainer width="100%" height="90%"><AreaChart data={metrics.monthlyRevenue}><XAxis dataKey="month" stroke="#9CA7BD"/><YAxis stroke="#9CA7BD"/><Tooltip/><Area type="monotone" dataKey="revenue" stroke="#37E67D" fill="#37E67D33"/></AreaChart></ResponsiveContainer></BrandCard>
        <BrandCard className="h-80"><p className="text-sm uppercase tracking-[0.25em] text-primary">Platform Breakdown</p><ResponsiveContainer width="100%" height="90%"><BarChart data={metrics.platformBreakdown.slice(0, 6)}><XAxis dataKey="name" stroke="#9CA7BD"/><YAxis stroke="#9CA7BD"/><Tooltip/><Bar dataKey="revenue" fill="#8B5CF6"/></BarChart></ResponsiveContainer></BrandCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BrandCard className="lg:col-span-2"><p className="text-sm uppercase tracking-[0.25em] text-primary">Top Songs</p><table className="mt-3 w-full text-sm"><thead><tr className="text-muted-foreground"><th className="text-left">Track</th><th className="text-right">Revenue</th></tr></thead><tbody>{top10.map((r) => <tr key={r.name} className="border-t border-white/10"><td className="py-2">{r.name}</td><td className="py-2 text-right">${r.revenue.toFixed(2)}</td></tr>)}</tbody></table></BrandCard>
        <BrandCard className="h-72"><p className="text-sm uppercase tracking-[0.25em] text-primary">Country Breakdown</p><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={metrics.countryBreakdown.slice(0, 5)} dataKey="revenue" nameKey="name" outerRadius={86}>{metrics.countryBreakdown.slice(0, 5).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie></PieChart></ResponsiveContainer></BrandCard>
      </div>
    </div>
  );
}
