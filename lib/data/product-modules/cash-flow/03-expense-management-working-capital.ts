import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 6: Expense Management & Working Capital Optimization
 * Challenge 2: Cash Flow Strain & Declining Profitability
 */
export const expenseManagementWorkingCapital: ProductModule = {
  id: "cash-flow-expense-management",
  name: "Expense Management & Working Capital Optimization",
  category: "cash-flow",
  description: "Automated vendor payment systems, inventory management with real-time tracking, and cash flow forecasting to optimize working capital and improve cash flow timing.",
  shortDescription: "Expense management & working capital optimization",
  pricing: {
    setup: "A$12,000-A$22,000",
    recurring: "A$400-A$700/month",
  },
  roi: {
    timeline: "4-6 months payback",
    savings: "Improved working capital efficiency and reduced costs",
  },
  implementation: {
    steps: [
      "Integrate with accounting and inventory systems",
      "Configure vendor payment automation",
      "Set up inventory tracking and alerts",
      "Build 13-week cash flow forecasting model",
      "Configure working capital optimization rules",
      "Train finance team",
      "Deploy and monitor",
    ],
    timeline: "5-8 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors, especially retail, manufacturing
  challengeIds: [2],
  relatedModules: [
    "cash-flow-forecasting",
    "cash-flow-billing-automation",
    "efficiency-cost-visibility",
  ],
  features: [
    "Vendor payment automation",
    "Inventory management with real-time tracking",
    "13-week rolling cash flow forecast",
    "Working capital optimization recommendations",
    "Expense approval workflows",
  ],
  expectedOutcomes: [
    "Optimized payment timing",
    "Reduced inventory holding costs",
    "Better cash flow visibility",
    "Improved working capital efficiency",
    "Reduced administrative burden",
  ],
};

