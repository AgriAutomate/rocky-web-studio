import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 22: Labour Automation & Productivity Enhancement
 * Challenge 6: Labour Shortages & Rising Wage Costs
 */
export const labourAutomationProductivity: ProductModule = {
  id: "labour-automation-productivity",
  name: "Labour Automation & Productivity Enhancement",
  category: "labour",
  description: "Data entry automation eliminating manual work (saving 5-10 hours/week per staff member), scheduling & routing optimization reducing admin time by 80%, customer service automation with chatbots handling 40-60% of routine inquiries, document automation auto-generating forms/proposals/contracts, and reporting automation auto-generating monthly reports and dashboards.",
  shortDescription: "Labour automation saving 5-10 hours/week per staff member",
  pricing: {
    setup: "A$25,000-A$40,000",
    recurring: "A$800-A$1,500/month",
  },
  roi: {
    timeline: "5-8 months payback",
    savings: "Equivalent to 0.5-1.0 FTE savings per 5 staff members",
  },
  implementation: {
    steps: [
      "Identify manual processes for automation",
      "Configure data entry automation",
      "Set up scheduling and routing optimization",
      "Implement customer service chatbot",
      "Configure document automation",
      "Set up reporting automation",
      "Train staff and deploy",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [6],
  relatedModules: [
    "labour-productivity-systems",
    "automation-workflow",
    "automation-data-entry",
  ],
  features: [
    "Data entry automation",
    "Scheduling and routing optimization",
    "Customer service chatbot automation",
    "Document automation (forms/proposals/contracts)",
    "Reporting automation",
  ],
  expectedOutcomes: [
    "5-10 hours/week saved per staff member",
    "80% reduction in admin time",
    "40-60% of routine inquiries handled by chatbot",
    "Equivalent to 0.5-1.0 FTE savings",
    "Improved staff productivity and job satisfaction",
  ],
};

