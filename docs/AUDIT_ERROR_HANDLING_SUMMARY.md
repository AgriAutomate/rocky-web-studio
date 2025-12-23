# Audit Error Handling - Executive Summary

## Problem Statement

The website audit system needs robust error handling for:
- Sites that don't respond or time out
- Uncertain technology detection (WordPress/Shopify/Next.js)
- PageSpeed API failures or rate limits
- Non-200 HTTP responses and redirects

**Critical Requirement:** Audit failures must never break the questionnaire or discovery flows.

## Solution Overview

### Three-Tier Error Handling Strategy

1. **Fatal Errors** → Save error message, don't save results
2. **Partial Failures** → Save partial results with error/warning flags
3. **Degraded Results** → Save with missing optional fields

### Key Principles

✅ **Never Break the Flow** - Audit failures are non-blocking
✅ **Graceful Degradation** - Return partial results when possible
✅ **Clear Error Messages** - Structured format: `"ErrorType: Message"`
✅ **Structured Logging** - Context-rich logs for debugging
✅ **UI Resilience** - Components handle missing data gracefully

## Error Storage Strategy

### Database Fields

**`audit_error` (TEXT):**
- Stores fatal errors only
- Format: `"ErrorType: Human-readable message"`
- Examples:
  - `"Timeout: Website did not respond within 30000ms"`
  - `"InvalidURL: Invalid URL format: not-a-url"`
  - `"PageSpeedAPI: Rate limit exceeded (429)"`

**`audit_results` (JSONB):**
- Stores partial results even if some parts failed
- Includes optional `errors` and `warnings` fields:
```json
{
  "websiteInfo": { ... },
  "techStack": { ... },
  "performance": null,  // null if PageSpeed failed
  "seo": { ... },
  "errors": {
    "performance": "PageSpeed API rate limit exceeded"
  },
  "warnings": [
    "Low confidence CMS detection: WordPress"
  ]
}
```

**`audit_completed_at` (TIMESTAMP):**
- Set only when audit completes (success or partial failure)
- Not set for fatal errors

## Error Categories & Handling

### Category 1: Fatal Errors

**Examples:**
- Invalid URL format
- Website timeout (no HTML received)
- DNS failure
- Database save failure

**Handling:**
- Save to `audit_error`
- Don't set `audit_completed_at`
- Don't save `audit_results`
- Log error with context
- Return early from audit function

### Category 2: Partial Failures

**Examples:**
- PageSpeed API rate limit (but HTML received)
- Non-200 HTTP status (but HTML received)
- Some tech detection uncertain

**Handling:**
- Continue with partial data
- Save partial results to `audit_results`
- Include `errors`/`warnings` in result
- Set `audit_completed_at`
- Clear `audit_error`

### Category 3: Degraded Results

**Examples:**
- Missing performance metrics (PageSpeed failed)
- Low confidence tech detection
- Missing SEO data

**Handling:**
- Save with `null` or `undefined` for missing fields
- Include warnings in result
- Still set `audit_completed_at`
- UI shows available data + warnings

## UI Error Handling

### AuditCard Component

**Current Behavior:**
- Shows loading state while fetching
- Shows "No audit data available" if missing
- Shows audit data if available

**Proposed Enhancement:**
- Show warnings in yellow banner
- Show errors in red banner
- Handle missing `performance` gracefully
- Never throw errors - always render something

### Discovery Page

**Current Behavior:**
- Fetches audit separately
- Logs errors but continues
- Doesn't break if audit fails

**Proposed Enhancement:**
- More detailed error logging
- Better handling of partial results
- Show warnings/errors in UI

## Implementation Checklist

### Backend Changes

- [ ] Update `auditWebsiteAsync` to handle partial failures
- [ ] Add error/warning tracking to audit results
- [ ] Update `saveAuditError` to use structured format
- [ ] Update `saveAuditResults` to handle save failures
- [ ] Add timeout detection for all external calls
- [ ] Add rate limit detection for PageSpeed API
- [ ] Improve error messages with context

### Type Changes

- [ ] Add `errors?: Record<string, string>` to `WebsiteAuditResult`
- [ ] Add `warnings?: string[]` to `WebsiteAuditResult`
- [ ] Make `performance` optional: `performance?: PerformanceMetrics`

### UI Changes

- [ ] Update `AuditCard` to show warnings/errors
- [ ] Update discovery page error handling
- [ ] Add visual indicators for partial data
- [ ] Ensure graceful degradation

### Testing

- [ ] Test invalid URL scenario
- [ ] Test timeout scenario
- [ ] Test PageSpeed API rate limit
- [ ] Test non-200 HTTP status
- [ ] Test database save failure
- [ ] Test UI with missing audit data
- [ ] Test UI with partial audit data

## Error Message Examples

### Fatal Errors
```
"InvalidURL: Invalid URL format: not-a-url"
"Timeout: Website did not respond within 30000ms"
"FetchError: Failed to fetch website HTML - ECONNREFUSED"
"DatabaseError: Failed to save audit results - RLS policy violation"
```

### Partial Failures (in `errors` field)
```json
{
  "errors": {
    "performance": "PageSpeed API rate limit exceeded (429)",
    "techStack": "Low confidence detection - multiple CMS patterns found"
  }
}
```

### Warnings (in `warnings` field)
```json
{
  "warnings": [
    "Low confidence CMS detection: WordPress",
    "Performance metrics unavailable due to API rate limit",
    "Non-200 HTTP status (404) but HTML received"
  ]
}
```

## Logging Patterns

### Structured Logging

```typescript
await logger.error("Website audit failed", {
  questionnaireResponseId,
  websiteUrl,
  error: errorMessage,
  errorType: "Timeout",
  durationMs: Date.now() - startTime,
  stack: errorStack,
});
```

### Success with Warnings

```typescript
await logger.info("Website audit completed", {
  questionnaireResponseId,
  websiteUrl,
  durationMs: auditResult.auditDurationMs,
  hasErrors: Object.keys(errors).length > 0,
  hasWarnings: warnings.length > 0,
  errors: Object.keys(errors).length > 0 ? errors : undefined,
  warnings: warnings.length > 0 ? warnings : undefined,
});
```

## Benefits

1. **Resilience** - System continues working even when audits fail
2. **Debugging** - Clear error messages and structured logs
3. **User Experience** - Partial data is better than no data
4. **Monitoring** - Easy to track error patterns
5. **Maintainability** - Consistent error handling patterns

## Next Steps

1. ✅ Review error handling strategy (this document)
2. ⏳ Implement error handling in `auditWebsiteAsync`
3. ⏳ Update helper functions
4. ⏳ Update UI components
5. ⏳ Test with various failure scenarios
6. ⏳ Monitor logs for error patterns

## Related Documents

- `docs/AUDIT_ERROR_HANDLING_STRATEGY.md` - Detailed strategy
- `docs/AUDIT_ERROR_HANDLING_IMPLEMENTATION.md` - Implementation guide
- `lib/services/audit-service.ts` - Current implementation
- `lib/services/audit-logging.ts` - Logging utilities
