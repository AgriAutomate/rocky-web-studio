import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 27 (Part 2): Personalization
 * Challenge 7: Reduced Consumer Spending & Demand
 */
export const personalization: ProductModule = {
  id: "customer-personalization",
  name: "Customer Personalization",
  category: "customer",
  description: "Personalization engine tailoring offers, content, and experiences to individual customer purchase history, preferences, and behavior to increase engagement and sales.",
  shortDescription: "Personalized customer experiences and offers",
  pricing: {
    setup: "A$12,000-A$20,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-7 months payback",
    revenueIncrease: "10-20% increase in customer engagement and sales",
  },
  implementation: {
    steps: [
      "Gather customer data",
      "Build customer preference profiles",
      "Configure personalization engine",
      "Set up personalized offer systems",
      "Create personalized content",
      "Train marketing team",
      "Deploy and optimize",
    ],
    timeline: "5-8 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "hospitality", "professional-services"],
  challengeIds: [7],
  relatedModules: [
    "customer-retention-optimization",
    "customer-market-intelligence",
    "revenue-upsell-crosssell",
  ],
  features: [
    "Customer preference profiling",
    "Personalized offers",
    "Personalized content",
    "Behavior-based recommendations",
    "Personalization analytics",
  ],
  expectedOutcomes: [
    "10-20% increase in engagement",
    "Better customer experience",
    "Increased sales conversion",
    "Higher customer satisfaction",
    "Improved customer loyalty",
  ],
};

