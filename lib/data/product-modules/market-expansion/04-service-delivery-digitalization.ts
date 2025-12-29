import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 34: Service Delivery Digitalization
 * Challenge 8: Market Access & Logistics Barriers
 */
export const serviceDeliveryDigitalization: ProductModule = {
  id: "market-expansion-service-digitalization",
  name: "Service Delivery Digitalization",
  category: "market-expansion",
  description: "Virtual services shifting professional services to online delivery, hybrid delivery combining local in-person with remote support, and subscription services scaling recurring digital services without logistics constraints.",
  shortDescription: "Digital service delivery for remote customers",
  pricing: {
    setup: "A$12,000-A$22,000",
    recurring: "A$500-A$1,000/month",
  },
  roi: {
    timeline: "4-8 months payback",
    revenueIncrease: "30-60% revenue increase through digital services",
  },
  implementation: {
    steps: [
      "Assess service digitalization opportunities",
      "Design virtual service delivery model",
      "Build online service platforms",
      "Set up hybrid delivery systems",
      "Configure subscription service models",
      "Train staff on digital delivery",
      "Launch and optimize",
    ],
    timeline: "6-10 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: ["professional-services", "healthcare"],
  challengeIds: [8],
  relatedModules: [
    "customer-digital-channels",
    "market-expansion-digital",
  ],
  features: [
    "Virtual service delivery platform",
    "Hybrid delivery systems",
    "Subscription service models",
    "Remote customer engagement tools",
    "Digital service analytics",
  ],
  expectedOutcomes: [
    "30-60% revenue increase",
    "Market expansion without logistics",
    "Scalable service delivery",
    "Better customer convenience",
    "Reduced geographic constraints",
  ],
};

