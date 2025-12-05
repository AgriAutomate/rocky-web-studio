# Rocky Web Studio - Project Structure Summary

**Generated:** 2025-01-12  
**Project Type:** Next.js 16 Application  
**Node Version:** v22.16.0  
**NPM Version:** 10.9.2

---

## 📁 Directory Structure

```
rocky-web-studio/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (35 endpoints)
│   │   ├── webhooks/             # Webhook receivers
│   │   │   └── stripe/           # Stripe payment webhooks
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── bookings/             # Booking management
│   │   ├── custom-songs/          # Custom song orders
│   │   ├── xero/                 # Xero integration
│   │   └── auth/                 # Authentication
│   ├── admin/                    # Admin dashboard pages (protected)
│   ├── services/                 # Service pages (8 services)
│   └── components/               # Page components
├── lib/                          # Shared libraries (30 files)
│   ├── sms/                      # SMS functionality
│   ├── xero/                     # Xero OAuth & API
│   ├── analytics/                # Google Analytics
│   ├── auth/                     # Authentication helpers
│   ├── email/                     # Email templates
│   └── kv/                       # Vercel KV storage
├── components/                   # React components (25 files)
│   ├── ui/                       # UI primitives (Radix UI)
│   ├── admin/                    # Admin components
│   └── services/                 # Service page components
├── docs/                         # Documentation (66 files)
├── public/                       # Static assets
├── scripts/                      # Utility scripts
└── types/                        # TypeScript types
```

---

## 🔧 Configuration Files

| File | Status | Purpose |
|------|--------|---------|
| `package.json` | ✅ Present | Dependencies & scripts |
| `tsconfig.json` | ✅ Present | TypeScript config (strict mode) |
| `next.config.ts` | ✅ Present | Next.js config + Sentry |
| `vercel.json` | ✅ Present | Vercel deployment config |
| `auth.config.ts` | ✅ Present | NextAuth configuration |
| `middleware.ts` | ✅ Present | Route protection |
| `.env.local` | ❌ Missing | **REQUIRED** - Environment variables |
| `.env.example` | ❌ Missing | **RECOMMENDED** - Template file |

---

## 🔌 API Endpoints

### Public Endpoints
- `POST /api/custom-songs/order` - Create custom song order
- `POST /api/bookings/create` - Create booking (rate-limited: 10/min)
- `GET /api/bookings/availability` - Get available slots
- `POST /api/bookings/[id]/cancel` - Cancel booking
- `POST /api/bookings/[id]/reschedule` - Reschedule booking
- `GET /api/health` - Health check

### Protected Endpoints (Admin Only)
- `GET /api/admin/sms/logs` - SMS logs
- `GET /api/admin/sms/stats` - SMS statistics
- `GET /api/admin/sms/credits` - API credits
- `GET /api/xero/connect` - Xero OAuth
- `GET /api/xero/invoices` - List invoices
- `POST /api/xero/create-invoice` - Create invoice

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhooks
  - Events: `payment_intent.succeeded`
  - Auth: Stripe signature verification
  - Idempotency: Vercel KV (7-day TTL)

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Cron Jobs
- `POST /api/notifications/send-reminder` - Hourly booking reminders

---

## 🔐 Authentication & Credentials

### NextAuth (Admin Login)
- **Provider:** Credentials
- **Admin Email:** `admin@rockywebstudio.com.au` (hardcoded)
- **Password:** `ADMIN_PASSWORD` env var
- **Session:** JWT, 8-hour expiry
- **Protected Routes:** `/admin/*`

### External API Credentials Required

| Service | Environment Variables | Storage |
|---------|---------------------|---------|
| **Stripe** | `STRIPE_SECRET_KEY`<br>`STRIPE_WEBHOOK_SECRET` | Env vars |
| **Mobile Message API** | `MOBILE_MESSAGE_API_URL`<br>`MOBILE_MESSAGE_API_USERNAME`<br>`MOBILE_MESSAGE_API_PASSWORD`<br>`MOBILE_MESSAGE_SENDER_ID` | Env vars |
| **Xero** | `XERO_CLIENT_ID`<br>`XERO_CLIENT_SECRET` | Env vars<br>Tokens: Vercel KV |
| **Resend Email** | `RESEND_API_KEY` | Env vars |
| **Google Analytics** | `NEXT_PUBLIC_GA_MEASUREMENT_ID`<br>`GA4_API_SECRET` | Env vars |
| **Sentry** | `SENTRY_ORG`<br>`SENTRY_PROJECT`<br>`SENTRY_AUTH_TOKEN` | Env vars |

---

## 🗄️ Data Storage

**No traditional database** - Uses **Vercel KV (Redis)**

### Storage Schemas

1. **Bookings** (`booking:*`)
   - Key: `lib/kv/bookings.ts`
   - Fields: id, date, time, name, email, phone, serviceType, status

2. **SMS Records** (`sms:*`)
   - Key: `lib/kv/sms.ts`
   - Fields: id, messageId, bookingId, phoneNumber, status, cost

3. **Xero Tokens** (`xero:token:{userId}`)
   - Key: `lib/xero/token-store.ts`
   - Fields: access_token, refresh_token, expires_in, obtained_at
   - TTL: Auto-expires based on token expiry

4. **Webhook Idempotency** (`webhook:stripe:{eventId}`)
   - Key: `app/api/webhooks/stripe/route.ts`
   - TTL: 7 days
   - Purpose: Prevent duplicate webhook processing

---

## 🌐 Tunnel Configurations

1. **Sentry Tunnel**
   - Route: `/monitoring`
   - Config: `next.config.ts`
   - Status: ✅ Configured

2. **n8n localtunnel**
   - Port: 5678
   - Subdomain: `rocky-web-n8n`
   - Script: `start-n8n.ps1`
   - Status: ⚠️ Manual setup required
   - Command: `npx localtunnel --port 5678 --subdomain rocky-web-n8n`

3. **ngrok (Documentation Only)**
   - Purpose: Xero webhook testing
   - Status: 📝 Documented in `docs/XERO_INTEGRATION.md`
   - Not configured in code

---

## ⚠️ Security Concerns

### High Priority
- ❌ **`.env.local` missing** - Required for local development
  - **Action:** Create file with all required environment variables

### Medium Priority
- ⚠️ **`.env.example` missing** - Documentation template
  - **Action:** Create template file with placeholder values
- ⚠️ **Hardcoded admin email** in `auth.ts`
  - **Recommendation:** Move to `ADMIN_EMAIL` env var

### Low Priority / Info
- ✅ **Secret redaction** implemented in logging
- ✅ **Sentry filtering** configured for sensitive params
- ✅ **Webhook signature verification** for Stripe
- ✅ **Token expiration** for Xero OAuth tokens

---

## 📦 Version Compatibility

| Package | Version | Status |
|---------|---------|--------|
| Node.js | v22.16.0 | ✅ Latest LTS |
| NPM | 10.9.2 | ✅ Latest |
| Next.js | 16.0.7 | ✅ Latest stable |
| React | 19.2.1 | ✅ Latest stable |
| TypeScript | ^5 | ✅ Latest |
| NextAuth | ^5.0.0-beta.30 | ⚠️ Beta (upgrade when stable) |
| Stripe | ^20.0.0 | ✅ Latest |
| Vercel KV | ^3.0.0 | ✅ Latest |

---

## 🚀 Deployment

- **Platform:** Vercel
- **Database:** Vercel KV (Redis)
- **Environment Variables:** Set in Vercel dashboard
- **Cron Jobs:** Configured in `vercel.json`
- **Function Memory:** 1024MB for webhooks/reminders
- **Max Duration:** 30s (webhooks), 10s (reminders)

---

## 📊 Statistics

- **Total API Endpoints:** 16
- **Webhook Receivers:** 1 (Stripe)
- **Protected Routes:** 8 (Admin only)
- **Environment Variables:** 20+ required
- **External Integrations:** 7 services
- **Documentation Files:** 66

---

## 🔍 Quick Reference

### Critical Files
- `app/api/webhooks/stripe/route.ts` - Payment processing
- `app/api/custom-songs/order/route.ts` - Order creation
- `lib/sms.ts` - SMS functionality
- `lib/xero/token-store.ts` - OAuth token management
- `auth.ts` - Authentication configuration

### Missing Files to Create
1. `.env.local` - **REQUIRED**
2. `.env.example` - **RECOMMENDED**

### Key Directories
- `app/api/` - All API endpoints
- `lib/` - Shared business logic
- `components/` - React components
- `docs/` - Documentation

---

## 📝 Next Steps

1. ✅ Create `.env.local` with all required variables
2. ✅ Create `.env.example` template
3. ⚠️ Consider moving admin email to env var
4. ⚠️ Monitor NextAuth v5 beta → stable upgrade
5. ✅ Verify all env vars set in Vercel production

---

**Full detailed JSON report:** `project_structure.json`


