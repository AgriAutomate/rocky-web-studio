import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 7: Business Intelligence for Profitability
 * Challenge 2: Cash Flow Strain & Declining Profitability
 */
export const businessIntelligenceProfitability: ProductModule = {
  id: "cash-flow-business-intelligence",
  name: "Business Intelligence for Profitability",
  category: "cash-flow",
  description: "Advanced analytics for customer profitability analysis, product/service margin analysis, and seasonal forecasting to improve overall business profitability.",
  shortDescription: "Business intelligence for profitability improvement",
  pricing: {
    setup: "A$15,000-A$25,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "5-8 months payback",
    savings: "15-30% improvement in profitability through better insights",
  },
  implementation: {
    steps: [
      "Integrate financial and operational data",
      "Build profitability analysis models",
      "Create margin analysis dashboards",
      "Configure seasonal forecasting",
      "Set up automated reporting",
      "Train management team",
      "Deploy with regular reviews",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [2],
  relatedModules: [
    "revenue-customer-profitability",
    "leadership-business-intelligence",
    "efficiency-predictive-analytics",
  ],
  features: [
    "Customer profitability analysis",
    "Product/service margin analysis",
    "Seasonal forecasting",
    "Profitability trend analysis",
    "Actionable insights and recommendations",
  ],
  expectedOutcomes: [
    "Clear visibility into profit drivers",
    "15-30% profitability improvement",
    "Data-driven pricing decisions",
    "Better resource allocation",
    "Improved strategic planning",
  ],
};

