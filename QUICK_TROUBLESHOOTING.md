# 🚨 QUICK TROUBLESHOOTING CARD - PDF & EMAIL FAILURES

**Use this when something isn't working. Start here, then reference `PDF_GENERATION_DEBUG_INFO.md` for details.**

---

## 🎯 IMMEDIATE DIAGNOSIS (2 minutes)

### Step 1: Look at Console Logs

```
✅ See "Starting PDF generation"?
   YES → Continue to Step 2
   NO  → Go to ISSUE A below

✅ See "Email sent successfully"?
   YES → Check email inbox (5 minute wait)
   NO  → Go to ISSUE B below
```

---

## 🔴 ISSUE A: No PDF Generation Logs

**Symptom:** Console shows nothing or error immediately

### Quick Fixes (Try in order):

#### 1. Check Chrome path is set
```bash
# Windows PowerShell
echo $env:CHROME_EXECUTABLE_PATH

# Windows CMD
echo %CHROME_EXECUTABLE_PATH%

# Mac/Linux
echo $CHROME_EXECUTABLE_PATH
```

**If empty, set it in `.env.local`:**

```bash
# Windows Chrome:
CHROME_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

# Windows Edge:
CHROME_EXECUTABLE_PATH="C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"

# Mac Chrome:
CHROME_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Linux Chrome:
CHROME_EXECUTABLE_PATH="/usr/bin/google-chrome"
```

#### 2. Close all Chrome instances
```bash
# Windows
taskkill /F /IM chrome.exe
taskkill /F /IM msedge.exe

# Mac
killall "Google Chrome"
killall "Microsoft Edge"

# Linux
pkill chrome
pkill chromium
```

#### 3. Restart dev server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

#### 4. Resubmit form
- Go to `http://localhost:3000/questionnaire`
- Fill out and submit
- Check console again for PDF logs

**If still failing:**
→ Jump to **SECTION A** in `PDF_GENERATION_DEBUG_INFO.md` (step-by-step guide)

---

## 🔴 ISSUE B: PDF Generated But Email Failed

**Symptom:** Logs show "PDF buffer generated" but not "Email sent successfully"

### Quick Checks:

#### Check 1: Is RESEND_API_KEY set?
```bash
# Windows PowerShell
echo $env:RESEND_API_KEY

# Windows CMD
echo %RESEND_API_KEY%

# Mac/Linux
echo $RESEND_API_KEY
```

**If empty:**
1. Get new key from https://resend.com/api-keys
2. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

#### Check 2: Is sender email verified?
1. Log in to https://resend.com
2. Go to "Domains" section
3. Email must be verified domain OR use `test@resend.dev` for testing

#### Check 3: Restart with new key
```bash
npm run dev
```

#### Check 4: Resubmit form
- Watch for "Email sent successfully" message
- Check logs for Resend errors

**If still failing:**
→ Jump to **SECTION B** in `PDF_GENERATION_DEBUG_INFO.md` (step-by-step guide)

---

## 🟡 ISSUE C: PDF Generates & Email Sends But No Attachment

**Symptom:** Email arrives but PDF not attached

### Quick Checks:

#### Check 1: Look for attachment logs
```
Should see: "Email options prepared with PDF attachment"
```

#### Check 2: Add debug logging
Edit `app/api/questionnaire/submit/route.ts` around line 200:

```typescript
// Add these lines after pdfBase64 is created
console.log("[DEBUG] pdfBase64 length:", pdfBase64?.length);
console.log("[DEBUG] pdfBase64 type:", typeof pdfBase64);
console.log("[DEBUG] PDF attachment:", {
  filename: "RockyWebStudio-Deep-Dive-Report.pdf",
  contentType: "application/pdf",
  hasContent: !!pdfBase64
});
```

Then:
```bash
npm run dev
# Resubmit form
```

**If `pdfBase64` is 0 or undefined:**
→ **SECTION B** in `PDF_GENERATION_DEBUG_INFO.md`

---

## 🟡 ISSUE D: PDF Has Content But Images Missing

**Symptom:** PDF generated, email arrives, but logos/images blank

### Quick Checks:

#### Check 1: Files exist
```bash
# Windows PowerShell
Test-Path public/images/rws-logo-transparent.png
Test-Path public/images/avob-logo-transparent.png

# Mac/Linux
ls public/images/rws-logo-transparent.png
ls public/images/avob-logo-transparent.png
```

#### Check 2: Can browser load them?
Open in browser:
- http://localhost:3000/images/rws-logo-transparent.png
- http://localhost:3000/images/avob-logo-transparent.png

**Should see images, not 404**

#### Check 3: Is NEXT_PUBLIC_URL set?
```bash
# Windows PowerShell
echo $env:NEXT_PUBLIC_URL

# Windows CMD
echo %NEXT_PUBLIC_URL%

# Mac/Linux
echo $NEXT_PUBLIC_URL
```

**Add to `.env.local` if missing:**
```bash
# Development
NEXT_PUBLIC_URL=http://localhost:3000

# Production (Vercel)
NEXT_PUBLIC_URL=https://rockywebstudio.com.au
```

Then:
```bash
npm run dev
# Resubmit form
```

**If still missing:**
→ Jump to **SECTION C** in `PDF_GENERATION_DEBUG_INFO.md` (for more details)

---

## ✅ SUCCESS CHECKLIST

After any fix, verify:

- [ ] Console shows all 7 log messages in order (see below)
- [ ] Email arrives within 5 seconds
- [ ] Email has PDF attachment
- [ ] PDF opens without errors
- [ ] PDF shows content (not blank)
- [ ] PDF has logos/images visible
- [ ] Supabase record created (check dashboard)

---

## 🌐 PRODUCTION (VERCEL) QUICK FIXES

**If works locally but not on Vercel:**

### 1. Check Vercel logs
```bash
vercel logs --follow
```

Or in Vercel dashboard:
- Go to your project → "Deployments" → Click latest deployment → "Functions" tab

### 2. Set missing env vars in Vercel dashboard
1. Go to https://vercel.com → Your Project → Settings → Environment Variables
2. Add or update:
   ```
   RESEND_API_KEY=re_xxx...
   NEXT_PUBLIC_URL=https://rockywebstudio.com.au
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   SUPABASE_URL=https://xxx.supabase.co
   ```

### 3. Check image URLs work
Open in browser:
- https://rockywebstudio.com.au/images/rws-logo-transparent.png
- https://rockywebstudio.com.au/images/avob-logo-transparent.png

**Should see images, not 404**

### 4. Redeploy
```bash
vercel --prod
```

Or push to main branch (auto-deploys)

### 5. Test again on production URL
- Go to https://rockywebstudio.com.au/questionnaire
- Submit form
- Check Vercel function logs

---

## 🔍 LOG LINES TO SEARCH FOR

### Success signs (should see all):

```
[INFO] Starting PDF generation
[INFO] Calling generatePdfReport
[INFO] generatePdfReport returned
[INFO] PDF buffer generated
[INFO] PDF converted to base64 successfully
[INFO] Email options prepared with PDF attachment
[INFO] Email sent successfully with PDF attachment
```

### Error signs (if you see these):

```
❌ CHROME_EXECUTABLE_PATH not set → Issue A
❌ Failed to launch browser → Issue A
❌ Timeout waiting for page.pdf → Issue A
❌ Failed to read PDF template → Issue A
❌ Resend email send failed → Issue B
❌ pdfBase64 empty or undefined → Issue C
❌ Failed to load image → Issue D
❌ PDF generation timeout after 25 seconds → Issue A
```

---

## ⚡ NUCLEAR OPTIONS (Last resort)

### Clear everything and rebuild
```bash
# Stop dev server first (Ctrl+C)

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev

# Mac/Linux
rm -rf node_modules .next
npm install
npm run dev
```

Then resubmit form and check logs

---

## 📞 WHAT INFO TO COLLECT IF STUCK

**Copy when asking for help:**

```
1. Full console output from form submission:
   [paste all logs starting with "Starting PDF generation"]

2. Error message (exact):
   [paste complete error]

3. Environment variables set:
   CHROME_EXECUTABLE_PATH: [SET/NOT SET]
   RESEND_API_KEY: [SET/NOT SET]
   NEXT_PUBLIC_URL: [SET/NOT SET]
   SUPABASE_SERVICE_ROLE_KEY: [SET/NOT SET]
   NODE_ENV: [development/production]

4. OS and Chrome version:
   OS: [Windows/Mac/Linux + version]
   Chrome: [version - check chrome://version]

5. Where are you testing?
   [ ] Local dev server
   [ ] Vercel production
   [ ] Both

6. What step fails?
   [ ] PDF generation
   [ ] Email sending
   [ ] PDF attachment
   [ ] Images loading
```

**This takes 90 seconds to collect but saves 30 minutes of debugging.**

---

## 🎯 MOST COMMON FIXES (95% of issues)

| Issue | Fix | Time |
|-------|-----|------|
| No PDF logs | Set `CHROME_EXECUTABLE_PATH` in `.env.local` | 2 min |
| Email not sending | Check `RESEND_API_KEY` valid | 2 min |
| PDF not attaching | Restart dev server | 1 min |
| Images missing | Add `NEXT_PUBLIC_URL` to `.env.local` | 2 min |
| Works local, not prod | Set Vercel env vars | 3 min |
| Random failures | Close Chrome tabs | 1 min |
| Timeout errors | Increase timeout or check Chrome path | 2 min |

---

## 📚 NEXT: DETAILED DEBUGGING

**After quick fixes, if still stuck:**

→ Open `PDF_GENERATION_DEBUG_INFO.md`

It has:
- ✅ Complete step-by-step sections (A, B, C, D)
- ✅ All error messages explained
- ✅ 20+ specific solutions
- ✅ Code examples
- ✅ Production troubleshooting
- ✅ File structure and connections
- ✅ Environment variable details

---

## 🆘 EMERGENCY CONTACTS

**If nothing works:**

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Check Resend Status:** https://status.resend.com
3. **Check Supabase Status:** https://status.supabase.com

**Common external issues:**
- Vercel function timeout (25s limit)
- Resend API rate limits
- Supabase connection issues

---

## 💡 PRO TIPS

1. **Always restart dev server after changing `.env.local`**
2. **Close all Chrome instances before testing PDF generation**
3. **Use `DEBUG_PDF="true"` to write PDF to disk for inspection**
4. **Check browser console AND terminal logs (both have info)**
5. **Test with simple form data first (fewer fields = faster)**
6. **Production logs are in Vercel dashboard, not terminal**

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0
