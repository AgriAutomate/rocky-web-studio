# Audit Results JSONB Column - Final Design Proposal

## Analysis of Existing JSONB Patterns

### Pattern 1: Structured Objects (business_profile, discovery_tree)
```typescript
// TypeScript interface
interface BusinessProfile {
  annualRevenue: AnnualRevenue;
  employeeCount: EmployeeCount;
  yearsInBusiness: YearsInBusiness;
  digitalMaturity: DigitalMaturityLevel;
}

// Database JSONB matches interface exactly
{
  "annualRevenue": "0-100k",
  "employeeCount": "1-5",
  "yearsInBusiness": "0-2",
  "digitalMaturity": "basic"
}
```

**Key:** Database JSONB structure matches TypeScript interface exactly.

### Pattern 2: Flat Key-Value (sector_specific_data)
```typescript
// Flexible structure - question IDs as keys
{
  "h6": "table",
  "h7": ["walkins", "phone"],
  "h9": "Using Square POS"
}
```

**Key:** Flexible structure for variable question answers.

### Pattern 3: Simple Arrays (goals, primary_offers)
```typescript
// Simple string arrays
["reduce-operating-costs", "increase-online-visibility"]
```

**Key:** Simple arrays for multi-select values.

## Proposed audit_results Structure

### Design Decision: Follow Pattern 1 (Structured Object)

**Rationale:**
- `audit_results` is a complete, structured dataset (like `discovery_tree`)
- Matches TypeScript `WebsiteAuditResult` interface exactly
- Enables type-safe consumption
- Consistent with `business_profile` and `discovery_tree` patterns

### JSON Structure (Matches WebsiteAuditResult Interface)

```json
{
  "websiteInfo": {
    "url": "https://example.com",
    "finalUrl": "https://example.com",
    "title": "Example Business",
    "description": "A great business",
    "isAccessible": true,
    "httpStatus": 200,
    "contentType": "text/html",
    "contentLength": 125000,
    "loadTimeMs": 1200
  },
  "techStack": {
    "cms": {
      "name": "WordPress",
      "confidence": "high",
      "detectionMethod": "content-analysis"
    },
    "analytics": [
      {
        "name": "Google Analytics",
        "confidence": "high",
        "detectionMethod": "script"
      }
    ],
    "paymentProcessors": [
      {
        "name": "Stripe",
        "confidence": "high",
        "detectionMethod": "script"
      }
    ],
    "frameworks": [
      {
        "name": "React",
        "confidence": "medium",
        "detectionMethod": "script"
      }
    ],
    "hosting": {
      "name": "Vercel",
      "confidence": "medium",
      "detectionMethod": "header"
    }
  },
  "performance": {
    "mobileScore": 65,
    "desktopScore": 80,
    "overallScore": 73,
    "firstContentfulPaint": 1200,
    "largestContentfulPaint": 2500,
    "totalBlockingTime": 300,
    "cumulativeLayoutShift": 0.1,
    "speedIndex": 3200,
    "timeToInteractive": 3800
  },
  "seo": {
    "hasTitleTag": true,
    "titleLength": 45,
    "hasMetaDescription": true,
    "descriptionLength": 155,
    "hasOpenGraphTags": true,
    "hasTwitterCards": false,
    "hasStructuredData": true,
    "hasSitemap": true,
    "hasRobotsTxt": true,
    "h1Count": 1,
    "h2Count": 5,
    "imageAltTags": {
      "total": 20,
      "withAlt": 18,
      "withoutAlt": 2
    },
    "mobileFriendly": true,
    "httpsEnabled": true,
    "canonicalUrl": "https://example.com"
  },
  "metadata": {
    "title": "Example Business",
    "description": "A great business",
    "keywords": ["business", "services"],
    "language": "en",
    "charset": "UTF-8",
    "socialProfiles": {
      "facebook": {
        "platform": "Facebook",
        "url": "https://facebook.com/example"
      },
      "instagram": {
        "platform": "Instagram",
        "url": "https://instagram.com/example",
        "username": "example"
      }
    },
    "contactInfo": {
      "emails": ["info@example.com"],
      "phones": ["0412345678"]
    }
  },
  "contentAnalysis": {
    "wordCount": 2500,
    "hasBlog": true,
    "hasEcommerce": false,
    "hasContactForm": true,
    "hasBookingSystem": false,
    "hasLiveChat": true,
    "hasNewsletter": true,
    "pageCount": 12,
    "lastUpdated": "2024-12-01"
  },
  "recommendations": [
    {
      "category": "performance",
      "priority": "high",
      "title": "Poor Mobile Performance",
      "description": "Mobile score is 65/100. This significantly impacts user experience and SEO rankings.",
      "impact": "Improving mobile performance can increase conversions by 20-30%",
      "effort": "high"
    },
    {
      "category": "seo",
      "priority": "critical",
      "title": "Missing Title Tag",
      "description": "Your website doesn't have a title tag. This is essential for SEO and browser tabs.",
      "impact": "Title tags are the #1 ranking factor for search engines",
      "effort": "low"
    }
  ],
  "auditDate": "2025-01-22T10:30:15.123Z",
  "auditDurationMs": 12500
}
```

## Database Column Definition

### Migration (Already Created - Verified)

```sql
-- Audit results stored as JSONB
-- Contains: WebsiteInfo, TechStackInfo, PerformanceMetrics, SEO metrics, etc.
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_results JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_results IS 
  'Complete website audit results including tech stack, performance, SEO, and recommendations';

-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_results
  ON public.questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
```

### Index Strategy

**GIN Index with Partial Filter:**
- ✅ Enables efficient queries on nested JSONB fields
- ✅ Partial index (`WHERE audit_results IS NOT NULL`) - smaller, faster
- ✅ Consistent with other JSONB columns (`sector_specific_data`, `business_profile`, `discovery_tree`)

**Query Examples Enabled:**
```sql
-- Find WordPress sites
WHERE audit_results->'techStack'->'cms'->>'name' = 'WordPress'

-- Find sites with poor mobile performance
WHERE (audit_results->'performance'->>'mobileScore')::int < 50

-- Find sites with critical recommendations
WHERE audit_results->'recommendations' @> '[{"priority": "critical"}]'

-- Find sites using Stripe
WHERE audit_results->'techStack'->'paymentProcessors' @> '[{"name": "Stripe"}]'
```

## Consistency Checklist

### ✅ Matches Existing Patterns

1. **Nullable Column**: `DEFAULT NULL` ✅
2. **GIN Index**: Same as other JSONB columns ✅
3. **Partial Index**: `WHERE audit_results IS NOT NULL` ✅
4. **Comment**: Descriptive comment explaining structure ✅
5. **TypeScript Interface Match**: Matches `WebsiteAuditResult` exactly ✅
6. **Idempotent Migration**: Uses `IF NOT EXISTS` ✅
7. **Migration Style**: Follows same format as `20250122_add_discovery_tree_columns.sql` ✅

### ✅ TypeScript Consumption

```typescript
// Fetch from database
const { data } = await supabase
  .from("questionnaire_responses")
  .select("audit_results")
  .eq("id", responseId)
  .single();

// Type assertion (safe - structure matches interface)
const audit: WebsiteAuditResult = data.audit_results;

// Type-safe access
const platform = audit.techStack.cms?.name; // string | undefined
const score = audit.performance.mobileScore; // number | undefined
const recommendations = audit.recommendations; // Recommendation[]
```

## V1 Scope (Minimal but Complete)

### Included:
- ✅ Website info (URL, title, accessibility)
- ✅ Tech stack (CMS, analytics, payment processors)
- ✅ Performance metrics (mobile/desktop scores, Core Web Vitals)
- ✅ SEO metrics (title tags, meta descriptions, structured data)
- ✅ Metadata (social profiles, contact info)
- ✅ Content analysis (features detected)
- ✅ Recommendations (prioritized improvements)
- ✅ Audit metadata (date, duration)

### Not Included (Future):
- Historical tracking (multiple audits over time)
- Comparison data (industry averages, percentiles)
- Additional tech detection (security, monitoring tools)
- Accessibility audit results
- Security audit results

**Rationale:** V1 focuses on core website analysis needed for project planning. Future enhancements can extend the structure without migration.

## Future Extensibility

### Adding Fields (No Migration Needed)

```typescript
// Future: Add accessibility audit
interface WebsiteAuditResult {
  // ... existing fields
  accessibility?: AccessibilityMetrics; // New optional field
}

// Future: Add historical tracking
interface WebsiteAuditResult {
  // ... existing fields
  auditHistory?: AuditSnapshot[]; // New optional field
}
```

**Key:** JSONB allows schema evolution without migrations - just update TypeScript types.

## Summary

### Column Definition ✅
```sql
audit_results JSONB DEFAULT NULL
```

### Index ✅
```sql
CREATE INDEX idx_questionnaire_responses_audit_results
  ON questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
```

### Structure ✅
- Matches `WebsiteAuditResult` TypeScript interface exactly
- Follows Pattern 1 (structured object like `business_profile` and `discovery_tree`)
- Nested, structured, type-safe
- Future-proof (extensible without migrations)

### Consistency ✅
- ✅ Nullable like other JSONB columns
- ✅ GIN index with partial filter like other JSONB columns
- ✅ Comment explaining structure
- ✅ Idempotent migration
- ✅ Matches TypeScript interface
- ✅ Follows existing migration style

**Status:** ✅ Migration already created and matches this design perfectly!
