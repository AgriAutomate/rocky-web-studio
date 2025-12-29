import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 6 (Part 2): Cash Flow Forecasting
 * Challenge 1 & 2: Cash Flow Management
 */
export const cashFlowForecasting: ProductModule = {
  id: "cash-flow-forecasting",
  name: "Cash Flow Forecasting",
  category: "cash-flow",
  description: "13-week rolling cash flow forecast predicting future cash position, enabling proactive cash flow management and working capital optimization.",
  shortDescription: "13-week rolling cash flow forecast",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$300-A$600/month",
  },
  roi: {
    timeline: "3-5 months payback",
    savings: "Better cash flow management and reduced risk",
  },
  implementation: {
    steps: [
      "Integrate with accounting systems",
      "Configure 13-week rolling forecast model",
      "Set up automated data updates",
      "Build forecasting dashboards",
      "Train finance team",
      "Establish forecast review cadence",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [1, 2, 10],
  relatedModules: [
    "cash-flow-expense-management",
    "cash-flow-billing-automation",
    "leadership-business-intelligence",
  ],
  features: [
    "13-week rolling cash flow forecast",
    "Automated data updates",
    "Scenario planning",
    "Cash flow dashboards",
    "Alerts for cash flow issues",
  ],
  expectedOutcomes: [
    "Better cash flow visibility",
    "Proactive cash flow management",
    "Reduced cash flow risk",
    "Improved working capital management",
    "Better financial planning",
  ],
};

