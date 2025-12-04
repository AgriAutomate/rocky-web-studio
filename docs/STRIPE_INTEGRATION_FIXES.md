# Stripe Integration - Issues & Fixes

## Issues Identified

### 1. **Missing Environment Variables** ⚠️ CRITICAL
- **Error:** `STRIPE_SECRET_KEY is not set` (appears in build logs)
- **Error:** `STRIPE_WEBHOOK_SECRET is not set` (appears in build logs)
- **Impact:** 
  - Payment processing fails
  - Webhooks cannot verify signatures
  - Custom songs orders cannot be processed
- **Status:** Environment variables need to be set in Vercel

### 2. **Inconsistent Error Handling** 🔧
- **Issue:** `app/api/custom-songs/order/route.ts` uses `console.error` instead of structured logging
- **Issue:** Error handling differs between order route and webhook route
- **Impact:** Harder to debug and monitor in production
- **Fix:** Standardize on structured logging

### 3. **API Version Verification** ⚠️
- **Current:** `2025-11-17.clover` 
- **Concern:** This appears to be a future date (we're in Dec 2024/2025)
- **Action:** Verify this is a valid Stripe API version or update to latest stable

### 4. **Missing Error Context** 📝
- **Issue:** Generic error messages without request context
- **Impact:** Difficult to trace issues in production
- **Fix:** Add request IDs and structured error responses

## Recommended Fixes

### Priority 1: Environment Variables (CRITICAL)
1. **Set in Vercel:**
   - `STRIPE_SECRET_KEY` (test or live key)
   - `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test or live key)

2. **Verify in Stripe Dashboard:**
   - Webhook endpoint configured: `https://rockywebstudio.com.au/api/webhooks/stripe`
   - Webhook secret copied correctly
   - Test mode vs Live mode keys match

### Priority 2: Standardize Error Handling
1. Replace `console.error` with structured logging
2. Use consistent error response format
3. Add request IDs for tracking

### Priority 3: Verify API Version
1. Check Stripe documentation for valid API versions
2. Update to latest stable version if needed
3. Test compatibility

### Priority 4: Improve Error Messages
1. Add user-friendly error messages
2. Include context in logs
3. Add request tracking

## Implementation Plan

1. ✅ Update order route to use structured logging
2. ✅ Add proper error handling with request IDs
3. ✅ Verify/update Stripe API version
4. ✅ Create environment variable checklist
5. ✅ Add runtime validation for required variables

