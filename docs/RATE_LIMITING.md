# API Rate Limiting Guide

This guide explains the global rate limiting implementation for Rocky Web Studio API endpoints.

## Overview

Rate limiting is implemented using Vercel KV (Redis) to prevent abuse and protect against:
- Booking spam
- SMS bombing
- API abuse
- Brute force attacks

## Implementation

### Core Utility

**File:** `lib/rate-limit.ts`

The `rateLimit()` function provides a reusable rate limiting mechanism:

```typescript
const result = await rateLimit(identifier, limit, windowSeconds, keyPrefix);
```

**Parameters:**
- `identifier`: Unique identifier (IP address, user ID, phone number)
- `limit`: Maximum requests allowed in the window
- `windowSeconds`: Time window in seconds
- `keyPrefix`: Optional prefix for KV key

**Returns:**
```typescript
{
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
  retryAfter?: number; // Seconds until reset
}
```

### Middleware

**File:** `lib/api/rate-limit-middleware.ts`

The `checkRateLimit()` function provides a convenient middleware for API routes:

```typescript
const response = await checkRateLimit(request, config);
if (response) {
  return response; // 429 response
}
// Continue with request
```

## Rate Limit Configuration

### Endpoint Limits

| Endpoint | Limit | Window | Identifier | Key Prefix |
|----------|-------|--------|------------|------------|
| `/api/bookings/create` | 10 | 1 minute | IP address | `rate-limit:bookings` |
| `/api/notifications/send-sms` | 100 | 24 hours | Phone number | `rate-limit:sms` |
| `/api/mobile-message/credits` | 60 | 1 hour | IP address | `rate-limit:credits` |
| `/api/auth/signin` | 5 | 15 minutes | IP address | `rate-limit:auth` |

### Configuration Constants

Defined in `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  BOOKING_CREATE: {
    limit: 10,
    windowSeconds: 60,
    keyPrefix: "rate-limit:bookings",
  },
  SMS_SEND: {
    limit: 100,
    windowSeconds: 24 * 60 * 60,
    keyPrefix: "rate-limit:sms",
  },
  CREDITS_CHECK: {
    limit: 60,
    windowSeconds: 60 * 60,
    keyPrefix: "rate-limit:credits",
  },
  AUTH_SIGNIN: {
    limit: 5,
    windowSeconds: 15 * 60,
    keyPrefix: "rate-limit:auth",
  },
};
```

## Response Format

### Rate Limit Exceeded (429)

When rate limit is exceeded, the API returns:

**Status Code:** `429 Too Many Requests`

**Headers:**
- `Retry-After`: Seconds until limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests (0 when exceeded)
- `X-RateLimit-Reset`: Unix timestamp when limit resets

**Body:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "message": "Too many requests. Please try again in 60 seconds."
}
```

## Usage Examples

### Basic Usage

```typescript
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, {
    limit: RATE_LIMITS.BOOKING_CREATE.limit,
    windowSeconds: RATE_LIMITS.BOOKING_CREATE.windowSeconds,
    keyPrefix: RATE_LIMITS.BOOKING_CREATE.keyPrefix,
  });

  if (rateLimitResponse) {
    return rateLimitResponse; // 429 response
  }

  // Continue with request processing
  // ...
}
```

### Custom Identifier

For SMS endpoint, we use phone number as identifier:

```typescript
const rateLimitResponse = await checkRateLimit(request, {
  limit: RATE_LIMITS.SMS_SEND.limit,
  windowSeconds: RATE_LIMITS.SMS_SEND.windowSeconds,
  keyPrefix: RATE_LIMITS.SMS_SEND.keyPrefix,
  identifierExtractor: () => phoneNumber || getClientIp(request),
});
```

## Testing

### Test Endpoint

A test endpoint is available at `/api/test/rate-limit`:

```bash
# Test booking rate limit (10 per minute)
curl https://rockywebstudio.com.au/api/test/rate-limit?endpoint=bookings

# Test SMS rate limit (100 per day)
curl https://rockywebstudio.com.au/api/test/rate-limit?endpoint=sms

# Test credits rate limit (60 per hour)
curl https://rockywebstudio.com.au/api/test/rate-limit?endpoint=credits

# Test auth rate limit (5 per 15 minutes)
curl https://rockywebstudio.com.au/api/test/rate-limit?endpoint=auth
```

### Testing Rate Limit Exceeded

1. **Make requests rapidly:**
   ```bash
   # Make 11 requests quickly (limit is 10)
   for i in {1..11}; do
     curl https://rockywebstudio.com.au/api/test/rate-limit?endpoint=bookings
   done
   ```

2. **Verify 429 response:**
   - 11th request should return `429 Too Many Requests`
   - Response includes `Retry-After` header
   - Response includes rate limit headers

3. **Wait for window to expire:**
   - Wait 1 minute (for bookings endpoint)
   - Make another request
   - Should succeed again

### Testing Different IPs

Rate limits are per identifier (IP address by default):

- **IP A:** Can make 10 requests/minute
- **IP B:** Can make 10 requests/minute (separate limit)
- Limits are independent per IP

## Implementation Details

### Vercel KV Storage

Rate limit counters are stored in Vercel KV with keys:

```
rate-limit:bookings:{ip}
rate-limit:sms:{phone}
rate-limit:credits:{ip}
rate-limit:auth:{ip}
```

**TTL:** Automatically expires after window duration

**Operation:** Uses `INCR` to atomically increment counter

### Fail-Open Behavior

If Vercel KV is unavailable:
- Rate limit check fails gracefully
- Request is allowed (fail-open)
- Error is logged for monitoring
- Prevents KV outages from blocking legitimate requests

### Logging

Rate limit events are logged:

- **Limit exceeded:** `WARN` level with identifier, limit, count
- **KV failure:** `ERROR` level with error details
- **Component:** `rateLimit` or `rateLimit.middleware`

## Adjusting Rate Limits

### Change Limits

Edit `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  BOOKING_CREATE: {
    limit: 20, // Changed from 10 to 20
    windowSeconds: 60,
    keyPrefix: "rate-limit:bookings",
  },
  // ...
};
```

### Add New Endpoint

1. **Add configuration:**
   ```typescript
   NEW_ENDPOINT: {
     limit: 50,
     windowSeconds: 300, // 5 minutes
     keyPrefix: "rate-limit:new-endpoint",
   },
   ```

2. **Apply to route:**
   ```typescript
   const rateLimitResponse = await checkRateLimit(request, {
     limit: RATE_LIMITS.NEW_ENDPOINT.limit,
     windowSeconds: RATE_LIMITS.NEW_ENDPOINT.windowSeconds,
     keyPrefix: RATE_LIMITS.NEW_ENDPOINT.keyPrefix,
   });
   ```

## Best Practices

### 1. Choose Appropriate Limits

- **Too strict:** Blocks legitimate users
- **Too loose:** Doesn't prevent abuse
- **Consider:** Normal usage patterns, abuse scenarios

### 2. Use Meaningful Identifiers

- **IP address:** For general API protection
- **User ID:** For authenticated endpoints
- **Phone number:** For SMS endpoints (prevents SMS bombing)
- **Email:** For email-related endpoints

### 3. Set Reasonable Windows

- **Short windows (seconds/minutes):** For high-frequency endpoints
- **Long windows (hours/days):** For expensive operations (SMS, emails)

### 4. Monitor Rate Limit Hits

- Review logs for rate limit warnings
- Identify patterns (legitimate vs abuse)
- Adjust limits based on usage

### 5. Provide Clear Error Messages

- Include `Retry-After` header
- Explain why request was blocked
- Provide guidance on when to retry

## Troubleshooting

### Rate Limit Not Working

**Symptoms:** Requests not being rate limited

**Solutions:**
1. **Check KV connection:** Verify Vercel KV is configured
2. **Check identifier:** Ensure identifier is extracted correctly
3. **Check configuration:** Verify limit and window are set correctly
4. **Check logs:** Look for rate limit errors

### Too Many False Positives

**Symptoms:** Legitimate users hitting rate limits

**Solutions:**
1. **Increase limit:** Adjust `limit` in configuration
2. **Increase window:** Adjust `windowSeconds` in configuration
3. **Use different identifier:** Consider user ID instead of IP
4. **Review usage patterns:** Analyze logs to understand normal usage

### KV Errors

**Symptoms:** Rate limit checks failing

**Solutions:**
1. **Check Vercel KV status:** Verify KV is operational
2. **Check credentials:** Verify KV credentials are set
3. **Review fail-open behavior:** Requests are allowed when KV fails
4. **Monitor logs:** Check for KV connection errors

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

