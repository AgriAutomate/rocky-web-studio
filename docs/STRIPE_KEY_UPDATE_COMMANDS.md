# Stripe Secret Key Update - Immediate Action Required

**Issue:** "Failed to create Stripe PaymentIntent - connection to Stripe failed"  
**Root Cause:** `STRIPE_SECRET_KEY` in Vercel may be incomplete/truncated  
**Solution:** Update with COMPLETE key from Stripe Dashboard

---

## 🔴 CRITICAL: Get Complete Key First

### Step 0: Extract Complete Key from Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Test Mode: https://dashboard.stripe.com/test/apikeys
   - Live Mode: https://dashboard.stripe.com/apikeys

2. **Find Secret Key:**
   - Look for **"Secret key"** (not Publishable key)
   - Click **"Reveal test key"** or **"Reveal live key"**

3. **Copy COMPLETE Key:**
   - Select ALL characters from start to end
   - Should be exactly **110 characters**
   - Format: `sk_test_51[A-Za-z0-9]{99}` or `sk_live_51[A-Za-z0-9]{99}`
   - **NO spaces, NO line breaks, NO truncation**

4. **Verify Before Pasting:**
   - Length: Exactly 110 characters
   - Starts with: `sk_test_51` (test) or `sk_live_51` (live)
   - No trailing `...` or ellipsis
   - No extra whitespace

---

## 📋 Method 1: Vercel CLI Commands

### Step 1: Remove Existing Incorrect Keys

```bash
# Remove from Production
vercel env rm STRIPE_SECRET_KEY production

# Remove from Preview
vercel env rm STRIPE_SECRET_KEY preview
```

**Expected Output:**
```
? Are you sure you want to remove STRIPE_SECRET_KEY from Production? Yes
✓ Removed STRIPE_SECRET_KEY from Production
```

### Step 2: Add Correct Complete Key

```bash
# Add to Production
vercel env add STRIPE_SECRET_KEY production
```

**When Prompted:**
```
? What's the value of STRIPE_SECRET_KEY? 
```
**Paste the COMPLETE 110-character key here** (no quotes, no spaces)

```bash
# Add to Preview
vercel env add STRIPE_SECRET_KEY preview
```

**When Prompted:**
```
? What's the value of STRIPE_SECRET_KEY? 
```
**Paste the SAME complete key** (no quotes, no spaces)

### Step 3: Verify Keys Are Set

```bash
vercel env ls | Select-String -Pattern "STRIPE_SECRET_KEY"
```

**Expected Output:**
```
STRIPE_SECRET_KEY    Encrypted    Production    just now
STRIPE_SECRET_KEY    Encrypted    Preview       just now
```

### Step 4: Trigger Redeploy

```bash
git commit --allow-empty -m "chore: trigger redeploy after Stripe key update"
git push origin main
```

**Note:** Vercel will automatically redeploy when environment variables change, but this ensures a fresh deployment.

---

## 🖥️ Method 2: Vercel Dashboard (Alternative)

### Step 1: Navigate to Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: **rocky-web-studio**
3. Go to: **Settings** → **Environment Variables**

### Step 2: Delete Existing Keys

1. Find `STRIPE_SECRET_KEY` in the list
2. Click **"..."** (three dots) → **Delete**
3. Confirm deletion for **Production**
4. Repeat for **Preview** (if separate entry exists)

### Step 3: Add New Keys

1. Click **"Add New"** button
2. **Name:** `STRIPE_SECRET_KEY`
3. **Value:** Paste COMPLETE key from Stripe Dashboard
   - **Important:** Copy entire key (110 characters)
   - No spaces, no line breaks
4. **Environments:** Select both:
   - ☑️ Production
   - ☑️ Preview
5. Click **Save**

### Step 4: Verify

- Check that `STRIPE_SECRET_KEY` appears twice:
  - Once for Production
  - Once for Preview
- Both should show "Encrypted" status

### Step 5: Redeploy

- Vercel will automatically redeploy, OR
- Go to **Deployments** tab → Click **"Redeploy"** on latest deployment

---

## ✅ Verification Checklist

Before proceeding, verify the key:

- [ ] **Length:** Key is EXACTLY 110 characters
- [ ] **Prefix:** Starts with `sk_test_51` (test) or `sk_live_51` (live)
- [ ] **No Spaces:** Contains no spaces or line breaks
- [ ] **No Truncation:** No trailing periods (`...`) or ellipsis
- [ ] **Complete:** Copied from Stripe Dashboard "Reveal" button
- [ ] **Correct Type:** Using test key for test mode, live key for production

### Quick Character Count Check

**PowerShell:**
```powershell
$key = "sk_test_51..." # Paste your key here
Write-Host "Key length: $($key.Length) characters"
# Should output: Key length: 110 characters
```

**Bash:**
```bash
echo -n "sk_test_51..." | wc -c
# Should output: 110
```

---

## 🔍 Troubleshooting

### Issue: Key Still Fails After Update

1. **Verify Key Format:**
   ```bash
   # Check if key matches pattern
   # Test: sk_test_51 + 99 alphanumeric chars = 110 total
   # Live: sk_live_51 + 99 alphanumeric chars = 110 total
   ```

2. **Regenerate Key in Stripe:**
   - Go to Stripe Dashboard → API Keys
   - Click **"Create secret key"** or **"Regenerate"**
   - Copy the NEW complete key
   - Update in Vercel

3. **Check API Version:**
   - Current code uses: `apiVersion: "2025-11-17.clover"`
   - Verify this is valid for your Stripe account
   - Consider updating to latest: `apiVersion: "2024-11-20.acacia"`

4. **Verify Environment Match:**
   - Test mode key → Use in Preview/Development
   - Live mode key → Use in Production
   - Ensure key type matches environment

### Issue: Key Not Updating

1. **Wait for Propagation:**
   - Environment variables can take 1-2 minutes to propagate
   - Redeploy after updating

2. **Force Redeploy:**
   ```bash
   git commit --allow-empty -m "chore: force redeploy"
   git push origin main
   ```

3. **Check Vercel Logs:**
   ```bash
   vercel logs --follow
   ```
   Look for: `STRIPE_SECRET_KEY is not set` or Stripe API errors

---

## 📝 Complete Command Sequence

Copy and paste this entire sequence (replace `YOUR_COMPLETE_KEY_HERE` with actual key):

```bash
# Step 1: Remove old keys
vercel env rm STRIPE_SECRET_KEY production
vercel env rm STRIPE_SECRET_KEY preview

# Step 2: Add new keys (will prompt for value)
# When prompted, paste YOUR_COMPLETE_KEY_HERE (110 characters)
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY preview

# Step 3: Verify
vercel env ls | Select-String -Pattern "STRIPE_SECRET_KEY"

# Step 4: Redeploy
git commit --allow-empty -m "chore: trigger redeploy after Stripe key update"
git push origin main
```

---

## 🎯 Expected Result

After completing these steps:

1. ✅ `STRIPE_SECRET_KEY` updated in Vercel (Production + Preview)
2. ✅ Key is complete (110 characters, no truncation)
3. ✅ Application redeployed
4. ✅ PaymentIntent creation succeeds
5. ✅ No more "connection to Stripe failed" errors

---

## 📞 Next Steps After Update

1. **Test Payment Flow:**
   - Create a test order
   - Verify PaymentIntent creation succeeds
   - Check browser console for errors

2. **Monitor Logs:**
   ```bash
   vercel logs --follow
   ```
   Look for successful PaymentIntent creation logs

3. **Check Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/payments
   - Verify PaymentIntents are being created
   - Check for any API errors

---

**Last Updated:** December 4, 2025  
**Status:** Ready for immediate action  
**Priority:** 🔴 CRITICAL

