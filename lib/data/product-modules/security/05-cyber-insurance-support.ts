import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 21: Cyber Insurance Support
 * Challenge 5: Cybersecurity Threats
 */
export const cyberInsuranceSupport: ProductModule = {
  id: "security-cyber-insurance",
  name: "Cyber Insurance Support",
  category: "security",
  description: "Maintaining audit trails and documentation insurers require, helping document incidents for insurance claims, and providing proof of security controls for insurance underwriting.",
  shortDescription: "Documentation and support for cyber insurance",
  pricing: {
    setup: "A$3,000-A$6,000",
    recurring: "A$200-A$400/month",
  },
  roi: {
    timeline: "Immediate value",
    savings: "Better insurance rates and faster claims processing",
  },
  implementation: {
    steps: [
      "Assess insurance requirements",
      "Set up audit trail documentation",
      "Configure incident documentation systems",
      "Create security controls documentation",
      "Establish regular documentation updates",
      "Train staff on incident documentation",
      "Deploy and maintain",
    ],
    timeline: "2-3 weeks",
    complexity: "low",
  },
  dependencies: ["security-foundational", "security-monitoring-incident"],
  sectorCompatibility: [], // All sectors
  challengeIds: [5],
  relatedModules: [
    "security-foundational",
    "security-monitoring-incident",
  ],
  features: [
    "Audit trail maintenance",
    "Incident documentation",
    "Security controls proof",
    "Insurance compliance documentation",
    "Claims support",
  ],
  expectedOutcomes: [
    "Better cyber insurance rates",
    "Faster claims processing",
    "Compliance with insurance requirements",
    "Reduced insurance costs",
    "Better risk documentation",
  ],
};

