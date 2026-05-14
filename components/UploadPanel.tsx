'use client';
import { useState } from 'react';
import { parseCsv } from '@/lib/csv';

export function UploadPanel() {
  const [message, setMessage] = useState('Upload a revenue CSV to begin analysis.');
  const [columns, setColumns] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-semibold">Revenue CSV Upload</h2>
        <p className="mt-2 text-sm text-slate-400">Accepted columns include track, ISRC, artist, platform, territory/country, date/month, streams, revenue, and currency. Flexible matching is enabled.</p>
        <div className="mt-4 rounded-xl border border-dashed border-slate-600 p-6 text-center">
          <input type="file" accept=".csv" className="mx-auto block" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            const headerLine = text.split('\n')[0] ?? '';
            setColumns(headerLine.split(',').map((x) => x.trim()).filter(Boolean));
            try {
              const rows = parseCsv(text);
              localStorage.setItem('rr_rows', JSON.stringify(rows));
              setMessage(`Success: parsed ${rows.length} rows.`);
            } catch (err) {
              setMessage(`Parsing error: ${(err as Error).message}`);
            }
          }} />
          <p className="mt-3 text-sm text-slate-400">Drag-and-drop is supported by your browser file picker.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/sample-catalog.csv" download className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400">Download Sample CSV</a>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold">Detected Columns</h3>
        <div className="mt-3 flex flex-wrap gap-2">{columns.length ? columns.map((c) => <span key={c} className="rounded-full border border-slate-700 px-3 py-1 text-xs">{c}</span>) : <p className="text-sm text-slate-500">No file loaded yet.</p>}</div>
      </div>
      <div className="card"><h3 className="font-semibold">Upload Status</h3><p className="mt-2 text-sm text-slate-300">{message}</p></div>
    </div>
  );
}
