import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 3 (Part 3): Upsell & Cross-Sell Automation
 * Challenge 1: High Operating Costs & Inflation
 */
export const upsellCrosssellAutomation: ProductModule = {
  id: "revenue-upsell-crosssell",
  name: "Upsell & Cross-Sell Automation",
  category: "revenue",
  description: "Automated systems to identify and execute upsell and cross-sell opportunities with existing customers. Increases average transaction value and customer lifetime value.",
  shortDescription: "Automated upsell and cross-sell optimization",
  pricing: {
    setup: "A$12,000-A$20,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "4-7 months payback",
    revenueIncrease: "10-20% increase in average transaction value",
  },
  implementation: {
    steps: [
      "Analyze customer purchase patterns",
      "Identify upsell/cross-sell opportunities",
      "Configure recommendation engine",
      "Integrate with sales/CRM systems",
      "Set up automated triggers",
      "Train sales team",
      "Deploy and measure performance",
    ],
    timeline: "5-7 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "hospitality", "professional-services"],
  challengeIds: [1],
  relatedModules: [
    "revenue-customer-profitability",
    "customer-retention-optimization",
    "customer-personalization",
  ],
  features: [
    "Intelligent product/service recommendations",
    "Automated email/SMS campaigns",
    "Point-of-sale prompts",
    "Customer segmentation for targeting",
    "Performance tracking and optimization",
  ],
  expectedOutcomes: [
    "Increased average transaction value",
    "10-20% revenue growth from existing customers",
    "Improved customer lifetime value",
    "Automated revenue optimization",
    "Better customer engagement",
  ],
};

