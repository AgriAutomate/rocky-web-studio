/**
 * Website Audit Type Definitions
 * 
 * Types for the automated website audit system that analyzes client websites
 * and stores results for use in discovery tree and project planning.
 * 
 * These types follow the same patterns as lib/types/discovery.ts:
 * - Clear section organization
 * - Consistent naming conventions
 * - Proper optionality and nullability
 * - ISO 8601 date strings
 */

// ============================================================================
// Core Audit Result Types
// ============================================================================

/**
 * Complete website audit result
 * Contains all information gathered from the audit
 * 
 * Stored in database as JSONB in questionnaire_responses.audit_results
 */
export interface WebsiteAuditResult {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance?: PerformanceMetrics; // Optional for partial audits
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string; // ISO 8601 timestamp
  auditDurationMs: number;
  errors?: Record<string, string>; // Partial failure errors by category
  warnings?: string[]; // Warnings about low confidence or missing data
}

/**
 * Basic website information
 * Captures fundamental website accessibility and metadata
 */
export interface WebsiteInfo {
  url: string;
  finalUrl?: string; // After redirects
  title?: string;
  description?: string;
  isAccessible: boolean;
  httpStatus?: number;
  contentType?: string;
  contentLength?: number;
  loadTimeMs?: number;
}

// ============================================================================
// Technology Stack Detection Types
// ============================================================================

/**
 * Technology stack detection results
 * Detected technologies organized by category
 */
export interface TechStackInfo {
  cms?: DetectedTechnology;
  ecommerce?: DetectedTechnology;
  analytics?: DetectedTechnology[];
  paymentProcessors?: DetectedTechnology[];
  hosting?: DetectedTechnology;
  cdn?: DetectedTechnology;
  frameworks?: DetectedTechnology[];
  languages?: string[];
  otherTechnologies?: DetectedTechnology[];
}

/**
 * Detected technology with confidence level
 * Represents a single technology detection result
 */
export interface DetectedTechnology {
  name: string;
  version?: string;
  confidence: TechnologyConfidence;
  detectionMethod: TechnologyDetectionMethod;
}

/**
 * Confidence level for technology detection
 */
export type TechnologyConfidence = "high" | "medium" | "low";

/**
 * Method used to detect the technology
 */
export type TechnologyDetectionMethod =
  | "meta-tag"
  | "script"
  | "header"
  | "url-pattern"
  | "content-analysis";

// ============================================================================
// Performance Metrics Types
// ============================================================================

/**
 * Performance metrics from Google PageSpeed Insights API
 * Core Web Vitals and performance scores
 */
export interface PerformanceMetrics {
  mobileScore?: number; // 0-100
  desktopScore?: number; // 0-100
  firstContentfulPaint?: number; // ms
  largestContentfulPaint?: number; // ms
  totalBlockingTime?: number; // ms
  cumulativeLayoutShift?: number;
  speedIndex?: number; // ms
  timeToInteractive?: number; // ms
  overallScore?: number; // Calculated average of mobile/desktop
}

// ============================================================================
// SEO Metrics Types
// ============================================================================

/**
 * SEO metrics and analysis
 * Basic on-page SEO factors
 */
export interface SeoMetrics {
  hasTitleTag: boolean;
  titleLength?: number;
  hasMetaDescription: boolean;
  descriptionLength?: number;
  hasOpenGraphTags: boolean;
  hasTwitterCards: boolean;
  hasStructuredData: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  h1Count?: number;
  h2Count?: number;
  imageAltTags?: ImageAltTagStats;
  mobileFriendly: boolean;
  httpsEnabled: boolean;
  canonicalUrl?: string;
}

/**
 * Image alt tag statistics
 */
export interface ImageAltTagStats {
  total: number;
  withAlt: number;
  withoutAlt: number;
}

// ============================================================================
// Site Metadata Types
// ============================================================================

/**
 * Site metadata extracted from HTML
 * Social profiles, contact info, and basic meta tags
 */
export interface SiteMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  language?: string;
  charset?: string;
  viewport?: string;
  themeColor?: string;
  socialProfiles?: SocialProfiles;
  contactInfo?: ContactInfo;
}

/**
 * Social media profiles found on the website
 */
export interface SocialProfiles {
  facebook?: SocialProfile;
  twitter?: SocialProfile;
  instagram?: SocialProfile;
  linkedin?: SocialProfile;
  youtube?: SocialProfile;
  other?: SocialProfile[];
}

/**
 * Individual social media profile
 */
export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
}

/**
 * Contact information extracted from website
 */
export interface ContactInfo {
  emails?: string[];
  phones?: string[];
}

// ============================================================================
// Content Analysis Types
// ============================================================================

/**
 * Content analysis results
 * Features and characteristics detected on the website
 */
export interface ContentAnalysis {
  wordCount?: number;
  hasBlog?: boolean;
  hasEcommerce?: boolean;
  hasContactForm?: boolean;
  hasBookingSystem?: boolean;
  hasLiveChat?: boolean;
  hasNewsletter?: boolean;
  pageCount?: number; // Estimated from sitemap or navigation
  lastUpdated?: string; // ISO 8601 date from meta tags or sitemap
}

// ============================================================================
// Recommendation Types
// ============================================================================

/**
 * Recommendation for website improvement
 * Prioritized suggestions based on audit findings
 */
export interface Recommendation {
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  impact?: string; // Expected impact if implemented
  effort?: RecommendationEffort; // Implementation effort
}

/**
 * Category of recommendation
 */
export type RecommendationCategory =
  | "performance"
  | "seo"
  | "security"
  | "accessibility"
  | "mobile"
  | "content"
  | "technical";

/**
 * Priority level for recommendation
 * Aligned with discovery tree priority levels where applicable
 */
export type RecommendationPriority = "critical" | "high" | "medium" | "low";

/**
 * Implementation effort required
 */
export type RecommendationEffort = "low" | "medium" | "high";

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for POST /api/audit-website
 * Triggers an audit for a questionnaire response
 */
export interface AuditRequest {
  questionnaireResponseId: string | number;
  websiteUrl: string;
}

/**
 * Response from POST /api/audit-website
 * Confirms audit has been triggered (fire-and-forget)
 */
export interface AuditResponse {
  success: boolean;
  questionnaireResponseId: string | number;
  message: string;
  auditStartedAt?: string; // ISO 8601 timestamp
}

/**
 * Response from GET /api/audit-website/get
 * Returns stored audit results or error information
 * 
 * Follows same pattern as DiscoveryTreePrePopulateResponse:
 * - Includes questionnaireResponseId
 * - Nullable audit data (audit?: WebsiteAuditResult)
 * - Separate error field for failures
 * - Timestamp fields for tracking
 */
export interface AuditFetchResponse {
  questionnaireResponseId: string | number;
  status?: "not_requested" | "pending" | "running" | "completed" | "failed";
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string; // ISO 8601 timestamp
  auditError?: string; // Error message if audit failed
  websiteUrl?: string; // Website URL for state determination
  message?: string; // Status message for UI display
  warnings?: string[]; // Warnings from audit_results.warnings (for partial states)
  cached?: true; // Set to true when returning cached result from POST
}
