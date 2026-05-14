import Link from 'next/link';
import type { ReactNode } from 'react';

export function BrandShell({ children }: { children: ReactNode }) { return <div className="container-custom pb-10">{children}</div>; }
export function BrandCard({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`card-premium ${className}`}>{children}</div>; }
export function BrandButton({ children, href, secondary=false }: { children: ReactNode; href?: string; secondary?: boolean }) {
  const cls = secondary ? 'btn-secondary' : 'btn-primary';
  return href ? <Link href={href} className={cls}>{children}</Link> : <button className={cls}>{children}</button>;
}
export function BrandBadge({ children }: { children: ReactNode }) { return <span className="rounded-full bg-primary/10 border border-primary/20 text-primary px-3 py-1 text-xs uppercase tracking-[0.2em]">{children}</span>; }
export function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) { return <div><p className="text-sm uppercase tracking-[0.25em] text-primary">{label}</p><h2 className="mt-2 text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{title}</h2>{subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}</div>; }
export function MetricCard({ label, value }: { label: string; value: string }) { return <BrandCard><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></BrandCard>; }
export function ReportBlock({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 p-4"><h3 className="text-lg font-semibold">{title}</h3><div className="mt-2 text-sm">{children}</div></section>; }
export function ScoreBadge({ label, score }: { label: string; score: number }) { return <div className="rounded-xl border border-white/10 bg-background/80 px-3 py-2 text-sm">{label}: <span className="text-primary font-semibold">{score}</span></div>; }
export function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-muted-foreground">{text}</div>; }
export function RiskWarning({ text }: { text: string }) { return <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{text}</div>; }
