# Audit Error Handling - Implementation Validation

## Comparison: Documented Strategy vs Actual Implementation

### 1. Error Storage Strategy

#### ✅ ALIGNED: Database Fields Usage

**Documented:**
- `audit_error` (TEXT) for fatal errors only
- `audit_results` (JSONB) for partial results with `errors`/`warnings`
- `audit_completed_at` set only when audit completes

**Actual Implementation:**
- ✅ `saveAuditError()` saves to `audit_error` and sets `audit_completed_at: null`
- ✅ `saveAuditResults()` saves to `audit_results` and sets `audit_completed_at`
- ✅ `saveAuditResults()` clears `audit_error` (line 762)

**Status:** ✅ Aligned

---

#### ❌ GAP: Error/Warning Tracking in Results

**Documented:**
```typescript
{
  errors?: {
    performance?: "PageSpeed API rate limit exceeded",
    techStack?: "Low confidence detection",
  },
  warnings?: string[],
}
```

**Actual Implementation:**
- ❌ `WebsiteAuditResult` type doesn't include `errors` or `warnings` fields
- ❌ `auditWebsiteAsync` doesn't track errors/warnings during execution
- ❌ Partial failures (e.g., PageSpeed API failure) don't record error in result

**Location:** `lib/types/audit.ts` (lines 24-34), `lib/services/audit-service.ts` (lines 100-110)

**Status:** ❌ Gap - Missing error/warning tracking

---

### 2. Error Message Format

#### ❌ GAP: Structured Error Format

**Documented:**
- Format: `"ErrorType: Human-readable message"`
- Examples: `"Timeout: Website did not respond within 30000ms"`

**Actual Implementation:**
- ❌ `saveAuditError()` accepts plain error messages (line 783)
- ❌ Error messages don't follow structured format
- ❌ No error type prefix (e.g., "Timeout:", "InvalidURL:")

**Location:** `lib/services/audit-service.ts` (lines 781-808)

**Status:** ❌ Gap - Missing structured format

---

### 3. Partial Failure Handling

#### ❌ GAP: Partial Results Not Saved

**Documented:**
- PageSpeed API failure → Continue with partial data, save with `errors.performance`
- HTML fetch failure → Save error, don't save results
- Non-200 HTTP status → Continue if HTML received

**Actual Implementation:**
- ❌ `getPageSpeedMetrics()` returns `{}` on error (line 449) but doesn't track error
- ❌ `fetchWebsiteHtml()` returns `null` on error (line 163) → triggers fatal error save
- ❌ No distinction between "can continue" vs "must fail" scenarios
- ❌ `auditWebsiteAsync` catches all errors at top level (line 120), saves as fatal error

**Location:** `lib/services/audit-service.ts` (lines 386-451, 137-165, 41-132)

**Status:** ❌ Gap - All failures treated as fatal

---

### 4. Error Handling in auditWebsiteAsync

#### ❌ GAP: No Partial Failure Support

**Documented:**
```typescript
const errors: Record<string, string> = {};
const warnings: string[] = [];
// ... handle each step individually ...
// Save partial results with errors/warnings
```

**Actual Implementation:**
- ❌ Single try/catch around entire function (line 47)
- ❌ No error/warning tracking variables
- ❌ No individual error handling for each step
- ❌ All errors → `saveAuditError()` → fatal error

**Location:** `lib/services/audit-service.ts` (lines 41-132)

**Status:** ❌ Gap - Missing partial failure handling

---

### 5. Logging Patterns

#### ✅ ALIGNED: Structured Logging

**Documented:**
- Use `logger.error()` with context
- Include questionnaireResponseId, websiteUrl, error details

**Actual Implementation:**
- ✅ Uses `logger.error()` (line 124)
- ✅ Includes context: questionnaireResponseId, websiteUrl, error message
- ✅ Uses `logger.info()` for success (line 115)

**Status:** ✅ Aligned

---

#### ⚠️ MINOR GAP: Missing Error Type in Logs

**Documented:**
```typescript
await logger.error("Website audit failed", {
  errorType: "Timeout",
  // ...
});
```

**Actual Implementation:**
- ⚠️ Logs error message but no explicit `errorType` field
- ⚠️ Could extract error type from message, but not structured

**Status:** ⚠️ Minor gap - Could be enhanced

---

### 6. API Route Error Handling

#### ✅ ALIGNED: Non-Blocking Behavior

**Documented:**
- POST returns 202 immediately (fire-and-forget)
- GET returns 200 with error field if audit failed
- Never breaks discovery flow

**Actual Implementation:**
- ✅ POST returns 202 Accepted (line 180)
- ✅ POST doesn't await audit (line 157)
- ✅ GET returns 200 with error field if `audit_error` exists (line 80-90)
- ✅ Discovery page handles errors gracefully (doesn't break UI)

**Status:** ✅ Aligned

---

### 7. Type Definitions

#### ❌ GAP: Missing Error/Warning Fields

**Documented:**
```typescript
export interface WebsiteAuditResult {
  // ... existing fields ...
  errors?: Record<string, string>;
  warnings?: string[];
}
```

**Actual Implementation:**
- ❌ `WebsiteAuditResult` doesn't include `errors` or `warnings` (lines 24-34)
- ❌ `performance` is required, not optional (line 27)

**Location:** `lib/types/audit.ts`

**Status:** ❌ Gap - Type definition incomplete

---

### 8. Helper Functions

#### ✅ ALIGNED: saveAuditError Implementation

**Documented:**
- Save error message
- Don't set `audit_completed_at`
- Log but don't throw

**Actual Implementation:**
- ✅ Saves error message (line 791)
- ✅ Sets `audit_completed_at: null` (line 792)
- ✅ Logs error but doesn't throw (lines 797-807)

**Status:** ✅ Aligned

---

#### ⚠️ MINOR GAP: saveAuditResults Error Handling

**Documented:**
- If save fails → Save as error instead
- Log error with context

**Actual Implementation:**
- ⚠️ Throws error on save failure (line 767)
- ⚠️ Logs error but doesn't save to `audit_error` as fallback
- ⚠️ Error propagates to top-level catch → saved as fatal error anyway

**Status:** ⚠️ Minor gap - Could be more explicit

---

### 9. UI Error Handling

#### ❌ GAP: No Warning/Error Display

**Documented:**
- Show warnings in yellow banner
- Show errors in red banner
- Handle missing `performance` gracefully

**Actual Implementation:**
- ❌ `AuditCard` doesn't check for `errors`/`warnings` fields
- ❌ No warning/error banners
- ⚠️ `getSummaryForClient()` may fail if `performance` is missing

**Location:** `components/discovery/AuditCard.tsx`

**Status:** ❌ Gap - Missing UI error display

---

## Summary: Gaps Identified

### Critical Gaps (Must Fix)

1. **Missing Error/Warning Tracking**
   - `WebsiteAuditResult` type doesn't include `errors`/`warnings`
   - `auditWebsiteAsync` doesn't track partial failures
   - Partial results not saved with error context

2. **All Failures Treated as Fatal**
   - No distinction between fatal vs partial failures
   - PageSpeed API failure → entire audit fails
   - Should continue with partial data when possible

3. **Missing Structured Error Format**
   - Error messages don't follow `"ErrorType: Message"` format
   - Harder to parse and categorize errors

### Minor Gaps (Should Fix)

4. **Type Definition Incomplete**
   - `performance` should be optional
   - Missing `errors`/`warnings` fields

5. **UI Doesn't Show Warnings/Errors**
   - No visual indication of partial data
   - No error banners

6. **Missing Error Type in Logs**
   - Logs don't include explicit `errorType` field
   - Could extract from message, but not structured

---

## Minimal Patch Plan

### Priority 1: Enable Partial Failure Handling

**1. Update Type Definition**
- Add `errors?: Record<string, string>` to `WebsiteAuditResult`
- Add `warnings?: string[]` to `WebsiteAuditResult`
- Make `performance?: PerformanceMetrics` optional

**2. Update auditWebsiteAsync**
- Add `errors` and `warnings` tracking variables
- Wrap individual steps in try/catch (not just top level)
- Save partial results with errors/warnings when possible

**3. Update Helper Functions**
- `getPageSpeedMetrics()`: Track error in `errors.performance` instead of returning `{}`
- `saveAuditResults()`: Accept and save `errors`/`warnings` fields

### Priority 2: Structured Error Messages

**4. Update saveAuditError**
- Format error messages as `"ErrorType: Message"`
- Extract error type from error message or context

**5. Update Error Handling**
- Categorize errors (Timeout, InvalidURL, PageSpeedAPI, etc.)
- Use structured format consistently

### Priority 3: UI Enhancements

**6. Update AuditCard**
- Check for `errors`/`warnings` fields
- Show warning banner for partial data
- Show error banner for failed audits
- Handle missing `performance` gracefully

**7. Update Discovery Page**
- Pass `auditError` to `AuditCard` if available
- Handle partial results correctly

---

## Implementation Checklist

### Backend Changes

- [ ] Add `errors?: Record<string, string>` to `WebsiteAuditResult` type
- [ ] Add `warnings?: string[]` to `WebsiteAuditResult` type
- [ ] Make `performance?: PerformanceMetrics` optional
- [ ] Add error/warning tracking to `auditWebsiteAsync`
- [ ] Wrap individual steps in try/catch for partial failure handling
- [ ] Update `getPageSpeedMetrics()` to track errors in result
- [ ] Update `saveAuditError()` to use structured format: `"ErrorType: Message"`
- [ ] Update `saveAuditResults()` to save `errors`/`warnings` fields

### UI Changes

- [ ] Update `AuditCard` to check for `errors`/`warnings`
- [ ] Add warning banner for partial data
- [ ] Add error banner for failed audits
- [ ] Handle missing `performance` gracefully in `getSummaryForClient()`
- [ ] Update discovery page to pass `auditError` to `AuditCard`

### Testing

- [ ] Test PageSpeed API failure → Should save partial results
- [ ] Test HTML fetch failure → Should save fatal error
- [ ] Test timeout → Should save fatal error with structured format
- [ ] Test invalid URL → Should save fatal error with structured format
- [ ] Test UI with partial results → Should show warnings
- [ ] Test UI with failed audit → Should show error banner

---

## Files to Modify

1. `lib/types/audit.ts` - Add `errors`/`warnings` fields, make `performance` optional
2. `lib/services/audit-service.ts` - Add partial failure handling
3. `lib/utils/audit-utils.ts` - Update `getSummaryForClient()` to handle missing `performance`
4. `components/discovery/AuditCard.tsx` - Add warning/error display
5. `app/discovery/[id]/page.tsx` - Pass `auditError` to `AuditCard`

---

## Estimated Effort

- **Priority 1 (Partial Failures):** ~2-3 hours
- **Priority 2 (Structured Errors):** ~1 hour
- **Priority 3 (UI Enhancements):** ~1-2 hours

**Total:** ~4-6 hours
