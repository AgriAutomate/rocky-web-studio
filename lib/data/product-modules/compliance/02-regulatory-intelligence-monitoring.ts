import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 10: Regulatory Intelligence & Monitoring
 * Challenge 3: Complex Regulatory & Compliance Burdens
 */
export const regulatoryIntelligenceMonitoring: ProductModule = {
  id: "compliance-regulatory-intelligence",
  name: "Regulatory Intelligence & Monitoring",
  category: "compliance",
  description: "Automated regulation tracking, compliance calendar auto-populating key deadlines, and regulatory update notifications with quarterly briefings to stay ahead of compliance requirements.",
  shortDescription: "Automated regulatory tracking and compliance calendar",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Reduced risk of non-compliance fines and penalties",
  },
  implementation: {
    steps: [
      "Configure regulation tracking system",
      "Set up compliance calendar",
      "Configure automated notifications",
      "Set up quarterly briefing system",
      "Train management team",
      "Deploy and establish review cadence",
    ],
    timeline: "3-5 weeks",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [3],
  relatedModules: [
    "compliance-automation-documentation",
    "compliance-sector-specific",
  ],
  features: [
    "Automated regulation tracking",
    "Compliance calendar with key deadlines",
    "Regulatory update notifications",
    "Quarterly compliance briefings",
    "Sector-specific regulatory alerts",
  ],
  expectedOutcomes: [
    "Proactive compliance management",
    "Reduced risk of missed deadlines",
    "Early awareness of regulatory changes",
    "Better compliance planning",
    "Reduced compliance risk exposure",
  ],
};

