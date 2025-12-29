import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 5: Billing & Cash Collection Acceleration
 * Challenge 2: Cash Flow Strain & Declining Profitability
 */
export const billingCashCollectionAcceleration: ProductModule = {
  id: "cash-flow-billing-automation",
  name: "Billing & Cash Collection Acceleration",
  category: "cash-flow",
  description: "Comprehensive billing and collection automation including same-day invoicing after service delivery, online payment portal, automated payment reminders, and early payment discount programs.",
  shortDescription: "Automated billing & cash collection acceleration",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "3-4 months payback",
    savings: "Improved cash flow and reduced collection costs",
  },
  implementation: {
    steps: [
      "Analyze current billing processes",
      "Integrate with service delivery systems",
      "Configure automated invoice generation",
      "Set up online payment portal",
      "Configure reminder sequences",
      "Set up early payment discount automation (2% within 10 days)",
      "Train staff and deploy",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors, especially professional-services, healthcare
  challengeIds: [2],
  relatedModules: [
    "cash-flow-collection-acceleration",
    "cash-flow-expense-management",
    "automation-workflow",
  ],
  features: [
    "Same-day automated invoicing after service delivery",
    "Online payment portal with card/bank transfer",
    "Automated payment reminders at day 7/14/20",
    "Early payment discount automation (2% for payment within 10 days)",
    "Collection workflow automation",
  ],
  expectedOutcomes: [
    "Faster cash collection",
    "Reduced DSO by 10-20 days",
    "Lower collection costs",
    "Improved customer payment experience",
    "Better cash flow predictability",
  ],
};

