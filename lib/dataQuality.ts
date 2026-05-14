import { RevenueMetrics } from './types';
import { buildValuation } from './valuation';

export type DataWarningSeverity = 'info' | 'warn' | 'error';

export type DataWarning = {
  severity: DataWarningSeverity;
  title: string;
  detail: string;
};

export function checkDataQuality(input: {
  metrics: RevenueMetrics;
  valuation: ReturnType<typeof buildValuation>;
  hasUserData: boolean;
}): DataWarning[] {
  const warnings: DataWarning[] = [];
  const { metrics, valuation, hasUserData } = input;
  const stats = metrics.rowStats;

  if (!hasUserData) {
    warnings.push({
      severity: 'info',
      title: 'Showing demo data',
      detail: 'Upload a CSV from the Upload page to generate a real analysis for a specific artist.',
    });
  }

  if (stats.totalRows === 0) {
    warnings.push({
      severity: 'error',
      title: 'No revenue rows detected',
      detail: 'The CSV parsed without errors but contained zero rows. Re-export and try again.',
    });
    return warnings;
  }

  if (stats.rowsWithMissingRevenue > 0 && stats.rowsWithMissingRevenue / stats.totalRows > 0.1) {
    warnings.push({
      severity: 'warn',
      title: `${stats.rowsWithMissingRevenue} rows are missing revenue`,
      detail: 'A meaningful share of rows have zero or invalid revenue. Run rate and valuation may be understated.',
    });
  }

  if (stats.rowsWithMissingDate > 0) {
    warnings.push({
      severity: 'warn',
      title: `${stats.rowsWithMissingDate} rows have unclear dates`,
      detail: 'Date / month parsing failed on some rows. Monthly trend may be inaccurate.',
    });
  }

  if (metrics.monthlyRevenue.length < 4) {
    warnings.push({
      severity: 'warn',
      title: 'Fewer than 4 months of data',
      detail: 'Run rate and growth signals get more reliable with 6+ months of history. Treat outputs as directional.',
    });
  }

  const top = metrics.revenueByTrack[0]?.revenue ?? 0;
  if (metrics.totalRevenue > 0 && top / metrics.totalRevenue > 0.55) {
    warnings.push({
      severity: 'warn',
      title: 'One track dominates the revenue',
      detail: `"${metrics.revenueByTrack[0]?.track ?? 'top track'}" is ${Math.round(
        (top / metrics.totalRevenue) * 100,
      )}% of revenue. Buyers will discount aggressively or carve it out.`,
    });
  }

  const topPlatform = metrics.revenueByPlatform[0];
  if (topPlatform && metrics.totalRevenue > 0 && topPlatform.revenue / metrics.totalRevenue > 0.75) {
    warnings.push({
      severity: 'warn',
      title: `Platform concentration: ${topPlatform.platform}`,
      detail: `${Math.round((topPlatform.revenue / metrics.totalRevenue) * 100)}% of revenue comes from one DSP. That is single-platform exposure risk.`,
    });
  }

  const topCountry = metrics.revenueByCountry[0];
  if (topCountry && metrics.totalRevenue > 0 && topCountry.revenue / metrics.totalRevenue > 0.7) {
    warnings.push({
      severity: 'info',
      title: `Territory concentration: ${topCountry.country}`,
      detail: `${Math.round((topCountry.revenue / metrics.totalRevenue) * 100)}% of revenue from one country. Not a dealbreaker, but partners will ask.`,
    });
  }

  if (stats.rowsWithMissingIsrc / Math.max(1, stats.totalRows) > 0.2) {
    warnings.push({
      severity: 'warn',
      title: 'ISRC missing on many rows',
      detail: 'Without ISRC, downstream rights enforcement and publishing collection get harder. Fix before partner outreach.',
    });
  }

  if (valuation.confidence < 55) {
    warnings.push({
      severity: 'info',
      title: 'Valuation confidence is low',
      detail: 'Treat the valuation range as a starting point. More history or cleaner metadata will tighten the band.',
    });
  }

  if (!metrics.hasAttention) {
    warnings.push({
      severity: 'info',
      title: 'No attention columns detected',
      detail:
        'Add optional columns (TikTok views, TikTok videos, Reels uses, YouTube views, Shazam, playlist adds) to unlock attention-adjusted valuation and track-level deal contribution.',
    });
  }

  return warnings;
}
