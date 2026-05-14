// Parses compact / formatted numbers from CSVs or user input.
// Accepts: "1,240,000", "2.7M", "600k", "1.2m", "950 K", "" → 0, undefined.
export function parseCompactNumber(input: unknown): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0;
  const raw = String(input).trim();
  if (!raw) return 0;

  // Strip thousands separators and whitespace; normalize unicode minus.
  const cleaned = raw.replace(/[\s,]/g, '').replace(/[−–—]/g, '-');
  if (!cleaned) return 0;

  // Match: optional sign, number, optional suffix k/m/b (case-insensitive).
  const match = cleaned.match(/^(-?\d*\.?\d+)\s*([kmb])?$/i);
  if (!match) {
    // Last resort: pull the first numeric token.
    const fallback = cleaned.match(/-?\d+\.?\d*/);
    return fallback ? Number(fallback[0]) || 0 : 0;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;

  const suffix = match[2]?.toLowerCase();
  const multiplier = suffix === 'k' ? 1_000 : suffix === 'm' ? 1_000_000 : suffix === 'b' ? 1_000_000_000 : 1;
  return value * multiplier;
}

// Formats numbers with compact suffixes for display in dense UIs.
export function formatCompactNumber(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return n.toFixed(0);
}
