import Link from 'next/link';

const links = [
  ['Dashboard', '/'], ['New Artist', '/artists/new'], ['Upload CSV', '/upload'], ['Analytics', '/analytics'],
  ['Valuation', '/valuation'], ['Recommendation', '/recommendation'], ['Report', '/report'], ['Settings', '/settings']
];

export function Nav() {
  return <nav className="mb-6 flex flex-wrap gap-2">{links.map(([label, href]) => <Link key={href} href={href} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900">{label}</Link>)}</nav>;
}
