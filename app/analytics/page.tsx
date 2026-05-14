import { AnalyticsView } from '@/components/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
          Step 02 · Revenue Intelligence
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white">Catalog Analytics</h1>
        <p className="mt-2 text-sm text-white/40">
          Platform breakdown, run rate, top tracks, and geographic diversification.
        </p>
      </div>
      <AnalyticsView />
    </div>
  );
}