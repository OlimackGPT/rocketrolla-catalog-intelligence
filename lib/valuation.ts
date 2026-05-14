import { RevenueMetrics } from './types';

export function scoreCatalog(metrics: RevenueMetrics) {
  const growth = metrics.last6Months > 0 ? metrics.last3Months / (metrics.last6Months / 2) : 1;
  const concentration = metrics.revenueByTrack[0]?.revenue ? metrics.revenueByTrack[0].revenue / Math.max(metrics.totalRevenue, 1) : 0;
  const health = Math.max(0, Math.min(100, 65 + (growth - 1) * 20 - concentration * 30));
  const momentum = Math.max(0, Math.min(100, 55 + (growth - 1) * 35));
  const rightsRisk = Math.max(0, Math.min(100, 35 + concentration * 50));
  const syncPotential = Math.max(0, Math.min(100, 50 + (1 - concentration) * 20));
  const partnerFit = Math.round((health + momentum + syncPotential - rightsRisk * 0.5) / 2.5);

  return { health: Math.round(health), momentum: Math.round(momentum), rightsRisk: Math.round(rightsRisk), syncPotential: Math.round(syncPotential), partnerFit: Math.max(0, Math.min(100, partnerFit)) };
}

export function buildValuation(metrics: RevenueMetrics) {
  // Conservative/Base/Aggressive multipliers are intentionally explicit for future tuning.
  const conservative = metrics.projectedNtm * 3;
  // Base scenario assumes stable collection performance.
  const base = metrics.projectedNtm * 5;
  // Aggressive scenario rewards accelerating catalogs.
  const aggressive = metrics.projectedNtm * 8;

  const scores = scoreCatalog(metrics);
  const confidence = Math.max(30, Math.min(95, 70 + (scores.momentum - scores.rightsRisk) * 0.3));
  return { conservative, base, aggressive, confidence: Math.round(confidence), scores };
}
