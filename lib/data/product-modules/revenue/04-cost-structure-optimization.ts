import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 29: Cost Structure Optimization
 * Challenge 7: Reduced Consumer Spending & Demand
 */
export const costStructureOptimization: ProductModule = {
  id: "revenue-cost-structure",
  name: "Cost Structure Optimization",
  category: "revenue",
  description: "Variable cost conversion moving fixed costs to variable, demand-responsive pricing with dynamic pricing based on real-time demand, inventory optimization right-sizing to actual demand, and outsourcing strategic functions moving non-core to contractors.",
  shortDescription: "Cost structure optimization for better margins",
  pricing: {
    setup: "A$12,000-A$22,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-7 months payback",
    savings: "15-30% cost reduction through structure optimization",
  },
  implementation: {
    steps: [
      "Analyze current cost structure",
      "Identify fixed-to-variable conversion opportunities",
      "Configure demand-responsive pricing",
      "Optimize inventory levels",
      "Identify outsourcing opportunities",
      "Implement cost structure changes",
      "Monitor and optimize",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [7],
  relatedModules: [
    "revenue-dynamic-pricing",
    "cash-flow-expense-management",
    "efficiency-cost-visibility",
  ],
  features: [
    "Fixed-to-variable cost conversion",
    "Demand-responsive pricing",
    "Inventory optimization",
    "Outsourcing strategy",
    "Cost structure analytics",
  ],
  expectedOutcomes: [
    "15-30% cost reduction",
    "Better margin protection",
    "More flexible cost structure",
    "Improved profitability",
    "Better alignment with demand",
  ],
};

