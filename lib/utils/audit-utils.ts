/**
 * Website Audit Utilities
 * 
 * Helper functions for URL normalization, text extraction, and analysis
 */

import type {
  WebsiteAuditResult,
  TechStackInfo,
  AuditFetchResponse,
} from "@/lib/types/audit";
import type { IntegrationRequirement } from "@/lib/types/discovery";

/**
 * Normalize URL to standard format
 * - Adds https:// if no protocol
 * - Removes trailing slashes
 * - Converts to lowercase
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid URL provided");
  }

  let normalized = url.trim();

  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, "");

  // Add protocol if missing
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  // Convert to lowercase (except protocol)
  const protocolMatch = normalized.match(/^(https?:\/\/)/i);
  if (protocolMatch && protocolMatch[1]) {
    const protocol = protocolMatch[1];
    normalized = protocol + normalized.slice(protocol.length).toLowerCase();
  }

  return normalized;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extract email addresses from text
 */
export function extractEmail(text: string): string[] {
  if (!text) return [];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  
  // Remove duplicates and normalize
  return [...new Set(matches.map(email => email.toLowerCase()))];
}

/**
 * Extract phone numbers from text (AU format)
 * Supports: 04XX XXX XXX, (07) XXXX XXXX, +61 4XX XXX XXX, etc.
 */
export function extractPhone(text: string): string[] {
  if (!text) return [];

  // Australian phone number patterns
  const patterns = [
    /\+61\s?4\d{2}\s?\d{3}\s?\d{3}/g, // +61 4XX XXX XXX
    /0?4\d{2}\s?\d{3}\s?\d{3}/g, // 04XX XXX XXX or 4XX XXX XXX
    /\(0[2-9]\)\s?\d{4}\s?\d{4}/g, // (0X) XXXX XXXX
    /0[2-9]\s?\d{4}\s?\d{4}/g, // 0X XXXX XXXX
  ];

  const phones: string[] = [];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    phones.push(...matches.map(phone => phone.replace(/\s+/g, " ").trim()));
  });

  // Remove duplicates
  return [...new Set(phones)];
}

/**
 * Extract year from text (for copyright, last updated, etc.)
 */
export function extractYear(text: string): number | null {
  if (!text) return null;

  // Look for 4-digit years (1900-2099)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    if (year >= 1900 && year <= 2099) {
      return year;
    }
  }

  return null;
}

/**
 * Calculate overall health score (0-100)
 * Based on performance, SEO, and technical metrics
 */
export function calculateOverallHealthScore(audit: WebsiteAuditResult): number {
  let score = 0;
  let weight = 0;

  // Performance score (40% weight) - optional field
  if (audit.performance) {
    if (audit.performance.overallScore !== undefined) {
      score += audit.performance.overallScore * 0.4;
      weight += 0.4;
    } else if (audit.performance.mobileScore !== undefined) {
      score += audit.performance.mobileScore * 0.4;
      weight += 0.4;
    }
  }

  // SEO score (30% weight)
  const seoScore = calculateSeoScore(audit.seo);
  score += seoScore * 0.3;
  weight += 0.3;

  // Technical score (30% weight)
  const technicalScore = calculateTechnicalScore(audit);
  score += technicalScore * 0.3;
  weight += 0.3;

  // Normalize if weights don't add up to 1.0
  return weight > 0 ? Math.round(score / weight) : 0;
}

/**
 * Calculate SEO score (0-100)
 */
function calculateSeoScore(seo: WebsiteAuditResult["seo"]): number {
  let score = 0;
  let maxScore = 0;

  // Title tag (10 points)
  maxScore += 10;
  if (seo.hasTitleTag) {
    score += 5;
    if (seo.titleLength && seo.titleLength >= 30 && seo.titleLength <= 60) {
      score += 5; // Optimal length
    }
  }

  // Meta description (10 points)
  maxScore += 10;
  if (seo.hasMetaDescription) {
    score += 5;
    if (seo.descriptionLength && seo.descriptionLength >= 120 && seo.descriptionLength <= 160) {
      score += 5; // Optimal length
    }
  }

  // Open Graph / Social (10 points)
  maxScore += 10;
  if (seo.hasOpenGraphTags || seo.hasTwitterCards) {
    score += 10;
  }

  // Structured data (10 points)
  maxScore += 10;
  if (seo.hasStructuredData) {
    score += 10;
  }

  // Sitemap (10 points)
  maxScore += 10;
  if (seo.hasSitemap) {
    score += 10;
  }

  // Robots.txt (5 points)
  maxScore += 5;
  if (seo.hasRobotsTxt) {
    score += 5;
  }

  // HTTPS (15 points)
  maxScore += 15;
  if (seo.httpsEnabled) {
    score += 15;
  }

  // Mobile friendly (15 points)
  maxScore += 15;
  if (seo.mobileFriendly) {
    score += 15;
  }

  // Image alt tags (15 points)
  maxScore += 15;
  if (seo.imageAltTags) {
    const altTagRatio = seo.imageAltTags.total > 0
      ? seo.imageAltTags.withAlt / seo.imageAltTags.total
      : 1;
    score += Math.round(15 * altTagRatio);
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calculate technical score (0-100)
 */
function calculateTechnicalScore(audit: WebsiteAuditResult): number {
  let score = 0;
  let maxScore = 0;

  // Website accessible (30 points)
  maxScore += 30;
  if (audit.websiteInfo.isAccessible) {
    score += 30;
  }

  // HTTPS enabled (20 points)
  maxScore += 20;
  if (audit.seo.httpsEnabled) {
    score += 20;
  }

  // Modern tech stack (20 points)
  maxScore += 20;
  if (audit.techStack.cms || audit.techStack.frameworks?.length) {
    score += 20;
  }

  // Fast load time (15 points)
  maxScore += 15;
  if (audit.websiteInfo.loadTimeMs && audit.websiteInfo.loadTimeMs < 3000) {
    score += 15;
  } else if (audit.websiteInfo.loadTimeMs && audit.websiteInfo.loadTimeMs < 5000) {
    score += 10;
  }

  // Has contact info (15 points)
  maxScore += 15;
  if (audit.metadata.contactInfo) {
    const hasEmail = (audit.metadata.contactInfo.emails?.length ?? 0) > 0;
    const hasPhone = (audit.metadata.contactInfo.phones?.length ?? 0) > 0;
    if (hasEmail && hasPhone) {
      score += 15;
    } else if (hasEmail || hasPhone) {
      score += 8;
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Generate client-friendly summary from audit results
 */
export function getSummaryForClient(audit: WebsiteAuditResult): {
  platform: string;
  performanceScore: number;
  mobileScore: number;
  topIssue: string;
  socialsFound: number;
} {
  const platform = audit.techStack.cms?.name || 
                   audit.techStack.frameworks?.[0]?.name || 
                   "Unknown";

  const performanceScore = audit.performance?.overallScore || 
                          audit.performance?.desktopScore || 
                          audit.performance?.mobileScore || 
                          0;

  const mobileScore = audit.performance?.mobileScore || 0;

  // Count social profiles
  const socialsFound = audit.metadata.socialProfiles
    ? Object.keys(audit.metadata.socialProfiles).filter(
        key => key !== "other" && audit.metadata.socialProfiles?.[key as keyof typeof audit.metadata.socialProfiles]
      ).length + (audit.metadata.socialProfiles.other?.length || 0)
    : 0;

  // Find top priority recommendation
  const topRecommendation = audit.recommendations
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })[0];

  const topIssue = topRecommendation?.title || "No critical issues found";

  return {
    platform,
    performanceScore,
    mobileScore,
    topIssue,
    socialsFound,
  };
}

// ============================================================================
// Current Stack Merge Utilities
// ============================================================================

/**
 * Normalize system/integration name for deduplication
 * - Convert to lowercase
 * - Remove common suffixes (" POS", " CMS", " Platform")
 * - Handle common variations
 * 
 * Examples:
 * - "Square POS" → "square"
 * - "WordPress" → "wordpress"
 * - "Google Analytics" → "google analytics"
 * - "Stripe" → "stripe"
 */
export function normalizeSystemName(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  let normalized = name.trim().toLowerCase();

  // Remove common suffixes
  normalized = normalized.replace(/\s+(pos|cms|platform|system|software|tool)$/i, "");

  // Handle common variations
  // GA4 → google analytics (if we detect it's Google Analytics)
  if (normalized === "ga4" || normalized === "google analytics 4") {
    normalized = "google analytics";
  }

  return normalized;
}

/**
 * Deduplicate systems/integrations array while preserving order
 * Uses normalized names for comparison but returns original names
 */
export function deduplicateSystems(
  systems: string[]
): { systems: string[]; normalized: string[] } {
  const seen = new Set<string>();
  const deduplicated: string[] = [];
  const normalized: string[] = [];

  for (const system of systems) {
    const normalizedName = normalizeSystemName(system);
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      deduplicated.push(system);
      normalized.push(normalizedName);
    }
  }

  return { systems: deduplicated, normalized };
}

/**
 * Extract systems and integrations from audit tech stack
 * 
 * Systems: CMS and e-commerce platforms (confidence ≥ "medium")
 * Integrations: Payment processors and analytics (all confidence levels)
 */
export function extractAuditTechStack(
  techStack?: TechStackInfo
): {
  systems: string[];
  integrations: string[];
  allTechnologies: string[]; // For notes
} {
  const systems: string[] = [];
  const integrations: string[] = [];
  const allTechnologies: string[] = [];

  if (!techStack) {
    return { systems, integrations, allTechnologies };
  }

  // Extract CMS (systems) - only if confidence ≥ "medium"
  if (techStack.cms && techStack.cms.confidence !== "low") {
    systems.push(techStack.cms.name);
    allTechnologies.push(techStack.cms.name);
  }

  // Extract e-commerce (systems) - only if confidence ≥ "medium"
  if (techStack.ecommerce && techStack.ecommerce.confidence !== "low") {
    systems.push(techStack.ecommerce.name);
    allTechnologies.push(techStack.ecommerce.name);
  }

  // Extract payment processors (integrations) - all confidence levels
  if (techStack.paymentProcessors) {
    for (const processor of techStack.paymentProcessors) {
      integrations.push(processor.name);
      allTechnologies.push(processor.name);
    }
  }

  // Extract analytics (integrations) - all confidence levels
  if (techStack.analytics) {
    for (const analytics of techStack.analytics) {
      integrations.push(analytics.name);
      allTechnologies.push(analytics.name);
    }
  }

  // If no systems found but we have low confidence CMS/ecommerce, include them
  // (better than nothing)
  if (systems.length === 0) {
    if (techStack.cms) {
      systems.push(techStack.cms.name);
      allTechnologies.push(techStack.cms.name);
    }
    if (techStack.ecommerce) {
      systems.push(techStack.ecommerce.name);
      allTechnologies.push(techStack.ecommerce.name);
    }
  }

  return { systems, integrations, allTechnologies };
}

/**
 * Derive integration requirements from audit tech stack
 * 
 * Maps audit-detected technologies to IntegrationRequirement objects:
 * - CMS and e-commerce → systemType: "other", priority: "important"
 * - Payment processors → systemType: "payment", priority: "critical"
 * - Analytics → systemType: "other", priority: "nice-to-have"
 * 
 * Note: User-edited integrations always take precedence over audit-derived ones.
 * Audit-based integrations are just a starting point, not authoritative.
 */
export function deriveIntegrationsFromAudit(
  auditResults: WebsiteAuditResult
): IntegrationRequirement[] {
  const integrations: IntegrationRequirement[] = [];
  const techStack = auditResults.techStack;

  if (!techStack) {
    return integrations;
  }

  // CMS Platforms: systemType "other", priority "important", confidence ≥ "medium"
  if (
    techStack.cms &&
    (techStack.cms.confidence === "high" ||
      techStack.cms.confidence === "medium")
  ) {
    integrations.push({
      systemName: techStack.cms.name,
      systemType: "other",
      integrationType: "api",
      priority: "important",
      notes: "Detected from website audit",
    });
  }

  // E-commerce Platforms: systemType "other", priority "important", confidence ≥ "medium"
  // Deduplicate: if same as CMS (e.g., Shopify), skip
  if (
    techStack.ecommerce &&
    techStack.ecommerce.name !== techStack.cms?.name &&
    (techStack.ecommerce.confidence === "high" ||
      techStack.ecommerce.confidence === "medium")
  ) {
    integrations.push({
      systemName: techStack.ecommerce.name,
      systemType: "other",
      integrationType: "api",
      priority: "important",
      notes: "Detected from website audit",
    });
  }

  // Payment Processors: systemType "payment", priority "critical", all confidence levels
  if (techStack.paymentProcessors) {
    for (const processor of techStack.paymentProcessors) {
      integrations.push({
        systemName: processor.name,
        systemType: "payment",
        integrationType: "api",
        priority: "critical",
        notes: "Detected from website audit",
      });
    }
  }

  // Analytics Platforms: systemType "other", priority "nice-to-have", all confidence levels
  if (techStack.analytics) {
    for (const analytics of techStack.analytics) {
      integrations.push({
        systemName: analytics.name,
        systemType: "other",
        integrationType: "api",
        priority: "nice-to-have",
        notes: "Detected from website audit",
      });
    }
  }

  return integrations;
}

/**
 * Merge audit-derived integrations with existing integrations
 * 
 * Smart merge strategy:
 * - Starts with existing integrations (preserves user edits)
 * - Adds audit-derived integrations that don't already exist
 * - Deduplicates by systemName (case-insensitive)
 * - User-edited integrations always take precedence
 * 
 * Note: Audit-based integrations are just a starting point, not authoritative.
 * If a user has already added or modified an integration, their version is preserved.
 */
export function mergeIntegrations(
  existing: IntegrationRequirement[],
  auditDerived: IntegrationRequirement[]
): IntegrationRequirement[] {
  // Start with existing integrations (preserve user edits)
  const merged = [...existing];

  // Normalize existing system names for comparison
  const normalizedExisting = existing.map((i) =>
    i.systemName.toLowerCase().trim()
  );

  // Add audit-derived integrations that don't already exist
  for (const auditIntegration of auditDerived) {
    const normalizedAuditName = auditIntegration.systemName.toLowerCase().trim();

    // Check if an integration with the same systemName (case-insensitive) already exists
    const exists = normalizedExisting.includes(normalizedAuditName);

    if (!exists) {
      // Doesn't exist - add it
      merged.push(auditIntegration);
      normalizedExisting.push(normalizedAuditName); // Track for deduplication
    }
    // If exists, keep existing (user may have edited priority, notes, systemType, etc.)
  }

  return merged;
}

// ============================================================================
// Audit Status Derivation Utilities
// ============================================================================

/**
 * UI-level audit status enum
 * Maps to explicit states for AuditCard component
 */
export type AuditStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "SUCCESS_FULL"
  | "SUCCESS_PARTIAL"
  | "FAILED"
  | "FAILED_WITH_PARTIAL_DATA";

/**
 * Derive explicit AuditStatus from API response
 * 
 * Algorithm:
 * 1. Check website_url → NOT_REQUESTED if null/empty
 * 2. Check audit_status → PENDING if "pending"/"running"
 * 3. Check audit_error → FAILED or FAILED_WITH_PARTIAL_DATA
 * 4. Check audit_completed_at + audit_results → SUCCESS_FULL or SUCCESS_PARTIAL
 * 5. Default → PENDING
 */
export function deriveAuditStatus(
  auditData: AuditFetchResponse
): {
  status: AuditStatus;
  audit?: WebsiteAuditResult;
  errorMessage?: string;
  warnings?: string[];
} {
  // Step 1: Check if audit was requested
  if (!auditData.websiteUrl || auditData.websiteUrl.trim() === "") {
    return { status: "NOT_REQUESTED" };
  }

  // Step 2: Check explicit status (if available)
  if (
    auditData.status === "pending" ||
    auditData.status === "running"
  ) {
    return { status: "PENDING" };
  }

  // Step 3: Check for errors
  if (auditData.error || auditData.auditError || auditData.status === "failed") {
    const errorMessage = auditData.error || auditData.auditError || "Audit failed";
    
    if (auditData.audit) {
      // Failed but has partial data
      return {
        status: "FAILED_WITH_PARTIAL_DATA",
        audit: auditData.audit,
        errorMessage,
        warnings: auditData.warnings || auditData.audit.warnings,
      };
    } else {
      // Failed with no data
      return {
        status: "FAILED",
        errorMessage,
      };
    }
  }

  // Step 4: Check for completed audit
  if (auditData.auditCompletedAt && auditData.audit) {
    const hasErrors =
      auditData.audit.errors &&
      Object.keys(auditData.audit.errors).length > 0;
    const hasWarnings =
      (auditData.warnings && auditData.warnings.length > 0) ||
      (auditData.audit.warnings && auditData.audit.warnings.length > 0);

    if (hasErrors || hasWarnings) {
      return {
        status: "SUCCESS_PARTIAL",
        audit: auditData.audit,
        warnings: auditData.warnings || auditData.audit.warnings,
      };
    } else {
      return {
        status: "SUCCESS_FULL",
        audit: auditData.audit,
      };
    }
  }

  // Step 5: Default to pending
  return { status: "PENDING" };
}
