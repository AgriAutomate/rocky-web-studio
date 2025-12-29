import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 42: Decision Support Systems
 * Challenge 10: Lack of Leadership & Strategic Planning
 */
export const decisionSupportSystems: ProductModule = {
  id: "leadership-decision-support",
  name: "Decision Support Systems",
  category: "leadership",
  description: "Customer management with CRM tracking relationships, project management ensuring deliverables met, sales pipeline visibility knowing deal stage and probability, and financial controls with budget tracking and approval workflows.",
  shortDescription: "Decision support systems for better management",
  pricing: {
    setup: "A$15,000-A$28,000",
    recurring: "A$600-A$1,200/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Better decision making and operational efficiency",
  },
  implementation: {
    steps: [
      "Assess current management systems",
      "Implement CRM for customer management",
      "Set up project management system",
      "Configure sales pipeline tracking",
      "Set up financial controls and approvals",
      "Train management team",
      "Deploy and optimize",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [10],
  relatedModules: [
    "leadership-business-intelligence",
    "leadership-strategic-planning",
  ],
  features: [
    "CRM for customer management",
    "Project management system",
    "Sales pipeline visibility",
    "Financial controls and approvals",
    "Decision support dashboards",
  ],
  expectedOutcomes: [
    "Better customer management",
    "Improved project delivery",
    "Better sales visibility",
    "Improved financial control",
    "Data-driven decision making",
  ],
};

