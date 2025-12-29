import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 19: Security Monitoring & Incident Response
 * Challenge 5: Cybersecurity Threats
 */
export const monitoringIncidentResponse: ProductModule = {
  id: "security-monitoring-incident",
  name: "Security Monitoring & Incident Response",
  category: "security",
  description: "24/7 automated alerts for suspicious activity, pre-defined incident response procedures, annual penetration testing and security assessment, and audit-ready compliance documentation.",
  shortDescription: "24/7 security monitoring and incident response",
  pricing: {
    setup: "A$10,000-A$18,000",
    recurring: "A$800-A$1,500/month",
  },
  roi: {
    timeline: "Immediate risk reduction",
    savings: "Faster incident detection and response reduces breach costs",
  },
  implementation: {
    steps: [
      "Configure 24/7 monitoring systems",
      "Set up automated alerting",
      "Develop incident response procedures",
      "Schedule annual penetration testing",
      "Set up security assessment framework",
      "Create audit-ready documentation",
      "Deploy and establish monitoring cadence",
    ],
    timeline: "5-8 weeks",
    complexity: "high",
  },
  dependencies: ["security-foundational", "security-multi-layer"],
  sectorCompatibility: [], // All sectors
  challengeIds: [5],
  relatedModules: [
    "security-foundational",
    "security-multi-layer",
    "security-cyber-insurance",
  ],
  features: [
    "24/7 automated security alerts",
    "Pre-defined incident response procedures",
    "Annual penetration testing",
    "Security assessments",
    "Audit-ready compliance documentation",
  ],
  expectedOutcomes: [
    "Proactive threat detection",
    "Faster incident response",
    "Reduced breach impact",
    "Compliance documentation",
    "Ongoing security improvement",
  ],
};

