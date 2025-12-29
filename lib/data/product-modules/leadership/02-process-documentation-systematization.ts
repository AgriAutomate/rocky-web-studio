import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 40: Process Documentation & Systematization
 * Challenge 10: Lack of Leadership & Strategic Planning
 */
export const processDocumentationSystematization: ProductModule = {
  id: "leadership-process-documentation",
  name: "Process Documentation & Systematization",
  category: "leadership",
  description: "Process documentation capturing critical business processes in writing/video, automation of key processes reducing manual work, standard operating procedures with written guidelines, and knowledge management with centralized documentation.",
  shortDescription: "Process documentation and systematization",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Business less dependent on owner, enables growth",
  },
  implementation: {
    steps: [
      "Identify critical processes",
      "Document processes (written/video)",
      "Create standard operating procedures",
      "Automate key processes",
      "Set up knowledge management system",
      "Train staff on documented processes",
      "Deploy and maintain",
    ],
    timeline: "6-12 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [10],
  relatedModules: [
    "leadership-business-intelligence",
    "leadership-strategic-planning",
    "automation-workflow",
  ],
  features: [
    "Process documentation (written/video)",
    "Standard operating procedures",
    "Process automation",
    "Knowledge management system",
    "Centralized documentation",
  ],
  expectedOutcomes: [
    "Business less dependent on owner",
    "Better process consistency",
    "Easier staff onboarding",
    "Enables business growth",
    "Reduced operational risk",
  ],
};

