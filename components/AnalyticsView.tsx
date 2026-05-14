'use client';
import { useMemo } from 'react';
import { mockRows } from '@/lib/mockData';
import { computeMetrics } from '@/lib/csv';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsView() {
  const metrics = useMemo(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('rr_rows') : null;
    const rows = raw ? JSON.parse(raw) : mockRows;
    return computeMetrics(rows);
  }, []);

  return <div className="grid gap-4"><div className="grid gap-3 md:grid-cols-4">{[['Total Revenue',metrics.totalRevenue],['Run Rate',metrics.runRate],['Projected NTM',metrics.projectedNtm],['Top Track Rev',metrics.revenueByTrack[0]?.revenue ?? 0]].map(([k,v])=><div key={String(k)} className="card"><p className="text-slate-400">{k}</p><p className="text-2xl font-semibold">${Number(v).toFixed(2)}</p></div>)}</div><div className="card h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics.monthlyRevenue}><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="revenue" fill="#3B82F6"/></BarChart></ResponsiveContainer></div></div>
}
