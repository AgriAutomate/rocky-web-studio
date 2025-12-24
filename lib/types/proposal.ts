/**
 * Proposal Data Types
 * 
 * Types for proposal PDF generation that map 1:1 with PDF content sections
 */

import type { WebsiteAuditResult } from "./audit";
import type { DiscoveryTree, BusinessProfile } from "./discovery";
import type { Sector } from "./questionnaire";

/**
 * Health Scorecard Section
 * Summary of current website health based on audit results
 */
export interface HealthScorecard {
  overallScore: number; // 0-100
  performanceScore?: number; // 0-100
  seoScore?: number; // 0-100
  technicalScore?: number; // 0-100
  platform?: string; // Detected CMS/platform
  topIssues: string[]; // Top 3-5 critical issues
  recommendations: string[]; // Top 3-5 recommendations
}

/**
 * Project Scope Section
 * What will be built based on discovery tree and priorities
 */
export interface ProjectScope {
  mustHaveFeatures: string[]; // From discovery_tree.priorities.mustHave
  niceToHaveFeatures: string[]; // From discovery_tree.priorities.niceToHave
  futureFeatures: string[]; // From discovery_tree.priorities.future
  integrations: Array<{
    name: string;
    type: string;
    priority: string;
  }>;
  dataMigration?: {
    required: boolean;
    dataTypes?: string[];
    volume?: string;
  };
  successMetrics: Array<{
    metric: string;
    target?: string;
    timeframe?: string;
  }>;
}

/**
 * Investment Section
 * Cost and timeline breakdown
 */
export interface Investment {
  totalCost: number; // AUD
  totalWeeks: number;
  costBreakdown: Array<{
    feature: string;
    cost: number;
    weeks: number;
  }>;
  paymentOptions?: {
    upfront?: number;
    milestones?: Array<{
      milestone: string;
      amount: number;
      trigger: string;
    }>;
  };
}

/**
 * ROI Snapshot Section
 * Projected return on investment calculations
 */
export interface RoiSnapshot {
  estimatedAnnualSavings?: number; // AUD
  estimatedAnnualRevenue?: number; // AUD
  paybackPeriod?: number; // Months
  threeYearROI?: number; // Percentage
  assumptions: string[]; // Key assumptions for ROI calculations
}

/**
 * Current State Analysis
 * Summary of current website and business state
 */
export interface CurrentStateAnalysis {
  businessProfile: BusinessProfile;
  currentStack: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
  };
  websiteInfo?: {
    url?: string;
    platform?: string;
    isAccessible?: boolean;
    loadTime?: number;
  };
  painPoints: string[]; // From questionnaire pain_points
  goals: string[]; // From questionnaire goals
}

/**
 * Proposed Solution Summary
 * High-level overview of the proposed solution
 */
export interface ProposedSolution {
  overview: string; // Executive summary
  keyFeatures: string[]; // Top 5-7 features
  expectedOutcomes: string[]; // What the client will achieve
  timeline: {
    phases?: Array<{
      phase: string;
      duration: string;
      deliverables: string[];
    }>;
    totalDuration: string;
  };
}

/**
 * Complete Proposal Data Structure
 * Maps 1:1 with PDF content sections
 */
export interface ProposalData {
  // Client Information
  client: {
    firstName: string;
    lastName?: string;
    businessName: string;
    email: string;
    phone?: string;
    sector: Sector;
  };

  // Proposal Metadata
  metadata: {
    proposalDate: string; // ISO 8601
    proposalId: string; // questionnaireResponseId
    validUntil?: string; // ISO 8601
    version?: string;
  };

  // PDF Content Sections (1:1 mapping)
  healthScorecard: HealthScorecard;
  currentStateAnalysis: CurrentStateAnalysis;
  projectScope: ProjectScope;
  proposedSolution: ProposedSolution;
  investment: Investment;
  roiSnapshot: RoiSnapshot;

  // Raw Data (for reference/debugging)
  rawData?: {
    auditResults?: WebsiteAuditResult | null;
    discoveryTree?: DiscoveryTree | null;
    businessProfile?: BusinessProfile | null;
  };
}
