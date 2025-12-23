# Audit Error Handling - Validation Summary

## Where We Are Aligned ✅

1. **Database Field Usage**
   - ✅ `saveAuditError()` saves to `audit_error` and clears `audit_completed_at`
   - ✅ `saveAuditResults()` saves to `audit_results` and sets `audit_completed_at`
   - ✅ `saveAuditResults()` clears `audit_error` on success

2. **Non-Blocking API Behavior**
   - ✅ POST returns 202 Accepted (fire-and-forget)
   - ✅ GET returns 200 with error field if audit failed
   - ✅ Discovery page handles errors gracefully

3. **Structured Logging**
   - ✅ Uses `logger.error()` with context
   - ✅ Includes questionnaireResponseId, websiteUrl, error details

## Critical Gaps ❌

### Gap 1: Missing Error/Warning Tracking in Results

**Problem:**
- `WebsiteAuditResult` type doesn't include `errors`/`warnings` fields
- `auditWebsiteAsync` doesn't track partial failures
- PageSpeed API failure → entire audit fails instead of saving partial results

**Impact:** Can't distinguish between "no data" vs "partial data with errors"

**Fix Required:**
- Add `errors?: Record<string, string>` to `WebsiteAuditResult`
- Add `warnings?: string[]` to `WebsiteAuditResult`
- Track errors/warnings during audit execution

---

### Gap 2: All Failures Treated as Fatal

**Problem:**
- Single try/catch around entire `auditWebsiteAsync` function
- PageSpeed API failure → saves as fatal error
- Should continue with partial data when HTML is available

**Impact:** Loses valuable data when only one part fails (e.g., PageSpeed API rate limit)

**Fix Required:**
- Wrap individual steps in try/catch
- Distinguish fatal vs partial failures
- Save partial results with error context

---

### Gap 3: Missing Structured Error Format

**Problem:**
- Error messages don't follow `"ErrorType: Message"` format
- Hard to parse and categorize errors programmatically

**Impact:** Difficult to handle errors consistently in UI/logging

**Fix Required:**
- Format errors as `"Timeout: Website did not respond within 30000ms"`
- Categorize errors (Timeout, InvalidURL, PageSpeedAPI, etc.)

---

### Gap 4: UI Doesn't Show Warnings/Errors

**Problem:**
- `AuditCard` doesn't check for `errors`/`warnings` fields
- No visual indication of partial data
- No error banners for failed audits

**Impact:** Users don't know if data is complete or partial

**Fix Required:**
- Check for `errors`/`warnings` in `AuditCard`
- Show warning banner for partial data
- Show error banner for failed audits

---

## Minimal Patch Plan

### Step 1: Update Types (30 min)

**File:** `lib/types/audit.ts`

```typescript
export interface WebsiteAuditResult {
  // ... existing fields ...
  performance?: PerformanceMetrics; // Make optional
  errors?: Record<string, string>;   // Add
  warnings?: string[];                // Add
}
```

---

### Step 2: Add Partial Failure Handling (2 hours)

**File:** `lib/services/audit-service.ts`

**Changes:**
1. Add error/warning tracking variables at start of `auditWebsiteAsync`
2. Wrap `getPageSpeedMetrics()` in try/catch → track error in `errors.performance`
3. Wrap other steps in try/catch → track partial failures
4. Save partial results with `errors`/`warnings` when possible

**Key Logic:**
```typescript
const errors: Record<string, string> = {};
const warnings: string[] = [];

try {
  performance = await getPageSpeedMetrics(url);
} catch (error) {
  errors.performance = "PageSpeed API rate limit exceeded";
  warnings.push("Performance metrics unavailable");
  performance = undefined; // Continue without performance data
}
```

---

### Step 3: Structured Error Format (1 hour)

**File:** `lib/services/audit-service.ts`

**Changes:**
1. Update `saveAuditError()` to format messages: `"ErrorType: Message"`
2. Categorize errors:
   - `"Timeout: Website did not respond within 30000ms"`
   - `"InvalidURL: Invalid URL format: not-a-url"`
   - `"PageSpeedAPI: Rate limit exceeded (429)"`
   - `"FetchError: Failed to fetch website HTML - ECONNREFUSED"`

---

### Step 4: UI Enhancements (1-2 hours)

**Files:** `components/discovery/AuditCard.tsx`, `app/discovery/[id]/page.tsx`

**Changes:**
1. Check for `audit.errors` and `audit.warnings` in `AuditCard`
2. Show warning banner (yellow) for partial data
3. Show error banner (red) for failed audits
4. Handle missing `performance` gracefully in `getSummaryForClient()`

---

## Implementation Order

1. **Update Types** → Enables error/warning tracking
2. **Add Partial Failure Handling** → Core functionality
3. **Structured Error Format** → Improves error messages
4. **UI Enhancements** → User-facing improvements

---

## Testing Checklist

- [ ] PageSpeed API failure → Saves partial results with `errors.performance`
- [ ] HTML fetch failure → Saves fatal error with structured format
- [ ] Timeout → Saves fatal error: `"Timeout: Website did not respond..."`
- [ ] Invalid URL → Saves fatal error: `"InvalidURL: Invalid URL format..."`
- [ ] UI with partial results → Shows warning banner
- [ ] UI with failed audit → Shows error banner
- [ ] UI with missing performance → Handles gracefully

---

## Files to Modify

1. `lib/types/audit.ts` - Add `errors`/`warnings`, make `performance` optional
2. `lib/services/audit-service.ts` - Add partial failure handling, structured errors
3. `lib/utils/audit-utils.ts` - Handle missing `performance` in `getSummaryForClient()`
4. `components/discovery/AuditCard.tsx` - Add warning/error display
5. `app/discovery/[id]/page.tsx` - Pass `auditError` to `AuditCard`

---

## Estimated Effort

- **Step 1 (Types):** 30 minutes
- **Step 2 (Partial Failures):** 2 hours
- **Step 3 (Structured Errors):** 1 hour
- **Step 4 (UI):** 1-2 hours

**Total:** ~4-6 hours
