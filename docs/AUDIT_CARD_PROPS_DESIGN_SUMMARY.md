# AuditCard Props & State Model - Design Summary

## Explicit Prop Model

### Minimal Prop Interface

```typescript
type AuditStatus = 
  | "NOT_REQUESTED"
  | "PENDING"
  | "SUCCESS_FULL"
  | "SUCCESS_PARTIAL"
  | "FAILED"
  | "FAILED_WITH_PARTIAL";

interface AuditCardProps {
  status: AuditStatus;
  audit?: WebsiteAuditResult;
  errorMessage?: string;
  warnings?: string[];
}
```

**Rationale:**
- ✅ Explicit `status` field (no ambiguity)
- ✅ `audit` optional (only for success states)
- ✅ `errorMessage` optional (only for failed states)
- ✅ `warnings` optional (only for partial states)

---

## Status Derivation from DB Fields

### Database Fields Available

- `website_url` (TEXT)
- `audit_results` (JSONB)
- `audit_completed_at` (TIMESTAMP)
- `audit_error` (TEXT)
- `audit_status` (TEXT, optional - if status tracking added)

### Derivation Algorithm

```
1. IF website_url is NULL or empty:
   → status = "NOT_REQUESTED"
   → Return early

2. IF audit_status === "pending" or "running":
   → status = "PENDING"
   → Return early

3. IF audit_error exists:
   → IF audit_results exists:
     → status = "FAILED_WITH_PARTIAL_DATA"
     → errorMessage = audit_error
     → warnings = audit_results.warnings
   → ELSE:
     → status = "FAILED"
     → errorMessage = audit_error
   → Return

4. IF audit_completed_at AND audit_results exist:
   → IF audit_results.errors OR audit_results.warnings:
     → status = "SUCCESS_PARTIAL"
     → warnings = audit_results.warnings
   → ELSE:
     → status = "SUCCESS_FULL"
   → audit = audit_results
   → Return

5. Default:
   → status = "PENDING"
   → Return
```

**Location:** Page-level helper function (after fetching audit data)

---

## AuditCard Display by State

### NOT_REQUESTED

**Display:**
- Card with muted styling
- Title: "Current Site Analysis"
- Message: "No audit data available. Audit will run automatically when a website URL is provided."
- No spinner, no buttons

**UX:** Informative, non-intrusive. User knows audit will happen when URL provided.

---

### PENDING

**Display:**
- Card with loading indicator
- Title: "Current Site Analysis"
- Loading spinner (animated)
- Message: "Analyzing website... This may take 10-30 seconds"
- Optional: Elapsed time if `audit_started_at` available

**UX:** Clear indication audit is in progress. User knows to wait.

---

### SUCCESS_FULL

**Display:**
- Card with success styling (green border-top accent)
- Title: "Current Site Analysis"
- Full audit data:
  - Platform badge
  - Performance scores
  - Social profiles
  - Top priority issue
  - View website link
- No warnings, no errors

**UX:** Complete, confident display. User sees full analysis results.

---

### SUCCESS_PARTIAL

**Display:**
- Card with warning styling (yellow border-top accent)
- Title: "Current Site Analysis"
- Warning banner (yellow):
  - ⚠️ "Some data unavailable"
  - List of warnings
- Available audit data (same as SUCCESS_FULL)
- Indicate missing fields (e.g., "Performance metrics unavailable")

**UX:** Shows available data but indicates limitations. User understands what's missing.

---

### FAILED

**Display:**
- Card with error styling (red border-top accent)
- Title: "Current Site Analysis"
- Error banner (red):
  - ⚠️ "Analysis unavailable"
  - Error message details
- Optional: "Retry Audit" button (future)
- No audit data

**UX:** Clear error indication. User knows audit failed and why.

---

### FAILED_WITH_PARTIAL_DATA

**Display:**
- Card with error styling (red border-top accent)
- Title: "Current Site Analysis"
- Error banner (red):
  - ⚠️ "Analysis incomplete"
  - Error message
- Available partial data (if any)
- Warnings banner (if warnings present)

**UX:** Shows what data was collected before failure. User sees partial results.

---

## Extra Data Needed from API

### Current API Response Gaps

**Missing:**
- ❌ `website_url` (needed for NOT_REQUESTED detection)
- ❌ Explicit `status` field (needed for clarity)
- ❌ `warnings` array (needed for SUCCESS_PARTIAL)

### Enhanced API Response

**Update `AuditFetchResponse`:**

```typescript
export interface AuditFetchResponse {
  questionnaireResponseId: string | number;
  status?: "not_requested" | "pending" | "completed" | "failed";  // NEW
  websiteUrl?: string;  // NEW
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string;
  auditError?: string;
  warnings?: string[];  // NEW
}
```

**Update GET Handler:**

1. Include `website_url` in SELECT query
2. Check `website_url` first → Return `status: "not_requested"` if null
3. Extract `warnings` from `audit_results.warnings`
4. Return explicit `status` field in all responses

**Benefits:**
- ✅ Page can derive status without additional queries
- ✅ Explicit status makes state clear
- ✅ Backward compatible (fields optional)

---

## Summary

### Prop Model ✅

- Explicit `status` field (6 states)
- Optional `audit`, `errorMessage`, `warnings`
- Minimal, clear interface

### Status Derivation ✅

- Check `website_url` → NOT_REQUESTED
- Check `audit_status` → PENDING
- Check `audit_error` → FAILED states
- Check `audit_completed_at` + `audit_results` → SUCCESS states
- Default → PENDING

### Display by State ✅

- Each state has clear, distinct UI
- Warning/error banners for partial/failed states
- Full data display for success states

### Extra Data ✅

- API must return `websiteUrl`, `status`, `warnings`
- Backward compatible (optional fields)

**Status:** Ready for implementation!
