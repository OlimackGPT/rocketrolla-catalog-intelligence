import Link from 'next/link';

const links = [
  ['Dashboard', '/'], ['Create Artist', '/artists/new'], ['Upload CSV', '/upload'], ['Analytics', '/analytics'],
  ['Valuation', '/valuation'], ['Partner Fit', '/recommendation'], ['Client Report', '/report'], ['Settings', '/settings']
];

export function Nav() {
  return (
    <nav className="sticky top-3 z-20 mb-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-xl border border-slate-700/80 px-3 py-2 text-sm text-slate-200 transition hover:border-blue-400 hover:bg-blue-500/10">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
