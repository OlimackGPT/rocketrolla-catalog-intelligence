import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata = { title: 'RocketRolla Catalog Intelligence', description: 'Infrastructure for independent artists' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen"><main className="mx-auto max-w-6xl p-6"><h1 className="mb-2 text-3xl font-semibold">RocketRolla Catalog Intelligence Engine</h1><p className="mb-6 text-slate-400">Infrastructure for independent artists</p><Nav />{children}</main></body></html>
  );
}
