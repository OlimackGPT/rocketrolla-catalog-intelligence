'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

const links: { label: string; href: Route; icon: string }[] = [
  { label: 'Dashboard', href: '/', icon: '⬡' },
  { label: 'Artists', href: '/artists', icon: '◇' },
  { label: 'Upload CSV', href: '/upload', icon: '↑' },
  { label: 'Analytics', href: '/analytics', icon: '◈' },
  { label: 'Valuation', href: '/valuation', icon: '$' },
  { label: 'Readiness', href: '/readiness', icon: '◐' },
  { label: 'Partner Fit', href: '/recommendation', icon: '◎' },
  { label: 'Report', href: '/report', icon: '▤' },
  { label: 'Artist Tools', href: '/artist-tools', icon: '✦' },
  { label: 'Settings', href: '/settings', icon: '⚙' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-sm">
      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              'group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200',
              active
                ? 'bg-purple-500/15 text-purple-200 shadow-[0_0_14px_rgba(167,139,250,0.18)]'
                : 'text-white/40 hover:bg-white/[0.05] hover:text-white/80',
            ].join(' ')}
          >
            <span
              className={[
                'text-[10px] transition-all duration-200',
                active ? 'text-purple-300' : 'text-white/25 group-hover:text-white/50',
              ].join(' ')}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
