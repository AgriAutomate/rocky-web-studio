import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 38: Government Assistance Navigation
 * Challenge 9: Digital Connectivity Limitations
 */
export const governmentAssistanceNavigation: ProductModule = {
  id: "connectivity-government-assistance",
  name: "Government Assistance Navigation",
  category: "connectivity",
  description: "Regional connectivity grants helping clients apply for Australian government programs, and infrastructure development advising on community initiatives to improve connectivity.",
  shortDescription: "Government grant application support for connectivity",
  pricing: {
    setup: "A$3,000-A$6,000",
    recurring: undefined,
  },
  roi: {
    timeline: "Grant-dependent",
    savings: "Access to government funding for connectivity",
  },
  implementation: {
    steps: [
      "Assess eligibility for grants",
      "Research available programs",
      "Prepare grant applications",
      "Advise on infrastructure initiatives",
      "Submit applications",
      "Manage grant process",
      "Provide ongoing support",
    ],
    timeline: "4-8 weeks (varies by program)",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [9],
  relatedModules: [
    "connectivity-infrastructure",
    "compliance-government-grants",
  ],
  features: [
    "Grant application support",
    "Program research and eligibility",
    "Infrastructure development advising",
    "Grant management",
    "Community initiative support",
  ],
  expectedOutcomes: [
    "Access to government funding",
    "Improved connectivity options",
    "Community infrastructure development",
    "Reduced connectivity costs",
    "Better long-term connectivity",
  ],
};

