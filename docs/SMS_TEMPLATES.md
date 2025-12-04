# SMS Templates Documentation

This document describes all SMS message templates used in Rocky Web Studio, including character counts, formatting, and usage guidelines.

## Overview

All SMS templates are optimized to stay under 160 characters (single SMS standard) to minimize costs and ensure reliable delivery.

**Character Encoding:** UTF-8 with Unicode support enabled (`enable_unicode: true`)

**Status Tracking:** Messages are tracked with status: `sent`, `pending`, `delivered`, `failed`

---

## Template Types

### 1. Booking Confirmation

**Function:** `generateServiceSpecificMessage()`  
**File:** `lib/sms/messages.ts`

#### Standard Confirmation

**Template:**
```
Hi {name}! Confirmed: {service} on {date} at {time}. ID: {bookingId}. Reply with questions - Rocky Web Studio
```

**Variations:**
- **Short version** (if > 160 chars): Removes full signature
- **With opt-out:** Adds "Reply STOP to opt out" if space allows

**Character Count:** ~100-140 characters (varies by service name length)

**Example:**
```
Hi John! Confirmed: Website Consult on 15/12 at 14:00. ID: BK1234567890. Reply with questions - Rocky Web Studio
```
**Length:** 108 characters ✅

#### Service-Specific Confirmations

**Website Consultation:**
```
Hi {name}! Confirmed: Website Consult on {date} at {time}. ID: {bookingId}. Prep: rockywebstudio.com.au/prep - Rocky
```
**Length:** ~120 characters ✅

**Website Audit:**
```
Hi {name}! Confirmed: Website Audit on {date} at {time}. ID: {bookingId}. Please share your current site URL - Rocky
```
**Length:** ~130 characters ✅

**Follow-up Meeting:**
```
Hi {name}! Follow-up confirmed: {date} at {time}. ID: {bookingId}. We'll continue from last session - Rocky
```
**Length:** ~110 characters ✅

**With Video Call Link:**
```
{base message}

Join: {meetingLink}
```
**Length:** May exceed 160 chars if link is long (will be split into multiple SMS)

**With Location:**
```
{base message}

Location: {location}
```
**Length:** ~140-160 characters ✅

---

### 2. 24-Hour Reminder

**Function:** `generate24HourReminder()`  
**File:** `lib/sms/messages.ts`

**Template:**
```
Reminder: Your Rocky Web Studio {service} is tomorrow at {time}. Reply CONFIRM or RESCHEDULE
```

**Short version** (if > 160 chars):
```
Reminder: {service} tomorrow at {time}. Reply CONFIRM or RESCHEDULE - Rocky
```

**With opt-out:**
```
{base message} Reply STOP to opt out
```

**Character Count:** ~90-120 characters

**Example:**
```
Reminder: Your Rocky Web Studio Website Consult is tomorrow at 14:00. Reply CONFIRM or RESCHEDULE
```
**Length:** 95 characters ✅

---

### 3. 2-Hour Reminder

**Function:** `generate2HourReminder()`  
**File:** `lib/sms/messages.ts`

**Template:**
```
Your {service} starts in 2 hours at {time}. Running late? Reply RESCHEDULE - Rocky
```

**Short version** (if > 160 chars):
```
{service} in 2 hours at {time}. Reply RESCHEDULE if needed - Rocky
```

**With opt-out:**
```
{base message} Reply STOP to opt out
```

**Character Count:** ~80-100 characters

**Example:**
```
Your Website Consult starts in 2 hours at 14:00. Running late? Reply RESCHEDULE - Rocky
```
**Length:** 78 characters ✅

---

### 4. Admin Notification (Not Currently Used)

**Note:** Admin SMS notifications are not currently implemented in the codebase. If needed, use this template:

**Template:**
```
{customerName} booked {service} on {date}. Reply to respond. - Rocky Web Studio
```

**Character Count:** ~60-80 characters

**Example:**
```
John Doe booked Website Consultation on 15/12. Reply to respond. - Rocky Web Studio
```
**Length:** 72 characters ✅

---

## Character Count Verification

### Template Length Analysis

| Template | Min Length | Max Length | Status |
|----------|------------|------------|--------|
| Confirmation (standard) | 100 | 140 | ✅ Under 160 |
| Confirmation (with link) | 140 | 200+ | ⚠️ May exceed |
| 24h Reminder | 90 | 120 | ✅ Under 160 |
| 2h Reminder | 80 | 100 | ✅ Under 160 |
| Admin Notification | 60 | 80 | ✅ Under 160 |

### Length Validation

All templates use `validateMessageLength()` function which:
- Calculates exact character count
- Determines number of SMS parts (160 chars = 1 part)
- Warns if message exceeds 160 characters
- Logs warnings for messages that will be split

**Function:** `lib/sms/messages.ts` → `validateMessageLength()`

---

## Message Formatting

### Date Format

- **Short format:** `DD/MM` (e.g., `15/12`)
- **Function:** `formatDateShort()`

### Time Format

- **Format:** `HH:mm` (e.g., `14:00`)
- **Function:** `formatTimeShort()`

### Service Name Shortening

Service names are shortened for SMS:

| Full Name | Short Name |
|-----------|------------|
| Website Consultation (1 hour) | Website Consult |
| Website Audit (30 min) | Website Audit |
| Follow-up Meeting (30 min) | Follow-up |

**Function:** `shortenServiceName()`

---

## Opt-Out Compliance (ACMA)

All templates attempt to include opt-out instructions:

**Standard:** `Reply STOP to opt out`

**Inclusion Logic:**
1. Try adding opt-out to base message
2. If total length ≤ 160 chars → include opt-out
3. If total length > 160 chars → exclude opt-out (compliance risk)

**Compliance Status:** ⚠️ **Partial** - Some messages may not include opt-out if they're already close to 160 chars

**Recommendation:** Ensure all messages include opt-out by keeping base messages shorter.

---

## Unicode & Special Characters

### Supported Characters

- ✅ **Emojis:** ✅ 📅 📍 🔗 👋 ⏰ (used in some templates)
- ✅ **Accents:** é, ñ, ü, etc.
- ✅ **Special symbols:** ©, ®, ™

**Note:** Unicode characters count as 1 character in UTF-8, but some carriers may display differently.

### Character Encoding

- **API Setting:** `enable_unicode: true` in Mobile Message API payload
- **Encoding:** UTF-8
- **GSM-7 Fallback:** Mobile Message API handles conversion automatically

---

## Link Handling

### Calendar Links

**Format:** Google Calendar URL
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text=...
```

**Length:** ~150-200 characters (very long)

**Handling:**
- Included if base message + link ≤ 160 chars
- Otherwise sent in separate message or excluded

**Function:** `generateConfirmationWithCalendar()`

### Meeting Links

**Format:** Video call URL (Zoom, Google Meet, etc.)

**Handling:**
- Included if space allows
- May cause message to exceed 160 chars
- Will be split into multiple SMS parts

### Shortening Links

**Current Status:** ❌ **Not implemented**

**Recommendation:** Use URL shortener (bit.ly, tinyurl.com) to reduce link length:
- Original: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...` (~200 chars)
- Shortened: `https://bit.ly/abc123` (~20 chars)

---

## Delivery Status Tracking

### Status Values

| Status | Meaning | When Set |
|--------|---------|----------|
| `sent` | Successfully sent to Mobile Message API | Immediately after API call succeeds |
| `pending` | Scheduled for future delivery | For scheduled reminders |
| `delivered` | Confirmed delivered to recipient | After checking Mobile Message status API |
| `failed` | Delivery failed | After API error or status check |

### Status Checking

**Function:** `lib/sms/delivery-status.ts` → `updateDeliveryStatus()`

**API Endpoint:** `POST /api/admin/sms/check-status`

**Usage:**
```typescript
// Check single message
const status = await updateDeliveryStatus(messageId);

// Check multiple messages
const results = await updateBatchDeliveryStatus([messageId1, messageId2]);
```

**Mobile Message API:** `GET /messages/{message_id}`

---

## Testing Templates

### Test Endpoint

**Endpoint:** `POST /api/test/sms`

**Request:**
```json
{
  "to": "+61400000000",
  "template": "confirmation"
}
```

**Templates Available:**
- `confirmation` - Booking confirmation template
- `reminder` - 24-hour reminder template
- `admin` - Admin notification template
- Custom message via `message` field

**Rate Limit:** 5 requests per hour per IP

### Character Count Testing

**Function:** `validateMessageLength(message)`

**Returns:**
```typescript
{
  valid: boolean;      // true if ≤ 160 chars
  length: number;      // Exact character count
  parts: number;       // Number of SMS parts (1 = single SMS)
  warning?: string;    // Warning if exceeds 160 chars
}
```

---

## Troubleshooting

### Message Exceeds 160 Characters

**Symptoms:** Message is split into multiple SMS parts, increasing cost

**Solutions:**
1. **Shorten service name:** Use `shortenServiceName()` function
2. **Remove optional text:** Remove signature or opt-out if needed
3. **Shorten links:** Use URL shortener
4. **Split content:** Send calendar link in separate message

### Unicode Characters Not Displaying

**Symptoms:** Emojis or accents show as question marks

**Solutions:**
1. **Verify encoding:** Ensure `enable_unicode: true` in API payload
2. **Check carrier support:** Some carriers don't support Unicode
3. **Use GSM-7:** Remove Unicode characters, use ASCII only

### Delivery Status Not Updating

**Symptoms:** Status stuck at "sent", never shows "delivered"

**Solutions:**
1. **Check Mobile Message API:** Verify status endpoint is accessible
2. **Run status check:** Call `/api/admin/sms/check-status` endpoint
3. **Verify messageId:** Ensure messageId is stored correctly
4. **Check logs:** Review delivery status logs for errors

### Links Broken in SMS

**Symptoms:** Links don't work when clicked from SMS

**Solutions:**
1. **Verify URL encoding:** Ensure special characters are encoded
2. **Test link:** Click link from SMS to verify it works
3. **Check carrier:** Some carriers may modify links
4. **Use HTTPS:** Always use HTTPS URLs

---

## Best Practices

### 1. Keep Messages Under 160 Characters

- Reduces cost (single SMS vs multiple)
- Improves readability
- Ensures reliable delivery

### 2. Include Opt-Out Instructions

- Required for ACMA compliance
- Keep base message short to allow space for opt-out

### 3. Use Clear Call-to-Actions

- "Reply CONFIRM" - Clear action
- "Reply RESCHEDULE" - Clear action
- "Reply STOP" - Clear opt-out

### 4. Test Templates Before Production

- Use `/api/test/sms` endpoint
- Test with real phone number
- Verify character count
- Verify delivery status tracking

### 5. Monitor Delivery Status

- Regularly check delivery status
- Investigate failed deliveries
- Track delivery rates
- Adjust templates based on delivery success

---

## Template Examples

### Confirmation (Shortest)

```
Hi John! Confirmed: Consult on 15/12 at 14:00. ID: BK123. Questions? Reply! - Rocky
```
**Length:** 88 characters ✅

### Confirmation (With Opt-Out)

```
Hi John! Confirmed: Website Consult on 15/12 at 14:00. ID: BK1234567890. Reply STOP to opt out
```
**Length:** 108 characters ✅

### Reminder (24h)

```
Reminder: Website Consult tomorrow at 14:00. Reply CONFIRM or RESCHEDULE - Rocky
```
**Length:** 75 characters ✅

### Reminder (2h)

```
Website Consult in 2 hours at 14:00. Reply RESCHEDULE if needed - Rocky
```
**Length:** 66 characters ✅

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

