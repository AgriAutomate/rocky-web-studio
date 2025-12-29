import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 36: Connectivity Redundancy
 * Challenge 9: Digital Connectivity Limitations
 */
export const connectivityRedundancy: ProductModule = {
  id: "connectivity-redundancy",
  name: "Connectivity Redundancy",
  category: "connectivity",
  description: "Multiple ISP options recommending dual internet sources for reliability, mobile-first design with applications working well on mobile 4G/5G as backup, and offline synchronization accepting data updates offline and syncing when connectivity restored.",
  shortDescription: "Multiple connectivity options for reliability",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "Immediate reliability improvement",
    savings: "Reduced downtime and business disruption",
  },
  implementation: {
    steps: [
      "Assess connectivity options",
      "Configure multiple ISP connections",
      "Set up mobile-first design",
      "Configure offline synchronization",
      "Test failover scenarios",
      "Train staff on redundancy systems",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [9],
  relatedModules: [
    "connectivity-optimized-design",
    "connectivity-infrastructure",
  ],
  features: [
    "Multiple ISP options",
    "Mobile-first design (4G/5G backup)",
    "Offline synchronization",
    "Automatic failover",
    "Connectivity monitoring",
  ],
  expectedOutcomes: [
    "Improved connectivity reliability",
    "Reduced downtime",
    "Business continuity",
    "Better system availability",
    "Reduced disruption risk",
  ],
};

