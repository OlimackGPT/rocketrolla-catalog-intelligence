import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'RocketRolla Catalog Intelligence Engine',
  description: 'Infrastructure for independent artists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#070418] text-white antialiased"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 0% 60%, rgba(16,185,129,0.05) 0%, transparent 55%)
          `,
        }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-500/40">
                <span className="text-xs font-black tracking-tighter text-purple-300">RR</span>
              </div>
              <div>
                <span className="text-[11px] font-black tracking-[0.25em] uppercase text-white/90">
                  RocketRolla
                </span>
                <span className="ml-2 text-[10px] tracking-[0.2em] uppercase text-white/30">
                  Catalog Intelligence
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase text-purple-300">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                Internal OS
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6">
            <Nav />
          </div>
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-24 border-t border-white/[0.04] py-6">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[10px] tracking-widest uppercase text-white/20">
              RocketRolla · Infrastructure for independent artists · Internal use only · Not for distribution
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
