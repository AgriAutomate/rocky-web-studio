# Phase 1 Quick Start Guide

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```
**Status:** ✅ Already completed

### 2. Verify Build
```bash
npm run type-check && npm run build
```
**Status:** ✅ Both passed - Ready to test

### 3. Start Development Server
```bash
npm run dev
```
**Expected:** Server running at `http://localhost:3000`

### 4. Start n8n (in separate terminal)
```powershell
.\start-n8n.ps1
```
**Expected:** n8n running at `http://localhost:5678`
- Username: `admin`
- Password: `27ParkAvenue`

---

## 🧪 Quick Test URLs

### Questionnaire Form
- **Page:** `http://localhost:3000/questionnaire`
- **API:** `POST http://localhost:3000/api/questionnaire/submit`

### Service Lead Form
- **API:** `POST http://localhost:3000/api/service/lead-submit`
- **Note:** May need to create a test page or use API directly

---

## ✅ Pre-Flight Checklist

Before testing, verify:

- [ ] Dependencies installed (`npm install` completed)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No Puppeteer errors in build
- [ ] `.env.local` has required variables:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY` (if testing emails)
  - [ ] `N8N_QUESTIONNAIRE_WEBHOOK_URL` (optional, for webhook testing)
  - [ ] `N8N_SERVICE_LEAD_WEBHOOK_URL` (optional, for webhook testing)
- [ ] Docker Desktop is running (for n8n)
- [ ] n8n container is running (`docker ps` shows `rocky-n8n`)

---

## 📋 Testing Checklist

See `PHASE_1_TESTING_CHECKLIST.md` for detailed testing steps.

### Quick Test Flow:

1. **Start Services**
   ```bash
   # Terminal 1: Dev server
   npm run dev
   
   # Terminal 2: n8n
   .\start-n8n.ps1
   ```

2. **Test Questionnaire**
   - Navigate to: `http://localhost:3000/questionnaire`
   - Fill form and submit
   - Check Supabase: `questionnaire_responses` table
   - Check n8n: Executions tab

3. **Test Service Lead**
   - Use API directly or create test page
   - Submit test data
   - Check Supabase: `service_leads` table
   - Check n8n: Executions tab

---

## 🔍 Verification Points

### Database Verification
- Supabase Dashboard → Table Editor
- Check `questionnaire_responses` table
- Check `service_leads` table

### n8n Verification
- Dashboard: `http://localhost:5678`
- Workflows tab: Verify workflows are "Active"
- Executions tab: Check for new executions

### API Verification
- Check browser Network tab for API calls
- Verify response status: `200 OK`
- Verify response body: `{ success: true, ... }`

---

## 🐛 Common Issues

### "Cannot find module" errors
```bash
npm install
```

### Build fails with Puppeteer errors
- Verify `package.json` has no puppeteer dependencies
- Check for any remaining Puppeteer imports
- Clear `.next` cache: `rm -rf .next`

### n8n not accessible
- Check Docker is running: `docker ps`
- Check container is running: `docker ps | Select-String "rocky-n8n"`
- Restart n8n: `docker restart rocky-n8n`

### Webhooks not triggering
- Verify `.env.local` has webhook URLs
- Check n8n workflow is "Active"
- Verify webhook URL in n8n matches environment variable
- Restart dev server after changing `.env.local`

---

## 📚 Full Documentation

- **Testing Checklist:** `PHASE_1_TESTING_CHECKLIST.md`
- **n8n Setup:** `docs/n8n-workflow-setup-instructions.md`
- **Environment Variables:** `docs/N8N_ENVIRONMENT_VARIABLES_SETUP.md`
