# Vercel Environment Variables Setup Guide

## Quick Access Link

Navigate to: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables

## Environment Variables to Add

Add each variable **one at a time** with the following settings:

### 1. STRIPE_SECRET_KEY

- **Name:** `STRIPE_SECRET_KEY`
- **Value:** `sk_test_your_stripe_secret_key_here`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

- **Name:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** `pk_test_51SZ8Xc28GEyQODXIzr74ckhqtvJnJv0886xiWP50wMJ51p1985j1k41PP88SVpEF53Z615Xq16fZo5ZqH129hhe00HgXQ2M43`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. STRIPE_WEBHOOK_SECRET

- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** [To get this value:]
  1. Go to https://dashboard.stripe.com/test/webhooks
  2. Click on your webhook endpoint (or create one if needed)
  3. Click the "Reveal" button next to "Signing secret"
  4. Copy the value (starts with `whsec_`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

**Note:** Make sure your webhook endpoint is configured to:
- URL: `https://rockywebstudio.com.au/api/webhooks/stripe` (or your production URL)
- Events to send: `payment_intent.succeeded`

---

### 4. RESEND_API_KEY

- **Name:** `RESEND_API_KEY`
- **Value:** [To get this value:]
  1. Go to https://resend.com/api-keys
  2. Click on your "Production" API key
  3. Click "Reveal" or copy the full key
  4. Copy the value (starts with `re_`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

**Note:** Ensure your Resend domain is verified before using in production.

---

### 5. NEXT_PUBLIC_GA_MEASUREMENT_ID

- **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Value:** [To get this value:]
  1. Go to https://analytics.google.com/
  2. Select your GA4 property
  3. Go to Admin → Data Streams
  4. Click on your web stream
  5. Copy the "Measurement ID" (format: `G-XXXXXXXXXX`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

---

## Step-by-Step Instructions

1. **Navigate to Vercel Settings:**
   - Go to: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables
   - Or: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add Each Variable:**
   - Click "Add New" or "Add Variable"
   - Enter the **Name** exactly as shown above
   - Paste the **Value** (or follow instructions to get it)
   - Select all three environments: Production, Preview, Development
   - Click "Save"

3. **Repeat for All 5 Variables:**
   - Add them one at a time
   - Double-check each value before saving

4. **Redeploy:**
   - After adding all variables, go to the Deployments tab
   - Click the three dots (⋯) on the latest deployment
   - Select "Redeploy"
   - Or push a new commit to trigger a new deployment

---

## Verification Checklist

After adding all variables, verify:

- [ ] All 5 variables are listed in Vercel
- [ ] Each variable has all three environments selected
- [ ] STRIPE_WEBHOOK_SECRET is set (check Stripe dashboard)
- [ ] RESEND_API_KEY is set (check Resend dashboard)
- [ ] NEXT_PUBLIC_GA_MEASUREMENT_ID is set (check Google Analytics)
- [ ] Site has been redeployed after adding variables

---

## Testing After Setup

1. **Test Stripe Payment:**
   - Go to `/services/custom-songs/order`
   - Complete a test order
   - Verify payment processes correctly

2. **Test Email Notifications:**
   - Complete a test order
   - Check customer email is received
   - Check admin email to `martin@rockywebstudio.com.au` is received

3. **Test Google Analytics:**
   - Open GA4 DebugView
   - Interact with the order form
   - Verify events are appearing in real-time

4. **Test Webhook:**
   - Check Stripe webhook logs
   - Verify `payment_intent.succeeded` events are being received
   - Check that emails are being sent

---

## Important Notes

- **Never commit these values to Git** - they're already in `.gitignore`
- **Use test keys for development** - switch to live keys for production
- **Webhook secret is different for test/live** - make sure you're using the correct one
- **Redeploy is required** - environment variables only take effect after redeployment

---

## Troubleshooting

**Variables not working?**
- Ensure you've redeployed after adding variables
- Check that all three environments are selected
- Verify variable names match exactly (case-sensitive)

**Stripe not working?**
- Verify both `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
- Check that you're using test keys in development
- Ensure webhook endpoint is configured correctly

**Emails not sending?**
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API key status
- Ensure domain is verified in Resend

**Analytics not tracking?**
- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (must start with `G-`)
- Check browser console for errors
- Verify GA4 DebugView is enabled

