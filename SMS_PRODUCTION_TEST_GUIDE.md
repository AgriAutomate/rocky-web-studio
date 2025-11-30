# SMS Production Test Guide

## 🧪 Test Instructions

### Prerequisites

- ✅ Production site deployed and live
- ✅ Environment variables configured in Vercel
- ✅ Real Australian mobile phone number for testing
- ✅ Access to Vercel function logs

---

## Step 1: Navigate to Booking Page

**URL:** https://rockywebstudio.com.au/book

**Verify:**
- [ ] Page loads without errors
- [ ] Booking form is visible
- [ ] Calendar shows available dates
- [ ] Time slots are selectable

---

## Step 2: Complete Test Booking

### Form Fields

| Field | Value | Notes |
|-------|-------|-------|
| **Date** | Select any available date | Use date picker |
| **Time** | Select any available time slot | e.g., 10:00, 14:00 |
| **Service** | "Website Consultation (1 hour)" | From dropdown |
| **Name** | Your actual name | For SMS personalization |
| **Email** | Your actual email | For email confirmation |
| **Phone** | **YOUR REAL PHONE** | Must be Australian mobile (04XX XXX XXX) |
| **SMS Opt-In** | ✅ **CHECKED** | Critical for SMS delivery |
| **Message** | "Test booking to verify SMS delivery" | Optional |

### Important Notes

⚠️ **Phone Number Format:**
- Must be Australian mobile: `04XX XXX XXX`
- Will be automatically formatted to E.164: `+614XX XXX XXX`
- Use a phone you can physically check for SMS

⚠️ **SMS Opt-In:**
- **MUST be checked** for SMS to be sent
- If unchecked, only email confirmation will be sent

---

## Step 3: Submit and Verify

### On Confirmation Page

**Expected Elements:**
- [ ] ✅ "Booking confirmed!" success message
- [ ] Booking ID displayed (format: `BK1234567890`)
- [ ] Booking details card showing:
  - Date and time
  - Service type
  - Your name
- [ ] **SMS Status Indicator:**
  - "📱 Sending confirmation SMS..." (loading)
  - "✅ Confirmation SMS sent to 04XX XXX XXX" (success)
  - "⚠️ SMS couldn't be sent..." (error)

### SMS Status States

1. **Sending (Loading):**
   - Blue spinner icon
   - Message: "📱 Sending confirmation SMS..."

2. **Success:**
   - Green checkmark icon
   - Message: "✅ Confirmation SMS sent to 04XX XXX XXX"
   - Phone number is masked (e.g., `04XX XXX 678`)

3. **Error:**
   - Yellow warning icon
   - Message: "⚠️ SMS couldn't be sent, but email confirmation was delivered"
   - Error details may be shown

---

## Step 4: Check Your Phone

### Expected SMS Content

**Format:**
```
Hi [Your Name]! Your Rocky Web Studio booking is confirmed for [DD/MM/YYYY] at [HH:00]. Service: Website Consultation (1 hour). Booking ID: BK[ID]. Questions? Just reply! - Rocky Web Studio
```

**Example:**
```
Hi John! Your Rocky Web Studio booking is confirmed for 25/01/2025 at 14:00. Service: Website Consultation (1 hour). Booking ID: BK1737561234567. Questions? Just reply! - Rocky Web Studio
```

### SMS Details

- **From:** `61485900170` (or configured sender ID)
- **Delivery Time:** Within 1-2 minutes of booking submission
- **Length:** ~150-200 characters

### Verification Checklist

- [ ] SMS received within 2 minutes
- [ ] Contains your name
- [ ] Contains correct date (DD/MM/YYYY format)
- [ ] Contains correct time
- [ ] Contains service type
- [ ] Contains booking ID (starts with `BK`)
- [ ] Contains "Questions? Just reply!" message
- [ ] From number matches configured sender ID

---

## Step 5: Check Vercel Function Logs

### Access Logs

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/martinc343-3347s-projects/rocky-web-studio
   ```

2. **Navigate to Logs:**
   - Click on latest deployment
   - Go to "Functions" tab
   - Or: Deployments → Latest → Functions Logs

3. **Filter Logs:**
   - Look for `[SMS]` entries
   - Filter by function: `/api/bookings/create`

### Expected Log Entries

#### 1. URL Construction Logs

```
[SMS] Base URL: https://api.mobilemessage.com.au/v1
[SMS] API URL: https://api.mobilemessage.com.au/v1/messages
[SMS] Final API URL (before fetch): https://api.mobilemessage.com.au/v1/messages
[SMS] URL verification - Expected: https://api.mobilemessage.com.au/v1/messages
[SMS] URL verification - Actual: https://api.mobilemessage.com.au/v1/messages
[SMS] URL match: ✅ CORRECT
```

#### 2. Payload Logs

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

#### 3. Success Logs

```
[SMS] ✓ Sent successfully {
  bookingId: 'BK1737561234567',
  messageId: 'msg_abc123xyz',
  phone: '+614***678'
}
```

#### 4. Error Logs (if failed)

```
[SMS] ✗ Failed to send {
  bookingId: 'BK1737561234567',
  status: 401,
  error: 'Authentication failed...',
  phone: '+614***678'
}
```

### Log Verification Checklist

- [ ] URL construction logs show correct URL
- [ ] URL match shows "✅ CORRECT"
- [ ] Payload structure is correct
- [ ] Phone number is in E.164 format (`+614...`)
- [ ] Sender ID matches environment variable
- [ ] Custom reference is booking ID
- [ ] HTTP status is 200 (not 404 or 401)
- [ ] Message ID is present in success response

---

## Step 6: Verify API Response

### Success Response (200 OK)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "message_id": "msg_abc123xyz",
        "to": "+61412345678",
        "status": "queued"
      }
    ]
  }
}
```

### Error Responses

#### 404 Not Found
```json
{
  "error": "Not Found"
}
```
**Cause:** Incorrect API URL  
**Fix:** Verify `MOBILE_MESSAGE_API_URL` environment variable

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** Invalid credentials  
**Fix:** Verify `MOBILE_MESSAGE_API_USERNAME` and `MOBILE_MESSAGE_API_PASSWORD`

#### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": "..."
}
```
**Cause:** Invalid payload structure  
**Fix:** Check payload logs for structure issues

---

## Step 7: Report Results

### Test Report Template

```markdown
## SMS Production Test Results

**Date:** [Date of test]
**Time:** [Time of test]
**Booking ID:** [BK...]

### Booking Submission
- [ ] Form submitted successfully
- [ ] Confirmation page displayed
- [ ] SMS status indicator shown

### SMS Delivery
- [ ] SMS received: YES / NO
- [ ] Delivery time: [X] minutes
- [ ] From number: [Sender ID]
- [ ] SMS content: [Paste full message]

### SMS Content Verification
- [ ] Contains name: YES / NO
- [ ] Contains date: YES / NO (format: DD/MM/YYYY)
- [ ] Contains time: YES / NO
- [ ] Contains service: YES / NO
- [ ] Contains booking ID: YES / NO
- [ ] Contains reply message: YES / NO

### Vercel Logs
- [ ] URL construction: ✅ CORRECT / ❌ MISMATCH
- [ ] HTTP status: [200 / 404 / 401 / Other]
- [ ] Message ID: [msg_...] or [N/A]
- [ ] Error message: [If any]

### Issues Found
[List any errors or unexpected behavior]
```

---

## Troubleshooting

### SMS Not Received

1. **Check SMS Opt-In:**
   - Verify checkbox was checked on form
   - Check confirmation page for SMS status

2. **Check Phone Number:**
   - Must be Australian mobile (04XX XXX XXX)
   - Check logs for E.164 format (`+614...`)

3. **Check Vercel Logs:**
   - Look for error messages
   - Check HTTP status code
   - Verify API response

4. **Check Environment Variables:**
   - Verify all 4 Mobile Message variables are set
   - Check for typos in credentials

### 404 Error

- **Symptom:** `HTTP 404: Not Found`
- **Cause:** Incorrect API URL
- **Fix:** 
  - Verify `MOBILE_MESSAGE_API_URL` = `https://api.mobilemessage.com.au/v1`
  - Check logs for actual URL being used
  - Ensure URL match shows "✅ CORRECT"

### 401 Error

- **Symptom:** `HTTP 401: Unauthorized`
- **Cause:** Invalid credentials
- **Fix:**
  - Verify `MOBILE_MESSAGE_API_USERNAME` = `FkqIHA`
  - Verify `MOBILE_MESSAGE_API_PASSWORD` is correct
  - Check for extra spaces or characters

### SMS Status Shows Error

- **Check logs** for specific error message
- **Verify environment variables** are set correctly
- **Check phone number format** in logs
- **Verify sender ID** is registered with Mobile Message

---

## Success Criteria

### ✅ Test Passes If:

1. ✅ Booking submitted successfully
2. ✅ SMS status shows "✅ Sent successfully"
3. ✅ SMS received on phone within 2 minutes
4. ✅ SMS contains all required information
5. ✅ Vercel logs show HTTP 200
6. ✅ URL match shows "✅ CORRECT"
7. ✅ Message ID present in response

### ❌ Test Fails If:

1. ❌ SMS not received after 5 minutes
2. ❌ HTTP status is 404 or 401
3. ❌ URL match shows "❌ MISMATCH"
4. ❌ Error message in logs
5. ❌ SMS status shows error on confirmation page

---

## Next Steps After Test

### If Test Passes ✅

1. Document successful SMS delivery
2. Note delivery time for reference
3. Verify SMS content format
4. Confirm all features working

### If Test Fails ❌

1. Copy error logs from Vercel
2. Note HTTP status code
3. Check environment variables
4. Verify phone number format
5. Report specific error message

---

**Last Updated:** 2025-01-22  
**Status:** Ready for Production Testing




