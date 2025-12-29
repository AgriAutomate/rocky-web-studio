import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 4: Faster Invoicing & Payment Collection
 * Challenge 1: High Operating Costs & Inflation
 */
export const invoicingCollectionAcceleration: ProductModule = {
  id: "cash-flow-collection-acceleration",
  name: "Faster Invoicing & Payment Collection",
  category: "cash-flow",
  description: "Automated invoicing and payment collection systems that reduce Days Sales Outstanding (DSO) by 10-20 days. Includes same-day invoicing, online payment portals, automated reminders, and early payment incentives.",
  shortDescription: "Faster invoicing & payment collection reducing DSO by 10-20 days",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$200-A$500/month",
  },
  roi: {
    timeline: "2-4 months payback",
    savings: "Improved cash flow equivalent to 10-20 days of revenue",
  },
  implementation: {
    steps: [
      "Integrate with accounting/time-tracking systems",
      "Configure automated invoice generation",
      "Set up online payment portal",
      "Configure payment reminder sequences",
      "Set up early payment discount automation",
      "Train staff on new processes",
      "Deploy and monitor",
    ],
    timeline: "3-5 weeks",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [1, 2],
  relatedModules: [
    "cash-flow-billing-automation",
    "cash-flow-forecasting",
    "automation-workflow",
  ],
  features: [
    "Same-day automated invoicing",
    "Online payment portal with multiple payment methods",
    "Automated payment reminders (day 7/14/20)",
    "Early payment discount automation",
    "Payment tracking and reporting",
  ],
  expectedOutcomes: [
    "10-20 day reduction in DSO",
    "Faster cash collection",
    "Reduced manual invoicing time",
    "Improved customer payment experience",
    "Better cash flow predictability",
  ],
};

