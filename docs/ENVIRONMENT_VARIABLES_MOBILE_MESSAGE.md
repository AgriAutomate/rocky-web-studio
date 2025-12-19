# Environment Variables - Mobile Message SMS

## 📋 Required Environment Variables

### Mobile Message API Configuration

```bash
# Mobile Message SMS API (mobilemessage.com.au)
# ACMA-Approved Sender ID: "Rocky Web"

MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
MOBILE_MESSAGE_API_USERNAME=your_username
MOBILE_MESSAGE_API_PASSWORD=your_password
MOBILE_MESSAGE_SENDER_ID=Rocky Web
```

---

## 🔧 Setup Instructions

### Local Development (.env.local)

1. **Create or update `.env.local`:**
   ```bash
   # Mobile Message SMS Configuration
   MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
   MOBILE_MESSAGE_API_USERNAME=your_username_from_dashboard
   MOBILE_MESSAGE_API_PASSWORD=your_password_from_dashboard
   MOBILE_MESSAGE_SENDER_ID=Rocky Web
   ```

2. **Get credentials from Mobile Message dashboard:**
   - Log in to mobilemessage.com.au
   - Go to Settings → API
   - Copy username and password
   - Verify Sender ID "Rocky Web" is registered and active

3. **Restart development server:**
   ```bash
   npm run dev
   ```

---

### Vercel Production

1. **Go to Vercel Dashboard:**
   - Project → Settings → Environment Variables

2. **Remove Twilio variables (if present):**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `TWILIO_FROM_NUMBER`

3. **Add Mobile Message variables:**
   - `MOBILE_MESSAGE_API_URL` = `https://api.mobilemessage.com.au/v1`
   - `MOBILE_MESSAGE_API_USERNAME` = Your username
   - `MOBILE_MESSAGE_API_PASSWORD` = Your password
   - `MOBILE_MESSAGE_SENDER_ID` = `Rocky Web`

4. **Set environment:**
   - Select: Production, Preview, Development (or all)

5. **Redeploy:**
   - Go to Deployments
   - Click "Redeploy" on latest deployment

---

### n8n Environment Variables

1. **Go to n8n Settings → Environment Variables**

2. **Add:**
   ```
   MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1
   MOBILE_MESSAGE_API_USERNAME=your_username
   MOBILE_MESSAGE_API_PASSWORD=your_password
   MOBILE_MESSAGE_SENDER_ID=Rocky Web
   ```

3. **Create Auth Header (for HTTP Request nodes):**
   ```
   MOBILE_MESSAGE_AUTH_HEADER=Basic <base64_encoded_username:password>
   ```
   
   **Calculate Base64:**
   ```bash
   echo -n "username:password" | base64
   # Result: dXNlcm5hbWU6cGFzc3dvcmQ=
   # Full value: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
   ```

---

## ✅ Verification

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

## 🔒 Security Notes

- **Never commit credentials to git**
- **Use environment variables only**
- **Rotate passwords periodically**
- **Use different credentials for dev/prod**
- **Monitor API usage in Mobile Message dashboard**

---

## 📚 Related Documentation

- **Migration Guide:** `docs/TWILIO_TO_MOBILE_MESSAGE_MIGRATION.md`
- **n8n Setup:** `docs/N8N_MOBILE_MESSAGE_SETUP.md`
- **Provider Code:** `lib/sms/providers/mobileMessage.ts`

---

**Last Updated:** December 2024  
**Status:** Production ready
