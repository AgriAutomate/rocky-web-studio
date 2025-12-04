# Rocky Web Studio - Prioritized Action Plan

**Generated:** 2025-01-15  
**Baseline Status:** ⚠️ **35 TypeScript Errors, 230 Console Logs, Legacy Code Present**

---

## Section A: Current State (As-Is)

### Build Status

**TypeScript Compilation:** ❌ **FAILING**
- **Total Errors:** 35 errors across 9 files
- **Error Breakdown:**
  - `app/api/notifications/send-reminder/route.ts`: 5 errors
  - `lib/kv/sms.ts`: 15 errors
  - `lib/kv/bookings.ts`: 5 errors
  - `app/api/xero/invoices/[id]/route.ts`: 5 errors
  - `app/api/xero/callback/route.ts`: 1 error
  - `lib/xero/helpers.ts`: 1 error
  - `auth.config.ts`: 1 error
  - `lib/email-templates/render.tsx`: 1 error
  - `lib/email-templates/CustomerOrderConfirmation.tsx`: 1 error

**npm audit:** ⚠️ **1 vulnerability found**

**Code Quality Metrics:**
- **Console.log statements:** 230 across 41 files
- **TODO/FIXME comments:** 141 across 31 files
- **`any` types:** 13 instances across 8 files
- **Legacy Kudosity references:** 3 files (code + docs)

**Environment Variables:** ✅ **Well documented** (all required vars documented)

**SMS Provider Status:** ✅ **Mobile Message is sole active provider**
- All production code uses `lib/sms.ts` (Mobile Message direct)
- Legacy `lib/sms/index.ts` NOT imported by any active routes
- Kudosity provider file exists but is orphaned

---

## Section B: Prioritized Action Plan

### 🔴 BLOCKING (Prevents Clean Build/Deploy)

#### Issue 1: TypeScript Compilation Errors (35 errors)

**Impact:** Blocks `npm run type-check`, prevents clean builds, Husky pre-commit hooks fail

**Files Affected:** 9 files

**Quick Fixes:**

##### 1.1 Reminder Route Errors (5 errors)
**File:** `app/api/notifications/send-reminder/route.ts`

**Errors:**
- Line 53: Unused `calculateAppointmentDate` function
- Line 70: Missing `markReminderSent` import
- Line 91: Unused `now` variable
- Lines 105-106: Duplicate `outcome` variable declaration

**Fix:**
```typescript
// Remove unused function (lines 53-60)
// Remove unused 'now' variable (line 91)
// Import markReminderSent from kvBookingStorage
import { kvBookingStorage } from "@/lib/kv/bookings";
// Fix duplicate outcome (remove line 106)
```

**Verification:** `npm run type-check` should eliminate 5 errors

**Test:** Trigger reminder cron manually: `GET /api/notifications/send-reminder`

---

##### 1.2 KV Storage Type Errors (20 errors)
**Files:** `lib/kv/bookings.ts` (5 errors), `lib/kv/sms.ts` (15 errors)

**Root Cause:** Incorrect generic types for `kv.smembers()` and `kv.mget()`

**Fix Pattern:**
```typescript
// WRONG:
const ids = await kv.smembers<string>(BOOKINGS_ALL_KEY);

// CORRECT:
const ids = await kv.smembers(BOOKINGS_ALL_KEY) as string[];

// WRONG:
const results = await kv.mget<Booking | null[]>(keys);

// CORRECT:
const results = await kv.mget<Booking>(keys) as (Booking | null)[];
```

**Files to Fix:**
- `lib/kv/bookings.ts` lines 38, 41, 42, 44
- `lib/kv/sms.ts` lines 40, 45, 54, 72, 76, 80, 121

**Verification:** `npm run type-check` should eliminate 20 errors

**Test:** Test booking/SMS storage operations

---

##### 1.3 Xero Type Errors (7 errors)
**Files:** 
- `app/api/xero/callback/route.ts` (1 error)
- `app/api/xero/invoices/[id]/route.ts` (5 errors)
- `lib/xero/helpers.ts` (1 error)

**Issues:**
1. `expires_in` can be function or number - need proper type guard
2. PDF Buffer type mismatch
3. Invoice date type narrowing issues

**Fixes:**

**File:** `app/api/xero/callback/route.ts` line 83
```typescript
// Current (line 83):
expiresIn = tokenSet.expires_in();

// Fix:
if (typeof tokenSet.expires_in === 'function') {
  expiresIn = tokenSet.expires_in();
} else if (typeof tokenSet.expires_in === 'number') {
  expiresIn = tokenSet.expires_in;
}
```

**File:** `app/api/xero/invoices/[id]/route.ts` line 99
```typescript
// Current:
responseBody = pdfBuffer;

// Fix:
responseBody = Buffer.from(pdfBuffer);
```

**File:** `app/api/xero/invoices/[id]/route.ts` lines 160-161
```typescript
// Current complex ternary - simplify:
date: invoice.date ? new Date(invoice.date).toISOString() : undefined,
dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
```

**File:** `lib/xero/helpers.ts` line 68
```typescript
// Same fix as callback route
```

**Verification:** `npm run type-check` should eliminate 7 errors

**Test:** Test Xero OAuth flow and invoice retrieval

---

##### 1.4 Auth Config Error (1 error)
**File:** `auth.config.ts` line 6

**Error:** Missing `providers` property in `NextAuthConfig`

**Fix:**
```typescript
const authConfig: Partial<NextAuthConfig> = {
  // ... existing config
};
```

**OR** add empty providers array:
```typescript
const authConfig: NextAuthConfig = {
  providers: [], // Will be merged in auth.ts
  // ... existing config
};
```

**Verification:** `npm run type-check` should eliminate 1 error

**Test:** Test admin login flow

---

##### 1.5 Email Template Errors (2 errors)
**Files:**
- `lib/email-templates/render.tsx` line 12
- `lib/email-templates/CustomerOrderConfirmation.tsx` line 32

**Fixes:**

**File:** `lib/email-templates/render.tsx`
```typescript
// Current:
export function renderEmailTemplate(
  component: React.ReactElement
): string {
  return render(component);
}

// Fix:
export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<string> {
  return await render(component);
}
```

**File:** `lib/email-templates/CustomerOrderConfirmation.tsx`
```typescript
// Remove unused parameter or use it:
// Option 1: Remove from destructuring
// Option 2: Use it in template
```

**Verification:** `npm run type-check` should eliminate 2 errors

**Test:** Test email template rendering

---

### 🟡 HIGH PRIORITY (Production Quality Issues)

#### Issue 2: Excessive Console Logging (230 statements)

**Risk:** Performance impact, potential info leakage, noisy logs

**Files Most Affected:**
- `lib/sms.ts`: 53 console.log statements (extensive debugging)
- `app/api/webhooks/stripe/route.ts`: 11 statements
- `app/api/xero/*`: Multiple files with logging
- `app/api/bookings/create/route.ts`: 8 statements

**Effort:** 4-6 hours

**Action Plan:**

1. **Create Structured Logger** (`lib/logger.ts`)
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  debug(...args: unknown[]): void {
    if (this.isDevelopment) console.debug('[DEBUG]', ...args);
  }
  
  info(...args: unknown[]): void {
    console.info('[INFO]', ...args);
  }
  
  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args);
  }
  
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
  }
}

export const logger = new Logger();
```

2. **Replace console.log in Production Routes**
   - Keep only error/warn logs in production
   - Move debug logs to `logger.debug()` (dev only)
   - Remove credential-related logs

3. **Priority Files:**
   - `lib/sms.ts` - Remove 40+ debug logs, keep only errors
   - `app/api/webhooks/stripe/route.ts` - Keep only error logs
   - `app/api/xero/*` - Reduce to essential logs

**Verification:** Search for `console.log` - should be <50 in production code

**Test:** Verify error logging still works, check Vercel logs

---

#### Issue 3: Legacy Kudosity Code Removal

**Risk:** Code confusion, maintenance burden, unused dependencies

**Effort:** 30 minutes

**Action Plan:**

1. **Delete Files:**
   - `lib/sms/providers/kudosity.ts` (236 lines)
   - `lib/sms/providers/twilio.ts` (if unused)
   - `lib/sms/index.ts` (legacy abstraction - 56 lines)

2. **Verify No Imports:**
   - ✅ Confirmed: No active routes import Kudosity
   - ✅ Confirmed: All SMS uses `lib/sms.ts` (Mobile Message)

3. **Update Documentation:**
   - `PROJECT_DETAILS.md` - Remove Kudosity section
   - `DEPLOYMENT.md` - Update SMS provider section
   - `README.md` - Confirm Mobile Message only

**Verification:** 
```bash
# Should return 0 results:
grep -r "kudosity\|Kudosity" --include="*.ts" --include="*.tsx"
```

**Test:** Verify SMS still works after removal

---

#### Issue 4: Security Vulnerability

**Status:** 1 vulnerability found in npm audit

**Action:** Run `npm audit fix` and review changes

**Verification:** `npm audit` should show 0 vulnerabilities

---

### 🟢 MEDIUM PRIORITY (Technical Debt)

#### Issue 5: `any` Types (13 instances)

**Scope:** 8 files

**Files:**
- `app/api/xero/disconnect/route.ts`: 1
- `app/book/page.tsx`: 1
- `lib/sms/booking-helpers.ts`: 2
- `lib/sms/providers/kudosity.ts`: 3 (will be removed)
- `lib/sms/providers/twilio.ts`: 2 (may be removed)
- `app/api/bookings/availability/route.ts`: 1

**Benefit:** Improved type safety, better IDE support

**Can wait until:** After blocking issues resolved

**Action:** Replace `any` with proper types or `unknown` with type guards

---

#### Issue 6: TODO/FIXME Comments (141 instances)

**Scope:** 31 files

**Categories:**
- Database migration strategy
- Feature completion
- Error handling improvements
- Documentation updates

**Benefit:** Clear roadmap, reduced confusion

**Can wait until:** Next sprint planning

**Action:** Review and prioritize TODOs, create GitHub issues

---

## Section C: Quick Wins (Can Do Now - <30min each)

### Quick Win 1: Remove Kudosity Provider File

**Time:** 5 minutes

**Action:**
```bash
rm lib/sms/providers/kudosity.ts
```

**Verification:** `npm run type-check` (should still pass/fail same as before)

**Impact:** Reduces codebase size, removes confusion

---

### Quick Win 2: Fix Reminder Route Duplicate Variable

**Time:** 2 minutes

**File:** `app/api/notifications/send-reminder/route.ts`

**Action:** Remove line 106 (duplicate `outcome` declaration)

**Verification:** `npm run type-check` (eliminates 2 errors)

---

### Quick Win 3: Fix Reminder Route Unused Code

**Time:** 5 minutes

**File:** `app/api/notifications/send-reminder/route.ts`

**Actions:**
1. Remove `calculateAppointmentDate` function (lines 53-60)
2. Remove unused `now` variable (line 91)
3. Add import: `import { kvBookingStorage } from "@/lib/kv/bookings";`
4. Fix line 70: `await kvBookingStorage.markReminderSent(...)`

**Verification:** `npm run type-check` (eliminates 3 more errors)

---

### Quick Win 4: Fix Auth Config Type

**Time:** 1 minute

**File:** `auth.config.ts`

**Action:** Change line 6:
```typescript
const authConfig: Partial<NextAuthConfig> = {
```

**Verification:** `npm run type-check` (eliminates 1 error)

---

### Quick Win 5: Fix Email Template Return Type

**Time:** 2 minutes

**File:** `lib/email-templates/render.tsx`

**Action:** Make function async and return Promise:
```typescript
export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<string> {
  return await render(component);
}
```

**Verification:** `npm run type-check` (eliminates 1 error)

---

### Quick Win 6: Remove Unused Email Template Parameter

**Time:** 1 minute

**File:** `lib/email-templates/CustomerOrderConfirmation.tsx`

**Action:** Remove `packagePrice` from destructuring if unused, or use it in template

**Verification:** `npm run type-check` (eliminates 1 error)

---

### Quick Win 7: Update AVOB Status References

**Time:** 10 minutes

**Files to Update:**
- `components/veteran-owned-callout.tsx` - Update placeholder text
- `app/page.tsx` - Check for AVOB references
- `PROJECT_DETAILS.md` - Update status
- `TECHNICAL_AUDIT.md` - Update if mentioned

**Action:** Search/replace "AVOB Pending" → "AVOB Certified", update badge placeholder

**Verification:** Visual check of homepage

---

## Section D: Baseline Metrics

### Code Statistics

**TypeScript Files:** ~80 files
- API Routes: 20+ files
- Components: 15+ files
- Library/Utils: 20+ files
- Pages: 10+ files

**Total API Routes:** 20+ endpoints
- Authentication: 1
- Admin: 6
- Bookings: 3
- Custom Songs: 1
- SMS/Notifications: 3
- Webhooks: 1
- Xero: 7
- Testing: 1

**Lines of Code (Estimate):**
- TypeScript/TSX: ~15,000 LOC
- Configuration: ~500 LOC
- Documentation: ~10,000 LOC

**Test Coverage:** ❌ **0%** (No test files found)

**Dependencies:**
- Production: 43 packages
- Development: 8 packages
- Total: 51 packages

**Security:**
- npm audit vulnerabilities: 1
- Exposed credentials: ✅ None found
- Environment variables: ✅ All documented

---

## Section E: Specific Fix Commands

### Fix 1: Reminder Route (5 errors → 0 errors)

**File:** `app/api/notifications/send-reminder/route.ts`

**Changes:**
```typescript
// 1. Add import at top
import { kvBookingStorage } from "@/lib/kv/bookings";

// 2. Remove lines 53-60 (calculateAppointmentDate function)

// 3. Remove line 91 (const now = new Date();)

// 4. Fix line 70:
await kvBookingStorage.markReminderSent(booking.id, config.flag === "reminderSent24h" ? "24h" : "2h");

// 5. Remove line 106 (duplicate outcome)
```

**Verification:**
```bash
npm run type-check
# Should show 30 errors (down from 35)
```

**Test:**
```bash
# Trigger reminder endpoint manually
curl http://localhost:3000/api/notifications/send-reminder
```

---

### Fix 2: KV Storage Types (20 errors → 0 errors)

**File:** `lib/kv/bookings.ts`

**Changes:**
```typescript
// Line 38:
const ids = (await kv.smembers(BOOKINGS_ALL_KEY)) as string[];

// Line 42:
const results = (await kv.mget<Booking>(keys)) as (Booking | null)[];

// Line 44:
return results.filter((b): b is Booking => b !== null);
```

**File:** `lib/kv/sms.ts`

**Changes:**
```typescript
// Line 40:
const results = (await kv.mget<SMSRecord>(keys)) as (SMSRecord | null)[];

// Line 41:
return results.filter((r): r is SMSRecord => r !== null);

// Lines 45, 54, 72, 76, 80, 121:
const ids = (await kv.smembers(SMS_BOOKING_KEY(bookingId))) as string[];
// (Apply same pattern to all smembers calls)
```

**Verification:**
```bash
npm run type-check
# Should show 10 errors (down from 30)
```

**Test:**
```bash
# Test booking creation
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-20","time":"10:00","name":"Test","email":"test@test.com","phone":"+61400000000","serviceType":"Consultation"}'
```

---

### Fix 3: Xero Type Errors (7 errors → 0 errors)

**File:** `app/api/xero/callback/route.ts` (line 83)

**Change:**
```typescript
// Already has correct logic, but TypeScript doesn't recognize it
// Add explicit type assertion:
let expiresIn = 0;
if (tokenSet.expires_in) {
  if (typeof tokenSet.expires_in === 'function') {
    expiresIn = (tokenSet.expires_in as () => number)();
  } else if (typeof tokenSet.expires_in === 'number') {
    expiresIn = tokenSet.expires_in;
  }
}
```

**File:** `lib/xero/helpers.ts` (line 68)

**Change:** Same fix as above

**File:** `app/api/xero/invoices/[id]/route.ts`

**Changes:**
```typescript
// Line 99:
responseBody = Buffer.from(pdfBuffer as ArrayLike<number>);

// Lines 160-161:
date: invoice.date ? (invoice.date instanceof Date ? invoice.date.toISOString() : String(invoice.date)) : undefined,
dueDate: invoice.dueDate ? (invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : String(invoice.dueDate)) : undefined,
```

**Verification:**
```bash
npm run type-check
# Should show 0 errors!
```

**Test:**
```bash
# Test Xero connection
curl http://localhost:3000/api/xero/status
```

---

### Fix 4: Auth Config (1 error → 0 errors)

**File:** `auth.config.ts`

**Change:**
```typescript
import type { NextAuthConfig } from "next-auth";

const authConfig: Partial<NextAuthConfig> = {
  // ... rest of config
};
```

**Verification:**
```bash
npm run type-check
```

**Test:**
```bash
# Test admin login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rockywebstudio.com.au","password":"your_password"}'
```

---

### Fix 5: Email Templates (2 errors → 0 errors)

**File:** `lib/email-templates/render.tsx`

**Change:**
```typescript
export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<string> {
  return await render(component);
}
```

**File:** `lib/email-templates/CustomerOrderConfirmation.tsx`

**Change:** Remove `packagePrice` from destructuring if unused

**Verification:**
```bash
npm run type-check
```

**Test:** Test email sending in custom songs order flow

---

## Section F: SMS Provider Cleanup Verification

### Current State

✅ **Mobile Message is sole active provider**
- All production routes import `@/lib/sms` → resolves to `lib/sms.ts`
- `lib/sms.ts` uses Mobile Message API directly
- No imports of `lib/sms/index.ts` (legacy abstraction)

❌ **Legacy code still present**
- `lib/sms/providers/kudosity.ts` exists but unused
- `lib/sms/providers/twilio.ts` exists but unused
- `lib/sms/index.ts` exists but unused

### Verification Commands

```bash
# Check for Kudosity imports (should return 0):
grep -r "from.*kudosity\|import.*kudosity\|KudosityProvider" --include="*.ts" --include="*.tsx" | grep -v "lib/sms/providers/kudosity.ts" | grep -v "KUDOSITY_REMOVAL_AUDIT"

# Check for lib/sms/index imports (should return 0):
grep -r "from.*@/lib/sms/index\|from.*lib/sms/index" --include="*.ts" --include="*.tsx"

# Verify all SMS uses lib/sms.ts:
grep -r "from.*@/lib/sms[^.]" --include="*.ts" --include="*.tsx"
# Should show imports from lib/sms.ts (Mobile Message)
```

### Cleanup Action

**Delete these files:**
```bash
rm lib/sms/providers/kudosity.ts
rm lib/sms/providers/twilio.ts
rm lib/sms/index.ts
```

**Update documentation:**
- Remove Kudosity references from `PROJECT_DETAILS.md`
- Update `DEPLOYMENT.md` SMS section
- Update `README.md` if needed

---

## Section G: AVOB Status Update

### Files to Update

1. **`components/veteran-owned-callout.tsx`**
   - Line 34: Change "AVOB Logo" → "AVOB Certified"
   - Line 38: Change "Placeholder" → "Certified 2025"

2. **`app/page.tsx`**
   - Check for any AVOB status references
   - Update if found

3. **`PROJECT_DETAILS.md`**
   - Search for "AVOB Pending" → "AVOB Certified"

4. **`TECHNICAL_AUDIT.md`**
   - Update if AVOB status mentioned

### Search/Replace Operations

```bash
# Find all AVOB references:
grep -r "AVOB\|avob" --include="*.tsx" --include="*.ts" --include="*.md"

# Update status:
# "AVOB Pending" → "AVOB Certified"
# "Placeholder" → "Certified 2025"
```

---

## Section H: Success Criteria Checklist

### Immediate (Week 1)

- [ ] **Clean TypeScript Build**
  - [ ] Fix all 35 TypeScript errors
  - [ ] `npm run type-check` passes with 0 errors
  - [ ] Husky pre-commit hooks pass

- [ ] **Remove Legacy Code**
  - [ ] Delete `lib/sms/providers/kudosity.ts`
  - [ ] Delete `lib/sms/providers/twilio.ts` (if unused)
  - [ ] Delete `lib/sms/index.ts`
  - [ ] Update documentation

- [ ] **Quick Wins**
  - [ ] Fix reminder route (5 errors)
  - [ ] Fix auth config (1 error)
  - [ ] Fix email templates (2 errors)
  - [ ] Update AVOB status

### Short-Term (Month 1)

- [ ] **Reduce Logging**
  - [ ] Create structured logger
  - [ ] Replace console.log in production routes
  - [ ] Reduce to <50 console statements

- [ ] **Security**
  - [ ] Fix npm audit vulnerability
  - [ ] Review environment variables
  - [ ] Add rate limiting

- [ ] **Code Quality**
  - [ ] Replace `any` types (13 instances)
  - [ ] Review and prioritize TODOs
  - [ ] Add basic tests

### Medium-Term (Quarter 1)

- [ ] **Error Monitoring**
  - [ ] Integrate Sentry or similar
  - [ ] Set up error alerts
  - [ ] Track error rates

- [ ] **Testing**
  - [ ] Add unit tests for core utilities
  - [ ] Add integration tests for API routes
  - [ ] Add E2E tests for critical flows

- [ ] **Documentation**
  - [ ] Update all outdated references
  - [ ] Create API documentation
  - [ ] Document deployment process

---

## Section I: Estimated Timeline

### Week 1: Critical Fixes
- **Day 1-2:** Fix all TypeScript errors (35 → 0)
- **Day 3:** Remove legacy Kudosity code
- **Day 4:** Update AVOB status
- **Day 5:** Testing & verification

**Total:** ~20-25 hours

### Week 2-4: High Priority
- **Week 2:** Implement structured logging
- **Week 3:** Reduce console.log statements
- **Week 4:** Security audit & fixes

**Total:** ~30-40 hours

### Month 2-3: Medium Priority
- Replace `any` types
- Add error monitoring
- Add basic tests
- Documentation updates

**Total:** ~40-60 hours

---

## Section J: Risk Assessment

### Low Risk Fixes (Safe to do immediately)
- ✅ Remove unused Kudosity code
- ✅ Fix duplicate variable in reminder route
- ✅ Fix auth config type
- ✅ Fix email template return type
- ✅ Update AVOB status text

### Medium Risk Fixes (Test thoroughly)
- ⚠️ Fix KV storage types (verify data access still works)
- ⚠️ Fix Xero type errors (verify OAuth flow)
- ⚠️ Remove console.log statements (verify error visibility)

### High Risk Fixes (Require careful testing)
- 🔴 Major logging refactor (ensure errors still logged)
- 🔴 Remove unused functions (verify not called dynamically)

---

## Conclusion

**Current State:** ⚠️ Functional but blocked by TypeScript errors

**Immediate Priority:** Fix 35 TypeScript errors to enable clean builds

**Quick Wins Available:** 7 fixes that can be done in <30min each

**Estimated Time to Clean Build:** 20-25 hours (1 week)

**Next Steps:**
1. Start with Quick Wins (Section C)
2. Fix blocking TypeScript errors (Section E)
3. Remove legacy code (Section F)
4. Update AVOB status (Section G)
5. Verify with `npm run type-check` passing

---

**End of Prioritized Action Plan**

*This plan provides a clear roadmap to achieve a clean, production-ready codebase. Focus on blocking issues first, then address technical debt systematically.*

