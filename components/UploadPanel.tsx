'use client';
import { useState } from 'react';
import { parseCsv } from '@/lib/csv';

export function UploadPanel() {
  const [message, setMessage] = useState('');
  return <div className="card"><input type="file" accept=".csv" onChange={async (e)=>{const f=e.target.files?.[0]; if(!f) return; const text=await f.text(); try{const rows=parseCsv(text); localStorage.setItem('rr_rows', JSON.stringify(rows)); setMessage(`Loaded ${rows.length} rows`);}catch(err){setMessage(`Error: ${(err as Error).message}`)}}} className="mb-3"/><p className="text-sm text-slate-300">{message || 'Upload a revenue CSV. Flexible column matching is enabled.'}</p></div>
}
