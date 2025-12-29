import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 11: Integration with Professional Advisors
 * Challenge 3: Complex Regulatory & Compliance Burdens
 */
export const professionalAdvisorsIntegration: ProductModule = {
  id: "compliance-professional-advisors",
  name: "Integration with Professional Advisors",
  category: "compliance",
  description: "Accountant integration with automatic P&L/balance sheet sharing, legal document vault for secure storage, and insurance coordination tracking renewals and requirements.",
  shortDescription: "Integration with accountants, lawyers, and insurers",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: "A$200-A$400/month",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "Reduced accounting/legal costs and improved efficiency",
  },
  implementation: {
    steps: [
      "Integrate with accounting systems",
      "Set up automatic financial data sharing",
      "Configure legal document vault",
      "Set up insurance tracking system",
      "Connect with professional advisors",
      "Train staff on new workflows",
      "Deploy and monitor",
    ],
    timeline: "3-4 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [3],
  relatedModules: [
    "compliance-automation-documentation",
    "security-foundational",
  ],
  features: [
    "Automatic P&L/balance sheet sharing with accountant",
    "Legal document vault for secure storage",
    "Insurance coordination and renewal tracking",
    "Advisor collaboration portal",
    "Document sharing and approval workflows",
  ],
  expectedOutcomes: [
    "Streamlined advisor collaboration",
    "Reduced accounting/legal costs",
    "Improved document security",
    "Better insurance compliance",
    "Faster advisor response times",
  ],
};

