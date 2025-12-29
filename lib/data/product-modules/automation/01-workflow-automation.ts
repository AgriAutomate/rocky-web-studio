import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 1: Workflow Automation
 * Challenge 1: High Operating Costs & Inflation
 */
export const workflowAutomation: ProductModule = {
  id: "automation-workflow",
  name: "Workflow Automation",
  category: "automation",
  description: "Automate repetitive business workflows to reduce manual labor and administrative overhead. Saves 8-15 hours per week by eliminating manual data entry, document routing, approval processes, and routine administrative tasks.",
  shortDescription: "Workflow automation saving 8-15 hours/week",
  pricing: {
    setup: "A$15,000-A$30,000",
    recurring: "A$200-A$500/month",
  },
  roi: {
    timeline: "5-8 months payback",
    savings: "A$15,000-A$30,000 annual labour cost reduction",
  },
  implementation: {
    steps: [
      "Identify key workflows for automation",
      "Map current manual processes",
      "Design automated workflow architecture",
      "Develop and configure automation rules",
      "Test with sample data",
      "Train staff on new workflows",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [1],
  relatedModules: [
    "automation-data-entry",
    "efficiency-cost-visibility",
    "labour-productivity-enhancement",
  ],
  features: [
    "Automated document routing and approvals",
    "Workflow notifications and reminders",
    "Integration with existing business systems",
    "Custom workflow builder",
    "Audit trail for all automated actions",
  ],
  expectedOutcomes: [
    "8-15 hours per week saved on manual tasks",
    "Reduced administrative errors",
    "Faster process completion times",
    "Improved staff productivity and job satisfaction",
    "A$15,000-A$30,000 annual cost savings",
  ],
};

