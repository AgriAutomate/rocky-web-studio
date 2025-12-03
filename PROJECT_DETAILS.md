# Rocky Web Studio - Complete Project Details
## Vercel Deployment Configuration

**Last Updated:** December 2025  
**Project Version:** 0.1.0  
**Framework:** Next.js 16.0.3 (App Router)  
**Node.js:** 18+ (recommended: 20+)

---

## 📦 Project Configuration

### Package.json Summary
```json
{
  "name": "rocky-web-studio",
  "version": "0.1.0",
  "private": true
}
```

### Build Configuration

**Build Command:** `npm run build`  
**Output Directory:** `.next` (default Next.js)  
**Install Command:** `npm install`  
**Node Version:** 20.x (recommended)

### Scripts
- `dev` - Development server (`next dev`)
- `build` - Production build (`next build`)
- `start` - Production server (`next start`)
- `type-check` - TypeScript validation (`tsc --noEmit`)
- `lint` - ESLint check (currently disabled due to Next.js bug)
- `preflight` - Pre-deployment checks (type-check + lint + build)
- `deploy` - Full deployment check
- `prepare` - Husky git hooks setup

---

## 🔧 Next.js Configuration

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true, // React Compiler enabled
};

export default nextConfig;
```

**Key Features:**
- React Compiler enabled
- App Router architecture
- TypeScript strict mode
- Server Components by default

---

## ⚙️ TypeScript Configuration

**File:** `tsconfig.json`

**Key Settings:**
- Target: ES2017
- Module: ESNext
- Module Resolution: Bundler
- JSX: react-jsx
- Strict Mode: Enabled
- Path Aliases: `@/*` → `./*`

**Strict Checks Enabled:**
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`
- `forceConsistentCasingInFileNames: true`

---

## 🚀 Vercel Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/notifications/send-reminder",
      "schedule": "0 * * * *"
    }
  ],
  "functions": {
    "app/api/notifications/send-reminder/route.ts": {
      "memory": 1024,
      "maxDuration": 10
    },
    "app/api/webhooks/stripe/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Cron Jobs:**
- Hourly reminder notifications (`/api/notifications/send-reminder`)
- Schedule: Every hour (`0 * * * *`)

**Function Configuration:**
- Reminder route: 1024MB memory, 10s max duration
- Stripe webhook route: 1024MB memory, 30s max duration

---

## 🔐 Environment Variables

### Required for Production

#### Public Variables (NEXT_PUBLIC_*)
```bash
# Base URL
NEXT_PUBLIC_URL=https://rockywebstudio.com.au

# Booking System
NEXT_PUBLIC_BOOKING_URL=https://rockywebstudio.com.au/book

# Admin Dashboard (optional)
NEXT_PUBLIC_ADMIN_TOKEN=your_secure_admin_token
```

#### Stripe Payment Processing
```bash
# Stripe Keys (Required for Custom Songs orders)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (for webhooks)
```

#### Email Service (Resend)
```bash
# Resend API Key (for booking confirmations & custom song orders)
RESEND_API_KEY=re_...
```

#### SMS Service - Mobile Message API (Primary)
```bash
# Mobile Message API Credentials
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_SENDER_ID=your_sender_id
```

#### SMS Service - Alternative Providers

**Option 1: Twilio**
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+61XXXXXXXXX
```

#### Optional Configuration
```bash
# SMS Cost Tracking (defaults to 0.08 AUD per message)
SMS_COST_PER_MESSAGE=0.08
```

---

## 📁 Project Structure

```
rocky-web-studio/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin endpoints
│   │   │   ├── sms/              # SMS admin (credits, logs, stats)
│   │   │   └── sms-logs/         # SMS log management
│   │   ├── bookings/             # Booking system
│   │   │   ├── availability/     # Check available times
│   │   │   ├── create/           # Create booking
│   │   │   └── [bookingId]/sms/  # Booking SMS logs
│   │   ├── custom-songs/         # Custom Songs service
│   │   │   └── order/            # Order processing (Stripe)
│   │   └── webhooks/             # Webhook handlers
│   │       └── stripe/           # Stripe webhook (payment confirmations)
│   │   ├── notifications/        # SMS notifications
│   │   │   ├── send-reminder/    # Scheduled reminders
│   │   │   └── send-sms/         # SMS sending
│   │   ├── cron/                 # Cron jobs
│   │   │   └── send-reminders/   # Hourly reminder cron
│   │   ├── mobile-message/       # Mobile Message API
│   │   │   └── credits/          # Check SMS credits
│   │   └── test/                 # Testing endpoints
│   │       └── mobile-message-auth/  # Test SMS auth
│   ├── admin/                    # Admin dashboards
│   │   ├── sms/                  # SMS dashboard
│   │   └── sms-logs/             # SMS logs viewer
│   ├── book/                     # Booking page
│   ├── services/                 # Service pages
│   │   ├── custom-songs/         # Custom Songs service
│   │   │   ├── order/            # Order form
│   │   │   └── terms/            # Terms & conditions
│   │   ├── website-design-development/
│   │   ├── website-redesign-refresh/
│   │   ├── ecommerce/
│   │   ├── crm-integration/
│   │   ├── ai-automation/
│   │   ├── seo-performance/
│   │   └── support-maintenance/
│   ├── components/               # App-specific components
│   │   └── BookingCalendar.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/                   # Shared components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── services/                 # Service page components
│   │   ├── ServiceHero.tsx
│   │   ├── ServiceFeatures.tsx
│   │   ├── ServicePricing.tsx
│   │   ├── ServiceProcess.tsx
│   │   ├── ServiceFAQ.tsx
│   │   └── ServiceCTA.tsx
│   ├── contact-form.tsx
│   ├── custom-songs-banner.tsx
│   ├── hero-section.tsx
│   ├── pricing-table.tsx
│   ├── services-grid.tsx
│   ├── testimonials-carousel.tsx
│   └── veteran-owned-callout.tsx
├── lib/                          # Utility libraries
│   ├── analytics.ts              # Google Analytics tracking
│   ├── bookings/                 # Booking storage
│   │   └── storage.ts
│   ├── mobile-message/           # Mobile Message API client
│   │   └── credits.ts
│   ├── sms/                      # SMS system
│   │   ├── index.ts              # SMS provider abstraction
│   │   ├── types.ts              # TypeScript types
│   │   ├── storage.ts            # SMS log storage
│   │   ├── messages.ts           # Message templates
│   │   ├── booking-helpers.ts    # Booking SMS helpers
│   │   └── providers/            # SMS providers (legacy - not currently used)
│   │       └── twilio.ts
│   ├── phone.ts                  # Phone number formatting
│   ├── sms.ts                    # Legacy SMS utilities
│   └── utils.ts                  # General utilities
├── public/                       # Static assets
│   ├── *.mp4                     # Custom song videos
│   └── *.svg                     # Icons
├── scripts/                      # Build scripts
│   └── dev-check.sh             # Pre-flight checks
├── .husky/                       # Git hooks
│   └── pre-commit               # Pre-commit checks
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── vercel.json                   # Vercel deployment config
├── package.json                  # Dependencies
└── .gitignore                    # Git ignore rules
```

---

## 📦 Dependencies

### Production Dependencies

**Core Framework:**
- `next@16.0.3` - Next.js framework
- `react@19.2.0` - React library
- `react-dom@19.2.0` - React DOM

**UI Components:**
- `@radix-ui/react-label@^2.1.8` - Label component
- `@radix-ui/react-select@^2.2.6` - Select component
- `@radix-ui/react-slot@^1.2.4` - Slot component
- `lucide-react@^0.554.0` - Icon library

**Forms & Validation:**
- `react-hook-form@^7.66.0` - Form management
- `@hookform/resolvers@^5.2.2` - Form resolvers
- `zod@^4.1.12` - Schema validation

**Styling:**
- `tailwind-merge@^3.4.0` - Tailwind class merging
- `class-variance-authority@^0.7.1` - Component variants
- `clsx@^2.1.1` - Conditional classnames

**Payment Processing:**
- `stripe@^20.0.0` - Stripe SDK

**Email Service:**
- `resend@^6.4.2` - Resend email API

**Utilities:**
- `date-fns@^4.1.0` - Date manipulation
- `libphonenumber-js@^1.12.26` - Phone number formatting
- `axios@^1.13.2` - HTTP client
- `@vercel/kv@^3.0.0` - Vercel KV storage

### Development Dependencies

**TypeScript:**
- `typescript@^5` - TypeScript compiler
- `@types/node@^20` - Node.js types
- `@types/react@^19` - React types
- `@types/react-dom@^19` - React DOM types

**Linting & Code Quality:**
- `eslint@^9.39.1` - ESLint
- `eslint-config-next@^16.0.3` - Next.js ESLint config
- `husky@^9.1.7` - Git hooks
- `lint-staged@^16.2.7` - Pre-commit linting

**Styling:**
- `tailwindcss@^4` - Tailwind CSS
- `@tailwindcss/postcss@^4` - PostCSS plugin
- `tw-animate-css@^1.4.0` - Tailwind animations

**Build Tools:**
- `babel-plugin-react-compiler@1.0.0` - React Compiler

---

## 🎯 Key Features

### 1. Booking System
- Interactive calendar booking
- SMS confirmations via Mobile Message API
- Email confirmations via Resend
- Automated reminders (24h and 1h before)
- Admin dashboard for SMS monitoring

### 2. Custom Songs Service
- Multi-step order form
- Stripe payment integration
- Promo code support (LAUNCH20 - 20% discount)
- Package pricing:
  - Standard: $29 (3-5 days)
  - Express: $49 (24-48 hours)
  - Wedding: $149 (5-7 days)
  - Commercial License: +$49
- **Stripe Webhook Handler** (`/api/webhooks/stripe`):
  - Listens for `payment_intent.succeeded` events
  - Verifies webhook signatures for security
  - Extracts order metadata (orderId, customer details, package, promo code, pricing)
  - Logs payment confirmations with full order details
  - Ready for email notifications and database storage integration
  - Configured in Vercel with 1024MB memory and 30s max duration

### 3. SMS System
- Mobile Message API (primary provider)
- SMS logging and tracking
- Admin dashboard (`/admin/sms-logs`)
- Credit monitoring
- ACMA compliant (opt-in/opt-out)

### 4. Service Pages
- Website Design & Development
- Website Redesign & Refresh
- E-commerce Solutions
- CRM Integration
- AI Automation
- SEO & Performance
- Support & Maintenance

---

## 🔄 Build & Deployment Process

### Pre-Deployment Checklist

1. **Type Check:**
   ```bash
   npm run type-check
   ```

2. **Lint Check:**
   ```bash
   npm run lint
   ```
   ⚠️ Note: Currently disabled due to Next.js 16.0.3 bug

3. **Build Test:**
   ```bash
   npm run build
   ```

4. **Full Preflight:**
   ```bash
   npm run preflight
   ```

### Vercel Deployment Settings

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next` (auto-detected)  
**Install Command:** `npm install`  
**Node.js Version:** 20.x

**Environment Variables:**
- Set all required variables in Vercel Dashboard
- Production, Preview, and Development environments
- Ensure `NEXT_PUBLIC_*` variables are set for all environments

**Cron Jobs:**
- Automatically configured via `vercel.json`
- Hourly reminder notifications

---

## Pre-Deployment Checklist

### Code Changes Required

- [ ] All pricing updated ($29/$49/$149/$49)
- [ ] Order page displays discount code UI
- [ ] Stripe webhook handler created
- [ ] Audio files uploaded to `/public/songs/`
- [ ] Terms page reflects new pricing

### Environment Variables (Vercel)

**Required:**
- [x] `STRIPE_SECRET_KEY`
- [x] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` (get from Stripe dashboard)
- [x] `RESEND_API_KEY`
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Vercel Configuration

- [ ] Webhook endpoint added to Stripe dashboard: `https://rockywebstudio.com.au/api/webhooks/stripe`
- [ ] Cron jobs configured (if applicable)
- [ ] Function timeout set to 10s minimum
- [ ] Environment variables match across Preview/Production

### Testing (Production)

- [ ] Order form loads correctly
- [ ] Package selection works
- [ ] Discount code "LAUNCH20" applies 20% off
- [ ] Payment processes through Stripe
- [ ] Webhook receives `payment_intent.succeeded`
- [ ] All prices consistent across site

### Known Issues to Monitor

- Order summary may not appear on first package selection (check state)
- ESLint warning for `map()` key (non-breaking)
- Audio files require manual upload (not in git)

---

## 🗄️ Data Storage

### Current Implementation
- **Bookings:** In-memory storage (temporary)
- **SMS Logs:** In-memory storage (temporary)
- **Future:** Migrate to Vercel KV or database

### Vercel KV (Available)
- Package: `@vercel/kv@^3.0.0` installed
- Ready for migration when needed

---

## 🔒 Security & Compliance

### Privacy
- Phone numbers masked in logs
- GDPR-ready consent mechanisms
- Secure environment variable handling

### SMS Compliance (ACMA)
- Explicit opt-in required
- Opt-out instructions included
- STOP keyword support
- Privacy-compliant logging

---

## 📊 Analytics & Tracking

**File:** `lib/analytics.ts`

**Package Prices (for value tracking):**
```typescript
export const packagePrices: Record<PackageType, number> = {
  express: 49,
  standard: 29,
  wedding: 149,
};
```

**Event Tracking:**
- Custom Songs page views
- Order form interactions
- Package selections
- Order submissions
- Conversion tracking

---

## 🐛 Known Issues

1. **ESLint/Next Lint:**
   - `next lint` command has a bug in Next.js 16.0.3
   - Workaround: Use `npm run type-check` instead
   - Issue: "Invalid project directory provided" error

2. **Data Persistence:**
   - Bookings and SMS logs are in-memory only
   - Will be lost on server restart
   - Migration to persistent storage needed for production

---

## 📝 Important Notes

### Custom Songs Pricing (Updated December 2025)
- **Standard:** $29 (was $99)
- **Express:** $49 (was $149)
- **Wedding:** $149 (was $349)
- **Commercial License:** +$49 (was +$200)

### Stripe Integration
- Payment Intents created for Custom Songs orders
- Promo code support (LAUNCH20 = 20% discount)
- Metadata includes order details and promo code

### SMS Provider
- Mobile Message API (primary and active provider)
- Twilio available as alternative (requires configuration)

---

## 🚀 Quick Deploy Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Pre-deployment check
npm run preflight

# Deploy to Vercel
vercel --prod
```

---

## 📞 Support & Documentation

**Documentation Files:**
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `DEVELOPMENT.md` - Development workflow
- `SMS_DEBUGGING_GUIDE.md` - SMS troubleshooting
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch checklist

**Contact:**
- Email: martin@rockywebstudio.com.au
- Website: https://rockywebstudio.com.au

---

**Generated:** December 2025  
**Project:** Rocky Web Studio  
**Version:** 0.1.0

