# Audit Idempotency & Status Tracking - Implementation Plan

## Current State Analysis

### Existing Implementation

**POST Handler (`app/api/audit-website/route.ts`):**
- ✅ Fire-and-forget pattern (returns 202 immediately)
- ✅ Triggers `auditWebsiteAsync()` without awaiting
- ❌ No idempotency check (duplicate audits possible)
- ❌ No status tracking (can't distinguish pending vs never started)

**Audit Service (`lib/services/audit-service.ts`):**
- ✅ Async function runs in background
- ✅ Saves results to `audit_results` JSONB
- ✅ Sets `audit_completed_at` on success
- ✅ Sets `audit_error` on failure
- ❌ No status tracking during execution
- ❌ No `audit_started_at` timestamp

**Database Schema:**
- ✅ `website_url` (TEXT) - indexed for duplicate detection
- ✅ `audit_results` (JSONB) - stores complete audit data
- ✅ `audit_completed_at` (TIMESTAMP) - completion time
- ✅ `audit_error` (TEXT) - error message if failed
- ❌ No `audit_status` column
- ❌ No `audit_started_at` column

**GET Handler:**
- ✅ Returns 200 with audit if `audit_completed_at` exists
- ✅ Returns 200 with error if `audit_error` exists
- ✅ Returns 404 if neither exists (pending/not started)
- ⚠️ Can't distinguish "pending" vs "running" vs "never started"

---

## Implementation Plan

### Part 1: 24-Hour Idempotency Check

#### Goal
Prevent duplicate audits for the same URL within 24 hours to save PageSpeed API quota.

#### Logic Flow

```
POST /api/audit-website
├─ Validate request (questionnaireResponseId, websiteUrl)
├─ Normalize URL
├─ CHECK IDEMPOTENCY:
│   ├─ Query: SELECT audit_results, audit_completed_at, website_url
│   │         WHERE id = questionnaireResponseId
│   ├─ IF audit_completed_at exists AND website_url matches:
│   │   ├─ Calculate hours since completion
│   │   ├─ IF hours < 24:
│   │   │   └─ RETURN 200 with cached result (skip audit)
│   │   └─ ELSE:
│   │       └─ Continue to trigger new audit
│   └─ ELSE:
│       └─ Continue to trigger new audit
└─ Trigger audit (if not cached)
```

#### Implementation Details

**File:** `app/api/audit-website/route.ts` (POST handler)

**Location:** After URL normalization, before triggering audit

**Query:**
```sql
SELECT audit_results, audit_completed_at, website_url
FROM questionnaire_responses
WHERE id = questionnaireResponseId
```

**Check Logic:**
1. If `audit_completed_at` exists AND `audit_results` exists AND `website_url` matches normalized URL:
   - Calculate: `hoursSince = (now - audit_completed_at) / (1000 * 60 * 60)`
   - If `hoursSince < 24`:
     - Log: "Using cached audit result"
     - Return: `200 OK` with `{ success: true, cached: true, auditCompletedAt: ..., message: "Using cached audit results" }`
   - Else:
     - Continue to trigger new audit (cache expired)

2. If any condition fails:
   - Continue to trigger new audit

**Edge Cases:**
- ✅ Different URL → Trigger new audit (even if recent audit exists)
- ✅ No audit_completed_at → Trigger new audit
- ✅ audit_error exists but no audit_results → Trigger new audit (previous audit failed)
- ✅ audit_completed_at > 24h → Trigger new audit (cache expired)

**Response Format:**
```typescript
{
  success: true,
  questionnaireResponseId: string | number,
  message: "Using cached audit results",
  cached: true,
  auditCompletedAt: string, // ISO 8601 timestamp
}
```

**Status Code:** `200 OK` (not `202 Accepted` - cached result is immediate)

**Benefits:**
- ✅ Prevents duplicate audits (saves API quota)
- ✅ Faster response (no wait for audit)
- ✅ Uses existing database columns (no migration needed)
- ✅ Backward compatible (existing audits still work)

**Risks:**
- ⚠️ **Low Risk:** If URL changes but same questionnaireResponseId, will trigger new audit (correct behavior)
- ⚠️ **Low Risk:** 24-hour window is arbitrary but reasonable (can be made configurable later)

---

### Part 2: Audit Status Tracking

#### Goal
Add explicit status tracking to distinguish "pending", "running", "completed", "failed" states.

#### Status Values

| Status | When Set | Meaning |
|--------|----------|---------|
| `pending` | POST handler (before triggering audit) | Audit queued, not yet started |
| `running` | `auditWebsiteAsync()` start | Audit in progress |
| `completed` | `saveAuditResults()` success | Audit completed successfully |
| `failed` | `saveAuditError()` or catch block | Audit failed (fatal error) |

#### Database Changes

**Migration:** `supabase/migrations/20250123_add_audit_status.sql`

**New Columns:**
```sql
-- Audit status: pending | running | completed | failed
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_status IS 
  'Audit status: pending (queued), running (in progress), completed (success), failed (error)';

-- Audit started timestamp
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_started_at IS 
  'Timestamp when audit started running';
```

**Index:**
```sql
-- Index for querying audits by status
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_status
  ON public.questionnaire_responses (audit_status)
  WHERE audit_status IS NOT NULL;
```

**Rationale:**
- ✅ Uses `TEXT` (not ENUM) for flexibility (can add new statuses later)
- ✅ `DEFAULT NULL` for backward compatibility (existing rows)
- ✅ Index for efficient querying by status
- ✅ Follows existing naming pattern (snake_case)

#### Implementation Flow

**1. POST Handler - Set Status to 'pending'**

**File:** `app/api/audit-website/route.ts`

**Location:** After idempotency check passes, before triggering audit

**Action:**
```typescript
// Set status to 'pending' before triggering
await (supabase as any)
  .from("questionnaire_responses")
  .update({ audit_status: 'pending' })
  .eq("id", body.questionnaireResponseId);
```

**Rationale:** 
- Sets status immediately (before async function starts)
- Allows GET handler to return "pending" status
- Non-blocking (doesn't await, fire-and-forget)

**2. Audit Service - Set Status to 'running'**

**File:** `lib/services/audit-service.ts`

**Location:** Start of `auditWebsiteAsync()` function, after URL validation

**Action:**
```typescript
// Set status to 'running' and record start time
await setAuditStatus(questionnaireResponseId, 'running');
```

**Helper Function:**
```typescript
async function setAuditStatus(
  questionnaireResponseId: string | number,
  status: 'pending' | 'running' | 'completed' | 'failed'
): Promise<void> {
  const supabase = createServerSupabaseClient(true);
  const update: any = { audit_status: status };
  
  if (status === 'running') {
    update.audit_started_at = new Date().toISOString();
  }
  
  await (supabase as any)
    .from("questionnaire_responses")
    .update(update)
    .eq("id", questionnaireResponseId);
}
```

**Rationale:**
- Sets status when audit actually starts (not when queued)
- Records `audit_started_at` for timing analysis
- Reusable helper for all status updates

**3. Audit Service - Set Status to 'completed'**

**File:** `lib/services/audit-service.ts`

**Location:** After `saveAuditResults()` succeeds

**Action:**
```typescript
// Save results
await saveAuditResults(questionnaireResponseId, auditResult);

// Set status to 'completed'
await setAuditStatus(questionnaireResponseId, 'completed');
```

**Note:** `saveAuditResults()` already sets `audit_completed_at`, so status update is separate.

**4. Audit Service - Set Status to 'failed'**

**File:** `lib/services/audit-service.ts`

**Location:** In catch block, before `saveAuditError()`

**Action:**
```typescript
catch (error) {
  // Set status to 'failed'
  await setAuditStatus(questionnaireResponseId, 'failed');
  
  // Save error message
  await saveAuditError(questionnaireResponseId, errorMessage);
}
```

**Rationale:**
- Sets status before saving error (allows GET handler to check status)
- Error message still saved for debugging

**5. GET Handler - Use Status for Better Responses**

**File:** `app/api/audit-website/route.ts`

**Location:** Update GET handler to check `audit_status`

**Current Logic:**
```typescript
if (audit_completed_at && audit_results) → 200 OK
if (audit_error) → 200 OK with error
else → 404 Not Found
```

**New Logic:**
```typescript
if (audit_status === 'completed' && audit_results) → 200 OK
if (audit_status === 'failed' && audit_error) → 200 OK with error
if (audit_status === 'running' || audit_status === 'pending') → 202 Accepted (processing)
else → 404 Not Found (never started)
```

**Response Format for 'running'/'pending':**
```typescript
{
  questionnaireResponseId: string | number,
  status: 'pending' | 'running',
  message: "Audit in progress. Please check again shortly.",
  auditStartedAt?: string, // If status is 'running'
}
```

**Status Code:** `202 Accepted` (processing, not completed)

**Benefits:**
- ✅ Clear distinction between states
- ✅ Better UI feedback (can show "in progress" vs "not started")
- ✅ Enables retry logic (if status stuck in 'running')
- ✅ Backward compatible (existing GET logic still works)

**Risks:**
- ⚠️ **Low Risk:** Status updates are async (may have slight delay)
- ⚠️ **Low Risk:** If audit crashes, status may remain 'running' (can add timeout check later)

---

### Part 3: Vercel Timeout Strategy

#### Goal
Ensure audit doesn't hit Vercel function timeout limits.

#### Vercel Timeout Limits

| Plan | Default | Max (configurable) |
|------|---------|-------------------|
| Hobby | 10s | 10s (fixed) |
| Pro | 60s | 300s (5 min) |
| Enterprise | 300s | 900s (15 min) |

#### Current Risk

**Fire-and-Forget Pattern:**
- POST handler triggers `auditWebsiteAsync()` without awaiting
- Function returns 202 immediately
- Audit continues in background

**Potential Issue:**
- If function times out before audit completes, audit may be killed
- No guarantee audit will finish if function is terminated

#### Solution: Add `maxDuration` Config

**File:** `app/api/audit-website/route.ts`

**Location:** Top of file, with other exports

**Configuration:**
```typescript
// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Extend timeout for audit processing
// Vercel Pro: up to 300s, Hobby: 10s (fixed)
// Set to 60s to give audit time to start (not complete)
export const maxDuration = 60; // seconds
```

**Rationale:**
- ✅ `60s` is enough for audit to start (not complete)
- ✅ Works on Vercel Pro (60s < 300s max)
- ✅ Fails gracefully on Hobby (will timeout at 10s, but audit already started)
- ✅ Doesn't block POST handler (fire-and-forget still works)

**Alternative Approach (If Needed):**
- Use Vercel Background Functions (if available)
- Or: Move audit to separate API route with longer timeout
- Or: Use external job queue (overkill for current scale)

**Benefits:**
- ✅ Reduces timeout risk (more time for audit to start)
- ✅ No code changes needed (just config)
- ✅ Backward compatible (existing behavior preserved)

**Risks:**
- ⚠️ **Low Risk:** On Hobby plan, will still timeout at 10s (but audit already started)
- ⚠️ **Low Risk:** If audit takes > 60s to start, may timeout (rare)

---

## Implementation Order

### Step 1: Add Idempotency Check (No Migration)

**Files:**
- `app/api/audit-website/route.ts` - Add idempotency check in POST handler

**Changes:**
- Add database query before triggering audit
- Add cache check logic (24-hour window)
- Return cached result if available

**Testing:**
- ✅ POST same URL twice → Second returns cached
- ✅ POST same URL after 24h → Triggers new audit
- ✅ POST different URL → Triggers new audit

**Risk:** ✅ Low - No database changes, backward compatible

---

### Step 2: Add Status Tracking (Requires Migration)

**Files:**
- `supabase/migrations/20250123_add_audit_status.sql` - New migration
- `app/api/audit-website/route.ts` - Set 'pending' in POST, check status in GET
- `lib/services/audit-service.ts` - Set 'running', 'completed', 'failed'

**Changes:**
- Add `audit_status` and `audit_started_at` columns
- Add `setAuditStatus()` helper function
- Update status at each stage (pending → running → completed/failed)
- Update GET handler to use status

**Testing:**
- ✅ POST → Status set to 'pending'
- ✅ Audit starts → Status set to 'running'
- ✅ Audit completes → Status set to 'completed'
- ✅ Audit fails → Status set to 'failed'
- ✅ GET with 'running' → Returns 202

**Risk:** ✅ Low - Backward compatible (NULL status = old behavior)

---

### Step 3: Add maxDuration Config (No Migration)

**Files:**
- `app/api/audit-website/route.ts` - Add `export const maxDuration = 60`

**Changes:**
- Single line addition

**Testing:**
- ✅ Function doesn't timeout before audit starts
- ✅ POST still returns 202 quickly

**Risk:** ✅ Very Low - Just config, no code changes

---

## Breaking Changes Analysis

### API Contract Changes

**POST Handler:**
- ✅ **No Breaking Changes:** Still returns 202 (or 200 for cached)
- ✅ **New Field:** `cached: true` in cached response (optional, backward compatible)

**GET Handler:**
- ✅ **No Breaking Changes:** Still returns 200/404 as before
- ✅ **New Response:** 202 for 'running'/'pending' (new status, doesn't break existing clients)
- ✅ **New Field:** `status` field in response (optional, backward compatible)

**Database:**
- ✅ **No Breaking Changes:** New columns are nullable
- ✅ **Backward Compatible:** Existing rows have NULL status (treated as "never started")

### UI Contract Changes

**Current UI:**
- Fetches audit via GET `/api/audit-website`
- Handles 200 (success/error) and 404 (pending)

**New UI Behavior:**
- ✅ **Backward Compatible:** 200 and 404 still work
- ✅ **Enhanced:** Can handle 202 for "in progress" (optional enhancement)

**No Breaking Changes:** Existing UI continues to work without modifications.

---

## Edge Cases & Error Handling

### Idempotency Edge Cases

1. **URL Changes:**
   - Scenario: Same questionnaireResponseId, different URL
   - Behavior: Triggers new audit (correct - URL changed)
   - ✅ Handled: Check `website_url` matches

2. **Previous Audit Failed:**
   - Scenario: `audit_error` exists but no `audit_results`
   - Behavior: Triggers new audit (correct - previous failed)
   - ✅ Handled: Check `audit_results` exists

3. **Cache Expired:**
   - Scenario: `audit_completed_at` > 24 hours old
   - Behavior: Triggers new audit (correct - cache expired)
   - ✅ Handled: Check hours since completion

4. **Concurrent Requests:**
   - Scenario: Two POST requests for same URL simultaneously
   - Behavior: Both may trigger audit (race condition)
   - ⚠️ **Acceptable:** Rare edge case, both audits will complete (one will be cached next time)

### Status Tracking Edge Cases

1. **Status Update Fails:**
   - Scenario: Database update fails when setting status
   - Behavior: Audit continues, status may be incorrect
   - ✅ **Handled:** Log error, continue audit (non-critical)

2. **Audit Crashes:**
   - Scenario: Audit process crashes mid-execution
   - Behavior: Status remains 'running'
   - ⚠️ **Future Enhancement:** Add timeout check (if status 'running' > 5 min, mark as 'failed')

3. **Multiple Status Updates:**
   - Scenario: Status updated multiple times rapidly
   - Behavior: Last update wins (correct)
   - ✅ **Handled:** Each update overwrites previous

### Timeout Edge Cases

1. **Hobby Plan:**
   - Scenario: Function times out at 10s
   - Behavior: Audit already started, continues in background
   - ✅ **Handled:** Fire-and-forget pattern ensures audit continues

2. **Very Long Audit:**
   - Scenario: Audit takes > 60s to start
   - Behavior: Function may timeout
   - ⚠️ **Rare:** Most audits start quickly, PageSpeed API is the bottleneck

---

## Testing Checklist

### Idempotency Tests

- [ ] POST same URL twice → Second returns cached (200)
- [ ] POST same URL after 24h → Triggers new audit (202)
- [ ] POST different URL → Triggers new audit (202)
- [ ] POST with previous failed audit → Triggers new audit (202)
- [ ] POST with no previous audit → Triggers new audit (202)

### Status Tracking Tests

- [ ] POST → Status set to 'pending'
- [ ] Audit starts → Status set to 'running', `audit_started_at` set
- [ ] Audit completes → Status set to 'completed'
- [ ] Audit fails → Status set to 'failed'
- [ ] GET with 'pending' → Returns 202 with status
- [ ] GET with 'running' → Returns 202 with status and `auditStartedAt`
- [ ] GET with 'completed' → Returns 200 with audit
- [ ] GET with 'failed' → Returns 200 with error
- [ ] GET with NULL status → Returns 404 (backward compatible)

### Timeout Tests

- [ ] POST returns 202 quickly (< 1s)
- [ ] Audit starts before function timeout
- [ ] Function doesn't block on audit completion

---

## Migration Plan

### Migration File

**File:** `supabase/migrations/20250123_add_audit_status.sql`

**Content:**
```sql
-- Add audit status tracking
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_status IS 
  'Audit status: pending (queued), running (in progress), completed (success), failed (error)';

-- Add audit started timestamp
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS audit_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.questionnaire_responses.audit_started_at IS 
  'Timestamp when audit started running';

-- Index for querying audits by status
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_audit_status
  ON public.questionnaire_responses (audit_status)
  WHERE audit_status IS NOT NULL;
```

**Rollback:**
```sql
-- If needed, remove status tracking
ALTER TABLE public.questionnaire_responses
  DROP COLUMN IF EXISTS audit_status;

ALTER TABLE public.questionnaire_responses
  DROP COLUMN IF EXISTS audit_started_at;

DROP INDEX IF EXISTS idx_questionnaire_responses_audit_status;
```

---

## Summary

### Implementation Plan

1. **Idempotency Check** (No migration)
   - Add cache check in POST handler
   - Return cached result if < 24h old
   - ✅ Low risk, backward compatible

2. **Status Tracking** (Requires migration)
   - Add `audit_status` and `audit_started_at` columns
   - Update status at each stage
   - ✅ Low risk, backward compatible

3. **Timeout Config** (No migration)
   - Add `maxDuration = 60` export
   - ✅ Very low risk, just config

### Benefits

- ✅ Prevents duplicate audits (saves API quota)
- ✅ Clear status tracking (better UI feedback)
- ✅ Reduced timeout risk (more time for audit to start)
- ✅ Backward compatible (no breaking changes)
- ✅ Follows existing patterns (snake_case DB, camelCase TS)

### Estimated Effort

- **Idempotency:** ~1 hour
- **Status Tracking:** ~2-3 hours (including migration)
- **Timeout Config:** ~5 minutes
- **Testing:** ~1 hour

**Total:** ~4-5 hours
