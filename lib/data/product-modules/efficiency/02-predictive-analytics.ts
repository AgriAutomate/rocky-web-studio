import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 2 (Part 2): Predictive Analytics
 * Challenge 1: High Operating Costs & Inflation
 */
export const predictiveAnalytics: ProductModule = {
  id: "efficiency-predictive-analytics",
  name: "Predictive Analytics",
  category: "efficiency",
  description: "Advanced analytics and forecasting capabilities to predict future costs, demand, and operational needs. Helps businesses anticipate challenges and optimize resource allocation.",
  shortDescription: "Predictive analytics for cost and demand forecasting",
  pricing: {
    setup: "A$10,000-A$20,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "6-12 months payback",
    savings: "10-20% cost reduction through better planning",
  },
  implementation: {
    steps: [
      "Gather historical operational data",
      "Identify key forecasting metrics",
      "Configure predictive models",
      "Build forecasting dashboards",
      "Validate model accuracy",
      "Train users on interpreting forecasts",
      "Deploy and monitor",
    ],
    timeline: "5-8 weeks",
    complexity: "high",
  },
  dependencies: ["efficiency-cost-visibility"],
  sectorCompatibility: [], // All sectors
  challengeIds: [1],
  relatedModules: [
    "efficiency-cost-visibility",
    "cash-flow-forecasting",
    "leadership-business-intelligence",
  ],
  features: [
    "Demand forecasting",
    "Cost trend prediction",
    "Seasonal pattern analysis",
    "What-if scenario modeling",
    "Automated forecast updates",
  ],
  expectedOutcomes: [
    "Better resource planning and allocation",
    "Reduced inventory holding costs",
    "Improved cash flow management",
    "10-20% cost reduction through better planning",
    "Proactive problem identification",
  ],
};

