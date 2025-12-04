# Stripe Integration Setup Guide

This guide provides comprehensive instructions for setting up and using the Stripe payment integration in Rocky Web Studio, with a focus on webhook handling and idempotency.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Setup Instructions](#setup-instructions)
3. [Webhook Configuration](#webhook-configuration)
4. [Idempotency & Reliability](#idempotency--reliability)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

---

## Environment Variables

The following environment variables are required for the Stripe integration:

### Required Variables

#### `STRIPE_SECRET_KEY`
- **Description:** Your Stripe secret key (use test key for development, live key for production)
- **Where to get it:** Stripe Dashboard → Developers → API keys
- **Example (Test):** `sk_test_51ABC123...`
- **Example (Live):** `sk_live_51ABC123...`
- **⚠️ Security:** Keep this secret! Never commit it to version control.

#### `STRIPE_WEBHOOK_SECRET`
- **Description:** Webhook signing secret for verifying webhook authenticity
- **Where to get it:** Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret
- **Example:** `whsec_ABC123...`
- **⚠️ Security:** Each webhook endpoint has its own secret. Use the correct one for your environment.

---

## Setup Instructions

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification (required for live mode)
3. Navigate to Dashboard → Developers → API keys

### 2. Get API Keys

**For Development:**
- Use **Test mode** keys (prefixed with `sk_test_` and `pk_test_`)
- Test mode allows you to test payments without real charges

**For Production:**
- Use **Live mode** keys (prefixed with `sk_live_` and `pk_live_`)
- ⚠️ **Important:** Only switch to live mode after thorough testing

### 3. Configure Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Production:** `https://rockywebstudio.com.au/api/webhooks/stripe`
   - **Development:** Use Stripe CLI (see below)
4. Select events to listen for:
   - ✅ `payment_intent.succeeded` (required)
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Test Webhook Locally (Development)

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will output a webhook signing secret (whsec_...)
# Use this as STRIPE_WEBHOOK_SECRET in your .env.local
```

### 5. Set Environment Variables

Add to your `.env.local` (development) or Vercel environment variables (production):

```bash
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

---

## Webhook Configuration

### Webhook Endpoint

**Route:** `POST /api/webhooks/stripe`

**Purpose:** Handles Stripe webhook events, specifically `payment_intent.succeeded` events.

### Supported Events

| Event Type | Description | Handler |
|------------|-------------|---------|
| `payment_intent.succeeded` | Payment completed successfully | Sends order confirmation emails |

### Webhook Flow

1. **Signature Verification:** Validates webhook authenticity using `STRIPE_WEBHOOK_SECRET`
2. **Idempotency Check:** Uses `event.id` to prevent duplicate processing
3. **Event Processing:** Processes `payment_intent.succeeded` events
4. **Email Notifications:** Sends customer and internal confirmation emails
5. **Response:** Returns appropriate HTTP status codes

---

## Idempotency & Reliability

### How Idempotency Works

The webhook handler implements **idempotency** to ensure webhooks are processed exactly once, even if Stripe retries delivery.

#### Idempotency Key

- **Format:** `webhook:stripe:{eventId}`
- **Source:** Stripe `event.id` (unique per webhook delivery)
- **Storage:** Vercel KV (Redis)
- **TTL:** 7 days (Stripe retries for up to 3 days, but we keep longer for audit)

#### Race Condition Prevention

Uses **atomic SET NX** operation in Vercel KV:

```typescript
// Only the first request succeeds in setting the key
const acquired = await kv.set(
  `webhook:stripe:${eventId}`,
  { processedAt: new Date().toISOString() },
  { nx: true, ex: 7 * 24 * 60 * 60 } // NX = only if not exists, EX = expire in 7 days
);

if (acquired !== "OK") {
  // Key already exists - event already processed
  return 200; // Skip processing
}
```

**Benefits:**
- ✅ Prevents duplicate email sends
- ✅ Handles concurrent webhook deliveries safely
- ✅ No database transactions needed

### Stripe Retry Behavior

Stripe automatically retries webhooks on:
- Network failures
- HTTP 5xx status codes
- Timeouts

**Retry Schedule:**
- Initial retry: ~5 minutes
- Subsequent retries: Exponential backoff (up to 3 days)

### Response Codes

| Status Code | Meaning | Stripe Behavior |
|-------------|---------|-----------------|
| `200` | Success | ✅ Webhook accepted, no retry |
| `400` | Bad Request | ❌ Invalid signature/data, no retry |
| `503` | Service Unavailable | 🔄 Transient failure, Stripe will retry |
| `500` | Internal Server Error | 🔄 Unexpected error, Stripe will retry |

### Edge Cases Handled

#### 1. Duplicate Webhook Delivery

**Scenario:** Stripe retries webhook due to network failure, but first delivery already succeeded.

**Handling:**
- Idempotency check detects `event.id` already processed
- Returns `200` immediately
- No side effects (emails not sent again)

**Log:**
```
INFO: Webhook event already processed, skipping
{ eventId: "evt_123...", eventType: "payment_intent.succeeded" }
```

#### 2. Concurrent Webhook Deliveries

**Scenario:** Two webhook deliveries arrive simultaneously (race condition).

**Handling:**
- Atomic `SET NX` ensures only one request acquires the lock
- First request processes webhook
- Second request sees key exists, returns `200` immediately

**Log:**
```
INFO: Processing new webhook event
{ eventId: "evt_123...", eventType: "payment_intent.succeeded" }
```

#### 3. Email Send Failure

**Scenario:** Resend API fails to send confirmation email.

**Handling:**
- Throws `ExternalServiceError` (retryable)
- Returns `503` (Service Unavailable)
- Stripe retries webhook → email sent on retry

**Log:**
```
ERROR: Failed to send email notifications
{ eventId: "evt_123...", orderId: "CS-123..." }
```

#### 4. KV Storage Failure

**Scenario:** Vercel KV is temporarily unavailable.

**Handling:**
- Idempotency check fails gracefully (assumes not processed)
- Webhook proceeds, but may process duplicate if KV recovers
- Logs error for monitoring

**Log:**
```
ERROR: Failed to check webhook idempotency
{ eventId: "evt_123..." }
```

**Note:** This is rare, but if it occurs, duplicate emails may be sent. Monitor KV availability.

#### 5. Invalid Customer Metadata

**Scenario:** Payment intent missing required metadata fields.

**Handling:**
- Logs warning
- Returns `200` (permanent issue, not transient)
- Stripe won't retry
- Event marked as processed (prevents retry loops)

**Log:**
```
WARN: Missing required metadata in payment intent - returning 200 to prevent retry
{ eventId: "evt_123...", orderId: null, ... }
```

---

## API Reference

### Webhook Endpoint

**POST** `/api/webhooks/stripe`

#### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `stripe-signature` | ✅ Yes | Stripe webhook signature for verification |

#### Request Body

Raw JSON body from Stripe (automatically parsed).

#### Response Codes

| Code | Meaning | Body |
|------|---------|------|
| `200` | Success | `{ received: true }` |
| `200` | Already processed (idempotent) | `{ received: true, idempotent: true }` |
| `200` | Skipped (invalid metadata) | `{ received: true, skipped: "invalid_metadata" }` |
| `400` | Missing/invalid signature | `{ error: "Missing signature" }` or `{ error: "Invalid signature" }` |
| `500` | Configuration error | `{ error: "Webhook configuration error" }` |
| `503` | Transient failure (retryable) | `{ error: "Service temporarily unavailable", retryable: true }` |

#### Example Request (Stripe → Your Server)

```http
POST /api/webhooks/stripe HTTP/1.1
Host: rockywebstudio.com.au
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=abc123...

{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 2900,
      "currency": "aud",
      "metadata": {
        "orderId": "CS-12345-67890",
        "customerName": "John Doe",
        "customerEmail": "john@example.com",
        "package": "standard",
        "occasion": "Birthday",
        "storyDetails": "A story about..."
      }
    }
  }
}
```

#### Example Response

```json
{
  "received": true
}
```

---

## Troubleshooting

### Webhook Not Received

**Symptoms:**
- Payment succeeds, but no confirmation emails sent
- Webhook logs show no activity

**Solutions:**
1. **Check webhook endpoint URL:**
   - Stripe Dashboard → Webhooks → Your endpoint
   - Verify URL matches: `https://rockywebstudio.com.au/api/webhooks/stripe`

2. **Check webhook secret:**
   - Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe Dashboard
   - Each endpoint has its own secret

3. **Check Stripe logs:**
   - Stripe Dashboard → Developers → Webhooks → Your endpoint → Logs
   - Look for delivery attempts and error messages

4. **Test with Stripe CLI:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Duplicate Emails Sent

**Symptoms:**
- Customer receives multiple confirmation emails for same order

**Possible Causes:**
1. **KV idempotency check failed:**
   - Check Vercel KV availability
   - Review logs for "Failed to check webhook idempotency" errors

2. **Multiple webhook endpoints configured:**
   - Ensure only one endpoint is active in Stripe Dashboard

**Solutions:**
- Monitor KV availability
- Check webhook logs for idempotency check failures
- Verify only one webhook endpoint is configured

### Webhook Returns 503 (Service Unavailable)

**Symptoms:**
- Stripe retries webhook repeatedly
- Logs show email send failures

**Solutions:**
1. **Check Resend API:**
   - Verify `RESEND_API_KEY` is set
   - Check Resend dashboard for API status
   - Review email send logs

2. **Check network connectivity:**
   - Ensure Vercel function can reach `api.resend.com`

3. **Review error logs:**
   - Check Vercel function logs for specific error messages
   - Look for `ExternalServiceError` entries

### Invalid Signature Error

**Symptoms:**
- Webhook returns `400` with "Invalid signature"
- Stripe logs show signature verification failures

**Solutions:**
1. **Verify webhook secret:**
   - Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe Dashboard
   - Each endpoint has its own secret

2. **Check request body:**
   - Ensure raw body is used for signature verification (not parsed JSON)
   - Next.js `req.text()` provides raw body

3. **Test signature locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Missing Metadata Error

**Symptoms:**
- Webhook logs show "Missing required metadata"
- Payment succeeds but no emails sent

**Solutions:**
1. **Check PaymentIntent creation:**
   - Verify all required metadata fields are included when creating PaymentIntent
   - Required fields: `orderId`, `customerName`, `customerEmail`, `occasion`, `package`, `storyDetails`

2. **Review order creation code:**
   - Check `/app/api/custom-songs/order/route.ts`
   - Ensure metadata is correctly set

---

## Best Practices

### 1. Always Return 200 for Permanent Failures

If a webhook fails due to invalid customer data (missing metadata), return `200` to prevent Stripe retries:

```typescript
if (!metadata.orderId) {
  // Permanent issue - return 200
  return NextResponse.json({ received: true }, { status: 200 });
}
```

### 2. Use 503 for Transient Failures

If a webhook fails due to external service issues (email API down), return `503` to allow Stripe retries:

```typescript
try {
  await sendEmail();
} catch (error) {
  // Transient failure - return 503
  return NextResponse.json(
    { error: "Service temporarily unavailable" },
    { status: 503 }
  );
}
```

### 3. Log All Webhook Events

Log webhook events for debugging and audit:

```typescript
stripeLogger.info("Processing webhook event", {
  eventId: event.id,
  eventType: event.type,
  orderId: metadata.orderId,
});
```

### 4. Monitor Idempotency Checks

Monitor KV availability and idempotency check failures:

```typescript
if (kvError) {
  stripeLogger.error("Idempotency check failed", { eventId });
  // Proceed with caution - may process duplicate
}
```

### 5. Test Webhook Retries

Test webhook retry behavior using Stripe CLI:

```bash
# Trigger a webhook
stripe trigger payment_intent.succeeded

# Check retry behavior in Stripe Dashboard
```

---

## Security Considerations

### 1. Webhook Signature Verification

**Always verify webhook signatures** to prevent unauthorized requests:

```typescript
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 2. Environment Variables

- ✅ Never commit `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to version control
- ✅ Use different secrets for test and production
- ✅ Rotate secrets periodically

### 3. Rate Limiting

Consider adding rate limiting to webhook endpoint to prevent abuse (though Stripe already rate-limits webhook deliveries).

### 4. Idempotency Key Security

Idempotency keys are stored in Vercel KV with 7-day TTL. Ensure KV access is restricted to your application.

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Webhook Delivery Success Rate:**
   - Stripe Dashboard → Webhooks → Your endpoint → Success rate

2. **Idempotency Check Failures:**
   - Logs: `ERROR: Failed to check webhook idempotency`

3. **Email Send Failures:**
   - Logs: `ERROR: Failed to send email notifications`

4. **KV Availability:**
   - Monitor Vercel KV uptime and latency

### Recommended Alerts

- Alert if webhook success rate drops below 95%
- Alert if idempotency check failures exceed threshold
- Alert if email send failures spike

---

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

