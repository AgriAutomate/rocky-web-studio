# Audit State Model - Visual Diagram

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT STATE MODEL                        │
└─────────────────────────────────────────────────────────────┘

[NOT_REQUESTED]
    │
    │ website_url = NULL
    │ audit_results = NULL
    │ audit_completed_at = NULL
    │ audit_error = NULL
    │
    │ UI: "No audit data available. Audit will run automatically..."
    │
    ↓ [URL provided in questionnaire]
    │
[PENDING]
    │
    │ website_url = "https://example.com"
    │ audit_results = NULL
    │ audit_completed_at = NULL
    │ audit_error = NULL
    │
    │ UI: Loading spinner + "Analyzing website..."
    │
    ↓ [Audit completes]
    │
    ├─────────────────────────────────────────────────────┐
    │                                                     │
    ↓                                                     ↓
[SUCCESS_FULL]                                    [SUCCESS_PARTIAL]
    │                                                     │
    │ audit_results = Complete                           │ audit_results = Partial
    │ audit_completed_at = Timestamp                     │ audit_completed_at = Timestamp
    │ audit_error = NULL                                 │ audit_error = NULL
    │ errors = undefined                                 │ errors = { performance: "..." }
    │ warnings = undefined                               │ warnings = ["..."]
    │                                                     │
    │ UI: Full audit data                                │ UI: Available data + warnings
    │      (platform, performance, etc.)                  │      "⚠️ Some data unavailable"
    │                                                     │
    └─────────────────────────────────────────────────────┘
                                                          │
                                                          ↓
                                                    [FAILED]
                                                          │
                                                          │ audit_results = NULL
                                                          │ audit_completed_at = NULL
                                                          │ audit_error = "Timeout: ..."
                                                          │
                                                          │ UI: "⚠️ Analysis unavailable: [error]"
                                                          │
                                                          ↓
                                    [FAILED_WITH_PARTIAL_DATA] (Edge Case)
                                                          │
                                                          │ audit_results = Partial
                                                          │ audit_completed_at = NULL
                                                          │ audit_error = "FatalError: ..."
                                                          │
                                                          │ UI: Error + partial data
```

## State Detection Decision Tree

```
Start: Fetch audit data
    │
    ├─→ Has website_url?
    │   │
    │   NO ──→ [NOT_REQUESTED]
    │   │       UI: "No audit data available..."
    │   │
    │   YES ──→ Has audit_completed_at?
    │           │
    │           NO ──→ Has audit_error?
    │           │       │
    │           │       YES ──→ Has audit_results?
    │           │               │
    │           │               YES ──→ [FAILED_WITH_PARTIAL_DATA]
    │           │               │       UI: Error + partial data
    │           │               │
    │           │               NO ──→ [FAILED]
    │           │                       UI: Error banner
    │           │
    │           │       NO ──→ [PENDING]
    │           │               UI: Loading spinner
    │           │
    │           YES ──→ Has audit_results?
    │                   │
    │                   NO ──→ [FAILED] (shouldn't happen)
    │                   │
    │                   YES ──→ Has errors or warnings?
    │                           │
    │                           YES ──→ [SUCCESS_PARTIAL]
    │                           │       UI: Data + warnings
    │                           │
    │                           NO ──→ [SUCCESS_FULL]
    │                                   UI: Full data
```

## Database Field Combinations

| State | website_url | audit_results | audit_completed_at | audit_error | errors | warnings |
|-------|-------------|--------------|-------------------|-------------|--------|----------|
| NOT_REQUESTED | `NULL` | `NULL` | `NULL` | `NULL` | - | - |
| PENDING | ✅ | `NULL` | `NULL` | `NULL` | - | - |
| SUCCESS_FULL | ✅ | ✅ Complete | ✅ | `NULL` | `undefined` | `undefined` |
| SUCCESS_PARTIAL | ✅ | ✅ Partial | ✅ | `NULL` | `{...}` | `[...]` |
| FAILED | ✅ | `NULL` | `NULL` | ✅ | - | - |
| FAILED_WITH_PARTIAL | ✅ | ✅ Partial | `NULL` | ✅ | `{...}` | `[...]` |

## API Response Examples

### NOT_REQUESTED
```json
{
  "questionnaireResponseId": "123",
  "status": "not_requested",
  "message": "No website URL provided. Audit will run automatically when URL is provided."
}
```

### PENDING
```json
{
  "questionnaireResponseId": "123",
  "status": "pending",
  "websiteUrl": "https://example.com",
  "message": "Audit in progress. Please check again shortly."
}
```

### SUCCESS_FULL
```json
{
  "questionnaireResponseId": "123",
  "status": "completed",
  "audit": {
    "websiteInfo": {...},
    "techStack": {...},
    "performance": {...},
    "seo": {...},
    ...
  },
  "auditCompletedAt": "2025-01-22T10:30:15Z",
  "isPartial": false
}
```

### SUCCESS_PARTIAL
```json
{
  "questionnaireResponseId": "123",
  "status": "completed",
  "audit": {
    "websiteInfo": {...},
    "techStack": {...},
    "performance": null,
    "seo": {...},
    "errors": {
      "performance": "PageSpeed API rate limit exceeded"
    },
    "warnings": ["Low confidence CMS detection"]
  },
  "auditCompletedAt": "2025-01-22T10:30:15Z",
  "isPartial": true
}
```

### FAILED
```json
{
  "questionnaireResponseId": "123",
  "status": "failed",
  "websiteUrl": "https://example.com",
  "error": "Timeout: Website did not respond within 30000ms",
  "auditError": "Timeout: Website did not respond within 30000ms"
}
```

## UI Component State Handling

### AuditCard Component Logic

```typescript
function AuditCard({ audit, isLoading, auditStatus, auditError, websiteUrl }) {
  // Priority 1: Loading (overrides everything)
  if (isLoading) {
    return <LoadingState />;
  }

  // Priority 2: Explicit status-based rendering
  switch (auditStatus) {
    case "not_requested":
      return <NotRequestedState />;
    
    case "pending":
      return <PendingState />;
    
    case "failed":
      return <FailedState error={auditError} />;
    
    case "completed":
      if (audit) {
        const isPartial = audit.errors || audit.warnings;
        return isPartial 
          ? <PartialSuccessState audit={audit} />
          : <FullSuccessState audit={audit} />;
      }
      return <PendingState />; // Fallback
    
    default:
      // Fallback: Infer from props
      if (!websiteUrl) return <NotRequestedState />;
      if (auditError) return <FailedState error={auditError} />;
      if (audit) return <FullSuccessState audit={audit} />;
      return <PendingState />;
  }
}
```

## Summary

### 6 Distinct States

1. **NOT_REQUESTED** - No URL provided
2. **PENDING** - Audit in progress
3. **SUCCESS_FULL** - Complete audit data
4. **SUCCESS_PARTIAL** - Partial audit data with warnings
5. **FAILED** - Fatal error, no data
6. **FAILED_WITH_PARTIAL** - Fatal error, some data collected

### Key Improvements Needed

1. ✅ Add `status` field to API response
2. ✅ Include `websiteUrl` in API response
3. ✅ Pass `auditStatus` and `auditError` to AuditCard
4. ✅ Handle all states explicitly in AuditCard
5. ✅ Show warnings for partial success
6. ✅ Show errors for failed state
