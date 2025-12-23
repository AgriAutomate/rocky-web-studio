# Audit API Contract Changes - Go/No-Go Assessment

## Question: Do API Route Contracts Need to Change?

### Answer: ✅ **GO - Changes Required, But All Backward Compatible**

---

## Required Changes

### 1. POST `/api/audit-website` - Idempotency

**Change:**
- Can return `200 OK` with cached result (instead of always `202 Accepted`)
- New response field: `cached: true`

**Impact:**
- ✅ **No Breaking Changes** - Frontend doesn't await or check POST response
- ✅ **Backward Compatible** - New response shape doesn't break existing code

---

### 2. GET `/api/audit-website` - Status Tracking & State Model

**Changes:**
- Add optional fields: `status`, `websiteUrl`, `warnings`
- Can return `202 Accepted` for pending/running (instead of `404`)

**Impact:**
- ✅ **No Breaking Changes** - New fields are optional
- ✅ **No Breaking Changes** - Frontend handles 200/202 correctly (`auditResponse.ok` is truthy for both)
- ✅ **Backward Compatible** - Existing logic continues to work

---

## Exact API Changes

### POST Response (New Cached Case)

**Current:**
```typescript
// Always returns 202
{ success: true, questionnaireResponseId, message, auditStartedAt }
```

**New (Cached):**
```typescript
// Returns 200 for cached
{ success: true, questionnaireResponseId, message, cached: true, auditCompletedAt }
```

**Impact:** ✅ None - Frontend doesn't check POST response

---

### GET Response (Enhanced)

**Current:**
```typescript
// 200 OK
{ questionnaireResponseId, audit?, error?, auditCompletedAt?, auditError? }

// 404 Not Found
{ questionnaireResponseId, message }
```

**New:**
```typescript
// 200 OK (completed)
{ questionnaireResponseId, status: "completed", websiteUrl?, warnings?, audit, auditCompletedAt }

// 200 OK (failed)
{ questionnaireResponseId, status: "failed", websiteUrl?, error, auditError }

// 202 Accepted (pending/running) - NEW STATUS CODE
{ questionnaireResponseId, status: "pending", websiteUrl, message }

// 200 OK (not_requested) - NEW RESPONSE
{ questionnaireResponseId, status: "not_requested", websiteUrl: null, message }
```

**Impact:** ✅ Minimal - Frontend checks `auditResponse.ok` (200/202 both truthy)

---

## Frontend Impact Analysis

### Current Frontend Code

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

### After Changes

**Scenario 1: Pending (202 Accepted)**
- `auditResponse.ok` → `true` ✅
- `auditData.audit` → `undefined` ✅
- `auditData.error` → `undefined` ✅
- Result: Doesn't set audit (correct behavior)

**Scenario 2: Completed (200 OK)**
- `auditResponse.ok` → `true` ✅
- `auditData.audit` → exists ✅
- Result: Sets audit (correct behavior)

**Scenario 3: Not Requested (200 OK with status)**
- `auditResponse.ok` → `true` ✅
- `auditData.audit` → `undefined` ✅
- Result: Doesn't set audit (correct behavior)

**Conclusion:** ✅ **Frontend continues to work without modifications**

---

## Can It Be Done Behind the Scenes?

### ✅ YES - All Can Be Implemented Behind the Scenes

**Idempotency:**
- ✅ POST handler logic (internal)
- ✅ New response shape (backward compatible)
- ✅ No frontend changes needed

**Status Tracking:**
- ✅ DB columns (migration)
- ✅ Service layer updates (internal)
- ✅ GET response enhancement (optional fields)
- ✅ No frontend changes needed

**State Model:**
- ✅ GET response enhancement (optional fields)
- ✅ Page-level status derivation (internal logic)
- ✅ AuditCard props update (optional enhancement)

---

## Final Verdict

### ✅ GO - Safe to Proceed

**All changes are:**
- ✅ Backward compatible (optional fields, new status codes handled correctly)
- ✅ Can be implemented incrementally
- ✅ No breaking changes to existing frontend code
- ✅ Can enhance frontend later to use new features

**Status:** Ready for implementation!
