# Rocky Web Studio – Deployment Guide

## 1. Prerequisites
1. **Environment variables** – Set the following in Vercel (see `.env.example` for names):
   - `NEXT_PUBLIC_*` values for branding/URLs
   - Mobile Message API credentials (`MOBILE_MESSAGE_API_USERNAME`, `MOBILE_MESSAGE_API_PASSWORD`, `MOBILE_MESSAGE_API_URL`, `MOBILE_MESSAGE_SENDER_ID`)
   - `RESEND_API_KEY` if email delivery is re-enabled later
2. **DNS records** – Add the Resend + Sender identities and any custom domain records before cut-over.
3. **SMS provider** – Verify Mobile Message API credentials are active and sender ID is registered in the Mobile Message dashboard.

## 2. Build & Test Checklist
1. `npm install`
2. `npm run lint`
3. `npm run build`
4. Manual QA (localhost):
   - Homepage renders without console errors
   - `/book` flow completes (mock data) and shows confirmation
   - `/admin/sms` dashboard loads and filters (in-memory data).

## 3. Deploying to Vercel
```bash
npm run build              # ensure local build passes
vercel                     # or use dashboard for preview
vercel --prod              # promote to production
```

## 4. Post-Deploy Smoke Test
1. Visit the production URL root and `/book`.
2. Submit a test booking (using your own phone/email) – expect SMS attempts to log even if provider rejects.
3. Check Vercel logs: Dashboard → Deployments → “View Functions Logs”.
4. Visit `/admin/sms` to confirm records appear (in-memory while server lives).

## 5. Known Follow-ups
- **Persistent storage** – Booking + SMS history currently live only in memory/logs. Replace mock ID generator with KV/DB before accepting real customers.
- **Resend DNS** – Email notifications remain disabled until DNS verification is finished.
- **Legacy `/api/bookings/sms` route** – removed since new provider abstraction handles SMS; keep the system consistent going forward.

Document any new requirements here so the next deploy has a single source of truth.

