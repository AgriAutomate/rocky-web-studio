# Sentry Integration Setup Guide

This guide provides instructions for setting up and using Sentry error tracking and performance monitoring in Rocky Web Studio.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Sentry Account Setup](#sentry-account-setup)
3. [Environment Variables](#environment-variables)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Alerts Configuration](#alerts-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Sentry account (free tier available at [sentry.io](https://sentry.io))
- Vercel project with environment variable access
- Next.js 16+ project

---

## Sentry Account Setup

### 1. Create Sentry Account

1. Sign up at [sentry.io](https://sentry.io/signup/)
2. Complete account verification

### 2. Create Project

1. Go to Sentry Dashboard → Projects → Create Project
2. Select **"Next.js"** as the platform
3. Enter project name: `rocky-web-studio`
4. Select organization (or create one)
5. Click **"Create Project"**

### 3. Get DSN

1. After project creation, Sentry will display your **DSN** (Data Source Name)
2. Copy the DSN (format: `https://xxx@xxx.ingest.sentry.io/xxx`)
3. You'll need this for environment variables

---

## Environment Variables

### Required Variables

Add the following to your Vercel project environment variables:

#### `SENTRY_DSN` (Server-side)
- **Description:** Sentry DSN for server-side error tracking
- **Where to get it:** Sentry Dashboard → Project Settings → Client Keys (DSN)
- **Example:** `https://abc123@o123456.ingest.sentry.io/123456`
- **⚠️ Security:** Keep this secret! Never commit to version control.

#### `NEXT_PUBLIC_SENTRY_DSN` (Client-side)
- **Description:** Sentry DSN for client-side error tracking
- **Where to get it:** Same as `SENTRY_DSN` (can use same value)
- **Example:** `https://abc123@o123456.ingest.sentry.io/123456`
- **⚠️ Note:** This is public (exposed to browser), but Sentry DSNs are safe to expose.

#### `SENTRY_ORG` (Optional, for source maps)
- **Description:** Sentry organization slug
- **Where to get it:** Sentry Dashboard → Settings → Organization Settings → Slug
- **Example:** `my-org`

#### `SENTRY_PROJECT` (Optional, for source maps)
- **Description:** Sentry project slug
- **Where to get it:** Sentry Dashboard → Project Settings → General → Slug
- **Example:** `rocky-web-studio`

### Setting Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - **Name:** `SENTRY_DSN`
   - **Value:** Your Sentry DSN
   - **Environment:** Production, Preview, Development (select all)
3. Repeat for `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
4. Click **"Save"**

---

## Configuration

### Files Created

The Sentry integration includes the following files:

- **`sentry.config.ts`** - Main Sentry configuration (legacy, kept for compatibility)
- **`sentry.client.config.ts`** - Client-side Sentry configuration
- **`sentry.server.config.ts`** - Server-side Sentry configuration
- **`instrumentation.ts`** - Next.js instrumentation hook
- **`next.config.ts`** - Wrapped with `withSentryConfig()`

### Key Configuration Options

#### Performance Monitoring

- **Traces Sample Rate:** 10% in production, 100% in development
- **Session Replay:** 10% of sessions, 100% of sessions with errors

#### Security & Privacy

- **PII Protection:** All sensitive data (passwords, tokens, emails, phone numbers) is automatically redacted
- **Session Replay:** Text masking enabled, media blocked
- **Headers:** Authorization, cookies, API keys are redacted

#### Error Filtering

The following errors are ignored (not sent to Sentry):
- Browser extension errors
- Network errors (handled gracefully)
- Stripe `InvalidRequestError` (handled in code)

---

## Testing

### Test Endpoint

A test endpoint is available at `/api/test/sentry` to verify Sentry integration:

#### Test Error Capture

```bash
curl https://rockywebstudio.com.au/api/test/sentry?type=error
```

**Expected:** Error captured in Sentry dashboard

#### Test Message

```bash
curl https://rockywebstudio.com.au/api/test/sentry?type=message
```

**Expected:** Message appears in Sentry dashboard

#### Test Exception

```bash
curl https://rockywebstudio.com.au/api/test/sentry?type=exception
```

**Expected:** Exception captured with full stack trace

### Manual Testing

1. **Deploy to staging/production** with `SENTRY_DSN` set
2. **Trigger test error:**
   ```bash
   curl https://your-domain.com/api/test/sentry?type=error
   ```
3. **Check Sentry Dashboard:**
   - Go to Sentry Dashboard → Issues
   - You should see "Test error from Sentry integration"
   - Click on the issue to see full details, stack trace, request context

### Verify Error Context

When viewing an error in Sentry, you should see:
- ✅ **Request context:** URL, method, headers (sanitized)
- ✅ **User session:** User ID (no email/phone)
- ✅ **Breadcrumbs:** Navigation and API calls leading to error
- ✅ **Stack trace:** Full stack trace with source maps (if configured)
- ✅ **Tags:** Component, requestId, errorCode

---

## Alerts Configuration

### Email Alerts

1. Go to Sentry Dashboard → Alerts → Create Alert Rule
2. **Rule Name:** "New Issues"
3. **Conditions:**
   - When an issue is first seen
   - When an issue's event count increases by more than 100% in 1 hour
4. **Actions:**
   - Send email notification
   - Enter your email address
5. Click **"Save Rule"**

### Slack Integration (Optional)

1. Go to Sentry Dashboard → Settings → Integrations → Slack
2. Click **"Add Integration"**
3. Authorize Sentry to access your Slack workspace
4. Select channel for notifications
5. Configure alert rules to send to Slack

### Alert Rules Recommendations

#### Critical Errors (Immediate Alert)

- **Rule:** Issue frequency > 10 events/minute
- **Action:** Email + Slack notification
- **Use case:** Production-breaking errors

#### New Issues (First Occurrence)

- **Rule:** Issue is first seen
- **Action:** Email notification
- **Use case:** Catch new bugs early

#### Error Spike (Sudden Increase)

- **Rule:** Event count increases by > 100% in 1 hour
- **Action:** Email notification
- **Use case:** Detect cascading failures

---

## Troubleshooting

### Errors Not Appearing in Sentry

**Symptoms:** Errors occur but don't appear in Sentry dashboard

**Solutions:**
1. **Verify DSN is set:**
   ```bash
   # Check environment variables in Vercel
   # Ensure SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN are set
   ```

2. **Check Sentry initialization:**
   - Verify `instrumentation.ts` exists in project root
   - Ensure `next.config.ts` wraps config with `withSentryConfig()`

3. **Test endpoint:**
   ```bash
   curl https://your-domain.com/api/test/sentry?type=error
   ```
   - If test endpoint works, Sentry is configured correctly
   - If test endpoint fails, check Sentry logs in Vercel

4. **Check Sentry dashboard:**
   - Go to Sentry Dashboard → Settings → Projects → Your Project → Client Keys
   - Verify DSN matches environment variable

### Source Maps Not Working

**Symptoms:** Stack traces show minified code instead of original source

**Solutions:**
1. **Verify source map upload:**
   - Check Vercel build logs for "Uploading source maps to Sentry"
   - Ensure `SENTRY_ORG` and `SENTRY_PROJECT` are set

2. **Check Sentry project settings:**
   - Go to Sentry Dashboard → Project Settings → Source Maps
   - Verify source maps are uploaded

3. **Manual upload (if needed):**
   ```bash
   npx @sentry/cli releases files <release> upload-sourcemaps .next
   ```

### Too Many Events (Rate Limiting)

**Symptoms:** Sentry dashboard shows "Rate limit exceeded"

**Solutions:**
1. **Reduce sample rate:**
   - Edit `sentry.config.ts`
   - Change `tracesSampleRate` from `0.1` to `0.05` (5%)

2. **Filter more errors:**
   - Add error patterns to `ignoreErrors` array
   - Use `beforeSend` to filter specific errors

3. **Upgrade Sentry plan:**
   - Free tier: 5,000 events/month
   - Consider upgrading if consistently hitting limits

### PII Leaking to Sentry

**Symptoms:** Sensitive data appears in Sentry events

**Solutions:**
1. **Verify `beforeSend` hook:**
   - Check `sentry.config.ts` and `sentry.server.config.ts`
   - Ensure sensitive keys are redacted

2. **Test sanitization:**
   - Trigger error with sensitive data
   - Check Sentry event → verify data is `[REDACTED]`

3. **Update redaction rules:**
   - Add new sensitive keys to `sensitiveKeys` array
   - Update `beforeSend` hook

---

## Integration Points

### Automatic Error Capture

Sentry automatically captures errors from:

1. **React Error Boundaries:**
   - `app/error.tsx` captures client-side errors
   - Errors are automatically sent to Sentry

2. **API Routes:**
   - `lib/api/handlers.ts` captures API errors
   - Only unexpected errors are sent (not `AppError` instances)

3. **Structured Logging:**
   - `lib/logging.ts` sends errors to Sentry
   - Errors logged via `logger.error()` are captured

### Manual Error Capture

You can manually capture errors:

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture exception
Sentry.captureException(error, {
  tags: { component: "my-component" },
  extra: { context: "additional info" },
});

// Capture message
Sentry.captureMessage("Something went wrong", {
  level: "warning",
  tags: { feature: "booking" },
});
```

---

## Best Practices

### 1. Use Tags for Filtering

Add tags to errors for easy filtering:

```typescript
Sentry.captureException(error, {
  tags: {
    component: "bookings",
    feature: "payment",
    environment: "production",
  },
});
```

### 2. Add Context with `extra`

Include relevant context (non-sensitive):

```typescript
Sentry.captureException(error, {
  extra: {
    bookingId: "BK123",
    userId: "user-456",
    requestId: "req-789",
  },
});
```

### 3. Set User Context

Identify users in errors (without PII):

```typescript
Sentry.setUser({
  id: "user-123",
  // Don't include email/phone (PII)
});
```

### 4. Monitor Performance

Use Sentry Performance Monitoring:

- Track slow API endpoints
- Identify performance bottlenecks
- Monitor Core Web Vitals

### 5. Review Errors Regularly

- Check Sentry dashboard weekly
- Triage new issues
- Fix high-frequency errors first

---

## Security Considerations

### ✅ What's Protected

- **Passwords:** Automatically redacted
- **API Keys:** Automatically redacted
- **Tokens:** Automatically redacted
- **Email/Phone:** Automatically redacted
- **Authorization Headers:** Automatically redacted

### ⚠️ What to Avoid

- **Don't log sensitive data:** Even if Sentry redacts it, avoid logging sensitive data
- **Don't include PII in tags:** Tags are searchable, avoid including PII
- **Don't expose DSN:** While DSNs are safe to expose, keep server-side DSN private

---

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Alert Rules](https://docs.sentry.io/product/alerts/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

