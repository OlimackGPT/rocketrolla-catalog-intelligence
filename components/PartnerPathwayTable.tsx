import type { PartnerValuation } from '@/lib/partnerModels';

const fmtUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function PartnerPathwayTable({ partnerValuations }: { partnerValuations: PartnerValuation[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead className="border-b border-white/[0.06]">
          <tr className="text-[10px] font-bold tracking-widest uppercase text-white/35">
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">Structure</th>
            <th className="px-4 py-3">Estimated Range</th>
            <th className="px-4 py-3">Ownership Impact</th>
            <th className="px-4 py-3">Best For</th>
            <th className="px-4 py-3">Main Risk</th>
            <th className="px-4 py-3">Next Step</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {partnerValuations.map((p, idx) => (
            <tr
              key={p.id}
              className={idx === 0 ? 'bg-purple-500/[0.05]' : 'hover:bg-white/[0.02]'}
            >
              <td className="px-4 py-3 align-top">
                <p className="font-bold text-white">{p.name}</p>
                <p className="text-[10px] text-white/35">{p.category}</p>
                <p className="mt-1 text-[10px] font-bold tracking-widest uppercase text-purple-300/80">
                  Fit {p.fitScore}
                </p>
              </td>
              <td className="px-4 py-3 align-top text-white/65">{p.structure}</td>
              <td className="px-4 py-3 align-top">
                {p.range ? (
                  <>
                    <p className="font-bold text-white tabular-nums">
                      {fmtUsd(p.range.low)} – {fmtUsd(p.range.high)}
                    </p>
                    <p className="text-[10px] text-white/40">
                      midpoint {fmtUsd(p.range.midpoint)}
                    </p>
                  </>
                ) : (
                  <p className="text-white/45">Strategic pathway</p>
                )}
              </td>
              <td className="px-4 py-3 align-top text-white/60">{p.ownershipImpact}</td>
              <td className="px-4 py-3 align-top text-white/60">{p.bestFor}</td>
              <td className="px-4 py-3 align-top text-amber-300/80">{p.mainRisk}</td>
              <td className="px-4 py-3 align-top text-white/65">{p.suggestedAsk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
