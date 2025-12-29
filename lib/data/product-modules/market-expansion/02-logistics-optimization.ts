import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 32: Logistics Optimization
 * Challenge 8: Market Access & Logistics Barriers
 */
export const logisticsOptimization: ProductModule = {
  id: "market-expansion-logistics",
  name: "Logistics Optimization",
  category: "market-expansion",
  description: "Supplier integration automating ordering for just-in-time inventory, freight optimization consolidating shipments and negotiating volume discounts, demand forecasting predicting inventory needs accurately, and dropshipping integration partnering with suppliers to eliminate inventory carrying costs.",
  shortDescription: "Logistics optimization for cost reduction",
  pricing: {
    setup: "A$15,000-A$25,000",
    recurring: "A$600-A$1,200/month",
  },
  roi: {
    timeline: "4-7 months payback",
    savings: "20-30% logistics cost reduction",
  },
  implementation: {
    steps: [
      "Assess current logistics processes",
      "Integrate with supplier systems",
      "Configure just-in-time ordering",
      "Set up freight optimization",
      "Build demand forecasting models",
      "Set up dropshipping partnerships",
      "Deploy and monitor",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "manufacturing", "agriculture"],
  challengeIds: [8],
  relatedModules: [
    "market-expansion-digital",
    "cash-flow-expense-management",
    "efficiency-predictive-analytics",
  ],
  features: [
    "Supplier integration and automation",
    "Just-in-time inventory ordering",
    "Freight optimization",
    "Demand forecasting",
    "Dropshipping integration",
  ],
  expectedOutcomes: [
    "20-30% logistics cost reduction",
    "Reduced inventory carrying costs",
    "Faster order fulfillment",
    "Better supplier relationships",
    "Improved logistics efficiency",
  ],
};

