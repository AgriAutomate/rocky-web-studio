import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 17: Foundational Security by Default
 * Challenge 5: Cybersecurity Threats
 */
export const foundationalSecurity: ProductModule = {
  id: "security-foundational",
  name: "Foundational Security by Default",
  category: "security",
  description: "Secure hosting on AWS with encryption at rest and in transit, daily automated backups stored in separate AWS account ransomware-proof, all sensitive data encrypted using AES-256, and secure development following OWASP standards.",
  shortDescription: "Foundational security infrastructure and encryption",
  pricing: {
    setup: "A$10,000-A$20,000",
    recurring: "A$500-A$1,000/month",
  },
  roi: {
    timeline: "Immediate risk reduction",
    savings: "Prevents A$200,000+ potential breach costs",
  },
  implementation: {
    steps: [
      "Assess current security posture",
      "Configure secure AWS hosting",
      "Set up encryption at rest and in transit",
      "Configure daily automated backups (separate account)",
      "Implement AES-256 encryption",
      "Apply OWASP security standards",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [5],
  relatedModules: [
    "security-multi-layer",
    "security-monitoring-incident",
    "security-staff-training",
  ],
  features: [
    "Secure AWS hosting",
    "Encryption at rest and in transit",
    "Daily automated backups (ransomware-proof)",
    "AES-256 encryption for sensitive data",
    "OWASP security standards compliance",
  ],
  expectedOutcomes: [
    "Foundation for secure operations",
    "Protection against ransomware",
    "Data encryption and protection",
    "Compliance with security standards",
    "Reduced risk of data breaches",
  ],
};

