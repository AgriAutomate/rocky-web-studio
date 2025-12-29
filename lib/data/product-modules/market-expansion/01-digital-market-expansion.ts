import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 31: Digital Market Expansion Beyond Geography
 * Challenge 8: Market Access & Logistics Barriers
 */
export const digitalMarketExpansion: ProductModule = {
  id: "market-expansion-digital",
  name: "Digital Market Expansion Beyond Geography",
  category: "market-expansion",
  description: "E-commerce platform selling online to customers outside Central Queensland Australia-wide or international, digital products/services delivering remotely via telemedicine/online consulting/training, marketplace integration selling on Amazon/eBay/specialist marketplaces, and social selling leveraging social media to reach customers Australia-wide with dropshipping or fulfillment partnerships.",
  shortDescription: "Digital market expansion beyond geographic boundaries",
  pricing: {
    setup: "A$25,000-A$40,000",
    recurring: "A$1,500-A$2,500/month",
  },
  roi: {
    timeline: "3-5 months payback",
    revenueIncrease: "50-100% revenue increase through market expansion",
  },
  implementation: {
    steps: [
      "Assess market expansion opportunities",
      "Build e-commerce platform",
      "Set up digital product/service delivery",
      "Integrate with marketplaces (Amazon/eBay)",
      "Configure social selling systems",
      "Set up fulfillment/dropshipping partnerships",
      "Launch and optimize",
    ],
    timeline: "10-16 weeks",
    complexity: "high",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [8],
  relatedModules: [
    "market-expansion-logistics",
    "customer-digital-channels",
  ],
  features: [
    "E-commerce platform (Australia-wide/international)",
    "Digital products/services delivery",
    "Marketplace integration (Amazon/eBay)",
    "Social selling automation",
    "Dropshipping/fulfillment integration",
  ],
  expectedOutcomes: [
    "Market expansion beyond geography",
    "50-100% revenue increase",
    "Access to larger customer base",
    "Reduced geographic constraints",
    "Scalable revenue model",
  ],
};

