# Audit TypeScript Types - Design Proposal

## Analysis of Existing Type Patterns

### Pattern 1: Type Organization (`lib/types/discovery.ts`)

**Structure:**
- Clear section comments (`// ============================================================================`)
- Logical grouping (Business Profile → Trunk → Branches → Priorities → API Types)
- API request/response types at the bottom
- Imports shared types (e.g., `Sector` from `questionnaire.ts`)

### Pattern 2: Naming Conventions

**Interfaces:** PascalCase (`BusinessProfile`, `DiscoveryTree`)
**Request Types:** `*Request` suffix (`DiscoveryTreeUpdateRequest`)
**Response Types:** `*Response` suffix (`DiscoveryTreeUpdateResponse`, `DiscoveryTreePrePopulateResponse`)
**Union Types:** PascalCase (`AnnualRevenue`, `EmployeeCount`)

### Pattern 3: Optionality & Nullability

**Required Fields:** No `?` (e.g., `annualRevenue: AnnualRevenue`)
**Optional Fields:** Use `?` (e.g., `notes?: string`)
**Nullable in Responses:** Use `| null` (e.g., `businessProfile: BusinessProfile | null`)
**Arrays:** Can be empty, optional only if whole thing might not exist
**Update Requests:** Use `Partial<>` (e.g., `businessProfile?: Partial<BusinessProfile>`)

### Pattern 4: Date Formats

**ISO 8601 Strings:** All dates/timestamps use `string` type
- `updatedAt: string` in `DiscoveryTreeUpdateResponse`
- `auditDate: string` in `WebsiteAuditResult` ✅ (already correct)

### Pattern 5: Priority/Confidence Enums

**String Unions:** Consistent across types
- `priority: "critical" | "important" | "nice-to-have"` (Discovery)
- `priority: "critical" | "high" | "medium" | "low"` (Audit - needs alignment)

### Pattern 6: Component Integration

**Props:** Use indexed access types for nested structures
```typescript
client: DiscoveryTreePrePopulateResponse["client"];
currentStack: DiscoveryTreePrePopulateResponse["currentStack"];
```

**Nullable Props:** Use `| null` or `| undefined`
```typescript
businessProfile: BusinessProfile | null;
audit?: WebsiteAuditResult;
```

## Proposed Audit Types (Aligned with Patterns)

```typescript
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
  performance: PerformanceMetrics;
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string; // ISO 8601 timestamp
  auditDurationMs: number;
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
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string; // ISO 8601 timestamp
  auditError?: string; // Error message if audit failed
}
```

## Integration with Existing Type System

### 1. Discovery Tree API Integration

**Current:** `GET /api/discovery-tree` returns `DiscoveryTreePrePopulateResponse`

**Enhancement:** Add audit results to pre-populate response:

```typescript
// In lib/types/discovery.ts (future enhancement)
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
  };
  goals: string[];
  primaryOffers: string[];
  discoveryTree: DiscoveryTree | null;
  // Future: Add audit results
  audit?: WebsiteAuditResult; // Optional - may not be completed yet
}
```

**Usage in API:**
```typescript
// app/api/discovery-tree/route.ts
import type { WebsiteAuditResult } from "@/lib/types/audit";

// In GET handler:
const auditResults = response.audit_results as WebsiteAuditResult | null;

return NextResponse.json({
  // ... existing fields
  audit: auditResults || undefined, // Convert null to undefined for optional field
});
```

### 2. Component Integration

**Current:** `SummarySidebar` receives audit as optional prop

```typescript
// components/discovery/SummarySidebar.tsx
import type { WebsiteAuditResult } from "@/lib/types/audit";

interface SummarySidebarProps {
  client: DiscoveryTreePrePopulateResponse["client"];
  businessProfile: BusinessProfile | null;
  currentStack: DiscoveryTreePrePopulateResponse["currentStack"];
  discoveryTree?: DiscoveryTree;
  audit?: WebsiteAuditResult; // Optional - matches pattern
  auditLoading?: boolean;
}
```

**Pattern Match:** ✅ Uses same optionality pattern as `businessProfile: BusinessProfile | null`

### 3. Type Extraction Patterns

**Indexed Access Types** (like discovery types):
```typescript
// Extract nested types using indexed access
type TechStack = WebsiteAuditResult["techStack"];
type Performance = WebsiteAuditResult["performance"];
type Recommendations = WebsiteAuditResult["recommendations"];
```

**Union Types for Enums:**
```typescript
// Consistent with discovery types
type Priority = RecommendationPriority; // "critical" | "high" | "medium" | "low"
type Confidence = TechnologyConfidence; // "high" | "medium" | "low"
```

### 4. API Response Consistency

**Pattern:** Response types include:
- Request identifier (`questionnaireResponseId`)
- Optional data field (`audit?: WebsiteAuditResult`)
- Optional error field (`error?: string`)
- Timestamp fields (`auditCompletedAt?: string`)

**Matches:** `AuditFetchResponse` follows same pattern as `DiscoveryTreePrePopulateResponse`:
- Both include `questionnaireResponseId`
- Both use optional data fields
- Both use `| null` or `| undefined` for nullable data

## Key Design Decisions

### ✅ Aligned with Existing Patterns

1. **Section Organization:** Clear comments, logical grouping ✅
2. **Naming:** PascalCase interfaces, `*Request`/`*Response` suffixes ✅
3. **Optionality:** Required fields not optional, optional fields use `?` ✅
4. **Nullability:** `| null` in responses, `| undefined` in props ✅
5. **Date Formats:** ISO 8601 strings (`string` type) ✅
6. **Priority Levels:** String unions consistent with discovery types ✅
7. **API Responses:** Same structure pattern as discovery API ✅

### ✅ Type Safety

- All nested structures properly typed
- Union types for enums (not string literals)
- Optional fields clearly marked
- No `any` types

### ✅ Future-Proof

- Extensible nested structures
- Optional fields allow gradual enhancement
- Union types can be extended
- No breaking changes needed for additions

## Summary

The proposed audit types:
- ✅ Follow exact same patterns as `lib/types/discovery.ts`
- ✅ Use consistent naming conventions
- ✅ Proper optionality and nullability
- ✅ ISO 8601 date strings
- ✅ Aligned priority/confidence enums
- ✅ API response types match discovery patterns
- ✅ Easy to integrate into existing components
- ✅ Type-safe and future-proof

**Status:** Ready to replace existing `lib/types/audit.ts` with this aligned version.
