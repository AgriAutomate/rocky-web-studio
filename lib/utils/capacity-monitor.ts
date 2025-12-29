/**
 * Capacity Monitor
 * 
 * Monitors current capacity utilization across all services and provides
 * alerts when approaching thresholds. Integrates with usage tracking utilities.
 */

import { getTodayUsageStats, type PerplexityUsageStats } from "./perplexity-usage-tracker";
import { getCapacityStatus } from "./capacity-calculator";

export interface ServiceCapacity {
  service: string;
  resource: string;
  limit: number;
  currentUsage: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "critical" | "over-capacity";
  alertLevel: "none" | "info" | "warning" | "critical" | "emergency";
}

export interface CapacityReport {
  timestamp: string;
  overallStatus: "healthy" | "warning" | "critical" | "over-capacity";
  services: ServiceCapacity[];
  criticalAlerts: string[];
  recommendations: string[];
}

/**
 * Vercel capacity limits (from verified subscriptions)
 */
const VERCEL_LIMITS = {
  bandwidth: { limit: 100, current: 23.07, unit: "GB" },
  fastOriginTransfer: { limit: 100, current: 11.08, unit: "hours" },
};

/**
 * Supabase capacity limits (from verified subscriptions)
 */
const SUPABASE_LIMITS = {
  databaseSize: { limit: 500, current: 54.97, unit: "MB" },
  bandwidth: { limit: 5, current: 0.10453, unit: "GB" },
  storage: { limit: 1, current: 0.00104, unit: "GB" },
  mau: { limit: 50000, current: 1, unit: "users" },
};

/**
 * Get Vercel capacity status
 */
export function getVercelCapacity(): ServiceCapacity[] {
  const services: ServiceCapacity[] = [];

  // Bandwidth
  const bandwidthUtil = (VERCEL_LIMITS.bandwidth.current / VERCEL_LIMITS.bandwidth.limit) * 100;
  const bandwidthStatus = getCapacityStatus(bandwidthUtil);
  
  services.push({
    service: "Vercel",
    resource: "Bandwidth",
    limit: VERCEL_LIMITS.bandwidth.limit,
    currentUsage: VERCEL_LIMITS.bandwidth.current,
    utilizationPercent: bandwidthUtil,
    status: bandwidthStatus.status,
    alertLevel: getAlertLevel(bandwidthUtil),
  });

  // Fast Origin Transfer
  const fotUtil = (VERCEL_LIMITS.fastOriginTransfer.current / VERCEL_LIMITS.fastOriginTransfer.limit) * 100;
  const fotStatus = getCapacityStatus(fotUtil);
  
  services.push({
    service: "Vercel",
    resource: "Fast Origin Transfer",
    limit: VERCEL_LIMITS.fastOriginTransfer.limit,
    currentUsage: VERCEL_LIMITS.fastOriginTransfer.current,
    utilizationPercent: fotUtil,
    status: fotStatus.status,
    alertLevel: getAlertLevel(fotUtil),
  });

  return services;
}

/**
 * Get Supabase capacity status
 */
export function getSupabaseCapacity(): ServiceCapacity[] {
  const services: ServiceCapacity[] = [];

  // Database Size
  const dbUtil = (SUPABASE_LIMITS.databaseSize.current / SUPABASE_LIMITS.databaseSize.limit) * 100;
  const dbStatus = getCapacityStatus(dbUtil);
  
  services.push({
    service: "Supabase",
    resource: "Database Size",
    limit: SUPABASE_LIMITS.databaseSize.limit,
    currentUsage: SUPABASE_LIMITS.databaseSize.current,
    utilizationPercent: dbUtil,
    status: dbStatus.status,
    alertLevel: getAlertLevel(dbUtil),
  });

  // Bandwidth
  const bandwidthUtil = (SUPABASE_LIMITS.bandwidth.current / SUPABASE_LIMITS.bandwidth.limit) * 100;
  const bandwidthStatus = getCapacityStatus(bandwidthUtil);
  
  services.push({
    service: "Supabase",
    resource: "Bandwidth",
    limit: SUPABASE_LIMITS.bandwidth.limit,
    currentUsage: SUPABASE_LIMITS.bandwidth.current,
    utilizationPercent: bandwidthUtil,
    status: bandwidthStatus.status,
    alertLevel: getAlertLevel(bandwidthUtil),
  });

  // Storage
  const storageUtil = (SUPABASE_LIMITS.storage.current / SUPABASE_LIMITS.storage.limit) * 100;
  const storageStatus = getCapacityStatus(storageUtil);
  
  services.push({
    service: "Supabase",
    resource: "Storage",
    limit: SUPABASE_LIMITS.storage.limit,
    currentUsage: SUPABASE_LIMITS.storage.current,
    utilizationPercent: storageUtil,
    status: storageStatus.status,
    alertLevel: getAlertLevel(storageUtil),
  });

  // Monthly Active Users
  const mauUtil = (SUPABASE_LIMITS.mau.current / SUPABASE_LIMITS.mau.limit) * 100;
  const mauStatus = getCapacityStatus(mauUtil);
  
  services.push({
    service: "Supabase",
    resource: "Monthly Active Users",
    limit: SUPABASE_LIMITS.mau.limit,
    currentUsage: SUPABASE_LIMITS.mau.current,
    utilizationPercent: mauUtil,
    status: mauStatus.status,
    alertLevel: getAlertLevel(mauUtil),
  });

  return services;
}

/**
 * Get Perplexity capacity status
 */
export async function getPerplexityCapacity(): Promise<ServiceCapacity> {
  const stats = await getTodayUsageStats();
  
  const status: ServiceCapacity["status"] = 
    stats.status === "exceeded" ? "over-capacity" :
    stats.status === "emergency" ? "critical" :
    stats.status === "safe" ? "safe" :
    stats.status === "warning" ? "warning" :
    "critical";

  return {
    service: "Perplexity PRO",
    resource: "Daily Searches",
    limit: 300,
    currentUsage: stats.totalSearches,
    utilizationPercent: stats.utilizationPercent,
    status,
    alertLevel: getPerplexityAlertLevel(stats),
  };
}

/**
 * Get alert level from utilization percentage
 */
function getAlertLevel(utilizationPercent: number): ServiceCapacity["alertLevel"] {
  if (utilizationPercent >= 90) return "emergency";
  if (utilizationPercent >= 75) return "critical";
  if (utilizationPercent >= 50) return "warning";
  if (utilizationPercent >= 25) return "info";
  return "none";
}

/**
 * Get Perplexity-specific alert level
 */
function getPerplexityAlertLevel(stats: PerplexityUsageStats): ServiceCapacity["alertLevel"] {
  if (stats.status === "exceeded") return "emergency";
  if (stats.status === "emergency") return "emergency";
  if (stats.status === "critical") return "critical";
  if (stats.status === "warning") return "warning";
  return "info";
}

/**
 * Generate comprehensive capacity report
 */
export async function generateCapacityReport(): Promise<CapacityReport> {
  const services: ServiceCapacity[] = [];
  const criticalAlerts: string[] = [];
  const recommendations: string[] = [];

  // Get all service capacities
  services.push(...getVercelCapacity());
  services.push(...getSupabaseCapacity());
  services.push(await getPerplexityCapacity());

  // Determine overall status
  const hasOverCapacity = services.some((s) => s.status === "over-capacity");
  const hasCritical = services.some((s) => s.status === "critical");
  const hasWarning = services.some((s) => s.status === "warning");

  let overallStatus: CapacityReport["overallStatus"] = "healthy";
  if (hasOverCapacity) {
    overallStatus = "over-capacity";
  } else if (hasCritical) {
    overallStatus = "critical";
  } else if (hasWarning) {
    overallStatus = "warning";
  }

  // Collect critical alerts
  for (const service of services) {
    if (service.alertLevel === "emergency" || service.alertLevel === "critical") {
      criticalAlerts.push(
        `${service.service} ${service.resource}: ${service.utilizationPercent.toFixed(1)}% utilized (${service.currentUsage}/${service.limit})`
      );
    }
  }

  // Generate recommendations
  for (const service of services) {
    if (service.status === "critical" || service.status === "over-capacity") {
      if (service.service === "Perplexity PRO") {
        recommendations.push(
          "Perplexity: Implement caching, optimize prompts, or consider upgrade. Current usage: " +
            `${service.currentUsage}/${service.limit} searches/day`
        );
      } else if (service.service === "Vercel" && service.resource === "Bandwidth") {
        recommendations.push(
          "Vercel: Consider upgrading to Pro plan ($20/month) when bandwidth exceeds 80 GB/month"
        );
      } else if (service.service === "Supabase" && service.resource === "Database Size") {
        recommendations.push(
          "Supabase: Consider upgrading to Pro plan ($25/month) when database exceeds 400 MB"
        );
      }
    } else if (service.status === "warning") {
      recommendations.push(
        `${service.service} ${service.resource}: Monitor closely - ${service.utilizationPercent.toFixed(1)}% utilized`
      );
    }
  }

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    services,
    criticalAlerts,
    recommendations,
  };
}

/**
 * Update Vercel usage (call this when you have updated usage data)
 */
export function updateVercelUsage(
  bandwidth?: number,
  fastOriginTransfer?: number
): void {
  if (bandwidth !== undefined) {
    VERCEL_LIMITS.bandwidth.current = bandwidth;
  }
  if (fastOriginTransfer !== undefined) {
    VERCEL_LIMITS.fastOriginTransfer.current = fastOriginTransfer;
  }
}

/**
 * Update Supabase usage (call this when you have updated usage data)
 */
export function updateSupabaseUsage(
  databaseSize?: number,
  bandwidth?: number,
  storage?: number,
  mau?: number
): void {
  if (databaseSize !== undefined) {
    SUPABASE_LIMITS.databaseSize.current = databaseSize;
  }
  if (bandwidth !== undefined) {
    SUPABASE_LIMITS.bandwidth.current = bandwidth;
  }
  if (storage !== undefined) {
    SUPABASE_LIMITS.storage.current = storage;
  }
  if (mau !== undefined) {
    SUPABASE_LIMITS.mau.current = mau;
  }
}

/**
 * Check if any service needs immediate attention
 */
export async function needsImmediateAttention(): Promise<{
  needsAttention: boolean;
  alerts: string[];
}> {
  const report = await generateCapacityReport();
  
  return {
    needsAttention: report.overallStatus === "critical" || report.overallStatus === "over-capacity",
    alerts: report.criticalAlerts,
  };
}

