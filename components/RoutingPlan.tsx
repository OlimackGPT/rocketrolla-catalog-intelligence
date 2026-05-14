import type { RoutingPlan, RoutingPhase, RoutingPriority, RoutingStep } from '@/lib/routingPlan';
import { PHASE_LABELS } from '@/lib/routingPlan';
import type { Vertical } from '@/lib/partnerModels';
import { VERTICAL_LABELS } from '@/lib/partnerModels';
import type { PartnerEntry } from '@/lib/partnerMatrix';

const PHASE_ORDER: RoutingPhase[] = ['now', '30-day', '60-day', '90-day'];

const phaseStyle: Record<RoutingPhase, { border: string; chip: string; dot: string; label: string }> = {
  now: {
    border: 'border-red-500/30',
    chip: 'bg-red-500/15 text-red-300',
    dot: 'bg-red-400',
    label: 'text-red-300/80',
  },
  '30-day': {
    border: 'border-purple-500/30',
    chip: 'bg-purple-500/15 text-purple-200',
    dot: 'bg-purple-400',
    label: 'text-purple-300/90',
  },
  '60-day': {
    border: 'border-emerald-500/25',
    chip: 'bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'text-emerald-300/80',
  },
  '90-day': {
    border: 'border-blue-500/25',
    chip: 'bg-blue-500/15 text-blue-300',
    dot: 'bg-blue-400',
    label: 'text-blue-300/80',
  },
};

const priorityStyle: Record<RoutingPriority, { chip: string; label: string }> = {
  critical: { chip: 'bg-red-500/15 text-red-300', label: 'Critical' },
  primary: { chip: 'bg-purple-500/15 text-purple-200', label: 'Primary' },
  parallel: { chip: 'bg-emerald-500/15 text-emerald-300', label: 'Parallel' },
  optional: { chip: 'bg-white/[0.06] text-white/55', label: 'Optional' },
};

export function RoutingPlanCard({
  plan,
  partners,
}: {
  plan: RoutingPlan;
  partners: PartnerEntry[];
}) {
  const stepsByPhase = PHASE_ORDER.map((phase) => ({
    phase,
    steps: plan.steps.filter((s) => s.phase === phase),
  }));

  return (
    <div className="space-y-5 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7">
      <div>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-300/90">
          Routing Plan · 30 / 60 / 90 days
        </p>
        <h3 className="text-xl font-black tracking-tight text-white">{plan.headline}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{plan.rationale}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {stepsByPhase.map(({ phase, steps }) => {
          const style = phaseStyle[phase];
          return (
            <div key={phase} className={`rounded-2xl border bg-black/30 p-5 ${style.border}`}>
              <div className="mb-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                <p className={`text-[10px] font-black tracking-[0.3em] uppercase ${style.label}`}>
                  {PHASE_LABELS[phase]}
                </p>
              </div>
              {steps.length === 0 ? (
                <p className="text-xs text-white/35">No action scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {steps.map((step) => (
                    <StepCard key={step.id} step={step} partners={partners} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ step, partners }: { step: RoutingStep; partners: PartnerEntry[] }) {
  const pStyle = priorityStyle[step.priority];
  const stepPartners = step.partnerIds
    .map((id) => partners.find((p) => p.id === id))
    .filter((p): p is PartnerEntry => Boolean(p));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-bold text-white">{step.title}</p>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase ${pStyle.chip}`}>
          {pStyle.label}
        </span>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-white/55">{step.description}</p>

      {stepPartners.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {stepPartners.map((p) => (
            <span
              key={p.id}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-white/70"
            >
              {p.name}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-white/[0.06] pt-2">
        <p className="text-[9px] font-bold tracking-widest uppercase text-emerald-400/70">Done when</p>
        <p className="text-[11px] leading-relaxed text-white/55">{step.doneCriteria}</p>
      </div>

      <p className="mt-2 text-[9px] tracking-widest uppercase text-white/25">
        {VERTICAL_LABELS[step.vertical as Vertical] ?? step.vertical}
      </p>
    </div>
  );
}
