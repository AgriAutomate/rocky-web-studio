# Stripe Secret Key Fix Guide

**Issue:** "Failed to create Stripe PaymentIntent - connection to Stripe failed"  
**Root Cause:** `STRIPE_SECRET_KEY` in Vercel may be incomplete/truncated

---

## 1. Stripe Secret Key Format

### Expected Format
- **Test Key:** `sk_test_51[A-Za-z0-9]{99}` (110 characters total)
- **Live Key:** `sk_live_51[A-Za-z0-9]{99}` (110 characters total)
- **Pattern:** Starts with `sk_test_` or `sk_live_`, followed by exactly 99 alphanumeric characters

### Key Length Verification
```bash
# Test key should be exactly 110 characters
echo -n "sk_test_51..." | wc -c
# Should output: 110
```

---

## 2. Extract Complete Key from Stripe Dashboard

### Steps:
1. Go to: https://dashboard.stripe.com/test/apikeys (Test mode) or https://dashboard.stripe.com/apikeys (Live mode)
2. Find **Secret key** (not Publishable key)
3. Click **Reveal test key** or **Reveal live key**
4. **Copy the ENTIRE key** - it should be 110 characters
5. **Important:** Copy from start (`sk_test_`) to end (no truncation)

### Common Issues:
- ❌ Key copied but last few characters missing
- ❌ Extra spaces or newlines added
- ❌ Key copied from wrong field (publishable vs secret)
- ❌ Test key used in production or vice versa

---

## 3. Verify Current Vercel Configuration

### Check Current Key Length (if possible):
```bash
# Note: Vercel encrypts keys, so we can't see the actual value
# But we can check when it was last updated
vercel env ls | Select-String -Pattern "STRIPE_SECRET_KEY"
```

### Check Last Updated:
- Production: Updated 3h ago
- Preview: Updated 3h ago

---

## 4. Update Stripe Secret Key in Vercel

### Option A: Update via Vercel CLI (Recommended)

**For Production:**
```bash
vercel env rm STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production
# When prompted, paste the COMPLETE key (110 characters)
```

**For Preview:**
```bash
vercel env rm STRIPE_SECRET_KEY preview
vercel env add STRIPE_SECRET_KEY preview
# When prompted, paste the COMPLETE key (110 characters)
```

**For Development (if needed):**
```bash
vercel env rm STRIPE_SECRET_KEY development
vercel env add STRIPE_SECRET_KEY development
# When prompted, paste the COMPLETE key (110 characters)
```

### Option B: Update via Vercel Dashboard

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Find `STRIPE_SECRET_KEY`
3. Click **Edit** or **Remove** then **Add**
4. Select environments: Production, Preview (and Development if needed)
5. Paste the **COMPLETE** key (verify it's 110 characters)
6. Click **Save**

---

## 5. Complete Key from Previous Configuration

Based on earlier configuration, the test key should be:
```
sk_test_51SZ8Xc28GEyQODXIjc5yWOJar7jKHEiwOoxbjq4eweupR4jN0tENrWpIcYyAHDXmoxat3IAno5qrQmpss0eqGTUD00NrQmpss0eqGTUD00N3hg60S
```

**⚠️ IMPORTANT:** 
- Verify this is the COMPLETE key (110 characters)
- If this key is truncated or incorrect, get a fresh one from Stripe Dashboard
- Never share or commit secret keys to version control

---

## 6. Verification Steps

### After Updating:

1. **Redeploy Application:**
   ```bash
   # Trigger a new deployment
   git commit --allow-empty -m "chore: trigger redeploy for Stripe key update"
   git push origin main
   ```

2. **Test Payment Flow:**
   - Create a test order
   - Verify PaymentIntent creation succeeds
   - Check Vercel function logs for errors

3. **Check Vercel Logs:**
   ```bash
   # View recent function logs
   vercel logs --follow
   ```

4. **Verify in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/payments
   - Check if PaymentIntents are being created
   - Look for any API errors

---

## 7. Troubleshooting

### If Key Still Fails:

1. **Regenerate Key in Stripe:**
   - Go to Stripe Dashboard → API Keys
   - Click **Create secret key** (or regenerate existing)
   - Copy the NEW complete key
   - Update in Vercel

2. **Check API Version Compatibility:**
   - Current code uses: `apiVersion: "2025-11-17.clover"`
   - Verify this is a valid API version in your Stripe account
   - Consider using latest stable version: `apiVersion: "2024-11-20.acacia"`

3. **Verify Key Type:**
   - Test mode: Use `sk_test_...`
   - Live mode: Use `sk_live_...`
   - Ensure you're using the correct key for your environment

4. **Check Network/Firewall:**
   - Ensure Vercel functions can reach Stripe API
   - Check for any IP restrictions in Stripe Dashboard

---

## 8. Quick Fix Commands

### Complete Update Script:

```bash
# 1. Remove existing keys
vercel env rm STRIPE_SECRET_KEY production
vercel env rm STRIPE_SECRET_KEY preview

# 2. Add new keys (will prompt for value)
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY preview

# 3. Verify
vercel env ls | Select-String -Pattern "STRIPE_SECRET_KEY"

# 4. Trigger redeploy
git commit --allow-empty -m "chore: trigger redeploy after Stripe key update"
git push origin main
```

---

## 9. Key Format Validation

### Test Script (run locally):

```bash
# Check if key format is correct
KEY="sk_test_51SZ8Xc28GEyQODXIjc5yWOJar7jKHEiwOoxbjq4eweupR4jN0tENrWpIcYyAHDXmoxat3IAno5qrQmpss0eqGTUD00NrQmpss0eqGTUD00N3hg60S"

# Check length
echo "Key length: ${#KEY} characters"
# Should output: Key length: 110 characters

# Check prefix
if [[ $KEY == sk_test_* ]] || [[ $KEY == sk_live_* ]]; then
  echo "✅ Key prefix is correct"
else
  echo "❌ Key prefix is incorrect"
fi

# Check alphanumeric after prefix
if [[ $KEY =~ ^sk_(test|live)_[A-Za-z0-9]{99}$ ]]; then
  echo "✅ Key format is valid"
else
  echo "❌ Key format is invalid"
fi
```

---

## 10. Next Steps

1. ✅ Get complete key from Stripe Dashboard
2. ✅ Update in Vercel (Production + Preview)
3. ✅ Trigger redeploy
4. ✅ Test payment flow
5. ✅ Monitor logs for errors

---

**Last Updated:** December 4, 2025  
**Status:** Ready for key update

