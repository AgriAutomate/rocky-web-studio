import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 3 (Part 2): Customer Profitability Analysis
 * Challenge 1: High Operating Costs & Inflation, Challenge 2: Cash Flow Strain
 */
export const customerProfitabilityAnalysis: ProductModule = {
  id: "revenue-customer-profitability",
  name: "Customer Profitability Analysis",
  category: "revenue",
  description: "Identify which customers are profitable and which are not by analyzing revenue, costs, and service time. Enables strategic customer management and pricing decisions.",
  shortDescription: "Customer profitability analysis for strategic customer management",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$250-A$500/month",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "15-25% improvement in customer portfolio profitability",
  },
  implementation: {
    steps: [
      "Integrate customer and financial data",
      "Define profitability metrics",
      "Calculate customer-level costs",
      "Build profitability dashboards",
      "Identify high/low value customer segments",
      "Train sales team on insights",
      "Deploy with regular reporting",
    ],
    timeline: "5-7 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [1, 2],
  relatedModules: [
    "revenue-dynamic-pricing",
    "cash-flow-collection-acceleration",
    "customer-retention-optimization",
  ],
  features: [
    "Customer-level profit calculation",
    "Segment profitability analysis",
    "Trend analysis over time",
    "Customer lifetime value estimation",
    "Actionable insights dashboard",
  ],
  expectedOutcomes: [
    "Clear visibility into customer profitability",
    "Data-driven customer acquisition strategy",
    "Optimized pricing for unprofitable segments",
    "15-25% improvement in portfolio profitability",
    "Better resource allocation to high-value customers",
  ],
};

