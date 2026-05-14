// Thin wrappers around localStorage that gracefully handle quota errors and SSR.
// Used for the catalog summary persistence to prevent QuotaExceededError on
// large CSVs (the previous design stored raw parsed rows under `rr_rows`).

export type SafeStorageResult = { ok: true } | { ok: false; reason: 'quota' | 'ssr' | 'unknown'; error?: unknown };

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number };
  if (e.name === 'QuotaExceededError') return true;
  if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') return true; // Firefox legacy
  if (e.code === 22 || e.code === 1014) return true; // Safari / Firefox numeric codes
  return false;
}

export function safeSetItem(key: string, value: string): SafeStorageResult {
  if (typeof window === 'undefined') return { ok: false, reason: 'ssr' };
  try {
    window.localStorage.setItem(key, value);
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) return { ok: false, reason: 'quota', error: err };
    return { ok: false, reason: 'unknown', error: err };
  }
}

export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}
