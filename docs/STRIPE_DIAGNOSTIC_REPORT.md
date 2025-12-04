# Stripe Payment Integration Diagnostic Report

**Date:** December 4, 2025  
**Commit:** 6fcb55d  
**Status:** Payment flow failing with "Something went wrong" error

---

## 1. ENVIRONMENT VARIABLES AUDIT

### ✅ Variables Found in Codebase

| Variable Name | Files Using It | Type | Status |
|--------------|----------------|------|--------|
| `STRIPE_SECRET_KEY` | 3 files | Server-side | ✅ Correct |
| `STRIPE_WEBHOOK_SECRET` | 1 file | Server-side | ✅ Correct |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 1 file | Client-side | ✅ Correct |

### File-by-File Analysis

#### 1. `app/api/custom-songs/order/route.ts`
- **Line 13:** `const stripeSecretKey = process.env.STRIPE_SECRET_KEY;`
- **Variable:** `STRIPE_SECRET_KEY` ✅
- **Type:** Server-side
- **Usage:** Creates Stripe PaymentIntent
- **Error Handling:** ✅ Proper (throws ExternalServiceError if not configured)

#### 2. `app/api/webhooks/stripe/route.ts`
- **Line 17:** `const stripeSecretKey = process.env.STRIPE_SECRET_KEY;`
- **Line 18:** `const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;`
- **Variables:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ✅
- **Type:** Server-side
- **Usage:** Webhook signature verification and event processing
- **Error Handling:** ✅ Proper (throws ExternalServiceError if not configured)

#### 3. `app/services/custom-songs/order/components/StripeProvider.tsx`
- **Line 8:** `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""`
- **Line 17:** Check for `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Variable:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅
- **Type:** Client-side (NEXT_PUBLIC_ prefix)
- **Usage:** Initializes Stripe.js client
- **Error Handling:** ⚠️ Shows error UI if missing

#### 4. `lib/bookings/cancellation.ts`
- **Line 71:** `const stripeSecretKey = process.env.STRIPE_SECRET_KEY;`
- **Variable:** `STRIPE_SECRET_KEY` ✅
- **Type:** Server-side
- **Usage:** Processes refunds for cancelled bookings
- **Error Handling:** ✅ Proper (returns error object if not configured)

### ✅ NO NAMING MISMATCHES FOUND

All environment variables match exactly what's configured in Vercel:
- ✅ `STRIPE_SECRET_KEY` (not `STRIPE_API_KEY` or similar)
- ✅ `STRIPE_WEBHOOK_SECRET` (correct)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (correct prefix)

---

## 2. STRIPE INITIALIZATION ANALYSIS

### Server-Side Initialization

#### Location 1: `app/api/custom-songs/order/route.ts`
```typescript
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    })
  : null;
```
- **Status:** ✅ Correct
- **API Version:** `2025-11-17.clover` (⚠️ Verify this is valid)
- **Error Handling:** ✅ Checks for null before use

#### Location 2: `app/api/webhooks/stripe/route.ts`
```typescript
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;
```
- **Status:** ✅ Correct
- **API Version:** `2025-11-17.clover` (⚠️ Verify this is valid)
- **Error Handling:** ✅ Checks for null before use

#### Location 3: `lib/bookings/cancellation.ts`
```typescript
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});
```
- **Status:** ⚠️ **ISSUE FOUND** - No null check before initialization
- **API Version:** `2025-11-17.clover` (⚠️ Verify this is valid)
- **Error Handling:** ⚠️ Will throw if `stripeSecretKey` is undefined

### Client-Side Initialization

#### Location: `app/services/custom-songs/order/components/StripeProvider.tsx`
```typescript
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);
```
- **Status:** ⚠️ **POTENTIAL ISSUE** - Falls back to empty string
- **Error Handling:** ✅ Shows error UI if missing
- **Issue:** `loadStripe("")` may cause Stripe.js initialization errors

---

## 3. API ROUTES USING STRIPE

### Route 1: `POST /api/custom-songs/order`
- **File:** `app/api/custom-songs/order/route.ts`
- **Purpose:** Creates Stripe PaymentIntent for custom song orders
- **Stripe Operations:**
  - `stripe.paymentIntents.create()`
- **Error Handling:** ✅ Uses `withApiHandler`, throws `ExternalServiceError`
- **Response Format:** ✅ Consistent JSON with `success`, `orderId`, `clientSecret`

### Route 2: `POST /api/webhooks/stripe`
- **File:** `app/api/webhooks/stripe/route.ts`
- **Purpose:** Handles Stripe webhook events
- **Stripe Operations:**
  - `stripe.webhooks.constructEvent()` (signature verification)
- **Error Handling:** ✅ Uses `withApiHandler`, throws `ValidationError`/`ExternalServiceError`
- **Response Format:** ✅ Consistent JSON

### Route 3: `POST /api/bookings/[bookingId]/cancel`
- **File:** `app/api/bookings/[bookingId]/cancel/route.ts`
- **Purpose:** Processes refunds for cancelled bookings
- **Stripe Operations:**
  - `stripe.refunds.create()`
- **Error Handling:** ⚠️ Uses dynamic import, but no null check before Stripe initialization

---

## 4. CLIENT-SIDE PAYMENT FLOW ANALYSIS

### Payment Form Submission (`app/services/custom-songs/order/page.tsx`)

#### Step 1: Create PaymentIntent (Lines 400-426)
```typescript
const response = await fetch("/api/custom-songs/order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...formData }),
});

const data: OrderResponse = await response.json();

if (data.success && data.clientSecret && data.orderId) {
  setOrderId(data.orderId);
  setClientSecret(data.clientSecret);
  setStep("payment");
} else {
  setFormError(data.error || "Failed to initialize payment. Please try again.");
}
```

**⚠️ ISSUE IDENTIFIED:**
- The response from `withApiHandler` wraps the data in a `data` property
- Current code expects `data.success` directly, but actual response is:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "orderId": "...",
      "clientSecret": "..."
    },
    "requestId": "..."
  }
  ```
- **This is causing the payment flow to fail!**

#### Step 2: Payment Form (PaymentForm component)
- Uses `useStripe()` and `useElements()` hooks
- Submits payment via `stripe.confirmPayment()`
- Error handling: ✅ Shows error messages

---

## 5. RESPONSE FORMAT MISMATCH

### Expected Response Format (from `withApiHandler`)

```typescript
{
  success: true,
  data: {
    success: true,
    orderId: "CS-...",
    clientSecret: "pi_...",
    paymentIntentId: "pi_...",
    // ... other fields
  },
  requestId: "req_..."
}
```

### Current Client Code Expects

```typescript
{
  success: true,
  orderId: "CS-...",
  clientSecret: "pi_...",
  // ... other fields
}
```

**❌ MISMATCH:** Client code is checking `data.success` but should check `data.data.success` or unwrap the response.

---

## 6. ISSUES IDENTIFIED

### 🔴 CRITICAL ISSUE #1: Response Format Mismatch
- **Location:** `app/services/custom-songs/order/page.tsx` (line 412-420)
- **Problem:** `withApiHandler` wraps response in `{ success, data, requestId }`, but client expects flat structure
- **Impact:** PaymentIntent creation appears to fail even when it succeeds
- **Fix Required:** Unwrap the `data` property from the response

### 🟡 MEDIUM ISSUE #2: Empty String Fallback in StripeProvider
- **Location:** `app/services/custom-songs/order/components/StripeProvider.tsx` (line 8)
- **Problem:** `loadStripe("")` may cause initialization errors
- **Impact:** Stripe.js may fail to initialize properly
- **Fix Required:** Return early if key is missing, don't call `loadStripe` with empty string

### 🟡 MEDIUM ISSUE #3: Missing Null Check in Cancellation Route
- **Location:** `lib/bookings/cancellation.ts` (line 81)
- **Problem:** Creates Stripe instance without null check
- **Impact:** Will throw error if `STRIPE_SECRET_KEY` is undefined
- **Fix Required:** Add null check before Stripe initialization

### ⚠️ WARNING: API Version Verification Needed
- **Location:** All Stripe initialization points
- **Problem:** Using `2025-11-17.clover` - verify this is a valid Stripe API version
- **Impact:** May cause compatibility issues
- **Action:** Verify with Stripe documentation or use latest stable version

---

## 7. RECOMMENDED FIXES

### Fix #1: Update Client-Side Response Handling (CRITICAL)

**File:** `app/services/custom-songs/order/page.tsx`

**Current Code (Lines 412-420):**
```typescript
const data: OrderResponse = await response.json();

if (data.success && data.clientSecret && data.orderId) {
  setOrderId(data.orderId);
  setClientSecret(data.clientSecret);
  setStep("payment");
} else {
  setFormError(data.error || "Failed to initialize payment. Please try again.");
}
```

**Fixed Code:**
```typescript
const responseData = await response.json();

// Handle withApiHandler wrapped response
if (responseData.success && responseData.data) {
  const data = responseData.data;
  if (data.success && data.clientSecret && data.orderId) {
    setOrderId(data.orderId);
    setClientSecret(data.clientSecret);
    setStep("payment");
  } else {
    setFormError(data.error || "Failed to initialize payment. Please try again.");
  }
} else {
  // Handle error response from withApiHandler
  const errorMessage = responseData.error?.message || "Failed to initialize payment. Please try again.";
  setFormError(errorMessage);
}
```

### Fix #2: Improve StripeProvider Error Handling

**File:** `app/services/custom-songs/order/components/StripeProvider.tsx`

**Current Code (Lines 7-9):**
```typescript
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);
```

**Fixed Code:**
```typescript
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
```

**And update the component:**
```typescript
export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Payment Configuration Error</p>
        <p className="text-sm mt-1">
          Stripe publishable key is not configured. Please contact support.
        </p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p className="font-semibold">Loading Payment System...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, ... }}>
      {children}
    </Elements>
  );
}
```

### Fix #3: Add Null Check in Cancellation Route

**File:** `lib/bookings/cancellation.ts`

**Current Code (Lines 79-84):**
```typescript
try {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  });
```

**Fixed Code:**
```typescript
if (!stripeSecretKey) {
  cancellationLogger.warn("Stripe secret key not configured, skipping refund", {
    paymentIntentId,
  });
  return { success: false, error: "Stripe not configured" };
}

try {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  });
```

---

## 8. VERIFICATION CHECKLIST

### Environment Variables
- [x] `STRIPE_SECRET_KEY` configured in Vercel Production
- [x] `STRIPE_WEBHOOK_SECRET` configured in Vercel Production
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configured in Vercel Production
- [x] Variable names match codebase exactly

### Code Issues
- [ ] **CRITICAL:** Fix response format handling in order page
- [ ] **MEDIUM:** Fix StripeProvider empty string fallback
- [ ] **MEDIUM:** Add null check in cancellation route
- [ ] **WARNING:** Verify Stripe API version `2025-11-17.clover`

### Testing
- [ ] Test PaymentIntent creation after fix
- [ ] Test payment form submission
- [ ] Test error handling
- [ ] Verify webhook delivery
- [ ] Check browser console for errors
- [ ] Check Vercel function logs

---

## 9. ROOT CAUSE ANALYSIS

**Primary Issue:** Response format mismatch between `withApiHandler` wrapper and client expectations.

**Why it's failing:**
1. API route uses `withApiHandler` which wraps response: `{ success: true, data: {...}, requestId: "..." }`
2. Client code expects flat structure: `{ success: true, orderId: "...", clientSecret: "..." }`
3. Client checks `data.success` which exists, but then checks `data.clientSecret` which doesn't exist (it's in `data.data.clientSecret`)
4. Condition fails → error message shown → payment flow stops

**Secondary Issues:**
- Empty string fallback in StripeProvider may cause Stripe.js initialization issues
- Missing null check in cancellation route could cause runtime errors

---

## 10. IMMEDIATE ACTION ITEMS

1. **Fix response handling** in `app/services/custom-songs/order/page.tsx` (CRITICAL)
2. **Fix StripeProvider** empty string issue (MEDIUM)
3. **Add null check** in cancellation route (MEDIUM)
4. **Test payment flow** after fixes
5. **Monitor Vercel logs** for any remaining errors

---

**Report Generated:** December 4, 2025  
**Next Steps:** Implement fixes and test payment flow

