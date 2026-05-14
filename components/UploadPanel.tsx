'use client';

import { useState, useRef } from 'react';
import { parseCsvDetailed } from '@/lib/csv';
import { expectedColumnSchema } from '@/lib/sampleCsv';
import { SampleCsvDownload } from '@/components/SampleCsvDownload';

export function UploadPanel() {
  const [message, setMessage] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [detectedCols, setDetectedCols] = useState<string[]>([]);
  const [attentionCols, setAttentionCols] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsSuccess(false);
    setErrors([]);
    setDetectedCols([]);
    setAttentionCols([]);
    setRowCount(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage('');
      setErrors(['File must be a .csv — please export your revenue data as CSV.']);
      return;
    }

    try {
      const text = await file.text();
      const { rows, detectedColumns, attentionColumnsFound } = parseCsvDetailed(text);
      localStorage.setItem('rr_rows', JSON.stringify(rows));
      setDetectedCols(detectedColumns);
      setAttentionCols(attentionColumnsFound);
      setRowCount(rows.length);
      setMessage(`Successfully parsed ${rows.length.toLocaleString()} revenue rows from "${file.name}"`);
      setIsSuccess(true);
    } catch (err) {
      setErrors([(err as Error).message || 'Unknown parse error.']);
      setMessage('');
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const coreSchema = expectedColumnSchema.filter((c) => c.group === 'core');
  const attentionSchema = expectedColumnSchema.filter((c) => c.group === 'attention');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center transition-all duration-200',
          isDragging
            ? 'border-purple-400/60 bg-purple-500/[0.07] shadow-[0_0_30px_rgba(167,139,250,0.10)]'
            : isSuccess
            ? 'border-emerald-500/40 bg-emerald-500/[0.04]'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />

        {isSuccess ? (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl text-emerald-400">
              ✓
            </div>
            <p className="text-sm font-bold text-emerald-300">{message}</p>
            <p className="mt-1 text-xs text-white/40">Click to upload a different file</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl text-white/30">
              ↑
            </div>
            <p className="mb-1 text-sm font-semibold text-white/80">
              Drop your revenue CSV here
            </p>
            <p className="text-xs text-white/35">
              or click to browse — .csv files only · attention columns optional
            </p>
          </>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <p className="mb-1 text-[10px] font-bold tracking-widest uppercase text-red-400">
            Parse Error
          </p>
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-300/80">
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Detected columns */}
      {detectedCols.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/30">
              Detected Columns ({detectedCols.length})
            </p>
            {attentionCols.length > 0 ? (
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-emerald-300">
                {attentionCols.length} attention columns found
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-amber-300">
                No attention columns
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {detectedCols.map((col) => {
              const isAttention = attentionCols.includes(col);
              return (
                <span
                  key={col}
                  className={`rounded-lg border px-3 py-1 text-xs font-mono ${
                    isAttention
                      ? 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-300'
                      : 'border-white/10 bg-white/[0.04] text-white/60'
                  }`}
                >
                  {col}
                </span>
              );
            })}
          </div>
          {rowCount !== null && (
            <p className="mt-3 text-xs text-white/30">
              {rowCount.toLocaleString()} rows loaded · Data stored in session
            </p>
          )}
          {attentionCols.length === 0 && (
            <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs text-amber-200/80">
              Upload optional TikTok / Reels / YouTube / Shazam columns to unlock attention-adjusted
              valuation and track-level deal contribution.
            </p>
          )}
        </div>
      )}

      {/* Schema guide */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25">
              Supported Column Schema
            </p>
            <p className="mt-1 text-xs text-white/40">
              Flexible matching: non-standard headers auto-map where possible. Numbers can be plain (1240000), compact ("1.2M", "600k"), or comma-separated ("1,240,000").
            </p>
          </div>
          <SampleCsvDownload />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase text-emerald-300/80">
              Core (Revenue)
            </p>
            <div className="space-y-1.5">
              {coreSchema.map((col) => (
                <div key={col.key} className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${col.required ? 'bg-emerald-400' : 'bg-white/20'}`}
                  />
                  <span className="font-mono text-xs text-white/60">{col.key}</span>
                  <span className="text-xs text-white/45">— {col.label}</span>
                  {col.required && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-500/60">
                      required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
              Attention (Optional · unlocks adjusted valuation)
            </p>
            <div className="space-y-1.5">
              {attentionSchema.map((col) => (
                <div key={col.key} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400/60" />
                  <span className="font-mono text-xs text-white/60">{col.key}</span>
                  <span className="text-xs text-white/45">— {col.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
