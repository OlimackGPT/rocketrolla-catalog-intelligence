import Link from 'next/link';

export function DemoDataBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      Demo data
      <Link href="/upload" className="ml-1 text-amber-200/90 hover:text-amber-100">
        Upload a CSV →
      </Link>
    </div>
  );
}
