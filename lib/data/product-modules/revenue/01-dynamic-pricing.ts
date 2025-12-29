import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 3: Dynamic Pricing
 * Challenge 1: High Operating Costs & Inflation
 */
export const dynamicPricing: ProductModule = {
  id: "revenue-dynamic-pricing",
  name: "Dynamic Pricing",
  category: "revenue",
  description: "Automated pricing optimization based on demand, costs, competitor pricing, and market conditions. Enables businesses to maximize margins while remaining competitive.",
  shortDescription: "Dynamic pricing optimization for revenue maximization",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "4-8 months payback",
    revenueIncrease: "5-15% revenue increase through optimized pricing",
  },
  implementation: {
    steps: [
      "Analyze current pricing strategy",
      "Define pricing rules and parameters",
      "Integrate with POS/e-commerce systems",
      "Configure competitor monitoring",
      "Set up automated pricing updates",
      "Test pricing strategies",
      "Deploy with monitoring",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "hospitality", "professional-services"],
  challengeIds: [1],
  relatedModules: [
    "revenue-customer-profitability",
    "revenue-upsell-crosssell",
    "customer-market-intelligence",
  ],
  features: [
    "Rule-based pricing automation",
    "Competitor price monitoring",
    "Demand-based price adjustments",
    "Margin protection rules",
    "Pricing performance analytics",
  ],
  expectedOutcomes: [
    "Optimized pricing across product/service lines",
    "Improved profit margins",
    "5-15% revenue increase",
    "Better competitive positioning",
    "Automated pricing management",
  ],
};

