# Audit API Contract Changes - Go/No-Go Assessment

## Current API Contracts

### POST `/api/audit-website`

**Current Contract:**
- Request: `{ questionnaireResponseId, websiteUrl }`
- Response: `202 Accepted` with `{ success: true, questionnaireResponseId, message, auditStartedAt }`
- Always returns 202 (fire-and-forget)

**Frontend Usage:**
- Doesn't await response (fire-and-forget)
- Doesn't check response body
- Just triggers and continues

---

### GET `/api/audit-website?questionnaireResponseId=...`

**Current Contract:**
- Response: `200 OK` with `{ questionnaireResponseId, audit?, error?, auditCompletedAt?, auditError? }`
- Response: `404 Not Found` with `{ questionnaireResponseId, message }`

**Frontend Usage:**
- Checks `auditResponse.ok` (200 vs 404)
- If `auditData.audit` → Sets audit
- If `auditData.error` → Logs but doesn't set audit
- If 404 → Doesn't set audit

---

## Required Changes Analysis

### Change 1: Idempotency Check (POST)

**What Changes:**
- POST handler checks cache before triggering
- Can return `200 OK` with cached result instead of always `202 Accepted`

**New Response (Cached Case):**
```typescript
{
  success: true,
  questionnaireResponseId: string | number,
  message: "Using cached audit results",
  cached: true,  // NEW FIELD
  auditCompletedAt: string,  // NEW FIELD
}
```

**Status Code:** `200 OK` (instead of `202 Accepted`)

**Impact on Frontend:**
- ✅ **No Impact** - Frontend doesn't await POST response
- ✅ **No Impact** - Frontend doesn't check response body
- ✅ **Backward Compatible** - New response shape doesn't break existing code

**Conclusion:** ✅ **No Breaking Changes** - Can be implemented safely

---

### Change 2: Status Tracking (GET)

**What Changes:**
- GET handler includes `website_url` and `audit_status` in SELECT
- Returns `status` field in response
- Can return `202 Accepted` for pending/running states

**New Response Fields:**
```typescript
{
  questionnaireResponseId: string | number,
  status?: "not_requested" | "pending" | "completed" | "failed",  // NEW
  websiteUrl?: string,  // NEW
  warnings?: string[],  // NEW
  audit?: WebsiteAuditResult,
  error?: string,
  auditCompletedAt?: string,
  auditError?: string,
}
```

**New Status Code:** `202 Accepted` for pending/running (instead of `404`)

**Impact on Frontend:**
- ⚠️ **Minor Impact** - Frontend checks `auditResponse.ok` (200/202 both truthy)
- ✅ **Backward Compatible** - New fields are optional
- ✅ **Backward Compatible** - Existing logic still works (checks `auditData.audit`)

**Current Frontend Code:**
```typescript
if (auditResponse.ok) {  // 200 or 202 both truthy
  const auditData = await auditResponse.json();
  if (auditData.audit) {
    setAudit(auditData.audit);
  } else if (auditData.error) {
    console.log("Audit error:", auditData.error);
  }
} else if (auditResponse.status === 404) {
  // Audit not yet completed
}
```

**After Changes:**
- `202 Accepted` for pending → `auditResponse.ok` is true → No `audit` field → Doesn't set audit (correct)
- `200 OK` for completed → `auditResponse.ok` is true → Has `audit` field → Sets audit (correct)
- `404 Not Found` for not_requested → `auditResponse.ok` is false → Doesn't set audit (correct)

**Conclusion:** ✅ **No Breaking Changes** - Frontend logic continues to work

---

### Change 3: State Model Support (GET)

**What Changes:**
- GET handler returns `websiteUrl`, `status`, `warnings` fields
- Page derives explicit status from these fields

**Impact on Frontend:**
- ✅ **No Breaking Changes** - New fields are optional
- ✅ **Enhancement** - Page can use new fields for better state handling
- ✅ **Backward Compatible** - Existing code ignores new fields

**Conclusion:** ✅ **No Breaking Changes** - Can be implemented safely

---

## Final Assessment

### ✅ GO - All Changes Are Backward Compatible

**Reasoning:**

1. **POST Idempotency:**
   - New response shape (200 with cached result)
   - Frontend doesn't await or check POST response
   - ✅ **No breaking changes**

2. **GET Status Tracking:**
   - New optional fields (`status`, `websiteUrl`, `warnings`)
   - New status code (`202 Accepted` for pending)
   - Frontend logic handles both 200 and 202 correctly
   - ✅ **No breaking changes**

3. **State Model:**
   - New optional fields in response
   - Page can derive status from new fields
   - Existing code continues to work
   - ✅ **No breaking changes**

---

## Implementation Strategy

### Option A: Behind-the-Scenes (Recommended)

**Can implement idempotency, status tracking, and state model entirely behind the scenes:**

1. **Idempotency:**
   - ✅ Implement in POST handler (internal logic)
   - ✅ Return new response shape (backward compatible)
   - ✅ No frontend changes needed

2. **Status Tracking:**
   - ✅ Add DB columns (migration)
   - ✅ Update service layer (internal)
   - ✅ Enhance GET response (add optional fields)
   - ✅ No frontend changes needed (can enhance later)

3. **State Model:**
   - ✅ Enhance GET response (add optional fields)
   - ✅ Page can derive status (internal logic)
   - ✅ AuditCard can use new props (enhancement, not required)

**Conclusion:** ✅ **Can implement entirely behind the scenes**

---

### Option B: Enhanced Frontend (Optional)

**If we want to use new features immediately:**

1. **Update Page:**
   - Derive status from new API fields
   - Pass explicit status to AuditCard

2. **Update AuditCard:**
   - Accept new prop model (`status`, `errorMessage`, `warnings`)
   - Handle all 6 states explicitly

**Conclusion:** ✅ **Optional enhancement** - Can be done incrementally

---

## Summary

### ✅ GO - No Breaking Changes

**All improvements can be implemented with:**
- ✅ Backward compatible API changes (optional fields)
- ✅ No frontend changes required (can enhance later)
- ✅ Internal implementation (service layer + DB)

### API Contract Changes (All Backward Compatible)

**POST:**
- Can return `200 OK` with cached result (new response shape)
- Frontend doesn't check POST response → ✅ No impact

**GET:**
- Adds optional fields: `status`, `websiteUrl`, `warnings`
- Can return `202 Accepted` for pending (instead of 404)
- Frontend handles 200/202 correctly → ✅ No impact

### Implementation Approach

**Recommended:**
1. ✅ Implement idempotency (POST handler)
2. ✅ Add status tracking (DB + service layer)
3. ✅ Enhance GET response (add optional fields)
4. ✅ Update page to derive status (internal logic)
5. ⏳ Update AuditCard props (optional enhancement)

**All can be done incrementally without breaking existing code.**

---

## Final Verdict

### ✅ GO - Safe to Proceed

**Reasoning:**
- ✅ All API changes are backward compatible
- ✅ Frontend continues to work without modifications
- ✅ Can implement incrementally
- ✅ No breaking changes

**Status:** Ready for implementation!
