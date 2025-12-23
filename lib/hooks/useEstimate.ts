/**
 * React Hook for Feature Estimation
 * 
 * Provides a reactive way to calculate project estimates based on
 * sector and selected features. Automatically recalculates when inputs change.
 */

import { useState, useEffect } from "react";
import { estimateProject, type EstimateOutput } from "@/lib/utils/feature-estimator";
import type { FeatureKey } from "@/lib/config/feature-estimates";

/**
 * Hook to calculate project estimates
 * 
 * @param sector - Business sector (e.g., "hospitality", "retail")
 * @param featureKeys - Array of selected feature keys
 * @returns Estimate output with total cost, timeline, and breakdown
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const sector = "hospitality";
 *   const featureKeys: FeatureKey[] = ["onlineBooking", "seoSetup"];
 *   const estimate = useEstimate(sector, featureKeys);
 *   
 *   if (!estimate) return <div>Calculating...</div>;
 *   
 *   return (
 *     <div>
 *       <p>Total: {estimate.totalCost}</p>
 *       <p>Timeline: {estimate.totalWeeks} weeks</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEstimate(
  sector: string,
  featureKeys: FeatureKey[]
): EstimateOutput | null {
  const [estimate, setEstimate] = useState<EstimateOutput | null>(null);

  useEffect(() => {
    if (!sector || featureKeys.length === 0) {
      setEstimate(null);
      return;
    }

    const result = estimateProject({ sector, featureKeys });
    setEstimate(result);
  }, [sector, featureKeys]);

  return estimate;
}
