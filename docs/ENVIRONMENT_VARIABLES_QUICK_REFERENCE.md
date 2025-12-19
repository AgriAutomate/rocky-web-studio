# Environment Variables Quick Reference

## Vercel Dashboard Link
🔗 https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables

## Variables to Add (Copy-Paste Ready)

### ✅ 1. STRIPE_SECRET_KEY
```
Name: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_secret_key_here
Environments: Production, Preview, Development
```

### ✅ 2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51SZ8Xc28GEyQODXIzr74ckhqtvJnJv0886xiWP50wMJ51p1985j1k41PP88SVpEF53Z615Xq16fZo5ZqH129hhe00HgXQ2M43
Environments: Production, Preview, Development
```

### ⚠️ 3. STRIPE_WEBHOOK_SECRET
```
Name: STRIPE_WEBHOOK_SECRET
Value: [Get from Stripe Dashboard → Webhooks → Click "Reveal" on signing secret]
Format: whsec_...
Environments: Production, Preview, Development
```

**How to get:**
1. https://dashboard.stripe.com/test/webhooks
2. Click your webhook endpoint
3. Click "Reveal" next to "Signing secret"
4. Copy the value

### ⚠️ 4. RESEND_API_KEY
```
Name: RESEND_API_KEY
Value: [Get from Resend Dashboard → API Keys → Production key]
Format: re_...
Environments: Production, Preview, Development
```

**How to get:**
1. https://resend.com/api-keys
2. Click "Production" key
3. Click "Reveal" or copy full key
4. Copy the value

### ⚠️ 5. NEXT_PUBLIC_GA_MEASUREMENT_ID
```
Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: [Get from Google Analytics → Admin → Data Streams]
Format: G-XXXXXXXXXX
Environments: Production, Preview, Development
```

**How to get:**
1. https://analytics.google.com/
2. Admin → Data Streams
3. Click your web stream
4. Copy "Measurement ID"

### ⚠️ 6. N8N Webhook URLs (Optional - Phase 1F)
```
Name: N8N_QUESTIONNAIRE_WEBHOOK_URL
Value: https://your-n8n-instance/webhook/questionnaire
Environments: Production, Preview, Development
```

```
Name: N8N_SERVICE_LEAD_WEBHOOK_URL
Value: https://your-n8n-instance/webhook/service-lead
Environments: Production, Preview, Development
```

```
Name: N8N_LEAD_SCORING_WEBHOOK_URL
Value: https://your-n8n-instance/webhook/lead-scoring
Environments: Production, Preview, Development
```

```
Name: N8N_NURTURE_WEBHOOK_URL
Value: https://your-n8n-instance/webhook/nurture-drip
Environments: Production, Preview, Development
```

**Note:** These are placeholder URLs. Update with actual webhook URLs after deploying n8n workflows in Phase 1F.

---

## After Adding Variables

1. ✅ Add all variables (5 required + 4 optional n8n webhooks)
2. ✅ Select all 3 environments for each
3. ✅ Redeploy the site (Deployments → Redeploy)

---

## Quick Links

- **Vercel Environment Variables:** https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables
- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Resend API Keys:** https://resend.com/api-keys
- **Google Analytics:** https://analytics.google.com/

