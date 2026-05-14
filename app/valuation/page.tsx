import { ValuationView } from '@/components/ValuationView';

export default function ValuationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
          Step 03 · Financial Modeling
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">Catalog Valuation</h1>
        <p className="mt-2 text-sm text-white/40">
          Internal estimate only — not a guaranteed offer or binding financial advice.
        </p>
      </div>
      <ValuationView />
    </div>
  );
}