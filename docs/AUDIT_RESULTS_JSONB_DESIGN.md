# Audit Results JSONB Column Design

## Existing JSONB Column Patterns

### 1. **sector_specific_data** (Flat Object)
```json
{
  "h6": "table",
  "h7": ["walkins", "phone", "online"],
  "h8": "Average 2 table turns per night",
  "h9": "Using Square POS and ResDiary",
  "h10": "Menu changes weekly, ~50 items"
}
```
**Pattern:** Flat key-value structure, question IDs as keys
**Type:** `Record<string, any>` (flexible)

### 2. **business_profile** (Structured Object)
```json
{
  "annualRevenue": "0-100k",
  "employeeCount": "1-5",
  "yearsInBusiness": "0-2",
  "digitalMaturity": "basic"
}
```
**Pattern:** Matches TypeScript interface exactly
**Type:** `BusinessProfile` interface

### 3. **discovery_tree** (Nested Structured Object)
```json
{
  "trunk": {
    "integrations": [...],
    "dataMigration": {...},
    "successMetrics": [...]
  },
  "branches": {
    "hospitality": {...}
  },
  "priorities": {
    "mustHave": [...],
    "niceToHave": [...],
    "future": [...]
  }
}
```
**Pattern:** Nested structure matching TypeScript interface
**Type:** `DiscoveryTree` interface

### 4. **goals** / **primary_offers** (Simple Arrays)
```json
["reduce-operating-costs", "increase-online-visibility"]
```
**Pattern:** Simple string arrays
**Type:** `string[]`

## Proposed audit_results Structure

### Design Decision: Match TypeScript Interface Exactly

Following the pattern of `business_profile` and `discovery_tree`, `audit_results` should match the `WebsiteAuditResult` TypeScript interface exactly.

### JSON Structure

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
    ]
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
      "description": "Mobile score is 65/100...",
      "impact": "Improving mobile performance can increase conversions by 20-30%",
      "effort": "high"
    }
  ],
  "auditDate": "2025-01-22T10:30:15.123Z",
  "auditDurationMs": 12500
}
```

### TypeScript Type Mapping

The JSON structure matches `WebsiteAuditResult` interface exactly:

```typescript
interface WebsiteAuditResult {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance: PerformanceMetrics;
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string; // ISO 8601
  auditDurationMs: number;
}
```

## Database Column Definition

### Migration SQL

```sql
-- Website audit results
-- Stores complete website audit data including tech stack, performance, SEO, and recommendations
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_results JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_results IS 
  'Complete website audit results: tech stack, performance metrics, SEO analysis, content analysis, and recommendations';

-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_results
  ON public.questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
```

### Index Strategy

**GIN Index:**
- Enables efficient queries on nested JSONB fields
- Useful for queries like:
  - `WHERE audit_results->>'techStack'->>'cms'->>'name' = 'WordPress'`
  - `WHERE audit_results->'performance'->>'mobileScore' > 50`
  - `WHERE audit_results->'recommendations' @> '[{"priority": "critical"}]'`

**Partial Index (`WHERE audit_results IS NOT NULL`):**
- Only indexes rows with audit data
- Smaller index size
- Faster queries on non-null audits

## Consistency with Existing Patterns

### ✅ Matches Existing Patterns

1. **Nullable Column**: Like all other JSONB columns (`DEFAULT NULL`)
2. **GIN Index**: Same as `sector_specific_data`, `business_profile`, `discovery_tree`
3. **Comment**: Descriptive comment explaining structure
4. **TypeScript Interface Match**: Like `business_profile` and `discovery_tree`
5. **Idempotent Migration**: Uses `IF NOT EXISTS`

### ✅ TypeScript Consumption

```typescript
// Fetch from database
const { data } = await supabase
  .from("questionnaire_responses")
  .select("audit_results")
  .eq("id", responseId)
  .single();

// Type assertion (safe because structure matches interface)
const audit: WebsiteAuditResult = data.audit_results;

// Use typed data
const platform = audit.techStack.cms?.name;
const score = audit.performance.mobileScore;
```

## Query Examples

### Find all WordPress sites
```sql
SELECT id, business_name, audit_results->'techStack'->'cms'->>'name' as cms
FROM questionnaire_responses
WHERE audit_results->'techStack'->'cms'->>'name' = 'WordPress';
```

### Find sites with poor performance
```sql
SELECT id, business_name, audit_results->'performance'->>'mobileScore' as score
FROM questionnaire_responses
WHERE (audit_results->'performance'->>'mobileScore')::int < 50;
```

### Find sites with critical recommendations
```sql
SELECT id, business_name, audit_results->'recommendations'
FROM questionnaire_responses
WHERE audit_results->'recommendations' @> '[{"priority": "critical"}]';
```

## Future-Proofing

### V1 Structure (Current)
- Complete but minimal
- All fields optional where appropriate
- Extensible nested structure

### Future Extensions (No Schema Changes Needed)

1. **Add more tech stack fields:**
   ```json
   "techStack": {
     "cms": {...},
     "security": [...],  // New field
     "monitoring": [...]  // New field
   }
   ```

2. **Add historical tracking:**
   ```json
   {
     "auditDate": "2025-01-22T10:30:15Z",
     "auditHistory": [  // New field
       { "date": "2025-01-15T...", "mobileScore": 60 },
       { "date": "2025-01-22T...", "mobileScore": 65 }
     ]
   }
   ```

3. **Add comparison data:**
   ```json
   {
     "performance": {...},
     "performanceComparison": {  // New field
       "industryAverage": 72,
       "percentile": 45
     }
   }
   ```

**Key:** JSONB allows adding fields without migration - just update TypeScript types and code.

## Summary

### Column Definition
```sql
audit_results JSONB DEFAULT NULL
```

### Index
```sql
CREATE INDEX idx_questionnaire_responses_audit_results
  ON questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
```

### Structure
- Matches `WebsiteAuditResult` TypeScript interface exactly
- Follows same pattern as `business_profile` and `discovery_tree`
- Nested, structured, type-safe
- Future-proof (extensible without migrations)

### Consistency
- ✅ Nullable like other JSONB columns
- ✅ GIN index like other JSONB columns  
- ✅ Comment explaining structure
- ✅ Idempotent migration
- ✅ Matches TypeScript interface
