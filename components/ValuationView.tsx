'use client';
import { useMemo } from 'react';
import { mockRows } from '@/lib/mockData';
import { computeMetrics } from '@/lib/csv';
import { buildValuation } from '@/lib/valuation';

export function ValuationView(){const v=useMemo(()=>{const raw=localStorage.getItem('rr_rows'); const rows=raw?JSON.parse(raw):mockRows; return buildValuation(computeMetrics(rows));},[]); return <div className="grid gap-4 md:grid-cols-2">{[['Conservative',v.conservative],['Base',v.base],['Aggressive',v.aggressive],['Confidence',v.confidence]].map(([k,val])=><div className="card" key={String(k)}><p className="text-slate-400">{k}</p><p className="text-3xl font-bold">{k==='Confidence'?`${val}%`:`$${Number(val).toFixed(0)}`}</p></div>)}<div className="card md:col-span-2">Scores: Health {v.scores.health}, Momentum {v.scores.momentum}, Rights Risk {v.scores.rightsRisk}, Sync {v.scores.syncPotential}, Partner Fit {v.scores.partnerFit}</div></div>}
