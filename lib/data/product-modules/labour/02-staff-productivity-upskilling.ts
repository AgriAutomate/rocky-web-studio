import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 23: Staff Productivity & Upskilling Systems
 * Challenge 6: Labour Shortages & Rising Wage Costs
 */
export const staffProductivityUpskilling: ProductModule = {
  id: "labour-productivity-systems",
  name: "Staff Productivity & Upskilling Systems",
  category: "labour",
  description: "Performance dashboard with real-time visibility, training management tracking certifications and renewals, knowledge base reducing repetitive training, and time tracking analyzing where staff time goes.",
  shortDescription: "Staff productivity tracking and upskilling systems",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "4-7 months payback",
    savings: "Improved productivity and reduced training costs",
  },
  implementation: {
    steps: [
      "Configure performance dashboard",
      "Set up training management system",
      "Build knowledge base",
      "Configure time tracking",
      "Train managers on dashboard usage",
      "Train staff on systems",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [6],
  relatedModules: [
    "labour-automation-productivity",
    "leadership-business-intelligence",
  ],
  features: [
    "Performance dashboard with real-time visibility",
    "Training management and certification tracking",
    "Knowledge base for staff",
    "Time tracking and analysis",
    "Productivity insights and reporting",
  ],
  expectedOutcomes: [
    "Better visibility into staff performance",
    "Reduced repetitive training",
    "Improved training management",
    "Better understanding of time allocation",
    "Enhanced staff development",
  ],
};

