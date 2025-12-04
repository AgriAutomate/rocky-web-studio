# Resend Custom Domain Email Setup Guide

This guide walks through setting up custom domain email sending via Resend for `rockywebstudio.com.au`.

---

## Prerequisites

- ✅ Resend account created
- ✅ Domain `rockywebstudio.com.au` registered with CrazyDomains
- ✅ Access to DNS management (CrazyDomains panel or Vercel if managing DNS)
- ✅ Resend API key (`RESEND_API_KEY` environment variable)

---

## Step 1: Add Domain in Resend

1. **Log in to Resend Dashboard**
   - Go to [resend.com](https://resend.com)
   - Navigate to **Domains** → **Add Domain**

2. **Enter Domain**
   - Domain: `rockywebstudio.com.au`
   - Click **Add Domain**

3. **Resend will provide DNS records**
   - You'll see a list of DNS records to add
   - Keep this page open - you'll need to add these records

---

## Step 2: Add DNS Records

### Option A: Via CrazyDomains (If Managing DNS There)

1. **Log in to CrazyDomains**
   - Go to your domain management panel
   - Navigate to DNS Management for `rockywebstudio.com.au`

2. **Add DNS Records**

   Resend will provide records like these (exact values will differ):

   **SPF Record (TXT):**
   ```
   Type: TXT
   Name: @ (or leave blank)
   Value: v=spf1 include:resend.com ~all
   TTL: 3600
   ```

   **DKIM Records (TXT):**
   ```
   Type: TXT
   Name: resend._domainkey (or similar)
   Value: [Resend will provide this]
   TTL: 3600
   ```

   **DMARC Record (TXT):**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@rockywebstudio.com.au
   TTL: 3600
   ```

   **MX Record (if needed):**
   ```
   Type: MX
   Name: @ (or leave blank)
   Value: feedback-smtp.resend.com
   Priority: 10
   TTL: 3600
   ```

3. **Save DNS Records**
   - Click Save/Update after adding each record
   - DNS propagation can take 24-48 hours (usually faster)

### Option B: Via Vercel (If Managing DNS There)

1. **Log in to Vercel Dashboard**
   - Go to your project settings
   - Navigate to **Domains** → `rockywebstudio.com.au`

2. **Add DNS Records**
   - Click **DNS Records** or **Configure DNS**
   - Add the same records as above
   - Save changes

---

## Step 3: Verify Domain in Resend

1. **Wait for DNS Propagation**
   - Usually takes 5-60 minutes
   - Can check with: `dig TXT rockywebstudio.com.au` or `nslookup -type=TXT rockywebstudio.com.au`

2. **Verify in Resend Dashboard**
   - Go back to Resend → Domains
   - Click **Verify** next to your domain
   - Resend will check DNS records

3. **Verification Status**
   - ✅ **Verified:** All DNS records are correct
   - ⚠️ **Pending:** DNS records not yet propagated (wait and retry)
   - ❌ **Failed:** DNS records incorrect (check values)

---

## Step 4: Create Email Addresses in Resend

1. **Go to Resend Dashboard → Domains**
   - Click on `rockywebstudio.com.au`
   - Navigate to **Email Addresses** or **Senders**

2. **Add Email Addresses**

   **Primary Address:**
   - Email: `bookings@rockywebstudio.com.au`
   - Display Name: `Rocky Web Studio`
   - Click **Add** or **Create**

   **Additional Addresses (Optional):**
   - `music@rockywebstudio.com.au` - For custom song orders
   - `hello@rockywebstudio.com.au` - For general inquiries
   - `notifications@rockywebstudio.com.au` - For admin notifications

3. **Verify Email Addresses**
   - Resend may require email verification
   - Check your email inbox for verification link
   - Click link to verify

---

## Step 5: Test Email Sending

### Using Test Endpoint

**Endpoint:** `POST /api/test/send-email`

**Request:**
```json
{
  "to": "your-email@example.com",
  "template": "booking"
}
```

**Verify:**
- ✅ Email received
- ✅ From address shows: `bookings@rockywebstudio.com.au`
- ✅ Email not in spam folder
- ✅ Links work correctly

### Using Resend Dashboard

1. **Go to Resend Dashboard → Emails → Send Test**
2. **Enter Details:**
   - From: `bookings@rockywebstudio.com.au`
   - To: Your test email
   - Subject: Test Email
   - Body: Test message
3. **Send and Verify**

---

## Step 6: Update Code Configuration

Email addresses are configured in `lib/email/config.ts`:

```typescript
export const EMAIL_CONFIG = {
  from: {
    bookings: "Rocky Web Studio <bookings@rockywebstudio.com.au>",
    music: "Rocky Web Studio <music@rockywebstudio.com.au>",
    notifications: "Rocky Web Studio <notifications@rockywebstudio.com.au>",
    hello: "Rocky Web Studio <hello@rockywebstudio.com.au>",
  },
  replyTo: {
    bookings: "bookings@rockywebstudio.com.au",
    music: "music@rockywebstudio.com.au",
    hello: "hello@rockywebstudio.com.au",
  },
};
```

All email sending code uses these centralized addresses.

---

## DNS Records Reference

### Required Records

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | @ | `v=spf1 include:resend.com ~all` | SPF authentication |
| TXT | `resend._domainkey` | [Resend provides] | DKIM signing |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@rockywebstudio.com.au` | DMARC policy |
| MX | @ | `feedback-smtp.resend.com` (Priority 10) | Bounce handling |

### Verification Commands

**Check SPF:**
```bash
dig TXT rockywebstudio.com.au | grep spf
```

**Check DKIM:**
```bash
dig TXT resend._domainkey.rockywebstudio.com.au
```

**Check DMARC:**
```bash
dig TXT _dmarc.rockywebstudio.com.au
```

---

## Troubleshooting

### Domain Not Verifying

**Symptoms:** Resend shows "Pending" or "Failed" verification

**Solutions:**
1. **Check DNS Propagation:**
   - Use `dig` or `nslookup` to verify records exist
   - Wait 24-48 hours for full propagation

2. **Verify Record Values:**
   - Copy exact values from Resend dashboard
   - Ensure no extra spaces or quotes
   - Check TTL is reasonable (3600 seconds)

3. **Check Record Types:**
   - SPF: Must be TXT record
   - DKIM: Must be TXT record with correct name
   - DMARC: Must be TXT record named `_dmarc`

### Emails Going to Spam

**Symptoms:** Emails delivered but in spam folder

**Solutions:**
1. **Verify SPF Record:**
   - Ensure SPF includes `include:resend.com`
   - Check SPF record is correct

2. **Verify DKIM:**
   - Ensure DKIM records are added correctly
   - Resend signs emails with DKIM automatically

3. **Check DMARC:**
   - Add DMARC record (start with `p=none` for testing)
   - Monitor DMARC reports

4. **Warm Up Domain:**
   - Send test emails to yourself first
   - Gradually increase volume
   - Avoid sending to spam traps

### Email Address Not Verified

**Symptoms:** Cannot send from email address

**Solutions:**
1. **Check Verification Status:**
   - Go to Resend → Domains → Email Addresses
   - Verify status shows "Verified"

2. **Resend Verification Email:**
   - Click "Resend Verification" if available
   - Check spam folder for verification email

3. **Manual Verification:**
   - Some addresses may require manual approval
   - Contact Resend support if needed

---

## Email Deliverability Best Practices

### 1. SPF Record

**Current:** `v=spf1 include:resend.com ~all`

**Explanation:**
- `v=spf1` - SPF version 1
- `include:resend.com` - Allow Resend to send on your behalf
- `~all` - Soft fail for other senders (testing)
- Change to `-all` for hard fail (production)

### 2. DKIM Signing

**Automatic:** Resend signs all emails with DKIM automatically

**Verification:**
- Check email headers for `DKIM-Signature`
- Verify signature is valid

### 3. DMARC Policy

**Testing:** `v=DMARC1; p=none; rua=mailto:dmarc@rockywebstudio.com.au`

**Production:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@rockywebstudio.com.au`

**Strict:** `v=DMARC1; p=reject; rua=mailto:dmarc@rockywebstudio.com.au`

**Start with `p=none`, monitor reports, then tighten policy.**

### 4. Email Content

- ✅ Use clear subject lines
- ✅ Include unsubscribe link
- ✅ Avoid spam trigger words
- ✅ Use proper HTML structure
- ✅ Include plain text version

---

## Monitoring & Maintenance

### Check Email Status

1. **Resend Dashboard → Emails**
   - View sent emails
   - Check delivery status
   - Monitor bounce rates

2. **Resend Dashboard → Domains**
   - Check domain verification status
   - View DNS record status
   - Monitor reputation

### DMARC Reports

1. **Set up DMARC Email:**
   - Create `dmarc@rockywebstudio.com.au` email
   - Forward to monitoring service (optional)

2. **Review Reports:**
   - Check for unauthorized senders
   - Monitor authentication rates
   - Adjust DMARC policy as needed

---

## Next Steps

1. ✅ **Domain Added:** Complete
2. ✅ **DNS Records Added:** Complete
3. ✅ **Domain Verified:** Complete
4. ✅ **Email Addresses Created:** Complete
5. ⏳ **Test Email Sent:** Send test email
6. ⏳ **Code Updated:** Use centralized email config
7. ⏳ **Monitor Deliverability:** Check spam rates

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

