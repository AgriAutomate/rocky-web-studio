import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 41: Strategic Planning & Goal Management
 * Challenge 10: Lack of Leadership & Strategic Planning
 */
export const strategicPlanningGoalManagement: ProductModule = {
  id: "leadership-strategic-planning",
  name: "Strategic Planning & Goal Management",
  category: "leadership",
  description: "Annual strategic planning workshop defining 3-year vision and annual goals, quarterly reviews tracking progress, team alignment communicating strategy, and contingency planning for what-if scenarios.",
  shortDescription: "Strategic planning and goal management",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$2,000-A$4,000/year (annual workshops + quarterly reviews)",
  },
  roi: {
    timeline: "Strategic value - enables growth and reduces risk",
    savings: "Better strategic direction and business growth",
  },
  implementation: {
    steps: [
      "Conduct annual strategic planning workshop",
      "Define 3-year vision and annual goals",
      "Set up goal tracking system",
      "Schedule quarterly reviews",
      "Communicate strategy to team",
      "Develop contingency plans",
      "Establish ongoing planning cadence",
    ],
    timeline: "Ongoing (annual + quarterly)",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [10],
  relatedModules: [
    "leadership-business-intelligence",
    "leadership-decision-support",
  ],
  features: [
    "Annual strategic planning workshop",
    "3-year vision and annual goals",
    "Quarterly progress reviews",
    "Team alignment and communication",
    "Contingency planning",
  ],
  expectedOutcomes: [
    "Clear strategic direction",
    "Better goal alignment",
    "Improved team engagement",
    "Business growth enablement",
    "Reduced strategic risk",
  ],
};

