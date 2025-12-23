/**
 * Discovery Tree Type Definitions
 * 
 * Types for the guided discovery tree system that extends the base questionnaire.
 * These types support storing richer operational and technical context needed
 * for project planning.
 */

import type { Sector } from "./questionnaire";

// ============================================================================
// Business Profile Types
// ============================================================================

export type AnnualRevenue = "0-100k" | "100-500k" | "500k-1m" | "1-5m" | "5m+";
export type EmployeeCount = "1-5" | "6-20" | "21-50" | "51-200" | "200+";
export type YearsInBusiness = "0-2" | "3-5" | "6-10" | "10+";
export type DigitalMaturityLevel = "basic" | "intermediate" | "advanced";

/**
 * Business profile data structure
 * Stores business size and digital maturity context
 */
export interface BusinessProfile {
  annualRevenue: AnnualRevenue;
  employeeCount: EmployeeCount;
  yearsInBusiness: YearsInBusiness;
  digitalMaturity: DigitalMaturityLevel;
}

// ============================================================================
// Discovery Trunk Types (Universal Questions)
// ============================================================================

/**
 * Integration requirements
 * What systems need to connect or integrate
 */
export interface IntegrationRequirement {
  systemName: string;
  systemType: "crm" | "pos" | "accounting" | "payment" | "booking" | "inventory" | "other";
  integrationType: "api" | "webhook" | "export" | "manual" | "unknown";
  priority: "critical" | "important" | "nice-to-have";
  notes?: string;
}

/**
 * Data migration requirements
 * Information about existing data that needs to be migrated
 */
export interface DataMigrationRequirement {
  hasExistingData: boolean;
  dataTypes?: string[]; // e.g., ["customers", "products", "orders", "bookings"]
  dataVolume?: "small" | "medium" | "large" | "unknown";
  currentSystem?: string;
  exportFormat?: "csv" | "excel" | "api" | "database" | "manual" | "unknown";
  notes?: string;
}

/**
 * Success metrics and KPIs
 * How the client will measure project success
 */
export interface SuccessMetric {
  metric: string; // e.g., "Increase online bookings by 30%"
  target?: string; // e.g., "30%"
  timeframe?: string; // e.g., "within 6 months"
  priority: "critical" | "important" | "nice-to-have";
}

/**
 * Discovery trunk data
 * Universal questions asked to all clients regardless of sector
 */
export interface DiscoveryTrunk {
  integrations?: IntegrationRequirement[];
  dataMigration?: DataMigrationRequirement;
  successMetrics?: SuccessMetric[];
  // Extend here for additional universal discovery questions
}

// ============================================================================
// Sector-Specific Branch Types
// ============================================================================

/**
 * Hospitality sector branch data
 * Operational details specific to hospitality businesses
 */
export interface HospitalityBranch {
  bookingModel?: "table" | "rooms" | "events" | "mixed";
  channels?: ("walkins" | "phone" | "online" | "ota")[];
  serviceFlow?: string; // Textarea: service flow / table turns
  posPmsStack?: string; // Textarea: POS / PMS stack today
  menuInventoryComplexity?: string; // Textarea: menu or inventory complexity
  // Extend here for additional hospitality-specific questions
}

/**
 * Retail sector branch data
 * Operational details specific to retail businesses
 */
export interface RetailBranch {
  salesMix?: "in-store" | "online" | "hybrid";
  channels?: ("shopify" | "pos" | "marketplaces" | "social")[];
  inventoryComplexity?: string; // Textarea: SKUs, variants
  fulfillmentOps?: string; // Textarea: 3PL, in-house
  loyaltyCrmSetup?: string; // Textarea: loyalty / CRM setup
  // Extend here for additional retail-specific questions
}

/**
 * Trades sector branch data
 * Operational details specific to trades/construction businesses
 */
export interface TradesBranch {
  jobSchedulingPattern?: "emergency" | "planned" | "projects" | "mixed";
  quoteWorkflow?: ("onsite" | "remote" | "template")[];
  dispatchRoutingTools?: string; // Textarea: dispatch / routing tools
  jobTrackingCompliance?: string; // Textarea: job tracking or compliance needs
  billingPaymentsProcess?: string; // Textarea: billing and payments process
  // Extend here for additional trades-specific questions
}

/**
 * Professional services sector branch data
 * Operational details specific to professional services businesses
 */
export interface ProfessionalServicesBranch {
  engagementModel?: "retainer" | "project" | "mixed";
  salesMotions?: ("inbound" | "outbound" | "referrals")[];
  proposalSowProcess?: string; // Textarea: proposal / SOW process
  deliveryTooling?: string; // Textarea: PM/QA tooling
  reportingClientPortals?: string; // Textarea: reporting / client portals
  // Extend here for additional professional-services-specific questions
}

/**
 * Union type for all sector branches
 * Use this when you need to handle any sector branch
 */
export type SectorBranch =
  | HospitalityBranch
  | RetailBranch
  | TradesBranch
  | ProfessionalServicesBranch;

// ============================================================================
// Discovery Tree Priorities
// ============================================================================

/**
 * Feature priorities
 * Categorizes features by priority level
 */
export interface FeaturePriorities {
  mustHave: string[]; // Critical features that must be included
  niceToHave: string[]; // Features that would be nice but not essential
  future: string[]; // Features to consider for future phases
}

// ============================================================================
// Complete Discovery Tree Structure
// ============================================================================

/**
 * Complete discovery tree data structure
 * Combines trunk (universal), branches (sector-specific), and priorities
 */
export interface DiscoveryTree {
  trunk?: DiscoveryTrunk;
  branches?: {
    hospitality?: HospitalityBranch;
    retail?: RetailBranch;
    trades?: TradesBranch;
    professionalServices?: ProfessionalServicesBranch;
    // Add more sectors as needed
  };
  priorities?: FeaturePriorities;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for POST /api/discovery-tree
 */
export interface DiscoveryTreeUpdateRequest {
  questionnaireResponseId: string | number;
  businessProfile?: Partial<BusinessProfile>;
  discoveryTree?: Partial<DiscoveryTree>;
  goals?: string[]; // Optional: update goals array
  primaryOffers?: string[]; // Optional: update primary offers array
}

/**
 * Response payload for GET /api/discovery-tree
 * Pre-population data for discovery UI
 */
export interface DiscoveryTreePrePopulateResponse {
  client: {
    name: string;
    businessName: string;
    sector: Sector;
  };
  businessProfile: BusinessProfile | null;
  currentStack: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
    sources?: {
      systems?: ("sector" | "audit")[];
      integrations?: ("sector" | "audit")[];
    };
  };
  goals: string[];
  primaryOffers: string[];
  discoveryTree: DiscoveryTree | null;
}

/**
 * Response payload for POST /api/discovery-tree
 * Returns updated record subset
 */
export interface DiscoveryTreeUpdateResponse {
  id: string | number;
  businessProfile: BusinessProfile | null;
  discoveryTree: DiscoveryTree | null;
  goals: string[] | null;
  primaryOffers: string[] | null;
  updatedAt: string;
}
