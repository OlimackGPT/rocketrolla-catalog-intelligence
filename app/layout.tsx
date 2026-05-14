import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata = { title: 'RocketRolla Catalog Intelligence', description: 'Infrastructure for independent artists' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <header className="mb-6">
            <p className="label">RocketRolla</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Catalog Intelligence Engine</h1>
            <p className="mt-2 text-slate-400">Infrastructure for independent artists</p>
          </header>
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
}
