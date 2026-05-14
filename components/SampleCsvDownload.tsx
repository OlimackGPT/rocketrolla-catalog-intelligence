'use client';

import { sampleCsvContent, sampleCsvFilename } from '@/lib/sampleCsv';

export function SampleCsvDownload() {
  const handleDownload = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sampleCsvFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/[0.08] px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-purple-200 hover:bg-purple-500/15 transition-all"
    >
      ↓ Download Sample CSV
    </button>
  );
}
