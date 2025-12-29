import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 33: Regional Supply Chain Networks
 * Challenge 8: Market Access & Logistics Barriers
 */
export const regionalSupplyChainNetworks: ProductModule = {
  id: "market-expansion-supply-chain",
  name: "Regional Supply Chain Networks",
  category: "market-expansion",
  description: "Local supplier connections developing relationships with local suppliers reducing lead time, co-distribution partnering with other local businesses to share freight costs, and inventory cooperative joining or creating shared inventory warehouse.",
  shortDescription: "Regional supply chain network development",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Reduced lead times and freight costs",
  },
  implementation: {
    steps: [
      "Identify local supplier opportunities",
      "Develop local supplier relationships",
      "Set up co-distribution partnerships",
      "Explore inventory cooperative options",
      "Configure shared systems",
      "Establish partnerships and agreements",
      "Deploy and optimize",
    ],
    timeline: "6-12 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: ["retail", "manufacturing", "agriculture"],
  challengeIds: [8],
  relatedModules: [
    "market-expansion-logistics",
  ],
  features: [
    "Local supplier connection system",
    "Co-distribution coordination",
    "Inventory cooperative management",
    "Regional network collaboration tools",
    "Shared logistics optimization",
  ],
  expectedOutcomes: [
    "Reduced lead times",
    "Lower freight costs",
    "Better local supplier relationships",
    "Improved regional collaboration",
    "More resilient supply chain",
  ],
};

