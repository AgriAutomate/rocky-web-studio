# AuditCard State Model & Props Design

## Current Implementation Analysis

### Current AuditCard Props

**Location:** `components/discovery/AuditCard.tsx` (lines 8-11)

```typescript
interface AuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
}
```

**Current Logic:**
1. If `isLoading` → Show loading spinner
2. If `!audit` → Show "No audit data available..."
3. If `audit` → Show audit data

**Gaps:**
- ❌ Can't distinguish NOT_REQUESTED vs PENDING vs FAILED
- ❌ No error display
- ❌ Can't distinguish PARTIAL vs FULL

---

### Current Page → AuditCard Flow

**Location:** `app/discovery/[id]/page.tsx` (lines 44-66, 136-137)

**Current Flow:**
1. Page fetches audit via GET `/api/audit-website`
2. Sets `auditLoading = true` before fetch
3. If `auditData.audit` → Sets `audit`
4. If `auditData.error` → Logs but doesn't set audit
5. If 404 → Doesn't set audit
6. Sets `auditLoading = false` after fetch
7. Passes `audit` and `auditLoading` to `AuditCard`

**Issue:** After loading completes, `auditLoading = false` and `audit = undefined` could mean multiple states.

---

### Current API Response

**Location:** `app/api/audit-website/route.ts` (GET handler)

**Current Responses:**
- 200 OK: `{ audit: WebsiteAuditResult, auditCompletedAt: string }`
- 200 OK: `{ error: string, auditError: string }`
- 404 Not Found: `{ questionnaireResponseId, message: "..." }`

**Gaps:**
- ❌ Doesn't include `website_url` in response
- ❌ Doesn't include explicit `status` field
- ❌ 404 doesn't distinguish "not requested" vs "pending"

---

## Proposed Explicit Prop Model

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
- ✅ `audit` optional (only present for success states)
- ✅ `errorMessage` optional (only present for failed states)
- ✅ `warnings` optional (only present for partial states)

---

## Status Derivation Logic (Page Level)

### Database Fields Available

**From API Response:**
- `website_url` (from questionnaire response)
- `audit_results` (JSONB)
- `audit_completed_at` (TIMESTAMP)
- `audit_error` (TEXT)
- `audit_status` (TEXT, if status tracking added) - optional

### Status Derivation Algorithm

**Location:** `app/discovery/[id]/page.tsx` (after fetching audit data)

**Logic Flow:**

```
1. Check website_url:
   IF website_url is NULL or empty:
     → status = "NOT_REQUESTED"
     → Return early (no audit possible)

2. Check audit_status (if available):
   IF audit_status === "pending" or "running":
     → status = "PENDING"
     → Return early (audit in progress)

3. Check audit_error:
   IF audit_error exists:
     → Check audit_results:
       IF audit_results exists:
         → status = "FAILED_WITH_PARTIAL_DATA"
       ELSE:
         → status = "FAILED"
     → errorMessage = audit_error
     → Return

4. Check audit_completed_at and audit_results:
   IF both exist:
     → Check for partial indicators:
       IF audit_results.errors exists OR audit_results.warnings exists:
         → status = "SUCCESS_PARTIAL"
         → warnings = audit_results.warnings
       ELSE:
         → status = "SUCCESS_FULL"
     → audit = audit_results
     → Return

5. Default (no audit_error, no audit_completed_at):
   → status = "PENDING"
   → Return (audit not yet completed)
```

**Pseudocode:**

```typescript
function deriveAuditStatus(
  websiteUrl: string | null | undefined,
  auditResults: WebsiteAuditResult | null | undefined,
  auditCompletedAt: string | null | undefined,
  auditError: string | null | undefined,
  auditStatus?: "pending" | "running" | "completed" | "failed" | null
): {
  status: AuditStatus;
  audit?: WebsiteAuditResult;
  errorMessage?: string;
  warnings?: string[];
} {
  // Step 1: Check if audit was requested
  if (!websiteUrl || websiteUrl.trim() === "") {
    return { status: "NOT_REQUESTED" };
  }

  // Step 2: Check explicit status (if available)
  if (auditStatus === "pending" || auditStatus === "running") {
    return { status: "PENDING" };
  }

  // Step 3: Check for errors
  if (auditError) {
    if (auditResults) {
      return {
        status: "FAILED_WITH_PARTIAL_DATA",
        audit: auditResults,
        errorMessage: auditError,
        warnings: auditResults.warnings,
      };
    } else {
      return {
        status: "FAILED",
        errorMessage: auditError,
      };
    }
  }

  // Step 4: Check for completed audit
  if (auditCompletedAt && auditResults) {
    const hasErrors = auditResults.errors && Object.keys(auditResults.errors).length > 0;
    const hasWarnings = auditResults.warnings && auditResults.warnings.length > 0;
    
    if (hasErrors || hasWarnings) {
      return {
        status: "SUCCESS_PARTIAL",
        audit: auditResults,
        warnings: auditResults.warnings,
      };
    } else {
      return {
        status: "SUCCESS_FULL",
        audit: auditResults,
      };
    }
  }

  // Step 5: Default to pending
  return { status: "PENDING" };
}
```

---

## API Response Enhancement Needed

### Current API Response

**Location:** `app/api/audit-website/route.ts` (GET handler)

**Current:**
- Doesn't include `website_url` in response
- Doesn't include explicit `status` field
- 404 doesn't distinguish states

### Enhanced API Response

**Required Changes:**

1. **Include `website_url` in SELECT query:**
   ```typescript
   .select("id, website_url, audit_results, audit_completed_at, audit_error, audit_status")
   ```

2. **Return `website_url` in response:**
   ```typescript
   {
     questionnaireResponseId: string;
     websiteUrl?: string;  // NEW
     status?: "not_requested" | "pending" | "completed" | "failed";  // NEW
     audit?: WebsiteAuditResult;
     error?: string;
     auditCompletedAt?: string;
     auditError?: string;
   }
   ```

3. **Update GET handler logic:**
   - Check `website_url` → Return `status: "not_requested"` if null
   - Check `audit_status` → Return `status: "pending"` if "pending"/"running"
   - Return explicit `status` field in all responses

**Benefits:**
- ✅ Page can derive status without additional queries
- ✅ Explicit status makes state clear
- ✅ Backward compatible (status is optional)

---

## AuditCard Display by State

### State 1: NOT_REQUESTED

**Props:**
```typescript
{
  status: "NOT_REQUESTED",
  audit: undefined,
  errorMessage: undefined,
  warnings: undefined
}
```

**Display:**
- Card with muted styling
- Title: "Current Site Analysis"
- Message: "No audit data available. Audit will run automatically when a website URL is provided."
- No loading spinner
- No action buttons

**UX:** Informative, non-intrusive. User knows audit will happen when URL is provided.

---

### State 2: PENDING

**Props:**
```typescript
{
  status: "PENDING",
  audit: undefined,
  errorMessage: undefined,
  warnings: undefined
}
```

**Display:**
- Card with loading indicator
- Title: "Current Site Analysis"
- Loading spinner (animated)
- Message: "Analyzing website... This may take 10-30 seconds"
- Optional: Show elapsed time if `audit_started_at` available

**UX:** Clear indication that audit is in progress. User knows to wait.

---

### State 3: SUCCESS_FULL

**Props:**
```typescript
{
  status: "SUCCESS_FULL",
  audit: WebsiteAuditResult,
  errorMessage: undefined,
  warnings: undefined
}
```

**Display:**
- Card with success styling (green border-top accent)
- Title: "Current Site Analysis"
- Full audit data display:
  - Platform badge
  - Performance scores (mobile/desktop)
  - Social profiles found
  - Top priority issue
  - View website link
- No warning banners
- No error indicators

**UX:** Complete, confident display. User sees full analysis results.

---

### State 4: SUCCESS_PARTIAL

**Props:**
```typescript
{
  status: "SUCCESS_PARTIAL",
  audit: WebsiteAuditResult,
  errorMessage: undefined,
  warnings: string[]
}
```

**Display:**
- Card with warning styling (yellow border-top accent)
- Title: "Current Site Analysis"
- Warning banner at top:
  - Yellow background (`bg-yellow-50`)
  - Border (`border-yellow-200`)
  - Icon: ⚠️
  - Message: "Some data unavailable"
  - List warnings: `warnings.map(w => <li>{w}</li>)`
- Available audit data display (same as SUCCESS_FULL)
- Indicate missing fields (e.g., "Performance metrics unavailable" if `performance` missing)

**UX:** Shows available data but indicates limitations. User understands what's missing.

---

### State 5: FAILED

**Props:**
```typescript
{
  status: "FAILED",
  audit: undefined,
  errorMessage: string,
  warnings: undefined
}
```

**Display:**
- Card with error styling (red border-top accent)
- Title: "Current Site Analysis"
- Error banner:
  - Red background (`bg-red-50`)
  - Border (`border-red-200`)
  - Icon: ⚠️
  - Message: "Analysis unavailable"
  - Error details: `errorMessage`
- Optional: "Retry Audit" button (future enhancement)
- No audit data displayed

**UX:** Clear error indication. User knows audit failed and why. Option to retry (future).

---

### State 6: FAILED_WITH_PARTIAL_DATA

**Props:**
```typescript
{
  status: "FAILED_WITH_PARTIAL_DATA",
  audit: WebsiteAuditResult,
  errorMessage: string,
  warnings?: string[]
}
```

**Display:**
- Card with error styling (red border-top accent)
- Title: "Current Site Analysis"
- Error banner at top:
  - Red background
  - Message: "Analysis incomplete"
  - Error details: `errorMessage`
- Available partial data display (if any):
  - Show what data is available
  - Indicate what's missing
- Warnings banner (if `warnings` present)

**UX:** Shows what data was collected before failure. User sees partial results despite error.

---

## Page-Level Status Derivation

### Implementation Location

**File:** `app/discovery/[id]/page.tsx`

**After fetching audit data:**

```typescript
// After auditResponse.json()
const auditStatus = deriveAuditStatus(
  auditData.websiteUrl,        // From API response
  auditData.audit,             // From API response
  auditData.auditCompletedAt,  // From API response
  auditData.error,             // From API response
  auditData.status             // From API response (if available)
);

// Pass to AuditCard
<AuditCard
  status={auditStatus.status}
  audit={auditStatus.audit}
  errorMessage={auditStatus.errorMessage}
  warnings={auditStatus.warnings}
/>
```

**Helper Function Location:** `lib/utils/audit-utils.ts` (or new `lib/utils/audit-state.ts`)

---

## Extra Data Needed from API

### Current API Response

**Missing:**
- ❌ `website_url` (needed to determine NOT_REQUESTED)
- ❌ Explicit `status` field (needed for clarity)
- ❌ `warnings` array (needed for SUCCESS_PARTIAL)

### Enhanced API Response Structure

**Update `AuditFetchResponse` type:**

```typescript
export interface AuditFetchResponse {
  questionnaireResponseId: string | number;
  status?: "not_requested" | "pending" | "completed" | "failed";  // NEW
  websiteUrl?: string;  // NEW
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string;
  auditError?: string;
  warnings?: string[];  // NEW (extracted from audit.warnings)
}
```

**Update GET Handler:**

1. **Include `website_url` in SELECT:**
   ```typescript
   .select("id, website_url, audit_results, audit_completed_at, audit_error, audit_status")
   ```

2. **Check `website_url` first:**
   ```typescript
   if (!response.website_url || response.website_url.trim() === "") {
     return { status: "not_requested", websiteUrl: null, ... };
   }
   ```

3. **Extract warnings from audit_results:**
   ```typescript
   if (auditResults?.warnings) {
     fetchResponse.warnings = auditResults.warnings;
   }
   ```

4. **Return explicit status:**
   ```typescript
   if (auditCompletedAt && auditResults) {
     const isPartial = auditResults.errors || auditResults.warnings;
     fetchResponse.status = isPartial ? "completed" : "completed"; // Both "completed", check partial separately
   }
   ```

**Note:** Status can be "completed" for both full and partial. Check `warnings`/`errors` to distinguish.

---

## Summary

### Explicit Prop Model ✅

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

### Status Derivation ✅

**Algorithm:**
1. Check `website_url` → NOT_REQUESTED if null
2. Check `audit_status` → PENDING if "pending"/"running"
3. Check `audit_error` → FAILED or FAILED_WITH_PARTIAL
4. Check `audit_completed_at` + `audit_results` → SUCCESS_FULL or SUCCESS_PARTIAL
5. Default → PENDING

### Display by State ✅

- **NOT_REQUESTED:** Informative message (no URL provided)
- **PENDING:** Loading spinner + "Analyzing website..."
- **SUCCESS_FULL:** Full audit data (no warnings)
- **SUCCESS_PARTIAL:** Audit data + warning banner
- **FAILED:** Error banner + error message
- **FAILED_WITH_PARTIAL:** Error banner + partial data

### Extra Data Needed ✅

**API Must Return:**
- ✅ `websiteUrl` (to determine NOT_REQUESTED)
- ✅ `status` (explicit status field)
- ✅ `warnings` (extracted from `audit_results.warnings`)

**Status:** Ready for implementation!
