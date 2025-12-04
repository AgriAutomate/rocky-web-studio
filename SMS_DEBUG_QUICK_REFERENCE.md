# SMS Debugging Quick Reference

## 🔗 Quick Links

### Vercel Logs
```
https://vercel.com/martinc343-3347s-projects/rocky-web-studio/logs
```

### Test Authentication Endpoint
```
https://rockywebstudio.com.au/api/test/mobile-message-auth
```

### Mobile Message Dashboard
```
https://app.mobilemessage.com.au
```

---

## 🔍 Log Search Patterns

### In Vercel Logs, Search For:

| Search Term | What It Shows |
|------------|---------------|
| `[SMS] API URL:` | Final URL being used |
| `[SMS] Username exists:` | Credential availability |
| `[SMS] Password exists:` | Credential availability |
| `[SMS] ✓ Sent successfully` | Success case |
| `[SMS] ✗ Failed to send` | Error case |
| `[SMS] URL match:` | URL verification result |

---

## ✅ Expected Values

### URL Construction
```
[SMS] Final API URL (before fetch): https://api.mobilemessage.com.au/v1/messages
[SMS] URL match: ✅ CORRECT
```

### Credentials
```
[SMS] Username exists: true
[SMS] Password exists: true
```

### Success Response
```
[SMS] ✓ Sent successfully {
  bookingId: 'BK...',
  messageId: 'msg_...',
  phone: '+614***678'
}
```

---

## ❌ Common Errors

### 401 Unauthorized
- **Check:** Credentials in Vercel match Mobile Message dashboard
- **Test:** Visit `/api/test/mobile-message-auth`
- **Fix:** Update environment variables

### 404 Not Found
- **Check:** `MOBILE_MESSAGE_API_URL` = `https://api.mobilemessage.com.au/v1`
- **Verify:** URL match shows "✅ CORRECT"
- **Fix:** Update environment variable (no trailing slash)

### 400 Bad Request
- **Check:** Phone number is E.164 format (`+614...`)
- **Check:** Sender ID is registered and active
- **Fix:** Verify payload structure in logs

### 429 Too Many Requests
- **Check:** API quota/limits in Mobile Message dashboard
- **Fix:** Wait 1-2 minutes and retry

---

## 🧪 Test Authentication

**Endpoint:** `https://rockywebstudio.com.au/api/test/mobile-message-auth`

**Expected Success:**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "credit_balance": 100
  }
}
```

**Expected Failure:**
```json
{
  "success": false,
  "status": 401,
  "error": "HTTP 401: Unauthorized"
}
```

---

## 📋 Mobile Message Dashboard Checklist

- [ ] Credit balance > 0
- [ ] Sender ID `61485900170` is active
- [ ] Account status: Active
- [ ] API credentials match Vercel
- [ ] No account restrictions

---

## 📝 Error Report Template

```markdown
**HTTP Status:** [Code]
**Error Message:** [Message]
**Vercel Logs:** [Paste [SMS] entries]
**Auth Test Result:** [Success/Failure]
**Mobile Message Dashboard:** [Status]
```

---

**For detailed debugging, see:** `SMS_DEBUGGING_GUIDE.md`









