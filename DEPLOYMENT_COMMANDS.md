# Phase 1 Deployment Commands

## Quick Deployment Steps

### 1. Stage All Changes
```bash
git add .
```

### 2. Commit Changes
```bash
git commit -m "chore: migrate questionnaire to n8n, add service lead intake, remove Puppeteer

- Remove Puppeteer dependencies and PDF generation code
- Simplify questionnaire submission API route
- Add service lead submission API route
- Create ServiceLeadForm component
- Add service_leads database schema
- Update environment variables for n8n integration
- Remove deprecated PDF generation files"
```

### 3. Push to Main (triggers Vercel auto-deploy)
```bash
git push origin main
```

---

## Files Changed Summary

### Modified Files (14)
- `.env.local.example` - Added n8n webhook variables
- `VERCEL_ENV_VARIABLES.md` - Updated with n8n variables
- `app/api/questionnaire/submit/route.ts` - Simplified, removed PDF logic
- `app/page.tsx` - (existing changes)
- `app/questionnaire/submit/route.ts` - Updated to use new function signature
- `docs/ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md` - Added n8n variables
- `lib/utils.ts` - (existing changes)
- `lib/utils/supabase-client.ts` - Added storeServiceLead function
- `package-lock.json` - Removed Puppeteer dependencies
- `package.json` - Removed Puppeteer dependencies
- `postcss.config.mjs` - (existing changes)
- `scripts/compare_deploy.py` - (existing changes)
- `scripts/diagnose-route-error.js` - Removed PDF test
- `scripts/test-imports.js` - Removed PDF test

### Deleted Files (2)
- `lib/pdf/generateClientReport.ts` - Removed (Puppeteer code)
- `lib/pdf/templates/reportTemplate.html` - Removed (PDF template)

### New Files (7)
- `PHASE_1_DEPLOYMENT_GUIDE.md` - Deployment documentation
- `PHASE_1_QUICK_START.md` - Quick start guide
- `PHASE_1_TESTING_CHECKLIST.md` - Testing checklist
- `app/api/service/lead-submit/route.ts` - New service lead API
- `components/ServiceLeadForm.tsx` - New form component
- `database/schema/service_leads.sql` - Database schema
- `docs/N8N_ENVIRONMENT_VARIABLES_SETUP.md` - n8n setup guide

---

## Pre-Deployment Checklist

Before running the commands above, verify:

- [x] `npm run type-check` passes
- [x] `npm run build` succeeds
- [x] No Puppeteer dependencies in `package.json`
- [x] All tests pass locally
- [ ] Environment variables documented
- [ ] Ready to deploy

---

## After Push - Monitor Deployment

1. **Watch Vercel Dashboard**
   - URL: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/deployments
   - Wait for deployment to appear
   - Monitor build progress

2. **Verify Build Success**
   - Check for "Ready" status
   - Review build logs
   - Verify no errors

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add n8n webhook URLs
   - Redeploy

4. **Test Production**
   - Test questionnaire form
   - Test service lead form
   - Verify all integrations work

---

## Rollback Command (if needed)

```bash
# Find previous commit
git log --oneline -5

# Revert to previous commit (replace COMMIT_HASH)
git revert COMMIT_HASH
git push origin main
```

Or use Vercel dashboard to redeploy previous version.
