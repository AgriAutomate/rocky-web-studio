import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 37: Network Infrastructure Guidance
 * Challenge 9: Digital Connectivity Limitations
 */
export const networkInfrastructureGuidance: ProductModule = {
  id: "connectivity-infrastructure",
  name: "Network Infrastructure Guidance",
  category: "connectivity",
  description: "ISP selection advising on best connectivity options in specific location, hardware optimization selecting network equipment to maximize performance, and bandwidth management optimizing priority to ensure critical functions work well.",
  shortDescription: "Network infrastructure optimization guidance",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: undefined,
  },
  roi: {
    timeline: "Immediate performance improvement",
    savings: "Better connectivity performance and cost efficiency",
  },
  implementation: {
    steps: [
      "Assess current infrastructure",
      "Research ISP options for location",
      "Recommend optimal connectivity solutions",
      "Optimize network hardware",
      "Configure bandwidth management",
      "Test and optimize",
      "Provide ongoing guidance",
    ],
    timeline: "3-4 weeks",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [9],
  relatedModules: [
    "connectivity-optimized-design",
    "connectivity-redundancy",
  ],
  features: [
    "ISP selection guidance",
    "Hardware optimization recommendations",
    "Bandwidth management",
    "Performance optimization",
    "Cost efficiency analysis",
  ],
  expectedOutcomes: [
    "Better connectivity performance",
    "Cost-efficient connectivity",
    "Optimized network infrastructure",
    "Improved system performance",
    "Better value from connectivity investment",
  ],
};

