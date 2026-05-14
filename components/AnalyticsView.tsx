'use client';
import { useMemo } from 'react';
import { mockRows } from '@/lib/mockData';
import { computeMetrics } from '@/lib/csv';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const colors = ['#5EA0FF', '#7C5CFF', '#23C8A1', '#F59E0B', '#F43F5E'];

export function AnalyticsView() {
  const metrics = useMemo(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('rr_rows') : null;
    const rows = raw ? JSON.parse(raw) : mockRows;
    return computeMetrics(rows);
  }, []);
  const top10 = metrics.revenueByTrack.slice(0, 10);
  const concentration = Math.round(((top10[0]?.revenue ?? 0) / Math.max(metrics.totalRevenue, 1)) * 100);

  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-4">{[['Total Revenue',metrics.totalRevenue],['Monthly Run Rate',metrics.runRate],['Projected NTM',metrics.projectedNtm],['Top Track Concentration',concentration]].map(([k,v])=><div key={String(k)} className="metric"><p className="label">{k}</p><p className="value">{k==='Top Track Concentration'?`${v}%`:`$${Number(v).toFixed(2)}`}</p></div>)}</div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card h-80"><p className="label">Monthly Revenue Trend</p><ResponsiveContainer width="100%" height="90%"><AreaChart data={metrics.monthlyRevenue}><XAxis dataKey="month" stroke="#94A3B8"/><YAxis stroke="#94A3B8"/><Tooltip/><Area type="monotone" dataKey="revenue" stroke="#5EA0FF" fill="#5EA0FF44"/></AreaChart></ResponsiveContainer></div>
      <div className="card h-80"><p className="label">Platform Breakdown</p><ResponsiveContainer width="100%" height="90%"><BarChart data={metrics.platformBreakdown.slice(0,6)}><XAxis dataKey="name" stroke="#94A3B8"/><YAxis stroke="#94A3B8"/><Tooltip/><Bar dataKey="revenue" fill="#7C5CFF"/></BarChart></ResponsiveContainer></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card lg:col-span-2"><p className="label">Top Songs</p><table className="mt-3 w-full text-sm"><thead className="text-slate-400"><tr><th className="text-left">Track</th><th className="text-right">Revenue</th></tr></thead><tbody>{top10.map((r)=><tr key={r.name} className="border-t border-slate-800"><td className="py-2">{r.name}</td><td className="py-2 text-right">${r.revenue.toFixed(2)}</td></tr>)}</tbody></table></div>
      <div className="card h-72"><p className="label">Country Mix</p><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={metrics.countryBreakdown.slice(0,5)} dataKey="revenue" nameKey="name" outerRadius={90}>{metrics.countryBreakdown.slice(0,5).map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
    </div>
  </div>;
}
