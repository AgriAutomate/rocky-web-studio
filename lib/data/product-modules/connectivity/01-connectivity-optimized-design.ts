import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 35: Connectivity-Optimized System Design
 * Challenge 9: Digital Connectivity Limitations
 */
export const connectivityOptimizedDesign: ProductModule = {
  id: "connectivity-optimized-design",
  name: "Connectivity-Optimized System Design",
  category: "connectivity",
  description: "Offline-first design with applications working offline and syncing when connected, data compression minimizing data usage for satellite internet users, low-bandwidth alternatives providing SMS/phone alternatives to cloud systems, and local caching storing frequently-accessed data locally.",
  shortDescription: "Offline-first system design for poor connectivity",
  pricing: {
    setup: "A$15,000-A$25,000",
    recurring: "A$800-A$1,200/month",
  },
  roi: {
    timeline: "Enables digital transformation otherwise impossible",
    savings: "Future-proofs for improved connectivity",
  },
  implementation: {
    steps: [
      "Assess connectivity constraints",
      "Design offline-first architecture",
      "Implement data compression",
      "Configure low-bandwidth alternatives",
      "Set up local caching",
      "Test in low-connectivity environments",
      "Deploy and optimize",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors, especially agriculture, mining
  challengeIds: [9],
  relatedModules: [
    "connectivity-redundancy",
    "connectivity-infrastructure",
  ],
  features: [
    "Offline-first application design",
    "Data compression",
    "Low-bandwidth alternatives (SMS/phone)",
    "Local caching",
    "Sync when connected",
  ],
  expectedOutcomes: [
    "Works in poor connectivity areas",
    "Enables digital transformation",
    "Future-proofs for better connectivity",
    "Reduced data usage costs",
    "Improved system reliability",
  ],
};

