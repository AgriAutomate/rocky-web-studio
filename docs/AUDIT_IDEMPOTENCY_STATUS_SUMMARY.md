# Audit Idempotency & Status - Implementation Plan Summary

## Current Gaps

1. ❌ **No Idempotency** → Duplicate audits waste PageSpeed API quota
2. ❌ **No Status Tracking** → Can't distinguish "pending" vs "never started"
3. ⚠️ **Timeout Risk** → Vercel function may timeout before audit starts

---

## Implementation Plan

### Part 1: 24-Hour Idempotency Check

**What:** Check if audit for same URL completed < 24h ago, return cached result.

**Where:** `app/api/audit-website/route.ts` (POST handler)

**Logic:**
```
IF audit_completed_at exists AND website_url matches AND hours < 24:
  RETURN 200 with cached result
ELSE:
  Trigger new audit
```

**Files:** `app/api/audit-website/route.ts`

**Migration:** ❌ None needed (uses existing columns)

**Risk:** ✅ Low - Backward compatible

**Effort:** ~1 hour

---

### Part 2: Audit Status Tracking

**What:** Add `audit_status` ('pending' | 'running' | 'completed' | 'failed') and `audit_started_at`.

**Where:** 
- Migration: New columns
- POST handler: Set 'pending'
- Audit service: Set 'running' → 'completed'/'failed'
- GET handler: Use status for better responses

**Status Flow:**
```
POST → 'pending'
Audit starts → 'running' (sets audit_started_at)
Audit completes → 'completed'
Audit fails → 'failed'
```

**Files:**
- `supabase/migrations/20250123_add_audit_status.sql` (new)
- `app/api/audit-website/route.ts` (POST + GET)
- `lib/services/audit-service.ts` (add `setAuditStatus()` helper)

**Migration:** ✅ Required (add 2 columns + index)

**Risk:** ✅ Low - Backward compatible (NULL = old behavior)

**Effort:** ~2-3 hours

---

### Part 3: Vercel Timeout Strategy

**What:** Add `maxDuration = 60` config to prevent function timeout.

**Where:** `app/api/audit-website/route.ts` (top-level export)

**Config:**
```typescript
export const maxDuration = 60; // seconds
```

**Files:** `app/api/audit-website/route.ts` (one line)

**Migration:** ❌ None needed (just config)

**Risk:** ✅ Very Low - Just config

**Effort:** ~5 minutes

---

## Implementation Order

1. **Idempotency** (no migration) → Test → Deploy
2. **Status Tracking** (requires migration) → Test → Deploy
3. **Timeout Config** (no migration) → Deploy

**Total Effort:** ~4-5 hours

---

## Breaking Changes

**None** - All changes are backward compatible:
- ✅ Idempotency: New cached response (200), doesn't break existing clients
- ✅ Status: New columns nullable, GET handler still works without status
- ✅ Timeout: Just config, no code changes

---

## Testing Checklist

**Idempotency:**
- [ ] POST same URL twice → Second returns cached
- [ ] POST same URL after 24h → Triggers new audit
- [ ] POST different URL → Triggers new audit

**Status:**
- [ ] POST → Status 'pending'
- [ ] Audit starts → Status 'running'
- [ ] Audit completes → Status 'completed'
- [ ] Audit fails → Status 'failed'
- [ ] GET with 'running' → Returns 202

**Timeout:**
- [ ] POST returns 202 quickly
- [ ] Audit starts before timeout
