# Audit Error Handling - Implementation Guide

## Quick Reference

### Error Categories

1. **Fatal Errors** → Save to `audit_error`, don't set `audit_completed_at`
2. **Partial Failures** → Save partial results with `errors`/`warnings` fields
3. **Degraded Results** → Save with missing optional fields (e.g., `performance: null`)

### Error Message Format

```
"ErrorType: Human-readable message"
```

**Error Types:**
- `InvalidURL` - URL validation failed
- `Timeout` - Request timed out
- `FetchError` - Failed to fetch HTML
- `PageSpeedAPI` - PageSpeed API error
- `DatabaseError` - Database save failed
- `FatalError` - Unexpected error

### Database Storage

**Fatal Error:**
```sql
audit_error = "Timeout: Website did not respond within 30000ms"
audit_completed_at = NULL
audit_results = NULL
```

**Partial Success:**
```sql
audit_error = NULL
audit_completed_at = "2025-01-22T10:30:15Z"
audit_results = {
  ...partial data...,
  errors: { performance: "PageSpeed API rate limit exceeded" },
  warnings: ["Low confidence CMS detection: WordPress"]
}
```

## Implementation Steps

### Step 1: Extend Types (Optional but Recommended)

Add error/warning tracking to `WebsiteAuditResult`:

```typescript
// In lib/types/audit.ts
export interface WebsiteAuditResult {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance?: PerformanceMetrics; // Optional - may be null
  seo: SeoMetrics;
  metadata: SiteMetadata;
  contentAnalysis: ContentAnalysis;
  recommendations: Recommendation[];
  auditDate: string;
  auditDurationMs: number;
  // New optional fields for error tracking
  errors?: Record<string, string>; // e.g., { performance: "Rate limit exceeded" }
  warnings?: string[]; // e.g., ["Low confidence detection"]
}
```

### Step 2: Update `auditWebsiteAsync`

Key changes:
1. Wrap each step in try/catch
2. Continue with partial data when possible
3. Track errors/warnings
4. Save partial results if HTML was fetched

### Step 3: Update Helper Functions

**`saveAuditError`:**
- Use structured error format
- Don't set `audit_completed_at`
- Log error with context

**`saveAuditResults`:**
- Handle save failures gracefully
- Clear `audit_error` on success
- Set `audit_completed_at`

### Step 4: Update UI Components

**`AuditCard`:**
- Show warnings in yellow banner
- Show errors in red banner
- Handle missing `performance` gracefully

**Discovery Page:**
- Don't break on audit fetch errors
- Log errors but continue rendering

## Testing Checklist

### Fatal Errors
- [ ] Invalid URL → `audit_error` set, no results
- [ ] Timeout → `audit_error` set, no results
- [ ] DNS failure → `audit_error` set, no results

### Partial Failures
- [ ] PageSpeed API rate limit → Partial results with `errors.performance`
- [ ] Non-200 status but HTML received → Continue with partial results
- [ ] Low confidence tech detection → Continue with `warnings`

### UI Resilience
- [ ] Missing audit data → Shows "No audit data available"
- [ ] Failed audit → Doesn't break discovery page
- [ ] Partial audit → Shows available data + warnings

## Error Handling Patterns Summary

### Pattern 1: Try/Catch with Graceful Degradation

```typescript
let performance: PerformanceMetrics | null = null;
try {
  performance = await getPageSpeedMetrics(url);
} catch (error) {
  errors.performance = error.message;
  warnings.push("Performance metrics unavailable");
  // Continue without performance data
}
```

### Pattern 2: Structured Error Messages

```typescript
await saveAuditError(
  questionnaireResponseId,
  `Timeout: Website did not respond within ${AUDIT_TIMEOUT_MS}ms`
);
```

### Pattern 3: Non-Breaking UI

```typescript
try {
  const audit = await fetchAudit();
  if (audit) setAudit(audit);
} catch (err) {
  console.error("Audit fetch failed:", err);
  // Don't break - UI handles missing audit gracefully
}
```

### Pattern 4: Contextual Logging

```typescript
await logger.error("Website audit failed", {
  questionnaireResponseId,
  websiteUrl,
  error: errorMessage,
  errorType: "Timeout",
  durationMs: Date.now() - startTime,
});
```

## Key Principles

1. ✅ **Never Break the Flow** - Audit failures don't prevent questionnaire/discovery
2. ✅ **Graceful Degradation** - Return partial results when possible
3. ✅ **Clear Error Messages** - Structured format for debugging
4. ✅ **Structured Logging** - Include context for debugging
5. ✅ **UI Resilience** - Handle missing/failed data gracefully

## Next Steps

1. Review and approve error handling strategy
2. Implement error handling in `auditWebsiteAsync`
3. Update helper functions
4. Update UI components
5. Test with various failure scenarios
6. Monitor logs for error patterns
