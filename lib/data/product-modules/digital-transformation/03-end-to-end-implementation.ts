import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 15: End-to-End Implementation Responsibility
 * Challenge 4: Digital Transformation Difficulties
 */
export const endToEndImplementation: ProductModule = {
  id: "digital-transformation-end-to-end",
  name: "End-to-End Implementation Responsibility",
  category: "digital-transformation",
  description: "Fixed timeline & scope, go-live confidence managing all technical complexity, and post-launch support with 90-day included period for worry-free technology implementation.",
  shortDescription: "End-to-end implementation with fixed timeline and 90-day support",
  pricing: {
    setup: "A$15,000-A$50,000 (varies by scope)",
    recurring: undefined,
  },
  roi: {
    timeline: "Depends on project scope",
    savings: "Reduced risk, faster implementation, better outcomes",
  },
  implementation: {
    steps: [
      "Define fixed timeline and scope",
      "Manage all technical complexity",
      "Coordinate all vendors and systems",
      "Execute implementation plan",
      "Go-live with confidence",
      "90-day post-launch support included",
      "Handover to business-as-usual",
    ],
    timeline: "8-16 weeks (varies by scope)",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [4],
  relatedModules: [
    "digital-transformation-technology-strategy",
    "digital-transformation-change-management",
    "digital-transformation-vendor-management",
  ],
  features: [
    "Fixed timeline and scope",
    "Go-live confidence",
    "All technical complexity managed",
    "90-day post-launch support included",
    "Single point of responsibility",
  ],
  expectedOutcomes: [
    "Worry-free implementation",
    "Faster time to value",
    "Reduced implementation risk",
    "Better project outcomes",
    "Smooth transition to new systems",
  ],
};

