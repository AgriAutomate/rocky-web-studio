import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 14: Change Management & Staff Enablement
 * Challenge 4: Digital Transformation Difficulties
 */
export const changeManagementStaffEnablement: ProductModule = {
  id: "digital-transformation-change-management",
  name: "Change Management & Staff Enablement",
  category: "digital-transformation",
  description: "Structured training before go-live, adoption monitoring over 30/60/90 days, gradual cutover with parallel running, and remote video call support to ensure successful technology adoption.",
  shortDescription: "Change management and staff training for technology adoption",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$500-A$1,000/month (first 3 months)",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "Higher adoption rates = better ROI on technology investments",
  },
  implementation: {
    steps: [
      "Develop training materials",
      "Conduct structured pre-go-live training",
      "Set up adoption monitoring system",
      "Plan gradual cutover with parallel running",
      "Configure remote support systems",
      "Monitor adoption at 30/60/90 days",
      "Provide ongoing support and optimization",
    ],
    timeline: "6-12 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [4],
  relatedModules: [
    "digital-transformation-technology-strategy",
    "digital-transformation-end-to-end",
  ],
  features: [
    "Structured training program",
    "30/60/90 day adoption monitoring",
    "Gradual cutover with parallel running",
    "Remote video call support",
    "Adoption analytics and reporting",
  ],
  expectedOutcomes: [
    "Higher staff adoption rates",
    "Reduced resistance to change",
    "Faster time to productivity",
    "Better ROI on technology investments",
    "Improved staff confidence with new systems",
  ],
};

