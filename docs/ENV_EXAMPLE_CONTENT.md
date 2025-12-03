# .env.example File Content

Since `.env.example` is blocked by globalignore, create it manually in the project root with the following content:

```bash
# =============================================================================
# Rocky Web Studio - Environment Variables Template
# =============================================================================
# Copy this file to .env.local and fill in your actual values.
# NEVER commit .env.local to version control.
# =============================================================================

# =============================================================================
# Stripe Payment Processing (Test Mode)
# =============================================================================
# Get keys from: https://dashboard.stripe.com/test/apikeys
# For production, use live keys (sk_live_... and pk_live_...)

STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Webhook secret from: https://dashboard.stripe.com/test/webhooks
# Click on your webhook endpoint → Reveal "Signing secret"
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# =============================================================================
# Resend Email API
# =============================================================================
# Get API key from: https://resend.com/api-keys
# Ensure your domain is verified before using in production

RESEND_API_KEY=re_your_key_here

# =============================================================================
# Google Analytics 4
# =============================================================================
# Get Measurement ID from: https://analytics.google.com/
# Admin → Data Streams → Click your web stream → Copy "Measurement ID"

NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# =============================================================================
# Database (Optional - if using)
# =============================================================================
# Uncomment and configure if you're using a database
# DATABASE_URL=your_database_url_here

# =============================================================================
# Site Configuration (Optional)
# =============================================================================
# NEXT_PUBLIC_URL=https://rockywebstudio.com.au

# =============================================================================
# NextAuth.js Authentication (if using)
# =============================================================================
# Generate secret with: openssl rand -base64 32
# NEXTAUTH_URL=https://rockywebstudio.com.au
# NEXTAUTH_SECRET=your_generated_secret_here
# ADMIN_PASSWORD=your_secure_password_here

# =============================================================================
# Vercel KV (Redis) - Optional
# =============================================================================
# Auto-populated by Vercel CLI: vercel env pull .env.local
# KV_REST_API_URL=https://your-project-slug.kv.vercel-storage.com
# KV_REST_API_TOKEN=your_secret_token
# KV_REST_API_READ_ONLY_TOKEN=your_read_only_token

# =============================================================================
# Mobile Message SMS API (if using)
# =============================================================================
# MOBILE_MESSAGE_API_USERNAME=your_username_here
# MOBILE_MESSAGE_API_PASSWORD=your_password_here
# MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
# MOBILE_MESSAGE_SENDER_ID=your_sender_id_here
```

## Instructions

1. Create a new file named `.env.example` in the project root
2. Copy the content above into the file
3. Save the file

## Verification

✅ `.env.local` is already in `.gitignore` (line 37)
✅ All environment variables are documented
✅ Template includes helpful comments and links

