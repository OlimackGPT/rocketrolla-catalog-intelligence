'use client';
import { useMemo } from 'react';
import { buildValuation } from '@/lib/valuation';
import { computeMetrics } from '@/lib/csv';
import { mockRows } from '@/lib/mockData';
import { BrandCard, MetricCard, RiskWarning, ScoreBadge, SectionHeader } from './brand';

export function ValuationView() {
  const valuation = useMemo(() => {
    const raw = localStorage.getItem('rr_rows');
    return buildValuation(computeMetrics(raw ? JSON.parse(raw) : mockRows));
  }, []);

  return <div className="space-y-4">
    <BrandCard>
      <SectionHeader label="Valuation" title="Internal Catalog Valuation" subtitle="Internal estimate only — not a guaranteed offer. Based on projected NTM revenue and risk-adjusted scoring." />
    </BrandCard>
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard label="Conservative (3x)" value={`$${valuation.conservative.toFixed(0)}`} />
      <MetricCard label="Base (5x)" value={`$${valuation.base.toFixed(0)}`} />
      <MetricCard label="Aggressive (8x)" value={`$${valuation.aggressive.toFixed(0)}`} />
    </div>
    <BrandCard>
      <p className="text-sm text-muted-foreground">Assumptions: 3x for downside-protected buyers, 5x for balanced growth catalogs, 8x for exceptional momentum with low operational risk.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ScoreBadge label="Confidence" score={valuation.confidence} />
        <ScoreBadge label="Health" score={valuation.scores.health} />
        <ScoreBadge label="Momentum" score={valuation.scores.momentum} />
        <ScoreBadge label="Rights Risk" score={valuation.scores.rightsRisk} />
      </div>
    </BrandCard>
    <RiskWarning text="This valuation range is directional. Final partner offers depend on diligence, rights clarity, and forward performance." />
  </div>;
}
