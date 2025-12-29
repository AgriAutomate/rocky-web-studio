import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 18: Multi-Layer Security Implementation
 * Challenge 5: Cybersecurity Threats
 */
export const multiLayerSecurity: ProductModule = {
  id: "security-multi-layer",
  name: "Multi-Layer Security Implementation",
  category: "security",
  description: "Multi-factor authentication requiring password + phone verification, role-based access control limiting staff to relevant data, activity logging flagging suspicious activity automatically, and network security with firewalls and intrusion detection.",
  shortDescription: "Multi-layer security with MFA, RBAC, and monitoring",
  pricing: {
    setup: "A$8,000-A$15,000",
    recurring: "A$400-A$800/month",
  },
  roi: {
    timeline: "Immediate risk reduction",
    savings: "Prevents unauthorized access and data breaches",
  },
  implementation: {
    steps: [
      "Configure multi-factor authentication",
      "Set up role-based access control",
      "Configure activity logging",
      "Implement network firewalls",
      "Set up intrusion detection",
      "Train staff on security protocols",
      "Deploy and monitor",
    ],
    timeline: "4-6 weeks",
    complexity: "medium",
  },
  dependencies: ["security-foundational"],
  sectorCompatibility: [], // All sectors
  challengeIds: [5],
  relatedModules: [
    "security-foundational",
    "security-monitoring-incident",
    "security-staff-training",
  ],
  features: [
    "Multi-factor authentication (MFA)",
    "Role-based access control (RBAC)",
    "Activity logging and monitoring",
    "Network firewalls",
    "Intrusion detection systems",
  ],
  expectedOutcomes: [
    "Protection against unauthorized access",
    "Reduced risk of insider threats",
    "Better visibility into system access",
    "Compliance with security requirements",
    "Enhanced data protection",
  ],
};

