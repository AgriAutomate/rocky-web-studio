import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 16: Vendor Management & Integration
 * Challenge 4: Digital Transformation Difficulties
 */
export const vendorManagementIntegration: ProductModule = {
  id: "digital-transformation-vendor-management",
  name: "Vendor Management & Integration",
  category: "digital-transformation",
  description: "RWS implements and manages software, connects new systems to old systems via APIs/data migration/workflows, and manages vendor support and upgrades to reduce complexity for business owners.",
  shortDescription: "Vendor management and system integration services",
  pricing: {
    setup: "A$10,000-A$25,000",
    recurring: "A$800-A$2,000/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Reduced IT management burden and better system integration",
  },
  implementation: {
    steps: [
      "Assess existing systems and vendors",
      "Plan integration architecture",
      "Implement system connections via APIs",
      "Manage data migration workflows",
      "Set up vendor support management",
      "Configure upgrade management",
      "Deploy and provide ongoing management",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [4],
  relatedModules: [
    "digital-transformation-end-to-end",
    "digital-transformation-change-management",
  ],
  features: [
    "Software implementation and management",
    "System integration via APIs",
    "Data migration workflows",
    "Vendor support management",
    "Upgrade management and coordination",
  ],
  expectedOutcomes: [
    "Reduced IT management burden",
    "Better system integration",
    "Single point of contact for vendors",
    "Faster issue resolution",
    "Smoother upgrades and updates",
  ],
};

