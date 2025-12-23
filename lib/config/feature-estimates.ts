/**
 * Feature-to-Cost/Timeline Mapping Configuration
 * 
 * This config-driven module maps selected features to estimated costs and timelines.
 * Update this file to adjust pricing without changing component code.
 */

export type FeatureKey =
  | "onlineBooking"
  | "staffPortal"
  | "paymentProcessing"
  | "emailAutomation"
  | "basicWebsite"
  | "ecommerce"
  | "crmIntegration"
  | "clientPortal"
  | "jobManagement"
  | "reportingDashboard"
  | "seoSetup"
  | "performanceTuning"
  | "inventory"
  | "scheduling"
  | "reporting"
  | "integrations"
  | "mobileApp"
  | "design"
  | "analytics"
  | "automation";

export interface FeatureEstimate {
  label: string;
  baseCost: number; // AUD
  baseWeeks: number;
  notes?: string;
  sectorOverrides?: {
    [sector: string]: {
      baseCost?: number;
      baseWeeks?: number;
    };
  };
}

/**
 * Feature configuration map
 * 
 * Each feature has:
 * - label: Human-readable name
 * - baseCost: Base cost in AUD
 * - baseWeeks: Base timeline in weeks
 * - notes: Optional notes about the feature
 * - sectorOverrides: Optional sector-specific adjustments
 */
export const featureConfig: Record<FeatureKey, FeatureEstimate> = {
  onlineBooking: {
    label: "Online Booking System",
    baseCost: 2500,
    baseWeeks: 3,
    notes: "Includes calendar integration and notifications",
    sectorOverrides: {
      hospitality: { baseCost: 3000, baseWeeks: 4 },
      "professional-services": { baseCost: 2800, baseWeeks: 3 },
    },
  },
  staffPortal: {
    label: "Staff Portal",
    baseCost: 2000,
    baseWeeks: 2,
    notes: "Employee dashboard and management",
  },
  paymentProcessing: {
    label: "Payment Processing",
    baseCost: 1500,
    baseWeeks: 2,
    notes: "Stripe/PayPal integration",
    sectorOverrides: {
      retail: { baseCost: 2000, baseWeeks: 2 },
      ecommerce: { baseCost: 2000, baseWeeks: 2 },
    },
  },
  emailAutomation: {
    label: "Email Automation",
    baseCost: 1200,
    baseWeeks: 2,
    notes: "Automated email workflows",
  },
  basicWebsite: {
    label: "Basic Website",
    baseCost: 3000,
    baseWeeks: 4,
    notes: "Standard 5-page website with CMS",
  },
  ecommerce: {
    label: "E-commerce Platform",
    baseCost: 5000,
    baseWeeks: 6,
    notes: "Full online store with product management",
    sectorOverrides: {
      retail: { baseCost: 5500, baseWeeks: 6 },
    },
  },
  crmIntegration: {
    label: "CRM Integration",
    baseCost: 2500,
    baseWeeks: 3,
    notes: "Connect with existing CRM system",
    sectorOverrides: {
      "professional-services": { baseCost: 3000, baseWeeks: 3 },
    },
  },
  clientPortal: {
    label: "Client Portal",
    baseCost: 3500,
    baseWeeks: 4,
    notes: "Secure client access area",
    sectorOverrides: {
      "professional-services": { baseCost: 4000, baseWeeks: 5 },
      healthcare: { baseCost: 4500, baseWeeks: 5 },
    },
  },
  jobManagement: {
    label: "Job Management System",
    baseCost: 4000,
    baseWeeks: 5,
    notes: "Job tracking and scheduling",
    sectorOverrides: {
      construction: { baseCost: 4500, baseWeeks: 6 },
      trades: { baseCost: 4500, baseWeeks: 6 },
    },
  },
  reportingDashboard: {
    label: "Reporting Dashboard",
    baseCost: 2500,
    baseWeeks: 3,
    notes: "Analytics and reporting interface",
  },
  seoSetup: {
    label: "SEO Setup & Optimization",
    baseCost: 2000,
    baseWeeks: 2,
    notes: "On-page SEO and initial optimization",
  },
  performanceTuning: {
    label: "Performance Optimization",
    baseCost: 1500,
    baseWeeks: 2,
    notes: "Speed and performance improvements",
  },
  inventory: {
    label: "Inventory Management",
    baseCost: 3000,
    baseWeeks: 4,
    notes: "Stock tracking and management",
    sectorOverrides: {
      retail: { baseCost: 3500, baseWeeks: 4 },
    },
  },
  scheduling: {
    label: "Scheduling System",
    baseCost: 2000,
    baseWeeks: 3,
    notes: "Appointment and resource scheduling",
  },
  reporting: {
    label: "Custom Reporting",
    baseCost: 2000,
    baseWeeks: 2,
    notes: "Custom report generation",
  },
  integrations: {
    label: "Third-Party Integrations",
    baseCost: 2500,
    baseWeeks: 3,
    notes: "Connect with external systems",
  },
  mobileApp: {
    label: "Mobile App",
    baseCost: 8000,
    baseWeeks: 10,
    notes: "Native or progressive web app",
  },
  design: {
    label: "Custom Design",
    baseCost: 3000,
    baseWeeks: 3,
    notes: "Custom UI/UX design",
  },
  analytics: {
    label: "Analytics Setup",
    baseCost: 1000,
    baseWeeks: 1,
    notes: "Google Analytics and tracking",
  },
  automation: {
    label: "Workflow Automation",
    baseCost: 3000,
    baseWeeks: 4,
    notes: "Automate business processes",
  },
};

/**
 * Map discovery tree priority feature names to FeatureKey
 * 
 * This mapping connects the feature names used in the prioritization
 * section to the feature keys in the config.
 */
export const featureNameToKey: Record<string, FeatureKey> = {
  booking: "onlineBooking",
  "e-commerce": "ecommerce",
  crm: "crmIntegration",
  portal: "clientPortal",
  automation: "automation",
  seo: "seoSetup",
  speed: "performanceTuning",
  design: "design",
  analytics: "analytics",
  payments: "paymentProcessing",
  inventory: "inventory",
  scheduling: "scheduling",
  reporting: "reporting",
  integrations: "integrations",
  "mobile-app": "mobileApp",
};

/**
 * Get feature key from discovery tree feature name
 */
export function getFeatureKey(featureName: string): FeatureKey | null {
  return featureNameToKey[featureName] || null;
}

/**
 * Get all feature keys from discovery tree priority arrays
 */
export function getFeatureKeysFromPriorities(priorities: {
  mustHave?: string[];
  niceToHave?: string[];
  future?: string[];
}): FeatureKey[] {
  const keys: FeatureKey[] = [];
  
  // Map must-have and nice-to-have features
  [...(priorities.mustHave || []), ...(priorities.niceToHave || [])].forEach(
    (name) => {
      const key = getFeatureKey(name);
      if (key) {
        keys.push(key);
      }
    }
  );
  
  return keys;
}
