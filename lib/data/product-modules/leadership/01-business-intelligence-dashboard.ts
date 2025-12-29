import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 39: Business Intelligence & Dashboard Reporting
 * Challenge 10: Lack of Leadership & Strategic Planning
 */
export const businessIntelligenceDashboard: ProductModule = {
  id: "leadership-business-intelligence",
  name: "Business Intelligence & Dashboard Reporting",
  category: "leadership",
  description: "Executive dashboard with real-time view of key metrics, profitability analysis understanding which customers/products/locations are profitable, financial forecasting with 13-week rolling cash flow forecast, and KPI monitoring tracking strategic priorities monthly.",
  shortDescription: "Executive dashboards and business intelligence",
  pricing: {
    setup: "A$15,000-A$25,000",
    recurring: "A$600-A$1,200/month",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "30-50% improvement in owner time available for strategic work",
  },
  implementation: {
    steps: [
      "Identify key metrics and KPIs",
      "Integrate data sources",
      "Build executive dashboard",
      "Configure profitability analysis",
      "Set up financial forecasting",
      "Configure KPI monitoring",
      "Train management team and deploy",
    ],
    timeline: "6-10 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [10],
  relatedModules: [
    "leadership-process-documentation",
    "leadership-strategic-planning",
    "efficiency-cost-visibility",
  ],
  features: [
    "Executive dashboard with real-time metrics",
    "Profitability analysis",
    "13-week rolling cash flow forecast",
    "KPI monitoring",
    "Strategic priority tracking",
  ],
  expectedOutcomes: [
    "Better business visibility",
    "30-50% improvement in owner time",
    "Data-driven decision making",
    "Improved profitability",
    "Better strategic planning",
  ],
};

