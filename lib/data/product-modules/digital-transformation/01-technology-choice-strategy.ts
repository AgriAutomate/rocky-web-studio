import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 13: Simplified Technology Choice & Strategy
 * Challenge 4: Digital Transformation Difficulties
 */
export const technologyChoiceStrategy: ProductModule = {
  id: "digital-transformation-technology-strategy",
  name: "Simplified Technology Choice & Strategy",
  category: "digital-transformation",
  description: "Business-first assessment identifying 3-5 biggest pain points, simple stack approach avoiding complexity, and risk-reduced phasing starting with small quick wins to reduce digital transformation risk.",
  shortDescription: "Business-first technology assessment and strategy",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: undefined,
  },
  roi: {
    timeline: "Immediate value through risk reduction",
    savings: "Avoid costly technology mistakes",
  },
  implementation: {
    steps: [
      "Business-first assessment of pain points",
      "Technology stack evaluation",
      "Risk assessment and mitigation planning",
      "Phased implementation strategy",
      "Quick wins identification",
      "Present strategy and recommendations",
      "Begin phased implementation",
    ],
    timeline: "2-3 weeks",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [4],
  relatedModules: [
    "digital-transformation-change-management",
    "digital-transformation-end-to-end",
  ],
  features: [
    "Business-first pain point assessment",
    "Simple stack approach",
    "Risk-reduced phasing strategy",
    "Quick wins identification",
    "Technology roadmap development",
  ],
  expectedOutcomes: [
    "Clear technology strategy aligned with business goals",
    "Reduced risk of technology failures",
    "Phased approach reducing disruption",
    "Quick wins building confidence",
    "Cost-effective technology decisions",
  ],
};

