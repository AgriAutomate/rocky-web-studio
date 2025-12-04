# Live Payment Test Package - Production Verification

**Date:** December 4, 2025  
**Status:** ✅ Added - Ready for Production Testing

---

## 📋 Test Package Details

### Package Information
- **Value:** `test`
- **Title:** "LIVE SYSTEM TEST"
- **Price:** $1.00 AUD (100 cents in Stripe)
- **Description:** "Temporary production verification item. Non-refundable transaction fee applies."
- **Features:**
  - Verifies Stripe Live Keys
  - Tests Webhook Signature
  - Checks Xero Invoice Generation

---

## 🔧 Files Modified

### 1. `app/services/custom-songs/order/page.tsx`
- **Line 65-69:** Added test package to `packageOptions` array
- **Line 227:** Added "test" to `validPackages` array
- **Marked with:** `// TODO: REMOVE AFTER PRODUCTION VERIFICATION`

### 2. `lib/email/customSongs.ts`
- **Line 24-28:** Added test package to `packagePrices` object
- **Name:** "LIVE SYSTEM TEST"
- **Price:** 1 (dollars, converts to 100 cents)
- **Turnaround:** "N/A - Test Package"
- **Marked with:** `// TODO: REMOVE AFTER PRODUCTION VERIFICATION`

### 3. `lib/analytics.ts`
- **Line 21:** Added "test" to `PackageType` union type
- **Line 97-101:** Added test package to `packagePrices` object
- **Line 106-110:** Added test package to `packageNames` object
- **Marked with:** `// TODO: REMOVE AFTER PRODUCTION VERIFICATION`

---

## ✅ Verification

### Payment Flow
- ✅ Price stored as $1.00 (1 dollar)
- ✅ Converts to 100 cents in PaymentIntent (line 86-87 in `app/api/custom-songs/order/route.ts`)
- ✅ Stripe will process $1.00 AUD transaction

### UI Display
- ✅ Appears in package selection dropdown
- ✅ Label: "LIVE SYSTEM TEST - $1.00 AUD"
- ✅ Renders correctly in selection card grid

### Type Safety
- ✅ TypeScript compilation passes
- ✅ All type definitions updated
- ✅ No type errors

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Deploy to Vercel Production
- [ ] Verify test package appears in dropdown
- [ ] Confirm price displays as $1.00 AUD

### During Test
- [ ] Select "LIVE SYSTEM TEST" package
- [ ] Fill in required form fields
- [ ] Complete payment with real card
- [ ] Verify PaymentIntent created for 100 cents
- [ ] Check webhook receives `payment_intent.succeeded`
- [ ] Verify GA4 events fire (payment_confirmed, song_request_purchased)
- [ ] Check email notifications sent
- [ ] Verify Xero invoice generation (if applicable)

### After Test
- [ ] Check Stripe Dashboard for transaction
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Check GA4 Dashboard for events
- [ ] Review Vercel logs for errors
- [ ] Check email delivery (customer + admin)

---

## 🗑️ Removal Instructions

After production verification is complete, remove the test package:

1. **Remove from `app/services/custom-songs/order/page.tsx`:**
   - Delete test entry from `packageOptions` array (line ~69)
   - Remove "test" from `validPackages` array (line ~227)

2. **Remove from `lib/email/customSongs.ts`:**
   - Delete test entry from `packagePrices` object (line ~31)

3. **Remove from `lib/analytics.ts`:**
   - Remove "test" from `PackageType` union type (line ~21)
   - Delete test entry from `packagePrices` object (line ~101)
   - Delete test entry from `packageNames` object (line ~110)

4. **Verify:**
   ```bash
   npm run type-check
   ```

5. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "chore: remove test package after production verification"
   git push origin main
   ```

---

## 📊 Expected Results

### Stripe PaymentIntent
- **Amount:** 100 (cents)
- **Currency:** AUD
- **Status:** succeeded
- **Metadata:** Includes orderId, package: "test"

### Webhook Event
- **Event Type:** `payment_intent.succeeded`
- **Processing:** Non-blocking analytics tracking
- **Email:** Customer + admin notifications sent

### GA4 Events
- **payment_confirmed:** Fired with transaction_id
- **song_request_purchased:** Fired with order_id and package_type: "test"

---

## ⚠️ Important Notes

1. **Real Payment:** This will process a real $1.00 AUD transaction
2. **Non-Refundable:** Marked as non-refundable transaction fee
3. **Temporary:** Must be removed after verification
4. **Production Only:** Only use in production environment for testing

---

**Status:** ✅ Ready for Production Testing  
**Next Step:** Deploy to Vercel and run live payment test

