# Resend DNS Records Quick Reference

Quick reference for DNS records needed to verify `rockywebstudio.com.au` in Resend.

---

## DNS Records to Add

### 1. SPF Record (TXT)

**Purpose:** Authorizes Resend to send emails on your behalf

**Record:**
```
Type: TXT
Name: @ (or leave blank/root domain)
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**Note:** Change `~all` to `-all` for strict enforcement (after testing)

---

### 2. DKIM Records (TXT)

**Purpose:** Email signing for authentication

**Records:** Resend will provide 2-3 DKIM records

**Example Format:**
```
Type: TXT
Name: resend._domainkey (or similar - Resend provides exact name)
Value: [Long string provided by Resend]
TTL: 3600
```

**Important:** Copy exact name and value from Resend dashboard

---

### 3. DMARC Record (TXT)

**Purpose:** Email authentication policy

**Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@rockywebstudio.com.au
TTL: 3600
```

**Policy Options:**
- `p=none` - Monitor only (testing)
- `p=quarantine` - Send to spam if fails (production)
- `p=reject` - Reject if fails (strict)

**Start with `p=none`, then tighten after monitoring.**

---

### 4. MX Record (Optional)

**Purpose:** Bounce handling

**Record:**
```
Type: MX
Name: @ (or leave blank)
Value: feedback-smtp.resend.com
Priority: 10
TTL: 3600
```

**Note:** Only needed if Resend requires it (check Resend dashboard)

---

## Verification Commands

### Check SPF Record
```bash
dig TXT rockywebstudio.com.au | grep spf
# or
nslookup -type=TXT rockywebstudio.com.au
```

### Check DKIM Record
```bash
dig TXT resend._domainkey.rockywebstudio.com.au
# (Use exact name from Resend)
```

### Check DMARC Record
```bash
dig TXT _dmarc.rockywebstudio.com.au
# or
nslookup -type=TXT _dmarc.rockywebstudio.com.au
```

### Check All TXT Records
```bash
dig TXT rockywebstudio.com.au
```

---

## Where to Add Records

### Option 1: CrazyDomains

1. Log in to CrazyDomains
2. Go to **My Domains** → `rockywebstudio.com.au`
3. Click **DNS Management** or **Manage DNS**
4. Add records as shown above
5. Save changes

### Option 2: Vercel (If Managing DNS)

1. Log in to Vercel Dashboard
2. Go to your project → **Settings** → **Domains**
3. Click on `rockywebstudio.com.au`
4. Click **DNS Records** or **Configure DNS**
5. Add records as shown above
6. Save changes

---

## Verification Checklist

After adding DNS records:

- [ ] SPF record added and visible in DNS lookup
- [ ] DKIM records added (check exact names from Resend)
- [ ] DMARC record added
- [ ] MX record added (if required)
- [ ] Wait 5-60 minutes for DNS propagation
- [ ] Verify domain in Resend dashboard
- [ ] Status shows ✅ **Verified**

---

## Troubleshooting

### Records Not Showing Up

**Wait Time:** DNS propagation can take 24-48 hours (usually faster)

**Check:**
1. Verify records saved correctly in DNS panel
2. Use `dig` or `nslookup` to verify records exist
3. Check TTL values (lower = faster propagation)

### Resend Shows "Failed" Verification

**Check:**
1. Copy exact values from Resend dashboard
2. Ensure no extra spaces or quotes
3. Verify record types are correct (TXT, MX)
4. Check record names match exactly

### Emails Still Going to Spam

**After DNS Setup:**
1. Verify SPF includes `include:resend.com`
2. Check DKIM records are correct
3. Add DMARC record (start with `p=none`)
4. Warm up domain (send test emails first)
5. Monitor DMARC reports

---

**Last Updated:** December 2025

