'use client';
import { useMemo } from 'react';
import { mockRows } from '@/lib/mockData';
import { computeMetrics } from '@/lib/csv';
import { buildValuation } from '@/lib/valuation';

export function ValuationView(){
  const val=useMemo(()=>{const raw=localStorage.getItem('rr_rows'); const rows=raw?JSON.parse(raw):mockRows; return buildValuation(computeMetrics(rows));},[]);
  return <div className="space-y-4">
    <div className="card"><h2 className="text-2xl font-semibold">Catalog Valuation Report</h2><p className="mt-2 text-slate-400">Assumption: projected next-twelve-month revenue (NTM) multiplied by scenario-specific factors.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{[['Conservative (3x)',val.conservative,'Lower-risk buyers, downside protection'],['Base (5x)',val.base,'Balanced growth and stability assumption'],['Aggressive (8x)',val.aggressive,'High-growth premium scenario']].map(([k,v,d])=><div key={String(k)} className="card"><p className="label">{k}</p><p className="value">${Number(v).toLocaleString()}</p><p className="mt-2 text-sm text-slate-400">{d}</p></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><p className="label">Valuation Confidence</p><p className="value">{val.confidence}%</p><p className="mt-2 text-sm text-slate-400">Confidence blends momentum and rights-risk signals from the scoring engine.</p></div>
      <div className="card"><p className="label">Risk Warnings</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300"><li>Revenue concentration can reduce bidder appetite.</li><li>Metadata/rights quality affects claim and collection speed.</li><li>Short operating history may compress multiples.</li></ul></div>
    </div>
  </div>
}
