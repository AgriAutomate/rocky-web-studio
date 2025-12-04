# Rocky Web Studio - Booking Platform

[![CI](https://github.com/your-org/rocky-web-studio/workflows/CI/badge.svg)](https://github.com/your-org/rocky-web-studio/actions/workflows/ci.yml)
[![Deploy](https://github.com/your-org/rocky-web-studio/workflows/Deploy%20to%20Production/badge.svg)](https://github.com/your-org/rocky-web-studio/actions/workflows/deploy.yml)

A Next.js booking platform with SMS notifications, email confirmations, and admin dashboard.

## Features

- 📅 Interactive booking calendar
- 📱 SMS confirmation notifications (Mobile Message API)
- ✉️ Email confirmations (Resend API)
- 🔔 Automated SMS reminders (24h and 2h before)
- 📊 Admin dashboard for SMS monitoring
- 🔒 Privacy-compliant (masked phone numbers, opt-in/opt-out)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Mobile Message API account (for SMS)
- Resend API account (for email, optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/rocky-web-studio.git
cd rocky-web-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local` (see Configuration below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

#### Mobile Message SMS API (Required)

Get credentials from [Mobile Message Dashboard](https://app.mobilemessage.com.au):

```bash
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_SENDER_ID=your_sender_id
```

**Important:**
- Sender ID must be registered and active in Mobile Message dashboard
- Ensure minimum 50 credits available for production
- Verify credentials work using `/api/test/mobile-message-auth` endpoint

#### Resend Email API (Optional)

Get API key from [Resend](https://resend.com):

```bash
RESEND_API_KEY=your_resend_api_key
```

#### Public URL

```bash
NEXT_PUBLIC_URL=https://rockywebstudio.com.au
```

### Production Deployment

1. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.example`
   - Verify `MOBILE_MESSAGE_API_URL` has no trailing slash

2. **Verify Sender ID:**
   - Login to Mobile Message dashboard
   - Confirm sender ID is active
   - Check credit balance (minimum 50 recommended)

3. **Test SMS Delivery:**
   - Submit test booking with real phone number
   - Verify SMS received within 30 seconds
   - Check Vercel logs for any errors

## SMS System

### Features

- **Confirmation SMS:** Sent immediately after booking
- **24h Reminder:** Sent 24 hours before appointment
- **2h Reminder:** Sent 2 hours before appointment
- **Opt-in/Opt-out:** Users must explicitly opt-in, can reply STOP to opt-out
- **Privacy:** Phone numbers masked in logs and UI

### Message Templates

Messages are optimized to stay under 160 characters (single SMS):
- Service-specific personalization
- Calendar link support (via email)
- Location/meeting link support
- Opt-out instructions included

### Admin Dashboard

Access SMS logs and statistics at `/admin/sms-logs`:
- View all SMS attempts
- Filter by status, date, booking ID
- Retry failed SMS
- Monitor success rates and credits

### Troubleshooting

See `SMS_DEBUGGING_GUIDE.md` for comprehensive troubleshooting:
- Common error codes (401, 404, 429)
- Authentication issues
- URL construction problems
- Carrier compatibility

## Project Structure

```
app/
  api/
    bookings/          # Booking creation and availability
    notifications/      # SMS notifications and reminders
    admin/              # Admin endpoints
  admin/
    sms-logs/          # SMS monitoring dashboard
  book/                # Booking form page
lib/
  sms/                 # SMS utilities and templates
  bookings/            # Booking storage
  phone.ts             # Phone number formatting
```

## Documentation

- `SMS_DEBUGGING_GUIDE.md` - Troubleshooting SMS issues
- `SMS_MESSAGE_OPTIMIZATION.md` - Message template optimization
- `ADMIN_SMS_LOGS_DASHBOARD.md` - Admin dashboard guide
- `PRODUCTION_READINESS_CHECKLIST.md` - Pre-launch checklist
- `DEPLOYMENT.md` - Deployment guide

## Compliance

- ✅ **ACMA Compliant:** Explicit opt-in, opt-out instructions
- ✅ **Privacy:** Phone numbers masked in logs
- ✅ **GDPR Ready:** User consent required

## Support

For issues or questions:
1. Check `SMS_DEBUGGING_GUIDE.md` for common issues
2. Review Vercel function logs
3. Test authentication endpoint: `/api/test/mobile-message-auth`

## Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
vercel --prod
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Mobile Message API Docs](https://mobilemessage.com.au/api-docs)
- [Resend API Docs](https://resend.com/docs)
