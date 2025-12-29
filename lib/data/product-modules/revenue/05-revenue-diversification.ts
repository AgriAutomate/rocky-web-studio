import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 30: Revenue Diversification
 * Challenge 7: Reduced Consumer Spending & Demand
 */
export const revenueDiversification: ProductModule = {
  id: "revenue-diversification",
  name: "Revenue Diversification",
  category: "revenue",
  description: "Complementary product/service lines adding new offerings, B2B channels shifting to business customers, and subscription/recurring revenue moving from transactional to recurring models to reduce revenue volatility.",
  shortDescription: "Revenue diversification strategies",
  pricing: {
    setup: "A$15,000-A$28,000",
    recurring: "A$500-A$1,000/month",
  },
  roi: {
    timeline: "6-12 months payback",
    revenueIncrease: "20-40% revenue increase through diversification",
  },
  implementation: {
    steps: [
      "Assess diversification opportunities",
      "Identify complementary products/services",
      "Plan B2B channel development",
      "Design subscription/recurring models",
      "Develop new offerings",
      "Launch and market new revenue streams",
      "Monitor and optimize",
    ],
    timeline: "8-14 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [7],
  relatedModules: [
    "customer-digital-channels",
    "market-expansion-ecommerce",
    "revenue-upsell-crosssell",
  ],
  features: [
    "Complementary product/service development",
    "B2B channel enablement",
    "Subscription/recurring revenue systems",
    "Revenue diversification analytics",
    "Multi-revenue stream management",
  ],
  expectedOutcomes: [
    "Reduced revenue volatility",
    "20-40% revenue increase",
    "New revenue streams",
    "Better business resilience",
    "Improved long-term stability",
  ],
};

