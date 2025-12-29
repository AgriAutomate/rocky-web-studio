import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 8 (Part 2): Government Grant Coordination
 * Challenge 2: Cash Flow Strain
 */
export const governmentGrants: ProductModule = {
  id: "compliance-government-grants",
  name: "Government Grant Coordination",
  category: "compliance",
  description: "Help clients identify and apply for relevant government grants, manage grant applications, and coordinate grant compliance requirements.",
  shortDescription: "Government grant application and coordination support",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: "A$200-A$500/month",
  },
  roi: {
    timeline: "Grant-dependent",
    savings: "Access to government funding",
  },
  implementation: {
    steps: [
      "Research available grants",
      "Assess client eligibility",
      "Prepare grant applications",
      "Submit and manage applications",
      "Coordinate compliance requirements",
      "Manage grant reporting",
      "Provide ongoing support",
    ],
    timeline: "4-12 weeks (varies by grant)",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [2],
  relatedModules: [
    "cash-flow-micro-lending",
    "connectivity-government-assistance",
  ],
  features: [
    "Grant research and identification",
    "Eligibility assessment",
    "Application preparation",
    "Grant management",
    "Compliance coordination",
  ],
  expectedOutcomes: [
    "Access to government funding",
    "Reduced financial burden",
    "Support for business growth",
    "Grant compliance support",
    "Better financial position",
  ],
};

