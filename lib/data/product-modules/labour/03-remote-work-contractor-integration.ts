import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 24: Remote Work & Contractor Integration
 * Challenge 6: Labour Shortages & Rising Wage Costs
 */
export const remoteWorkContractorIntegration: ProductModule = {
  id: "labour-remote-contractor",
  name: "Remote Work & Contractor Integration",
  category: "labour",
  description: "Digital workflows enabling remote work, contractor management automating onboarding and payment, and geographic reach hiring specialized talent from outside Central Queensland without relocation costs.",
  shortDescription: "Remote work and contractor management systems",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "4-8 months payback",
    savings: "Access to specialized talent without relocation costs",
  },
  implementation: {
    steps: [
      "Assess remote work requirements",
      "Configure digital workflows",
      "Set up contractor management system",
      "Configure onboarding automation",
      "Set up contractor payment systems",
      "Train staff on remote collaboration",
      "Deploy and establish processes",
    ],
    timeline: "5-7 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors, especially professional-services
  challengeIds: [6],
  relatedModules: [
    "labour-productivity-systems",
    "connectivity-optimized-design",
  ],
  features: [
    "Digital workflows for remote work",
    "Contractor management system",
    "Automated onboarding and payment",
    "Remote collaboration tools",
    "Geographic talent access",
  ],
  expectedOutcomes: [
    "Access to specialized talent",
    "Reduced need for relocation",
    "Improved contractor management",
    "Better remote collaboration",
    "Expanded talent pool",
  ],
};

