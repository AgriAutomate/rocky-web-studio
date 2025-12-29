import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 26: Market Intelligence & Customer Understanding
 * Challenge 7: Reduced Consumer Spending & Demand
 */
export const marketIntelligenceCustomerUnderstanding: ProductModule = {
  id: "customer-market-intelligence",
  name: "Market Intelligence & Customer Understanding",
  category: "customer",
  description: "Customer segmentation identifying which segments are buying vs. not spending, propensity modeling predicting who's likely to buy next, competitor monitoring tracking pricing and positioning, and market research surveying customers to understand what they want.",
  shortDescription: "Market intelligence and customer segmentation",
  pricing: {
    setup: "A$12,000-A$20,000",
    recurring: "A$400-A$700/month",
  },
  roi: {
    timeline: "4-8 months payback",
    revenueIncrease: "10-20% revenue increase through better targeting",
  },
  implementation: {
    steps: [
      "Gather customer data",
      "Perform customer segmentation analysis",
      "Build propensity models",
      "Set up competitor monitoring",
      "Configure customer surveys",
      "Build intelligence dashboards",
      "Train sales/marketing team and deploy",
    ],
    timeline: "6-9 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [7],
  relatedModules: [
    "customer-retention-optimization",
    "revenue-customer-profitability",
    "customer-personalization",
  ],
  features: [
    "Customer segmentation",
    "Propensity modeling",
    "Competitor monitoring",
    "Market research surveys",
    "Intelligence dashboards",
  ],
  expectedOutcomes: [
    "Better understanding of customers",
    "Improved targeting and messaging",
    "10-20% revenue increase",
    "Competitive intelligence",
    "Data-driven marketing decisions",
  ],
};

