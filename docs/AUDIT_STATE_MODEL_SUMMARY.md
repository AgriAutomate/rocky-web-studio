# Audit State Model - Summary

## Complete State Enumeration

### State 1: NOT_REQUESTED

**Database:**
- `website_url`: `NULL`
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL`
- `audit_error`: `NULL`

**UI Display:**
- "No audit data available. Audit will run automatically when a website URL is provided."

**When:** Client didn't provide website URL in questionnaire

---

### State 2: PENDING

**Database:**
- `website_url`: Has value
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL`
- `audit_error`: `NULL`

**UI Display:**
- Loading spinner + "Analyzing website... This may take 10-30 seconds"

**When:** Audit triggered but not completed yet

---

### State 3: SUCCESS_FULL

**Database:**
- `website_url`: Has value
- `audit_results`: Complete object (all fields populated)
- `audit_completed_at`: Timestamp
- `audit_error`: `NULL`
- `audit_results.errors`: `undefined` or `{}`
- `audit_results.warnings`: `undefined` or `[]`

**UI Display:**
- Full audit data (platform, performance scores, top issue, etc.)
- No warnings or error indicators

**When:** Audit completed successfully with all data available

---

### State 4: SUCCESS_PARTIAL

**Database:**
- `website_url`: Has value
- `audit_results`: Partial object (some fields missing/null)
- `audit_completed_at`: Timestamp
- `audit_error`: `NULL`
- `audit_results.errors`: `{ performance?: "PageSpeed API rate limit exceeded", ... }`
- `audit_results.warnings`: `["Low confidence CMS detection", ...]`

**UI Display:**
- Available audit data + warning banner
- Warning: "⚠️ Some data unavailable: [warnings]"
- Show available metrics even if some missing

**When:** Audit completed but some parts failed (e.g., PageSpeed API rate limit)

---

### State 5: FAILED

**Database:**
- `website_url`: Has value
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL`
- `audit_error`: Error message (e.g., "Timeout: Website did not respond...")

**UI Display:**
- Error banner: "⚠️ Analysis unavailable: [error message]"

**When:** Fatal error occurred (timeout, invalid URL, DNS failure)

---

### State 6: FAILED_WITH_PARTIAL_DATA (Edge Case)

**Database:**
- `website_url`: Has value
- `audit_results`: Partial object (some data before fatal error)
- `audit_completed_at`: `NULL`
- `audit_error`: Error message

**UI Display:**
- Error message + any available partial data

**When:** Audit started but failed partway through (rare)

## Current Gaps

### Gap 1: Can't Distinguish NOT_REQUESTED vs PENDING

**Current:** Both show "No audit data available"

**Problem:** Can't tell if audit was never requested or is in progress

**Fix:** Check `website_url` in API, return explicit status

### Gap 2: No Error State Display

**Current:** Errors logged but not shown to user

**Problem:** User doesn't know why audit failed

**Fix:** Pass `auditError` to AuditCard, show error banner

### Gap 3: Can't Distinguish PARTIAL vs FULL

**Current:** Shows all audit data the same way

**Problem:** User doesn't know if data is complete

**Fix:** Check for `errors`/`warnings` fields, show warning banner

### Gap 4: Ambiguous State After Loading

**Current:** `auditLoading = false` but `audit = undefined` could mean multiple things

**Problem:** Can't determine actual state

**Fix:** Return explicit `status` field from API

### Gap 5: No Retry Mechanism

**Current:** If audit fails, user can't retry

**Problem:** User stuck with failed audit

**Fix:** Add "Retry Audit" button (future enhancement)

## Recommended Changes

### 1. Enhanced API Response

```typescript
export interface AuditFetchResponse {
  questionnaireResponseId: string | number;
  status: "not_requested" | "pending" | "completed" | "failed";
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string;
  auditError?: string;
  websiteUrl?: string; // Include to help determine state
  isPartial?: boolean; // Indicate if partial success
}
```

### 2. Enhanced AuditCard Props

```typescript
interface AuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  auditStatus?: "not_requested" | "pending" | "completed" | "failed";
  auditError?: string;
  websiteUrl?: string;
}
```

### 3. State Detection Logic

**In API GET handler:**
1. Check `website_url` → If null → `status: "not_requested"`
2. Check `audit_completed_at && audit_results` → `status: "completed"`
3. Check `audit_error` → `status: "failed"`
4. Otherwise → `status: "pending"`

**In AuditCard:**
1. If `isLoading` → Show loading
2. If `auditStatus === "not_requested"` → Show "No URL" message
3. If `auditStatus === "pending"` → Show loading (even if `isLoading = false`)
4. If `auditStatus === "failed"` → Show error banner
5. If `auditStatus === "completed"` → Show data (check for partial)

## State Transition Flow

```
NOT_REQUESTED (no URL)
    ↓ [URL provided in questionnaire]
PENDING (audit triggered)
    ↓ [audit completes]
    ├─→ SUCCESS_FULL (all data available)
    ├─→ SUCCESS_PARTIAL (some data missing)
    └─→ FAILED (fatal error)
```

## Implementation Checklist

- [ ] Update API GET handler to return `status` field
- [ ] Update API GET handler to include `websiteUrl` in response
- [ ] Update `AuditFetchResponse` type to include `status` and `websiteUrl`
- [ ] Update discovery page to extract and pass `status` and `error`
- [ ] Update `AuditCard` props to accept `auditStatus` and `auditError`
- [ ] Update `AuditCard` logic to handle all 6 states explicitly
- [ ] Add warning banner for partial success state
- [ ] Add error banner for failed state
- [ ] Test all state transitions

## Benefits

1. **Predictable:** Clear state model, no ambiguity
2. **User-Friendly:** Users understand what's happening
3. **Debuggable:** Explicit states make issues obvious
4. **Future-Proof:** Easy to add retry, refresh, etc.
5. **Type-Safe:** TypeScript can enforce state handling
