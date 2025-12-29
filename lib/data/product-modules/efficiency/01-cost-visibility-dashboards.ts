import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 2: Cost Visibility Dashboards
 * Challenge 1: High Operating Costs & Inflation
 */
export const costVisibilityDashboards: ProductModule = {
  id: "efficiency-cost-visibility",
  name: "Cost Visibility Dashboards",
  category: "efficiency",
  description: "Real-time dashboards providing visibility into operational costs across all business areas. Enables data-driven decision making by tracking costs by category, department, project, or customer.",
  shortDescription: "Cost visibility dashboards for operational efficiency",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: "A$200-A$400/month",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "5-15% operational cost reduction through better visibility",
  },
  implementation: {
    steps: [
      "Integrate with accounting and operational systems",
      "Define cost categories and tracking dimensions",
      "Build dashboard visualizations",
      "Configure alerts for cost anomalies",
      "Train management team on dashboard usage",
      "Deploy and establish review cadence",
    ],
    timeline: "3-4 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [1],
  relatedModules: [
    "efficiency-predictive-analytics",
    "revenue-customer-profitability",
    "leadership-business-intelligence",
  ],
  features: [
    "Real-time cost tracking across categories",
    "Multi-dimensional cost analysis",
    "Customizable dashboard views",
    "Cost trend analysis and forecasting",
    "Alert system for budget variances",
  ],
  expectedOutcomes: [
    "Complete visibility into operational costs",
    "Faster identification of cost-saving opportunities",
    "Data-driven cost management decisions",
    "5-15% operational cost reduction",
    "Improved budget accuracy",
  ],
};

