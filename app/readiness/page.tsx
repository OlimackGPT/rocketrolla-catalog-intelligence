'use client';

import { useDealAnalysis } from '@/lib/hooks';
import { DemoDataBadge } from '@/components/DemoDataBadge';
import { DealReadinessCard } from '@/components/DealReadinessCard';
import { MomentumInputsPanel } from '@/components/MomentumInputs';
import { StrategyRecommendationCard } from '@/components/StrategyRecommendation';

export default function ReadinessPage() {
  const { hasUserData, hydrated, readiness, strategy, momentum } = useDealAnalysis();

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.3em] uppercase text-purple-300/80">
            Decision Layer
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Deal Readiness</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Combine revenue analytics, valuation signals, and manual market momentum into a single,
            executive-grade readiness score. Use it to decide whether to pitch a partner, run a
            cleanup sprint, or hold the catalog.
          </p>
        </div>
        <DemoDataBadge visible={hydrated && !hasUserData} />
      </div>

      <DealReadinessCard readiness={readiness} />

      <StrategyRecommendationCard strategy={strategy} />

      <MomentumInputsPanel
        values={momentum.momentum}
        onUpdate={momentum.update}
        onReset={momentum.reset}
        usingMock={momentum.usingMock}
      />
    </div>
  );
}
