/**
 * Product Module Utilities
 * 
 * Utility functions for working with product modules in proposals
 */

import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Extract pricing summary from modules
 */
export function extractModulePricingSummary(modules: ProductModule[]): {
  totalSetupRange: string;
  totalRecurringRange?: string;
  moduleCount: number;
} {
  if (modules.length === 0) {
    return {
      totalSetupRange: "A$0",
      moduleCount: 0,
    };
  }

  // Parse setup costs (format: "A$X,XXX-A$X,XXX" or "A$X,XXX")
  const setupCosts: number[] = [];
  const recurringCosts: number[] = [];

  modules.forEach(module => {
    // Parse setup cost
    const setupMatch = module.pricing.setup.match(/A\$\s*([\d,]+)(?:-A\$\s*([\d,]+))?/);
    if (setupMatch && setupMatch[1]) {
      const min = parseInt(setupMatch[1].replace(/,/g, ""), 10);
      const max = setupMatch[2] ? parseInt(setupMatch[2].replace(/,/g, ""), 10) : min;
      setupCosts.push(min, max);
    }

    // Parse recurring cost if present
    if (module.pricing.recurring) {
      const recurringMatch = module.pricing.recurring.match(/A\$\s*([\d,]+)(?:-A\$\s*([\d,]+))?/);
      if (recurringMatch && recurringMatch[1]) {
        const min = parseInt(recurringMatch[1].replace(/,/g, ""), 10);
        const max = recurringMatch[2] ? parseInt(recurringMatch[2].replace(/,/g, ""), 10) : min;
        recurringCosts.push(min, max);
      }
    }
  });

  // Calculate ranges
  const totalSetupMin = setupCosts.length > 0 ? Math.min(...setupCosts) : 0;
  const totalSetupMax = setupCosts.length > 0 ? Math.max(...setupCosts) : 0;
  const totalSetupRange = setupCosts.length > 0 
    ? `A$${totalSetupMin.toLocaleString()}${totalSetupMin !== totalSetupMax ? `-A$${totalSetupMax.toLocaleString()}` : ""}`
    : "A$0";

  const totalRecurringMin = recurringCosts.length > 0 ? Math.min(...recurringCosts) : 0;
  const totalRecurringMax = recurringCosts.length > 0 ? Math.max(...recurringCosts) : 0;
  const totalRecurringRange = recurringCosts.length > 0 && totalRecurringMin > 0
    ? `A$${totalRecurringMin.toLocaleString()}${totalRecurringMin !== totalRecurringMax ? `-A$${totalRecurringMax.toLocaleString()}` : ""}/month`
    : undefined;

  return {
    totalSetupRange,
    totalRecurringRange,
    moduleCount: modules.length,
  };
}

/**
 * Format module name for display
 */
export function formatModuleName(module: ProductModule): string {
  return module.name;
}

/**
 * Get module ROI summary
 */
export function getModuleRoiSummary(modules: ProductModule[]): string[] {
  const rois = modules
    .map(module => module.roi.timeline)
    .filter((timeline): timeline is string => Boolean(timeline));
  
  // Return unique ROI timelines
  return Array.from(new Set(rois));
}

