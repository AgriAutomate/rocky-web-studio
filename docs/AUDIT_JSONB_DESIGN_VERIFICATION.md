# Audit Results JSONB Design - Verification & Recommendations

## Existing JSONB Column Patterns Analysis

### Pattern Comparison

| Column | Structure Type | TypeScript Match | Example |
|--------|---------------|------------------|---------|
| `sector_specific_data` | Flat key-value | Flexible (`Record<string, any>`) | `{"h6": "table", "h7": ["walkins"]}` |
| `business_profile` | Structured object | Exact match (`BusinessProfile`) | `{"annualRevenue": "0-100k", ...}` |
| `discovery_tree` | Nested structured | Exact match (`DiscoveryTree`) | `{"trunk": {...}, "branches": {...}}` |
| `goals` | Simple array | Exact match (`string[]`) | `["goal1", "goal2"]` |
| `primary_offers` | Simple array | Exact match (`string[]`) | `["offer1", "offer2"]` |

### Key Pattern: Structured Objects Match TypeScript Interfaces

**business_profile** and **discovery_tree** follow this pattern:
- Database JSONB structure matches TypeScript interface exactly
- Enables type-safe consumption
- No transformation needed when reading from database

## Proposed audit_results Design

### Structure: Follow Pattern 1 (Structured Object)

**Matches:** `WebsiteAuditResult` TypeScript interface exactly

**Rationale:**
- Consistent with `business_profile` and `discovery_tree`
- Type-safe consumption
- No transformation layer needed
- Future-proof (extensible without migrations)

### JSON Shape

```json
{
  "websiteInfo": {
    "url": "https://example.com",
    "isAccessible": true,
    "title": "...",
    ...
  },
  "techStack": {
    "cms": { "name": "WordPress", "confidence": "high", ... },
    "analytics": [...],
    "paymentProcessors": [...],
    ...
  },
  "performance": {
    "mobileScore": 65,
    "desktopScore": 80,
    "overallScore": 73,
    ...
  },
  "seo": {
    "hasTitleTag": true,
    "hasMetaDescription": true,
    ...
  },
  "metadata": {
    "title": "...",
    "socialProfiles": {...},
    "contactInfo": {...}
  },
  "contentAnalysis": {
    "wordCount": 2500,
    "hasBlog": true,
    ...
  },
  "recommendations": [
    {
      "category": "performance",
      "priority": "high",
      "title": "...",
      ...
    }
  ],
  "auditDate": "2025-01-22T10:30:15.123Z",
  "auditDurationMs": 12500
}
```

## Database Column Definition

### ✅ Current Migration (Verified Correct)

```sql
-- Audit results stored as JSONB
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_results JSONB DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_results IS 
  'Complete website audit results including tech stack, performance, SEO, and recommendations';

-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_results
  ON public.questionnaire_responses USING GIN (audit_results)
  WHERE audit_results IS NOT NULL;
```

### Index Analysis

**GIN Index Benefits:**
- ✅ Enables efficient queries on nested fields
- ✅ Supports JSONB operators (`->`, `->>`, `@>`)
- ✅ Consistent with other JSONB columns

**Partial Index (`WHERE audit_results IS NOT NULL`):**
- ✅ Smaller index (only indexes rows with audit data)
- ✅ Faster queries on non-null audits
- ✅ Consistent with other JSONB indexes

**Query Examples:**
```sql
-- Find WordPress sites
SELECT * FROM questionnaire_responses
WHERE audit_results->'techStack'->'cms'->>'name' = 'WordPress';

-- Find sites with poor performance
SELECT * FROM questionnaire_responses
WHERE (audit_results->'performance'->>'mobileScore')::int < 50;

-- Find sites with critical recommendations
SELECT * FROM questionnaire_responses
WHERE audit_results->'recommendations' @> '[{"priority": "critical"}]';
```

## Consistency Verification

### ✅ Matches Existing Patterns

1. **Nullable**: `DEFAULT NULL` ✅ (like all other JSONB columns)
2. **GIN Index**: ✅ (like `sector_specific_data`, `business_profile`, `discovery_tree`)
3. **Partial Index**: ✅ (`WHERE audit_results IS NOT NULL` - efficient)
4. **Comment**: ✅ (descriptive, explains structure)
5. **TypeScript Match**: ✅ (matches `WebsiteAuditResult` interface exactly)
6. **Idempotent**: ✅ (`IF NOT EXISTS` - safe to run multiple times)
7. **Migration Style**: ✅ (follows same format as discovery tree migration)

### ✅ TypeScript Consumption Pattern

```typescript
// Pattern matches business_profile and discovery_tree consumption
const { data } = await supabase
  .from("questionnaire_responses")
  .select("audit_results")
  .eq("id", responseId)
  .single();

// Direct type assertion (safe - structure matches)
const audit: WebsiteAuditResult = data.audit_results;

// Type-safe access
const cms = audit.techStack.cms?.name;
const score = audit.performance.mobileScore;
```

## V1 Scope (Minimal but Complete)

### Included Fields:
- ✅ `websiteInfo` - Basic website data
- ✅ `techStack` - CMS, analytics, payment processors, frameworks
- ✅ `performance` - Mobile/desktop scores, Core Web Vitals
- ✅ `seo` - SEO metrics and analysis
- ✅ `metadata` - Social profiles, contact info
- ✅ `contentAnalysis` - Content features detected
- ✅ `recommendations` - Prioritized improvements
- ✅ `auditDate` / `auditDurationMs` - Audit metadata

### Future Extensions (No Migration Needed):
- `accessibility` - Accessibility audit results
- `security` - Security audit results
- `auditHistory` - Historical tracking
- `comparison` - Industry averages, percentiles

**Key:** JSONB allows adding optional fields without migration - just extend TypeScript types.

## Recommendations

### ✅ Current Design is Correct

The existing migration (`20250122_add_audit_columns.sql`) already follows all patterns correctly:

1. ✅ Column definition matches pattern
2. ✅ GIN index with partial filter
3. ✅ Comment explaining structure
4. ✅ Idempotent migration

### Optional Enhancements

1. **Add JSONB Path Indexes** (if specific queries are common):
   ```sql
   -- If querying by CMS frequently
   CREATE INDEX idx_audit_cms 
   ON questionnaire_responses ((audit_results->'techStack'->'cms'->>'name'))
   WHERE audit_results IS NOT NULL;
   ```

2. **Add Performance Score Index** (if filtering by score frequently):
   ```sql
   -- If querying by performance score frequently
   CREATE INDEX idx_audit_performance 
   ON questionnaire_responses (((audit_results->'performance'->>'mobileScore')::int))
   WHERE audit_results IS NOT NULL;
   ```

**Note:** Only add these if you have specific query patterns. GIN index covers most use cases.

## Summary

### ✅ Design Verification

**Column:** `audit_results JSONB DEFAULT NULL`
- ✅ Matches existing JSONB column pattern
- ✅ Nullable like other columns
- ✅ Structured object matching TypeScript interface

**Index:** GIN with partial filter
- ✅ Consistent with other JSONB indexes
- ✅ Efficient for nested queries
- ✅ Partial index reduces size

**Structure:** Matches `WebsiteAuditResult` interface
- ✅ Type-safe consumption
- ✅ No transformation needed
- ✅ Future-proof (extensible)

**Status:** ✅ **Migration already created correctly!**

No changes needed - the existing migration follows all patterns perfectly.
