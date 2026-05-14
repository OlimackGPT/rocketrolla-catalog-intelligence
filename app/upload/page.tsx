import { UploadPanel } from '@/components/UploadPanel';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
          Step 01 · Data Ingestion
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">Upload Catalog CSV</h1>
        <p className="mt-2 text-sm text-white/40">
          Import a raw revenue export from any DSP or aggregator dashboard. Flexible column
          matching handles non-standard headers.
        </p>
      </div>
      <UploadPanel />
    </div>
  );
}