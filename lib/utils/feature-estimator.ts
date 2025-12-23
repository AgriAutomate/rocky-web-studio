/**
 * Feature-to-Cost/Timeline Estimator
 * 
 * Pure function that calculates project estimates based on selected features
 * and sector. Uses config-driven pricing from feature-estimates.ts.
 */

import type { FeatureKey, FeatureEstimate } from "@/lib/config/feature-estimates";
import { featureConfig } from "@/lib/config/feature-estimates";

export interface EstimateInput {
  sector: string;
  featureKeys: FeatureKey[];
}

export interface FeatureBreakdown extends FeatureEstimate {
  appliedCost: number;
  appliedWeeks: number;
}

export interface EstimateOutput {
  totalCost: number;
  totalWeeks: number;
  breakdown: FeatureBreakdown[];
}

/**
 * Estimate project cost and timeline based on selected features and sector
 * 
 * @param input - Sector and array of feature keys
 * @returns Total cost, total weeks, and per-feature breakdown
 * 
 * @example
 * ```ts
 * const estimate = estimateProject({
 *   sector: "hospitality",
 *   featureKeys: ["onlineBooking", "seoSetup", "performanceTuning"]
 * });
 * // Returns: { totalCost: 6500, totalWeeks: 8, breakdown: [...] }
 * ```
 */
export function estimateProject(input: EstimateInput): EstimateOutput {
  const { sector, featureKeys } = input;
  
  const breakdown: FeatureBreakdown[] = [];
  let totalCost = 0;
  let totalWeeks = 0;

  featureKeys.forEach((key) => {
    const feature = featureConfig[key];
    
    if (!feature) {
      console.warn(`Unknown feature key: ${key}`);
      return;
    }

    // Apply sector override if available
    const sectorOverride = feature.sectorOverrides?.[sector];
    const appliedCost = sectorOverride?.baseCost ?? feature.baseCost;
    const appliedWeeks = sectorOverride?.baseWeeks ?? feature.baseWeeks;

    breakdown.push({
      ...feature,
      appliedCost,
      appliedWeeks,
    });

    totalCost += appliedCost;
    totalWeeks += appliedWeeks;
  });

  return {
    totalCost,
    totalWeeks,
    breakdown,
  };
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cost);
}

/**
 * Format weeks as human-readable timeline
 */
export function formatTimeline(weeks: number): string {
  if (weeks === 0) {
    return "No timeline";
  }
  
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
  
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  
  if (remainingWeeks === 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  
  return `${months} month${months !== 1 ? "s" : ""} ${remainingWeeks} week${remainingWeeks !== 1 ? "s" : ""}`;
}
