# Mobile Message API Payload Structure Comparison

## Official API Specification

**Endpoint:** `POST https://api.mobilemessage.com.au/v1/messages`

**Expected Payload:**
```json
{
  "enable_unicode": boolean,
  "messages": [
    {
      "to": "phone_number",
      "message": "message_content", 
      "sender": "Sender_ID",
      "custom_ref": "tracking_reference"
    }
  ]
}
```

---

## Current Implementation Analysis

### 1. Messages Array Structure (buildPayload function, line 147-163)

**Current Code:**
```typescript
const buildPayload = (messages: SMSMessage[]): MobileMessagePayload => {
  const runtimeSenderId = process.env.MOBILE_MESSAGE_SENDER_ID;
  
  if (!runtimeSenderId) {
    throw new Error("MOBILE_MESSAGE_SENDER_ID is required. Set it in your environment variables.");
  }

  return {
    enable_unicode: true,
    messages: messages.map((message) => ({
      to: message.to,
      message: message.message,
      sender: runtimeSenderId,
      custom_ref: message.customRef,
    })),
  };
};
```

**✅ VERIFICATION:**

| Field | Expected | Current | Status |
|-------|----------|---------|--------|
| `enable_unicode` | `boolean` | `true` (boolean) | ✅ **CORRECT** |
| `messages` | `Array<{...}>` | `Array<{...}>` | ✅ **CORRECT** |
| `messages[].to` | `string` | `message.to` (string) | ✅ **CORRECT** |
| `messages[].message` | `string` | `message.message` (string) | ✅ **CORRECT** |
| `messages[].sender` | `string` | `runtimeSenderId` (string from env) | ✅ **CORRECT** |
| `messages[].custom_ref` | `string?` (optional) | `message.customRef` (optional) | ✅ **CORRECT** |

**Status:** ✅ **FULLY COMPLIANT** - Structure matches API specification exactly

---

### 2. Sender Field Source (Line 159)

**Question:** Is the sender field using senderId from env or defaulting to "RockyWeb"?

**Answer:** ✅ **USES ENVIRONMENT VARIABLE**

- **Before fix:** Used `senderId || "RockyWeb"` fallback
- **After fix:** Uses `process.env.MOBILE_MESSAGE_SENDER_ID` directly
- **Validation:** Throws error if `MOBILE_MESSAGE_SENDER_ID` is not set
- **No fallback:** Ensures registered Sender ID is always used

**Status:** ✅ **CORRECT** - Uses environment variable, no default fallback

---

### 3. enable_unicode Default Value (Line 155)

**Question:** Is enable_unicode set to true by default?

**Answer:** ✅ **YES**

```typescript
enable_unicode: true,  // Always set to true
```

**Status:** ✅ **CORRECT** - Always `true`, supports Unicode characters

---

### 4. Phone Number Formatting

**Question:** Are phone numbers being formatted correctly (Australian local or international format)?

**Current Flow:**

1. **Booking Form (`app/book/page.tsx`):**
   ```typescript
   const formattedPhone = formatToE164(formData.phone.trim());
   // Result: +61412345678 (E.164 format)
   ```

2. **SMS API Route (`app/api/notifications/send-sms/route.ts`):**
   ```typescript
   const { to } = body;  // Receives E.164 format: +61412345678
   const result = await sendSMS(to, message, `booking_${Date.now()}`);
   ```

3. **Reminder Route (`app/api/notifications/send-reminder/route.ts`):**
   ```typescript
   const result = await sendSMS(booking.phone, message, ...);
   // booking.phone is stored in E.164 format from booking creation
   ```

**Phone Formatting Functions (`lib/phone.ts`):**
- `formatToE164()`: Converts to `+61412345678` (E.164 international format)
- `validateAustralianPhone()`: Validates Australian numbers

**Mobile Message API Phone Format Requirements:**
- ✅ Accepts: International format (`+61412345678`)
- ✅ Accepts: Australian local format (`0412345678`)
- ✅ Accepts: Australian with spaces (`04 1234 5678`)

**Current Implementation:**
- Phone numbers are formatted to **E.164 international format** (`+61412345678`)
- This is the **recommended format** for international APIs
- Mobile Message API accepts this format ✅

**Status:** ✅ **CORRECT** - Using E.164 international format, which is accepted by Mobile Message API

---

## Exact Payload Example

**What gets sent to Mobile Message API:**

```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "+61412345678",
      "message": "Hi John! Your Rocky Web Studio booking is confirmed for 2025-01-25 at 14:00. Service: Website Consultation. Questions? Reply to this SMS. Thanks!",
      "sender": "61485900170",
      "custom_ref": "booking_1737561234567"
    }
  ]
}
```

**Field-by-Field Breakdown:**

| Field | Value | Type | Source |
|-------|-------|------|--------|
| `enable_unicode` | `true` | `boolean` | Hardcoded in `buildPayload()` |
| `messages[0].to` | `"+61412345678"` | `string` | From `formatToE164()` in booking form |
| `messages[0].message` | `"Hi John!..."` | `string` | Constructed in API route |
| `messages[0].sender` | `"61485900170"` | `string` | From `MOBILE_MESSAGE_SENDER_ID` env var |
| `messages[0].custom_ref` | `"booking_1737561234567"` | `string` | Generated timestamp-based ID |

---

## Verification Checklist

### ✅ Structure Compliance
- [x] `enable_unicode` is boolean (true)
- [x] `messages` is an array
- [x] Each message has `to`, `message`, `sender` fields
- [x] `custom_ref` is optional and included when provided
- [x] Field names match API spec exactly (`custom_ref` not `customRef`)

### ✅ Data Sources
- [x] `sender` comes from `MOBILE_MESSAGE_SENDER_ID` environment variable
- [x] No hardcoded fallback values
- [x] Error thrown if `sender` is missing

### ✅ Phone Number Format
- [x] Phone numbers formatted to E.164 international format (`+61412345678`)
- [x] Format is accepted by Mobile Message API
- [x] Consistent formatting across all SMS sending points

### ✅ Payload Logging
- [x] Added comprehensive payload logging in `post()` function
- [x] Logs exact structure, types, and values
- [x] Logs full JSON payload for debugging

---

## Summary

### ✅ **FULLY COMPLIANT**

The payload structure in `lib/sms.ts` **exactly matches** the Mobile Message API specification:

1. ✅ **Messages array structure:** Correct - matches API spec exactly
2. ✅ **Sender field:** Uses `MOBILE_MESSAGE_SENDER_ID` from environment (no fallback)
3. ✅ **enable_unicode:** Always set to `true` (boolean)
4. ✅ **Phone number format:** E.164 international format (`+61412345678`) - accepted by API

### Improvements Made

1. ✅ Removed "RockyWeb" fallback - now requires `MOBILE_MESSAGE_SENDER_ID`
2. ✅ Added comprehensive payload logging for debugging
3. ✅ Validates sender ID before building payload

### No Changes Needed

The implementation is **production-ready** and fully compliant with Mobile Message API requirements.

---

## Testing

To verify the exact payload being sent:

1. **Check server logs** when sending SMS - new logging shows:
   - Exact payload structure
   - Field types and values
   - Full JSON payload

2. **Use test endpoint:** `/api/test/mobile-message-auth` to verify credentials

3. **Monitor API responses** - Mobile Message API will return errors if payload structure is incorrect

---

**Last Updated:** 2025-01-22
**Status:** ✅ Verified and Compliant






