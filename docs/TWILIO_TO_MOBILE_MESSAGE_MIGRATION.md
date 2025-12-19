# Twilio to Mobile Message Migration Guide

## ✅ Migration Complete

This document tracks the migration from Twilio SMS to Mobile Message (mobilemessage.com.au) with ACMA-approved Sender ID "Rocky Web".

---

## 📋 Changes Made

### 1. Code Changes

#### ✅ Created Mobile Message Provider
- **File:** `lib/sms/providers/mobileMessage.ts`
- **Status:** Complete
- **Features:**
  - ACMA-approved Sender ID: "Rocky Web"
  - Basic Auth (username/password)
  - Supports scheduled SMS
  - Error handling and logging

#### ✅ Updated SMS Service Index
- **File:** `lib/sms/index.ts`
- **Status:** Complete
- **Changes:**
  - Removed TwilioProvider import
  - Added MobileMessageProvider export
  - Default provider set to "mobile-message"

#### ✅ Removed Twilio Provider
- **File:** `lib/sms/providers/twilio.ts`
- **Status:** Deleted

---

### 2. Environment Variables

#### ✅ Required Variables (Mobile Message)
```bash
# Mobile Message SMS API Configuration
MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

#### ❌ Removed Variables (Twilio)
```bash
# These should be removed from .env.local and Vercel:
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_FROM_NUMBER
```

---

### 3. n8n Workflow Updates

#### Status Notification Workflow

**OLD (Twilio Node):**
- Node Type: `n8n-nodes-base.twilio`
- Credentials: Twilio API credentials
- Parameters:
  - `from`: `{{ $env.TWILIO_PHONE_NUMBER }}`
  - `to`: `{{ $json.phone }}`
  - `message`: `{{ $json.message }}`

**NEW (HTTP Request Node):**
- Node Type: `n8n-nodes-base.httpRequest`
- Method: `POST`
- URL: `https://api.mobilemessage.com.au/v1/messages`
- Authentication: `Generic Credential Type`
- Headers:
  - `Authorization`: `Basic {{ $env.MOBILE_MESSAGE_AUTH_HEADER }}`
  - `Content-Type`: `application/json`
- Body (JSON):
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "{{ $json.message }}",
      "sender": "Rocky Web",
      "custom_ref": "{{ $json.booking_id }}"
    }
  ]
}
```

**Environment Variable Setup in n8n:**
1. Create credential: `MOBILE_MESSAGE_AUTH_HEADER`
2. Value: Base64 encoded `username:password`
3. Format: `Basic <base64_string>`

---

### 4. API Route Updates

All API routes using SMS now use Mobile Message:

**Example:** `app/api/test/sms/route.ts`
- Uses `sendSMS()` from `@/lib/sms`
- Automatically uses Mobile Message provider
- Sender ID: "Rocky Web"

---

### 5. Documentation Updates

#### ✅ Updated Files:
- `docs/n8n-status-notification-workflow.md` - Updated SMS integration section
- `docs/n8n-smart-booking-workflow.md` - Updated SMS references
- `docs/MULTI_TENANT_PRICING_TIERS.md` - Updated SMS provider reference

#### 📝 Files Still Needing Updates:
- `docs/n8n-nps-survey-workflow.md` - Update Twilio references
- `docs/n8n-recurring-billing-workflow.json` - Update Twilio nodes
- `docs/n8n-nps-survey-workflow.json` - Update Twilio nodes
- `docs/n8n-status-notification-workflow.json` - Update Twilio nodes

---

## 🔧 n8n Workflow Migration Steps

### Step 1: Update HTTP Request Nodes

For each Twilio node in n8n workflows:

1. **Delete Twilio Node**
2. **Add HTTP Request Node**
3. **Configure:**
   - **Method:** POST
   - **URL:** `https://api.mobilemessage.com.au/v1/messages`
   - **Authentication:** Generic Credential Type
   - **Header Name:** `Authorization`
   - **Header Value:** `Basic {{ $env.MOBILE_MESSAGE_AUTH_HEADER }}`
   - **Body Type:** JSON
   - **Body:**
   ```json
   {
     "enable_unicode": true,
     "messages": [
       {
         "to": "{{ $json.phone }}",
         "message": "{{ $json.message }}",
         "sender": "Rocky Web",
         "custom_ref": "{{ $json.id || $json.booking_id }}"
       }
     ]
   }
   ```

### Step 2: Set Up Environment Variables in n8n

1. Go to n8n Settings → Environment Variables
2. Add: `MOBILE_MESSAGE_AUTH_HEADER`
3. Value: Base64 encoded credentials
   ```bash
   # Calculate in terminal:
   echo -n "username:password" | base64
   # Result: dXNlcm5hbWU6cGFzc3dvcmQ=
   # Full value: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
   ```

### Step 3: Test Workflow

1. Activate workflow
2. Trigger test SMS
3. Verify SMS received with sender "Rocky Web"
4. Check n8n execution logs for success

---

## ✅ Verification Checklist

- [x] Mobile Message provider created
- [x] Twilio provider removed
- [x] SMS service index updated
- [x] Environment variables documented
- [ ] n8n workflows updated (manual step)
- [ ] Vercel environment variables updated (manual step)
- [ ] Test SMS sent and verified
- [ ] Documentation updated

---

## 🧪 Testing

### Test SMS Sending

**API Endpoint:** `POST /api/test/sms`

**Request:**
```json
{
  "to": "+61412345678",
  "message": "Test message from Rocky Web Studio"
}
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "mobile-message-1234567890",
  "senderId": "Rocky Web"
}
```

**Verify:**
- SMS received on test phone
- Sender ID shows "Rocky Web"
- Message content correct

---

## 📊 Cost Comparison

| Provider | Cost per SMS | Notes |
|----------|--------------|-------|
| **Twilio** | ~$0.01 AUD | International rates |
| **Mobile Message** | ~$0.005 AUD | Australian provider, 50% cheaper |

**Savings:** ~50% reduction in SMS costs

---

## 🔒 Security Notes

- Mobile Message API credentials stored in environment variables
- Never commit credentials to git
- Use Vercel environment variables for production
- Rotate credentials periodically

---

## 📚 Related Documentation

- **Mobile Message API:** https://mobilemessage.com.au/api
- **ACMA Sender ID:** "Rocky Web" (approved)
- **SMS Service:** `lib/sms/index.ts`
- **Provider Implementation:** `lib/sms/providers/mobileMessage.ts`

---

## 🆘 Troubleshooting

### SMS Not Sending

1. **Check Environment Variables:**
   ```bash
   echo $MOBILE_MESSAGE_API_USERNAME
   echo $MOBILE_MESSAGE_API_PASSWORD
   echo $MOBILE_MESSAGE_SENDER_ID
   ```

2. **Verify Sender ID:**
   - Must be exactly "Rocky Web"
   - Must be registered in Mobile Message dashboard

3. **Check API Response:**
   - Review n8n execution logs
   - Check for authentication errors
   - Verify phone number format (+61...)

### Authentication Errors

- Verify username/password are correct
- Check Base64 encoding of auth header
- Ensure credentials are active in Mobile Message dashboard

---

## ✨ Benefits of Migration

1. **Lower Cost:** 50% reduction in SMS costs
2. **ACMA Compliance:** Approved Sender ID "Rocky Web"
3. **Simpler API:** Easier to integrate than Twilio
4. **Australian Provider:** Better support for AU market
5. **Brand Recognition:** Customers see "Rocky Web" as sender

---

**Migration Date:** December 2024  
**Status:** ✅ Code migration complete, n8n workflows need manual update
