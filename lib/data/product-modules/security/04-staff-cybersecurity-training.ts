import type { ProductModule } from "@/lib/types/product-modules";

/**
 * Module 20: Staff Cybersecurity Training
 * Challenge 5: Cybersecurity Threats
 */
export const staffCybersecurityTraining: ProductModule = {
  id: "security-staff-training",
  name: "Staff Cybersecurity Training",
  category: "security",
  description: "Phishing awareness teaching staff to identify phishing emails, password management enforcing strong passwords, social engineering defense training, and privacy best practices for handling sensitive data.",
  shortDescription: "Comprehensive staff cybersecurity training program",
  pricing: {
    setup: "A$5,000-A$10,000",
    recurring: "A$200-A$500/month (ongoing training)",
  },
  roi: {
    timeline: "3-6 months payback",
    savings: "Reduced risk of human error leading to breaches",
  },
  implementation: {
    steps: [
      "Assess current staff security awareness",
      "Develop training curriculum",
      "Conduct phishing awareness training",
      "Train on password management",
      "Provide social engineering defense training",
      "Train on privacy best practices",
      "Establish ongoing training program",
    ],
    timeline: "3-4 weeks (initial), ongoing",
    complexity: "low",
  },
  dependencies: [],
  sectorCompatibility: [], // All sectors
  challengeIds: [5],
  relatedModules: [
    "security-foundational",
    "security-multi-layer",
    "security-monitoring-incident",
  ],
  features: [
    "Phishing awareness training",
    "Password management training",
    "Social engineering defense",
    "Privacy best practices",
    "Ongoing security awareness program",
  ],
  expectedOutcomes: [
    "Reduced risk of human error",
    "Better security awareness",
    "Fewer successful phishing attacks",
    "Improved password hygiene",
    "Enhanced data protection culture",
  ],
};

