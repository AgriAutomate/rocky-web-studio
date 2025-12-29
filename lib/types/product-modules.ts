/**
 * Product Module Types
 * 
 * TypeScript interfaces for product offering modules.
 * Each module represents a reusable, combinable product offering.
 */

import type { Sector } from "./questionnaire";

/**
 * Pricing structure for a product module
 */
export interface ProductModulePricing {
  setup: string; // e.g., "A$5,000-A$10,000"
  recurring?: string; // e.g., "A$200-A$500/month"
}

/**
 * ROI information for a product module
 */
export interface ProductModuleROI {
  timeline: string; // e.g., "5-8 months payback"
  savings?: string; // e.g., "A$15,000-A$30,000 annual"
  revenueIncrease?: string; // e.g., "15-25% annual revenue increase"
}

/**
 * Implementation details for a product module
 */
export interface ProductModuleImplementation {
  steps: string[]; // Implementation steps
  timeline: string; // e.g., "4-6 weeks"
  complexity?: "low" | "medium" | "high";
}

/**
 * Complete Product Module structure
 */
export interface ProductModule {
  id: string; // Unique identifier, e.g., "automation-workflow"
  name: string; // Display name, e.g., "Workflow Automation"
  category: string; // Category, e.g., "automation", "efficiency", "security"
  description: string; // Full description
  shortDescription: string; // One-line summary
  pricing: ProductModulePricing;
  roi: ProductModuleROI;
  implementation: ProductModuleImplementation;
  dependencies: string[]; // Other module IDs this depends on
  sectorCompatibility: Sector[]; // Sectors this applies to (empty array = all sectors)
  challengeIds: number[]; // Which challenges (1-10) this addresses
  relatedModules: string[]; // Other module IDs that work well together
  features?: string[]; // Key features/capabilities
  expectedOutcomes?: string[]; // What clients will achieve
}

/**
 * Product module category
 */
export type ProductModuleCategory =
  | "automation"
  | "efficiency"
  | "security"
  | "compliance"
  | "cash-flow"
  | "revenue"
  | "digital-transformation"
  | "market-expansion"
  | "connectivity"
  | "leadership"
  | "labour"
  | "customer";

/**
 * Module recommendation result
 */
export interface ModuleRecommendation {
  module: ProductModule;
  score: number; // 0-100, higher = better match
  reasons: string[]; // Why this module was recommended
}

/**
 * Module combination/package
 */
export interface ModulePackage {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  totalSetupCost: string;
  totalRecurringCost?: string;
  estimatedROI: ProductModuleROI;
  implementationTimeline: string;
}

