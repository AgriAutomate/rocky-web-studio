import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 28: Digital Channel Expansion
 * Challenge 7: Reduced Consumer Spending & Demand
 */
export const digitalChannelExpansion: ProductModule = {
  id: "customer-digital-channels",
  name: "Digital Channel Expansion",
  category: "customer",
  description: "Online sales channel moving revenue online where acquisition is cheaper, e-commerce enablement for retail with delivery/pickup options, digital services for professional services offering online consultations, and social selling with automated social media systems.",
  shortDescription: "Digital channel expansion for online sales and services",
  pricing: {
    setup: "A$18,000-A$30,000",
    recurring: "A$800-A$1,500/month",
  },
  roi: {
    timeline: "5-8 months payback",
    revenueIncrease: "20-40% revenue increase from new digital channels",
  },
  implementation: {
    steps: [
      "Assess digital channel opportunities",
      "Build e-commerce platform (if retail)",
      "Set up online consultation system (if services)",
      "Configure social selling automation",
      "Integrate with existing systems",
      "Train staff on new channels",
      "Launch and optimize",
    ],
    timeline: "8-12 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "hospitality", "professional-services"],
  challengeIds: [7],
  relatedModules: [
    "market-expansion-ecommerce",
    "customer-retention-optimization",
  ],
  features: [
    "E-commerce platform",
    "Online consultation system",
    "Social selling automation",
    "Multi-channel integration",
    "Digital channel analytics",
  ],
  expectedOutcomes: [
    "New revenue from digital channels",
    "20-40% revenue increase",
    "Lower customer acquisition costs",
    "Expanded customer reach",
    "Better customer convenience",
  ],
};

