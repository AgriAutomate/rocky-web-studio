# Audit State Model - Complete Specification

## Current State Analysis

### Current AuditCard Logic

**Location:** `components/discovery/AuditCard.tsx`

**Current States:**
1. **Loading:** `isLoading === true` → Shows spinner + "Analyzing website..."
2. **No Audit:** `!audit` → Shows "No audit data available. Audit will run automatically..."
3. **Has Audit:** `audit` exists → Shows audit data (platform, performance, etc.)

**Gaps Identified:**
- ❌ Can't distinguish "not requested" vs "pending" vs "failed"
- ❌ No error state display (errors are logged but not shown)
- ❌ Can't distinguish "partial" vs "full" success
- ❌ No way to show warnings/partial data indicators

### Current API Response Logic

**Location:** `app/api/audit-website/route.ts` (GET handler)

**Current Logic:**
1. If `audit_completed_at && audit_results` → Return 200 with audit
2. If `audit_error` → Return 200 with error field
3. Otherwise → Return 404 (not yet completed)

**Gaps Identified:**
- ❌ Doesn't check if `website_url` exists (can't tell if audit was requested)
- ❌ Doesn't distinguish partial vs full results
- ❌ Doesn't return audit status explicitly

### Current Discovery Page Logic

**Location:** `app/discovery/[id]/page.tsx`

**Current Logic:**
- Sets `auditLoading = true` before fetch
- If `auditData.audit` → Sets audit
- If `auditData.error` → Logs but doesn't set audit
- If 404 → Doesn't set audit
- Sets `auditLoading = false` after fetch

**Gaps Identified:**
- ❌ Can't distinguish between states after loading completes
- ❌ No error state passed to UI
- ❌ No way to know if audit was requested

## Proposed State Model

### State Enumeration

#### State 1: NOT_REQUESTED

**Database State:**
- `website_url`: `NULL` or empty string
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL`
- `audit_error`: `NULL`

**API Response:**
- Status: `404 Not Found`
- Body: `{ questionnaireResponseId, message: "Audit not yet completed..." }`
- **OR** Could return `200` with explicit status: `{ status: "not_requested", message: "No website URL provided" }`

**UI Display (AuditCard):**
- Show: "No audit data available. Audit will run automatically when a website URL is provided."

**When This Occurs:**
- Client didn't provide website URL in questionnaire
- Audit was never triggered

---

#### State 2: PENDING

**Database State:**
- `website_url`: Has value (e.g., "https://example.com")
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL`
- `audit_error`: `NULL`
- `audit_status`: `"pending"` or `"running"` (if status tracking added)

**API Response:**
- Status: `404 Not Found` (current) or `202 Accepted` (if status tracking)
- Body: `{ questionnaireResponseId, message: "Audit not yet completed. Please check again shortly." }`
- **OR** `{ status: "pending", message: "Audit in progress..." }`

**UI Display (AuditCard):**
- Show: Loading spinner + "Analyzing website... This may take 10-30 seconds"

**When This Occurs:**
- Audit was triggered but hasn't completed yet
- Audit is currently running in background

---

#### State 3: SUCCESS_FULL

**Database State:**
- `website_url`: Has value
- `audit_results`: Complete `WebsiteAuditResult` object (all fields populated)
- `audit_completed_at`: Timestamp (e.g., "2025-01-22T10:30:15Z")
- `audit_error`: `NULL`
- `audit_results.errors`: `undefined` or empty object
- `audit_results.warnings`: `undefined` or empty array

**API Response:**
- Status: `200 OK`
- Body: `{ questionnaireResponseId, audit: WebsiteAuditResult, auditCompletedAt: "..." }`

**UI Display (AuditCard):**
- Show: Full audit data (platform, performance scores, top issue, etc.)
- No warnings or error indicators

**When This Occurs:**
- Audit completed successfully with all data available
- No partial failures or missing data

---

#### State 4: SUCCESS_PARTIAL

**Database State:**
- `website_url`: Has value
- `audit_results`: Partial `WebsiteAuditResult` object (some fields missing/null)
- `audit_completed_at`: Timestamp
- `audit_error`: `NULL`
- `audit_results.errors`: `{ performance?: "PageSpeed API rate limit exceeded", ... }`
- `audit_results.warnings`: `["Low confidence CMS detection: WordPress", ...]`

**API Response:**
- Status: `200 OK`
- Body: `{ questionnaireResponseId, audit: WebsiteAuditResult (partial), auditCompletedAt: "..." }`

**UI Display (AuditCard):**
- Show: Available audit data + warning banner
- Warning banner: "⚠️ Some data unavailable: [warnings]"
- Show available metrics (e.g., platform, SEO) even if performance missing
- Indicate missing fields (e.g., "Performance metrics unavailable")

**When This Occurs:**
- Audit completed but some parts failed (e.g., PageSpeed API rate limit)
- Some detections have low confidence
- Non-critical errors occurred

---

#### State 5: FAILED

**Database State:**
- `website_url`: Has value
- `audit_results`: `NULL`
- `audit_completed_at`: `NULL` (or set if we want to track completion time)
- `audit_error`: Error message (e.g., "Timeout: Website did not respond within 30000ms")

**API Response:**
- Status: `200 OK` (current) or `500 Internal Server Error` (alternative)
- Body: `{ questionnaireResponseId, error: "Timeout: Website did not respond...", auditError: "..." }`

**UI Display (AuditCard):**
- Show: Error message in red banner
- Message: "⚠️ Analysis unavailable: [error message]"
- Optionally: "Try again" button (if retry functionality added)

**When This Occurs:**
- Fatal error occurred (timeout, invalid URL, DNS failure, etc.)
- Audit couldn't complete at all

---

#### State 6: FAILED_WITH_PARTIAL_DATA (Edge Case)

**Database State:**
- `website_url`: Has value
- `audit_results`: Partial data (some fields populated before fatal error)
- `audit_completed_at`: `NULL` (fatal error, didn't complete)
- `audit_error`: Error message

**API Response:**
- Status: `200 OK` with error field
- Body: `{ questionnaireResponseId, error: "...", auditError: "...", audit?: partial }`

**UI Display (AuditCard):**
- Show: Error message + any available partial data
- Warning: "⚠️ Analysis incomplete: [error]"
- Show what data is available (if any)

**When This Occurs:**
- Audit started but failed partway through
- Some data was collected before fatal error
- (Rare edge case - may not occur in current implementation)

## State Detection Logic

### Proposed State Detection Function

```typescript
type AuditState = 
  | "NOT_REQUESTED"
  | "PENDING"
  | "SUCCESS_FULL"
  | "SUCCESS_PARTIAL"
  | "FAILED"
  | "FAILED_WITH_PARTIAL_DATA";

interface AuditStateInfo {
  state: AuditState;
  hasWebsiteUrl: boolean;
  hasResults: boolean;
  hasError: boolean;
  isPartial: boolean;
  errorMessage?: string;
  warnings?: string[];
}

function detectAuditState(
  websiteUrl: string | null | undefined,
  auditResults: WebsiteAuditResult | null | undefined,
  auditCompletedAt: string | null | undefined,
  auditError: string | null | undefined
): AuditStateInfo {
  // State 1: NOT_REQUESTED
  if (!websiteUrl || websiteUrl.trim() === "") {
    return {
      state: "NOT_REQUESTED",
      hasWebsiteUrl: false,
      hasResults: false,
      hasError: false,
      isPartial: false,
    };
  }

  // State 5: FAILED (with no results)
  if (auditError && !auditResults) {
    return {
      state: "FAILED",
      hasWebsiteUrl: true,
      hasResults: false,
      hasError: true,
      isPartial: false,
      errorMessage: auditError,
    };
  }

  // State 6: FAILED_WITH_PARTIAL_DATA
  if (auditError && auditResults) {
    return {
      state: "FAILED_WITH_PARTIAL_DATA",
      hasWebsiteUrl: true,
      hasResults: true,
      hasError: true,
      isPartial: true,
      errorMessage: auditError,
      warnings: auditResults.warnings,
    };
  }

  // State 2: PENDING
  if (!auditCompletedAt && !auditResults && !auditError) {
    return {
      state: "PENDING",
      hasWebsiteUrl: true,
      hasResults: false,
      hasError: false,
      isPartial: false,
    };
  }

  // State 3 or 4: SUCCESS (full or partial)
  if (auditCompletedAt && auditResults) {
    const hasErrors = auditResults.errors && Object.keys(auditResults.errors).length > 0;
    const hasWarnings = auditResults.warnings && auditResults.warnings.length > 0;
    const isPartial = hasErrors || hasWarnings || !auditResults.performance;

    return {
      state: isPartial ? "SUCCESS_PARTIAL" : "SUCCESS_FULL",
      hasWebsiteUrl: true,
      hasResults: true,
      hasError: false,
      isPartial,
      warnings: auditResults.warnings,
    };
  }

  // Fallback: PENDING (shouldn't reach here, but safe fallback)
  return {
    state: "PENDING",
    hasWebsiteUrl: true,
    hasResults: false,
    hasError: false,
    isPartial: false,
  };
}
```

## Updated API Response Structure

### Enhanced AuditFetchResponse

```typescript
export interface AuditFetchResponse {
  questionnaireResponseId: string | number;
  status: "not_requested" | "pending" | "completed" | "failed";
  audit?: WebsiteAuditResult;
  error?: string;
  auditCompletedAt?: string;
  auditError?: string;
  websiteUrl?: string; // Include to help frontend determine state
}
```

### Updated GET Handler Logic

```typescript
// Fetch with website_url to determine NOT_REQUESTED state
const { data: response } = await supabase
  .from("questionnaire_responses")
  .select("id, website_url, audit_results, audit_completed_at, audit_error")
  .eq("id", questionnaireResponseId)
  .single();

// Determine state
if (!response.website_url || response.website_url.trim() === "") {
  return NextResponse.json({
    questionnaireResponseId,
    status: "not_requested",
    message: "No website URL provided. Audit will run automatically when URL is provided.",
  }, { status: 200 });
}

if (response.audit_completed_at && response.audit_results) {
  const audit = response.audit_results as WebsiteAuditResult;
  const hasErrors = audit.errors && Object.keys(audit.errors).length > 0;
  const hasWarnings = audit.warnings && audit.warnings.length > 0;
  const isPartial = hasErrors || hasWarnings;

  return NextResponse.json({
    questionnaireResponseId,
    status: "completed",
    audit,
    auditCompletedAt: response.audit_completed_at,
    isPartial, // Optional: indicate if partial
  }, { status: 200 });
}

if (response.audit_error) {
  return NextResponse.json({
    questionnaireResponseId,
    status: "failed",
    error: response.audit_error,
    auditError: response.audit_error,
    audit: response.audit_results || undefined, // Include partial if exists
  }, { status: 200 });
}

// PENDING
return NextResponse.json({
  questionnaireResponseId,
  status: "pending",
  message: "Audit in progress. Please check again shortly.",
}, { status: 200 }); // Changed from 404 to 200 with explicit status
```

## Updated UI Component Logic

### Enhanced AuditCard Props

```typescript
interface AuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  auditStatus?: "not_requested" | "pending" | "completed" | "failed";
  auditError?: string;
  websiteUrl?: string;
}
```

### Updated AuditCard Logic

```typescript
export function AuditCard({ 
  audit, 
  isLoading, 
  auditStatus,
  auditError,
  websiteUrl 
}: AuditCardProps) {
  // State 1: Loading
  if (isLoading) {
    return <LoadingState />;
  }

  // State 2: Not Requested
  if (auditStatus === "not_requested" || (!audit && !auditError && !websiteUrl)) {
    return (
      <Card className="p-6">
        <h3>Current Site Analysis</h3>
        <p>No audit data available. Audit will run automatically when a website URL is provided.</p>
      </Card>
    );
  }

  // State 3: Pending
  if (auditStatus === "pending" || (!audit && !auditError && websiteUrl)) {
    return (
      <Card className="p-6">
        <h3>Current Site Analysis</h3>
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Analyzing website... This may take 10-30 seconds</span>
        </div>
      </Card>
    );
  }

  // State 4: Failed
  if (auditStatus === "failed" || auditError) {
    return (
      <Card className="p-6">
        <h3>Current Site Analysis</h3>
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            ⚠️ Analysis unavailable: {auditError || "Unknown error"}
          </p>
        </div>
      </Card>
    );
  }

  // State 5: Success (Full or Partial)
  if (audit) {
    const isPartial = audit.errors && Object.keys(audit.errors).length > 0;
    const hasWarnings = audit.warnings && audit.warnings.length > 0;

    return (
      <Card className="p-6">
        <h3>Current Site Analysis</h3>
        
        {/* Warning Banner for Partial */}
        {(isPartial || hasWarnings) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-medium mb-1">
              ⚠️ Some data unavailable
            </p>
            {hasWarnings && (
              <ul className="text-xs text-yellow-700 list-disc list-inside">
                {audit.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Audit Data */}
        {/* ... existing audit display ... */}
      </Card>
    );
  }

  // Fallback: Shouldn't reach here
  return (
    <Card className="p-6">
      <h3>Current Site Analysis</h3>
      <p>Unable to load audit data.</p>
    </Card>
  );
}
```

## State Transition Diagram

```
NOT_REQUESTED (no URL)
    ↓ [URL provided]
PENDING (audit triggered)
    ↓ [audit completes]
    ├─→ SUCCESS_FULL (all data)
    ├─→ SUCCESS_PARTIAL (some data missing)
    └─→ FAILED (fatal error)
```

## Summary Table

| State | website_url | audit_results | audit_completed_at | audit_error | UI Display |
|-------|-------------|--------------|-------------------|-------------|------------|
| **NOT_REQUESTED** | `NULL` | `NULL` | `NULL` | `NULL` | "No audit data available. Audit will run automatically when a website URL is provided." |
| **PENDING** | Has value | `NULL` | `NULL` | `NULL` | Loading spinner + "Analyzing website... This may take 10-30 seconds" |
| **SUCCESS_FULL** | Has value | Complete object | Timestamp | `NULL` | Full audit data (platform, performance, top issue) |
| **SUCCESS_PARTIAL** | Has value | Partial object | Timestamp | `NULL` | Available data + warning banner with missing fields |
| **FAILED** | Has value | `NULL` | `NULL` | Error message | Error banner: "⚠️ Analysis unavailable: [error]" |
| **FAILED_WITH_PARTIAL** | Has value | Partial object | `NULL` | Error message | Error banner + any available partial data |

## Gaps in Current Implementation

### Gap 1: Can't Distinguish NOT_REQUESTED vs PENDING

**Current:** Both show "No audit data available"

**Fix:** Check `website_url` in API response, return explicit status

### Gap 2: No Error State Display

**Current:** Errors are logged but not shown to user

**Fix:** Pass `auditError` to AuditCard, show error banner

### Gap 3: Can't Distinguish PARTIAL vs FULL

**Current:** Shows all audit data the same way

**Fix:** Check for `errors`/`warnings` fields, show warning banner

### Gap 4: Ambiguous State After Loading

**Current:** `auditLoading = false` but `audit = undefined` could mean multiple things

**Fix:** Return explicit `status` field from API, pass to component

### Gap 5: No Retry Mechanism

**Current:** If audit fails, user can't retry

**Fix:** Add "Retry Audit" button for FAILED state (future enhancement)

## Recommended Changes

### 1. Update API Response

**Add `status` field:**
```typescript
{
  status: "not_requested" | "pending" | "completed" | "failed",
  // ... other fields
}
```

**Include `websiteUrl` in response:**
```typescript
{
  websiteUrl: string | null,
  // ... other fields
}
```

### 2. Update AuditCard Props

**Add status and error props:**
```typescript
interface AuditCardProps {
  audit?: WebsiteAuditResult;
  isLoading: boolean;
  auditStatus?: "not_requested" | "pending" | "completed" | "failed";
  auditError?: string;
  websiteUrl?: string;
}
```

### 3. Update Discovery Page

**Pass status and error:**
```typescript
const auditData = await auditResponse.json();
setAudit(auditData.audit);
setAuditStatus(auditData.status);
setAuditError(auditData.error);
```

### 4. Update AuditCard Logic

**Handle all states explicitly:**
- NOT_REQUESTED → Show "No URL" message
- PENDING → Show loading (even if `isLoading = false`)
- SUCCESS_FULL → Show full data
- SUCCESS_PARTIAL → Show data + warnings
- FAILED → Show error message

## Benefits

1. **Predictable UI:** Clear state model, no ambiguity
2. **Better UX:** Users understand what's happening
3. **Easier Debugging:** Explicit states make issues obvious
4. **Future-Proof:** Easy to add retry, refresh, etc.
5. **Type-Safe:** TypeScript can enforce state handling
