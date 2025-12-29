import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 22 (Part 2): Data Entry Automation
 * Challenge 6: Labour Shortages & Rising Wage Costs
 */
export const dataEntryAutomation: ProductModule = {
  id: "automation-data-entry",
  name: "Data Entry Automation",
  category: "automation",
  description: "Eliminate manual data entry work freeing staff for higher-value activities. Saves 5-10 hours per week per staff member through automated form filling, data extraction, and system integration.",
  shortDescription: "Data entry automation saving 5-10 hours/week per staff member",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "4-7 months payback",
    savings: "5-10 hours/week per staff member = significant labour cost savings",
  },
  implementation: {
    steps: [
      "Identify data entry bottlenecks",
      "Map data sources and destinations",
      "Configure data extraction",
      "Set up automated form filling",
      "Integrate with existing systems",
      "Test with sample data",
      "Train staff and deploy",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [6],
  relatedModules: [
    "automation-workflow",
    "labour-automation-productivity",
  ],
  features: [
    "Automated form filling",
    "Data extraction from documents",
    "System integration and data sync",
    "Error reduction through automation",
    "Audit trail for all data transfers",
  ],
  expectedOutcomes: [
    "5-10 hours/week saved per staff member",
    "Eliminated manual data entry",
    "Reduced data entry errors",
    "Faster data processing",
    "Staff freed for higher-value work",
  ],
};

