# SMS Delivery Debugging Guide

## 🔍 Systematic Debugging Process

### Step 1: Check Vercel Production Logs

**Logs URL:**
```
https://vercel.com/martinc343-3347s-projects/rocky-web-studio/logs
```

**Alternative Access:**
1. Go to: https://vercel.com/martinc343-3347s-projects/rocky-web-studio
2. Click "Deployments" → Latest deployment
3. Click "Functions" tab
4. Or: Click "View Function Logs"

---

## Step 2: Search for Key Log Entries

### Critical Log Patterns to Find

#### 1. URL Construction Logs

**Search for:** `[SMS] API URL:`

**Expected Output:**
```
[SMS] Base URL: https://api.mobilemessage.com.au/v1
[SMS] API URL: https://api.mobilemessage.com.au/v1/messages
[SMS] Final API URL (before fetch): https://api.mobilemessage.com.au/v1/messages
[SMS] URL verification - Expected: https://api.mobilemessage.com.au/v1/messages
[SMS] URL verification - Actual: https://api.mobilemessage.com.au/v1/messages
[SMS] URL match: ✅ CORRECT
```

**What to Check:**
- ✅ URL should be exactly: `https://api.mobilemessage.com.au/v1/messages`
- ✅ URL match should show: `✅ CORRECT`
- ❌ If shows `❌ MISMATCH` → URL construction issue

---

#### 2. Credential Verification Logs

**Search for:** `[SMS] Username exists:`

**Expected Output:**
```
[SMS] Username exists: true
[SMS] Password exists: true
```

**What to Check:**
- ✅ Both should be `true`
- ❌ If `false` → Environment variable not set in Vercel

---

#### 3. Authentication Header Logs

**Search for:** `[SMS] Auth header`

**Expected Output:**
```
[SMS] Auth header (first 10 chars): Basic Rmtx
```

**What to Check:**
- ✅ Should start with `Basic ` (with space)
- ✅ Should be Base64 encoded string
- ❌ If missing or malformed → Authentication will fail

---

#### 4. Payload Structure Logs

**Search for:** `[SMS] Payload structure verification:`

**Expected Output:**
```
[SMS] Payload structure verification:
[SMS]   enable_unicode: true (type: boolean)
[SMS]   messages array length: 1
[SMS]   Message 1:
[SMS]     to: "+61412345678" (type: string)
[SMS]     message: "Hi John! Your Rocky Web Studio booking..." (length: 187)
[SMS]     sender: "61485900170" (type: string)
[SMS]     custom_ref: "BK1737561234567" (type: string)
```

**What to Check:**
- ✅ `to` should be E.164 format: `+614...`
- ✅ `sender` should match: `61485900170`
- ✅ `enable_unicode` should be `true`
- ✅ `custom_ref` should be booking ID

---

#### 5. API Response Logs

**Search for:** `[SMS] ✓ Sent successfully` or `[SMS] ✗ Failed to send`

**Success Output:**
```
[SMS] ✓ Sent successfully {
  bookingId: 'BK1737561234567',
  messageId: 'msg_abc123xyz',
  phone: '+614***678'
}
```

**Error Output:**
```
[SMS] ✗ Failed to send {
  bookingId: 'BK1737561234567',
  status: 401,
  error: 'Authentication failed...',
  phone: '+614***678'
}
```

**What to Check:**
- ✅ Success: Should have `messageId`
- ❌ Error: Note `status` code and `error` message

---

## Step 3: Common Issues and Fixes

### Issue 1: 401 Unauthorized

**Symptoms:**
- HTTP status: `401`
- Error message: `"Unauthorized"` or `"Authentication failed"`
- Logs show: `[SMS] ✗ Failed to send { status: 401 }`

**Possible Causes:**
1. **Incorrect Username/Password:**
   - Credentials in Vercel don't match Mobile Message dashboard
   - Typo in environment variables
   - Extra spaces or characters

2. **Base64 Encoding Issue:**
   - Auth header not properly formatted
   - Missing "Basic " prefix

3. **Account Suspended:**
   - Mobile Message account inactive
   - Payment issue

**Debugging Steps:**

1. **Verify Environment Variables in Vercel:**
   ```
   MOBILE_MESSAGE_API_USERNAME = FkqIHA
   MOBILE_MESSAGE_API_PASSWORD = zJA9fvXN0kWpIvJY4fL1sXnDg43PUFwIWx0m
   ```
   - Check for extra spaces
   - Verify exact match with Mobile Message dashboard

2. **Check Logs for Auth Header:**
   ```
   [SMS] Auth header (first 10 chars): Basic Rmtx
   ```
   - Should start with `Basic ` (with space)
   - Should be Base64 encoded

3. **Test Authentication Endpoint:**
   - Visit: https://rockywebstudio.com.au/api/test/mobile-message-auth
   - Should return authentication status

4. **Verify Mobile Message Dashboard:**
   - Login: https://app.mobilemessage.com.au
   - Check API credentials match Vercel env vars
   - Verify account is active

**Fix:**
- Update environment variables in Vercel to match Mobile Message dashboard
- Ensure no extra spaces or characters
- Redeploy after updating variables

---

### Issue 2: 404 Not Found

**Symptoms:**
- HTTP status: `404`
- Error message: `"Not Found"`
- Logs show: `[SMS] ✗ Failed to send { status: 404 }`

**Possible Causes:**
1. **Incorrect API URL:**
   - Wrong endpoint path
   - Missing `/v1` in URL
   - Trailing slash issue

2. **API Endpoint Changed:**
   - Mobile Message updated API structure
   - Endpoint deprecated

**Debugging Steps:**

1. **Check URL Construction Logs:**
   ```
   [SMS] Final API URL (before fetch): https://api.mobilemessage.com.au/v1/messages
   [SMS] URL match: ✅ CORRECT
   ```
   - Should be exactly: `https://api.mobilemessage.com.au/v1/messages`
   - If mismatch → Check environment variable

2. **Verify Environment Variable:**
   ```
   MOBILE_MESSAGE_API_URL = https://api.mobilemessage.com.au/v1
   ```
   - No trailing slash
   - Includes `/v1` path

3. **Check Mobile Message API Documentation:**
   - Verify endpoint hasn't changed
   - Confirm API version is correct

**Fix:**
- Verify `MOBILE_MESSAGE_API_URL` in Vercel
- Should be: `https://api.mobilemessage.com.au/v1` (no trailing slash)
- Redeploy after fixing

---

### Issue 3: 400 Bad Request

**Symptoms:**
- HTTP status: `400`
- Error message: `"Bad Request"` or validation error
- Logs show: `[SMS] ✗ Failed to send { status: 400 }`

**Possible Causes:**
1. **Invalid Phone Number Format:**
   - Not in E.164 format
   - Missing country code
   - Invalid characters

2. **Invalid Sender ID:**
   - Sender ID not registered
   - Sender ID inactive
   - Wrong format

3. **Invalid Payload Structure:**
   - Missing required fields
   - Wrong data types
   - Invalid message content

**Debugging Steps:**

1. **Check Payload Logs:**
   ```
   [SMS]     to: "+61412345678" (type: string)
   [SMS]     sender: "61485900170" (type: string)
   ```
   - `to` should be E.164: `+614...`
   - `sender` should match registered sender ID

2. **Verify Phone Number Format:**
   - Should be: `+61412345678` (E.164)
   - Not: `0412345678` or `61412345678` (missing +)

3. **Check Sender ID:**
   - Verify `61485900170` is registered in Mobile Message dashboard
   - Check if sender ID is active

4. **Check Message Content:**
   - Should not exceed character limits
   - Should not contain invalid characters

**Fix:**
- Ensure phone numbers are formatted to E.164 before sending
- Verify sender ID is registered and active
- Check payload structure matches API requirements

---

### Issue 4: 429 Too Many Requests

**Symptoms:**
- HTTP status: `429`
- Error message: `"Too Many Requests"` or `"Rate limit exceeded"`
- Logs show: `[SMS] ✗ Failed to send { status: 429 }`

**Possible Causes:**
1. **Rate Limiting:**
   - Too many requests in short time
   - API quota exceeded
   - Concurrent request limit

2. **Account Limits:**
   - Daily/monthly limit reached
   - Credit limit exceeded

**Debugging Steps:**

1. **Check Request Frequency:**
   - How many bookings submitted recently?
   - Are reminders running too frequently?

2. **Check Mobile Message Dashboard:**
   - Login: https://app.mobilemessage.com.au
   - Check API usage/limits
   - Verify credit balance

3. **Check Logs for Rate Limit Message:**
   ```
   [SMS] ✗ Failed to send {
     status: 429,
     error: "Rate limit exceeded. Mobile Message API allows max 5 concurrent requests..."
   }
   ```

**Fix:**
- Wait 1-2 minutes and retry
- Reduce request frequency
- Check API quota/limits in Mobile Message dashboard
- Consider implementing request queuing

---

### Issue 5: SMS Not Received (No Error in Logs)

**Symptoms:**
- Logs show success: `[SMS] ✓ Sent successfully`
- HTTP status: `200`
- But SMS not received on phone

**Possible Causes:**
1. **Phone Number Incorrect:**
   - Wrong number entered
   - Number not active
   - Number blocked

2. **Carrier Issues:**
   - SMS delivery delayed
   - Carrier blocking
   - Network issues

3. **Mobile Message Delivery Issue:**
   - Message queued but not delivered
   - Delivery failed silently

**Debugging Steps:**

1. **Verify Phone Number in Logs:**
   ```
   [SMS]     to: "+61412345678"
   ```
   - Confirm number matches test phone
   - Check for typos

2. **Check Message ID:**
   ```
   [SMS] ✓ Sent successfully {
     messageId: 'msg_abc123xyz'
   }
   ```
   - Note message ID
   - Check Mobile Message dashboard for delivery status

3. **Check Mobile Message Dashboard:**
   - Login: https://app.mobilemessage.com.au
   - Go to "Messages" or "SMS Logs"
   - Find message by ID
   - Check delivery status

4. **Wait and Retry:**
   - SMS delivery can take 1-5 minutes
   - Check spam/junk folder
   - Try different phone number

**Fix:**
- Verify phone number is correct
- Check Mobile Message dashboard for delivery status
- Contact Mobile Message support if message shows as delivered but not received

---

## Step 4: Test Authentication Endpoint

### Endpoint URL

```
https://rockywebstudio.com.au/api/test/mobile-message-auth
```

### Expected Response

**Success:**
```json
{
  "success": true,
  "authenticated": true,
  "account": {
    "username": "FkqIHA",
    "credit_balance": 100
  }
}
```

**Failure:**
```json
{
  "success": false,
  "authenticated": false,
  "error": "Authentication failed: 401 Unauthorized"
}
```

### What to Check

- ✅ `authenticated: true` → Credentials are correct
- ❌ `authenticated: false` → Check credentials in Vercel
- ✅ `credit_balance` → Should be > 0

---

## Step 5: Verify Mobile Message Account

### Login to Dashboard

**URL:** https://app.mobilemessage.com.au

### Checklist

#### 1. Credit Balance

- [ ] **Check Credit Balance:**
  - Should have at least 1 credit
  - If 0 → Top up account
  - Note: Each SMS costs ~1 credit

#### 2. Sender ID Verification

- [ ] **Verify Sender ID:**
  - Sender ID: `61485900170`
  - Status: Active
  - Registered: Yes
  - If inactive → Contact Mobile Message support

#### 3. Account Status

- [ ] **Check Account Restrictions:**
  - Account status: Active
  - No payment issues
  - No API restrictions
  - No account suspensions

#### 4. API Credentials

- [ ] **Verify API Credentials:**
  - Username: `FkqIHA`
  - Password: Matches Vercel environment variable
  - API access: Enabled

#### 5. SMS Logs

- [ ] **Check SMS Delivery Logs:**
  - Go to "Messages" or "SMS Logs"
  - Find recent test message
  - Check delivery status:
    - ✅ Delivered
    - ⏳ Pending
    - ❌ Failed
  - Note error message if failed

---

## Step 6: Collect Debug Information

### Information to Collect

1. **Vercel Logs:**
   - Copy all `[SMS]` log entries
   - Note HTTP status codes
   - Copy error messages

2. **Environment Variables (Verify):**
   ```
   MOBILE_MESSAGE_API_USERNAME = FkqIHA
   MOBILE_MESSAGE_API_PASSWORD = [verify matches dashboard]
   MOBILE_MESSAGE_API_URL = https://api.mobilemessage.com.au/v1
   MOBILE_MESSAGE_SENDER_ID = 61485900170
   ```

3. **Mobile Message Dashboard:**
   - Credit balance
   - Sender ID status
   - Account status
   - SMS delivery logs

4. **Test Results:**
   - Booking ID
   - Phone number (masked)
   - SMS received: Yes/No
   - Delivery time

---

## Step 7: Report Issues

### Error Report Template

```markdown
## SMS Delivery Error Report

**Date:** [Date]
**Time:** [Time]
**Booking ID:** [BK...]

### Error Details
- **HTTP Status:** [200/400/401/404/429/500]
- **Error Message:** [Exact error from logs]
- **Error Location:** [Which step failed]

### Vercel Logs
[Paste relevant [SMS] log entries]

### Environment Variables
- **MOBILE_MESSAGE_API_USERNAME:** [Set/Not Set]
- **MOBILE_MESSAGE_API_PASSWORD:** [Set/Not Set]
- **MOBILE_MESSAGE_API_URL:** [Value]
- **MOBILE_MESSAGE_SENDER_ID:** [Value]

### Mobile Message Dashboard
- **Credit Balance:** [Amount]
- **Sender ID Status:** [Active/Inactive]
- **Account Status:** [Active/Suspended]
- **SMS Delivery Status:** [Delivered/Failed/Pending]

### Authentication Test
- **Endpoint:** https://rockywebstudio.com.au/api/test/mobile-message-auth
- **Result:** [Success/Failure]
- **Response:** [JSON response]

### Additional Notes
[Any other relevant information]
```

---

## Quick Reference: Error Codes

| HTTP Status | Error | Common Cause | Fix |
|------------|-------|--------------|-----|
| **200** | Success | - | ✅ Working correctly |
| **400** | Bad Request | Invalid payload/phone format | Check payload structure, phone format |
| **401** | Unauthorized | Wrong credentials | Verify username/password in Vercel |
| **404** | Not Found | Wrong API URL | Check `MOBILE_MESSAGE_API_URL` |
| **429** | Too Many Requests | Rate limited | Wait and retry, check quota |
| **500** | Server Error | Mobile Message API issue | Contact Mobile Message support |

---

## Summary

### Debugging Checklist

- [ ] Check Vercel logs for `[SMS]` entries
- [ ] Verify URL construction shows "✅ CORRECT"
- [ ] Confirm credentials exist (`Username exists: true`)
- [ ] Check HTTP status code
- [ ] Test authentication endpoint
- [ ] Verify Mobile Message account status
- [ ] Check credit balance
- [ ] Verify sender ID is active
- [ ] Review SMS delivery logs in dashboard

### Next Steps

1. **If 401:** Update credentials in Vercel
2. **If 404:** Verify API URL environment variable
3. **If 400:** Check payload structure and phone format
4. **If 429:** Wait and retry, check quota
5. **If success but no SMS:** Check Mobile Message dashboard for delivery status

---

**Last Updated:** 2025-01-22  
**Status:** Ready for Debugging








