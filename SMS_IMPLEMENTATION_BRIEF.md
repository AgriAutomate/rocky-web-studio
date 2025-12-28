# SMS Notifications Implementation Brief

**Date:** January 27, 2025  
**Status:** ⚠️ Needs Review & Fixing

---

## 🔍 Current Architecture Overview

### **Two Different Implementations** ⚠️

You have **two separate SMS implementations** in your codebase, which may be causing confusion:

1. **Old Implementation** (`lib/sms.ts`)
   - Direct Mobile Message API integration
   - Uses Basic Auth (username/password)
   - Currently used by: `/api/notifications/send-sms`

2. **New Implementation** (`lib/sms/index.ts` + `lib/sms/providers/mobileMessage.ts`)
   - Provider pattern (allows switching providers)
   - Supports both API Key (Bearer) and Basic Auth
   - Not currently used by main endpoints

---

## 📁 File Structure

```
lib/
├── sms.ts                          # OLD implementation (currently active)
├── sms/
│   ├── index.ts                    # NEW provider pattern (exports sendSMS)
│   ├── providers/
│   │   └── mobileMessage.ts        # NEW Mobile Message provider
│   └── types.ts                    # Type definitions
└── mobile-message/
    ├── client.ts                   # Wrapper for Mobile Message API
    └── send-payment-sms.ts         # Payment-specific SMS (uses client.ts)

app/api/
├── notifications/send-sms/route.ts # Uses OLD lib/sms.ts
├── test/sms/route.ts               # Test endpoint (uses OLD lib/sms.ts)
└── webhooks/stripe/route.ts        # Uses send-payment-sms.ts
```

---

## 🔧 Current Implementation Details

### **1. Old Implementation** (`lib/sms.ts`) - **CURRENTLY ACTIVE**

**Location:** `lib/sms.ts`

**Used By:**
- `app/api/notifications/send-sms/route.ts`
- `app/api/test/sms/route.ts`
- `app/book/page.tsx` (booking confirmation SMS)

**Authentication:**
- Basic Auth (username:password → Base64)
- Environment variables:
  ```bash
  MOBILE_MESSAGE_API_USERNAME=your_username
  MOBILE_MESSAGE_API_PASSWORD=your_password
  MOBILE_MESSAGE_SENDER_ID=Rocky Web
  MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1  # Optional
  ```

**Key Functions:**
```typescript
sendSMS(to: string, message: string, customRef?: string): Promise<MobileMessageResponse>
sendBulkSMS(messages: SMSMessage[]): Promise<MobileMessageResponse>
```

**API Endpoint:**
- `POST https://api.mobilemessage.com.au/v1/messages`
- Headers: `Authorization: Basic <base64(username:password)>`
- Content-Type: `application/json`

**Payload Format:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "+61412345678",
      "message": "Your message text",
      "sender": "Rocky Web",
      "custom_ref": "optional-reference"
    }
  ]
}
```

---

### **2. New Implementation** (`lib/sms/index.ts`) - **NOT CURRENTLY USED**

**Location:** `lib/sms/index.ts` + `lib/sms/providers/mobileMessage.ts`

**Authentication:**
- Supports both:
  - API Key: `Authorization: Bearer <api_key>`
  - Basic Auth: `Authorization: Basic <base64(username:password)>`
- Environment variables:
  ```bash
  MOBILE_MESSAGE_API_KEY=your_api_key        # Optional (preferred)
  MOBILE_MESSAGE_API_USERNAME=your_username  # Fallback
  MOBILE_MESSAGE_API_PASSWORD=your_password  # Fallback
  MOBILE_MESSAGE_SENDER_ID=Rocky Web
  MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1  # Optional
  ```

**Key Functions:**
```typescript
getSMSProvider(): SMSProvider
sendSMS(params: SendSMSParams): Promise<SMSResponse>
scheduleSMS(params: ScheduleSMSParams): Promise<SMSResponse>
```

**Interface:**
```typescript
interface SendSMSParams {
  to: string;
  body: string;
  from?: string;  // Optional, defaults to SENDER_ID
}
```

---

### **3. Payment SMS** (`lib/mobile-message/send-payment-sms.ts`)

**Location:** `lib/mobile-message/send-payment-sms.ts`

**Used By:**
- `app/api/webhooks/stripe/route.ts` (payment success notifications)

**Implementation:**
- Uses `lib/mobile-message/client.ts`
- Sender ID: Hardcoded "Rocky Web"
- Custom reference: Payment ID

---

## 🔍 Common Issues & Troubleshooting

### **Issue 1: Missing Environment Variables**

**Symptoms:**
- `Missing Mobile Message API credentials: MOBILE_MESSAGE_API_USERNAME, MOBILE_MESSAGE_API_PASSWORD`
- SMS fails with 401 Unauthorized

**Fix:**
1. Check Vercel environment variables:
   ```
   MOBILE_MESSAGE_API_USERNAME
   MOBILE_MESSAGE_API_PASSWORD
   MOBILE_MESSAGE_SENDER_ID=Rocky Web
   ```
2. Verify they're set for correct environment (Production/Preview)

---

### **Issue 2: Authentication Failures (401)**

**Symptoms:**
- `Authentication failed. Please verify MOBILE_MESSAGE_API_USERNAME and MOBILE_MESSAGE_API_PASSWORD are correct.`
- HTTP 401 from Mobile Message API

**Possible Causes:**
1. **Wrong credentials** - Username/password incorrect
2. **Encoding issues** - Special characters in password
3. **Base64 encoding** - Auth header malformed
4. **API account disabled** - Mobile Message account issues

**Debug Steps:**
1. Check logs for: `[SMS] Auth header (first 10 chars): Basic Rmtx`
2. Verify credentials in Mobile Message dashboard
3. Test credentials directly with Mobile Message API

---

### **Issue 3: Sender ID Not Registered**

**Symptoms:**
- SMS fails with error about sender ID
- `MOBILE_MESSAGE_SENDER_ID environment variable is required`

**Fix:**
1. Ensure `MOBILE_MESSAGE_SENDER_ID=Rocky Web` is set
2. Verify "Rocky Web" is registered in Mobile Message account
3. Check ACMA approval status

---

### **Issue 4: Rate Limiting (429)**

**Symptoms:**
- `Rate limit exceeded. Mobile Message API allows max 5 concurrent requests.`

**Fix:**
- Mobile Message limits: 5 concurrent requests
- Implement request queuing or delays
- Check rate limiting in your code (`lib/rate-limit.ts`)

---

### **Issue 5: URL Construction Issues**

**Symptoms:**
- `HTTP error! status: 404`
- SMS fails with invalid URL

**Expected URL:**
- `https://api.mobilemessage.com.au/v1/messages` (no trailing slash)

**Fix:**
- Ensure `MOBILE_MESSAGE_API_URL` doesn't have trailing slash
- Default is: `https://api.mobilemessage.com.au/v1`

---

## 🧪 Testing

### **Test Endpoint**

**Location:** `app/api/test/sms/route.ts`

**Usage:**
```bash
curl -X POST http://localhost:3000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+61412345678",
    "message": "Test SMS from Rocky Web Studio"
  }'
```

**⚠️ WARNING:** This sends real SMS messages!

---

### **Payment SMS Test**

**Location:** `app/api/test/payment-sms/route.ts`

**Usage:**
```bash
curl -X POST http://localhost:3000/api/test/payment-sms \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "+61412345678",
    "customer_name": "Test User",
    "amount": 9900,
    "currency": "AUD",
    "order_id": "TEST-123",
    "payment_id": "pi_test123"
  }'
```

**⚠️ Only works in development/test environments**

---

## ✅ Required Environment Variables

### **Minimum Required:**

```bash
# Mobile Message SMS API (ACMA-Approved)
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

### **Optional:**

```bash
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1  # Default if not set
```

---

## 🎯 Recommended Next Steps

### **1. Consolidate Implementations** ⚠️ HIGH PRIORITY

**Problem:** Two implementations causing confusion

**Solution:**
- Choose one implementation (recommend new provider pattern)
- Update all endpoints to use `lib/sms/index.ts`
- Remove or deprecate `lib/sms.ts`

**Migration Steps:**
1. Update `/api/notifications/send-sms` to use new provider
2. Update `app/book/page.tsx` to use new provider
3. Test all SMS functionality
4. Remove old `lib/sms.ts` file

---

### **2. Verify Environment Variables**

**Action Items:**
1. Check Vercel project settings
2. Verify all 3 required variables are set:
   - `MOBILE_MESSAGE_API_USERNAME`
   - `MOBILE_MESSAGE_API_PASSWORD`
   - `MOBILE_MESSAGE_SENDER_ID`
3. Test credentials in Mobile Message dashboard

---

### **3. Test SMS Sending**

**Action Items:**
1. Use test endpoint: `/api/test/sms`
2. Send test SMS to your phone
3. Verify SMS received with sender "Rocky Web"
4. Check logs for errors

---

### **4. Check Mobile Message Account**

**Action Items:**
1. Log into Mobile Message dashboard
2. Verify account status (active/credits)
3. Verify "Rocky Web" sender ID is registered
4. Check API credentials are correct
5. Review account usage/limits

---

### **5. Review Error Logs**

**Where to Check:**
1. Vercel Function Logs
2. Search for: `[SMS]`, `sms`, `Mobile Message`
3. Look for 401, 429, or 500 errors
4. Check authentication header logs

---

## 📝 Key Code Locations

| File | Purpose | Status |
|------|---------|--------|
| `lib/sms.ts` | Old SMS implementation | ⚠️ Currently active |
| `lib/sms/index.ts` | New provider pattern | ✅ Better architecture |
| `lib/sms/providers/mobileMessage.ts` | Mobile Message provider | ✅ Modern implementation |
| `app/api/notifications/send-sms/route.ts` | Main SMS endpoint | Uses old implementation |
| `lib/mobile-message/send-payment-sms.ts` | Payment SMS | ✅ Working |
| `app/api/test/sms/route.ts` | Test endpoint | Uses old implementation |

---

## 🔗 Mobile Message API Documentation

- **Base URL:** `https://api.mobilemessage.com.au/v1`
- **Endpoint:** `POST /messages`
- **Auth:** Basic Auth (username:password) or Bearer (API key)
- **Sender ID:** "Rocky Web" (ACMA-approved)

**API Reference:** https://mobilemessage.com.au/api

---

## 💡 Quick Diagnosis Checklist

- [ ] Environment variables set in Vercel?
- [ ] Credentials correct in Mobile Message dashboard?
- [ ] Sender ID "Rocky Web" registered?
- [ ] Account has credits?
- [ ] Test endpoint working?
- [ ] Check Vercel logs for errors?
- [ ] Authentication header format correct?
- [ ] API URL correct (no trailing slash)?

---

**Next Action:** Review environment variables and test SMS sending via `/api/test/sms` endpoint.

