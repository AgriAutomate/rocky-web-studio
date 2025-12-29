import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 25: Workforce Planning & Capacity Modeling
 * Challenge 6: Labour Shortages & Rising Wage Costs
 */
export const workforcePlanningCapacity: ProductModule = {
  id: "labour-workforce-planning",
  name: "Workforce Planning & Capacity Modeling",
  category: "labour",
  description: "Demand forecasting predicting busy seasons, scenario planning for growth, and labour cost modeling understanding cost of hiring vs. automation vs. outsourcing.",
  shortDescription: "Workforce planning and capacity modeling",
  pricing: {
    setup: "A$12,000-A$20,000",
    recurring: "A$400-A$700/month",
  },
  roi: {
    timeline: "5-9 months payback",
    savings: "Optimized labour costs and better capacity planning",
  },
  implementation: {
    steps: [
      "Analyze historical demand patterns",
      "Build demand forecasting models",
      "Configure scenario planning tools",
      "Set up labour cost modeling",
      "Build capacity planning dashboards",
      "Train management team",
      "Deploy and establish planning cadence",
    ],
    timeline: "6-8 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [6],
  relatedModules: [
    "labour-automation-productivity",
    "efficiency-predictive-analytics",
    "leadership-business-intelligence",
  ],
  features: [
    "Demand forecasting",
    "Scenario planning for growth",
    "Labour cost modeling",
    "Capacity planning dashboards",
    "Hiring vs. automation vs. outsourcing analysis",
  ],
  expectedOutcomes: [
    "Better workforce planning",
    "Optimized labour costs",
    "Improved capacity management",
    "Data-driven hiring decisions",
    "Better resource allocation",
  ],
};

