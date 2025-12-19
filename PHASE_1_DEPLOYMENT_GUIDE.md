# Phase 1 Production Deployment Guide

## 🎯 Deployment Checklist

### Prerequisites Verification

Before deploying, verify:

- [x] All local tests passing
- [x] `npm run build` succeeds
- [x] `npm run type-check` passes
- [x] No Puppeteer dependencies in `package.json`
- [x] No Puppeteer imports in codebase
- [x] Environment variables documented

**Status:** ✅ All prerequisites met

---

## 📦 Step 1: Commit Changes to Git

### Review Changes
```bash
git status
```

### Stage All Changes
```bash
git add .
```

### Commit with Descriptive Message
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

**Expected Output:**
```
[main abc1234] chore: migrate questionnaire to n8n, add service lead intake, remove Puppeteer
 X files changed, Y insertions(+), Z deletions(-)
```

---

## 🚀 Step 2: Push to Main Branch

### Push Changes
```bash
git push origin main
```

**Expected Behavior:**
- Vercel will automatically detect the push
- Deployment will start automatically
- Watch Vercel dashboard for deployment progress

**Monitor Deployment:**
- Go to: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/deployments
- Watch for new deployment to appear
- Check build logs in real-time

---

## ✅ Step 3: Verify Build Succeeds

### Check Vercel Dashboard

1. **Navigate to Deployments**
   - URL: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/deployments
   - Find the latest deployment (should be in progress or just completed)

2. **Check Build Status**
   - [ ] Status shows "Building" → "Ready"
   - [ ] No red error indicators
   - [ ] Build completes successfully

3. **Review Build Logs**
   - Click on deployment → "Build Logs"
   - Look for: `✓ Compiled successfully`
   - Look for: `✓ Generating static pages`
   - **Verify:** NO Puppeteer errors
   - **Verify:** Routes loaded:
     - `[Questionnaire] API route module for /api/questionnaire/submit loaded`
     - `[SERVICE_LEAD] API route module for /api/service/lead-submit loaded`

4. **Check for Errors**
   - [ ] No TypeScript errors
   - [ ] No build failures
   - [ ] No missing dependencies
   - [ ] No Puppeteer-related errors

**If Build Fails:**
- Review error logs
- Fix issues locally
- Commit and push again
- See Troubleshooting section below

---

## 🔐 Step 4: Set Environment Variables in Vercel

### Navigate to Environment Variables

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/settings/environment-variables

2. **Add n8n Webhook Variables**

   **Variable 1: N8N_QUESTIONNAIRE_WEBHOOK_URL**
   ```
   Name: N8N_QUESTIONNAIRE_WEBHOOK_URL
   Value: [Your actual n8n webhook URL]
   Environments: Production, Preview, Development
   ```

   **Variable 2: N8N_SERVICE_LEAD_WEBHOOK_URL**
   ```
   Name: N8N_SERVICE_LEAD_WEBHOOK_URL
   Value: [Your actual n8n webhook URL]
   Environments: Production, Preview, Development
   ```

   **Variable 3: N8N_LEAD_SCORING_WEBHOOK_URL**
   ```
   Name: N8N_LEAD_SCORING_WEBHOOK_URL
   Value: [Your actual n8n webhook URL]
   Environments: Production, Preview, Development
   ```

   **Variable 4: N8N_NURTURE_WEBHOOK_URL**
   ```
   Name: N8N_NURTURE_WEBHOOK_URL
   Value: [Your actual n8n webhook URL]
   Environments: Production, Preview, Development
   ```

3. **Verify Existing Variables**
   - [ ] `SUPABASE_URL` is set
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
   - [ ] `RESEND_API_KEY` is set
   - [ ] `NEXT_PUBLIC_URL` is set to production URL

4. **Save All Variables**
   - Click "Save" after adding each variable
   - Verify all variables appear in the list

**Note:** If you don't have actual n8n webhook URLs yet, use placeholder URLs. You can update them later after deploying n8n workflows.

---

## 🔄 Step 5: Redeploy After Environment Variables

### Trigger Redeployment

1. **Go to Deployments Tab**
   - URL: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/deployments

2. **Redeploy Latest**
   - Click on the latest deployment
   - Click "Redeploy" button (three dots menu)
   - Confirm redeployment

3. **Wait for Build**
   - Monitor build progress
   - Verify build succeeds
   - Check that environment variables are loaded

**Alternative:** Push an empty commit to trigger redeploy:
```bash
git commit --allow-empty -m "chore: trigger redeploy with new env vars"
git push origin main
```

---

## 🧪 Step 6: Test Production

### Test Questionnaire Submission

1. **Navigate to Production Site**
   - URL: https://rockywebstudio.com.au/questionnaire

2. **Fill and Submit Form**
   - [ ] Form loads correctly
   - [ ] Fill all required fields
   - [ ] Submit form
   - [ ] Success message appears

3. **Verify Database**
   - Go to Supabase Dashboard
   - Table: `questionnaire_responses`
   - [ ] New row created
   - [ ] `status` = `'submitted'`
   - [ ] All fields populated correctly

4. **Verify n8n Workflow**
   - Go to n8n Dashboard
   - Executions tab
   - [ ] "RWS Questionnaire" workflow executed
   - [ ] Execution status: Success
   - [ ] Data received correctly

5. **Verify Email**
   - Check email inbox
   - [ ] Confirmation email received
   - [ ] Email content is correct
   - [ ] Check spam folder if missing

6. **Verify Slack**
   - Check Slack workspace
   - Channel: `#questionnaires`
   - [ ] Notification posted
   - [ ] Message content is correct

### Test Service Lead Submission

1. **Navigate to Service Lead Form**
   - URL: Check if form page exists
   - Or use API directly for testing

2. **Submit Test Lead**
   - [ ] Form submits successfully
   - [ ] Success response received
   - [ ] Response includes `leadId`

3. **Verify Database**
   - Go to Supabase Dashboard
   - Table: `service_leads`
   - [ ] New row created
   - [ ] `status` = `'new'`
   - [ ] All fields populated correctly

4. **Verify n8n Workflow**
   - Go to n8n Dashboard
   - Executions tab
   - [ ] "Service Lead Intake" workflow executed
   - [ ] Execution status: Success

5. **Verify Slack**
   - Check Slack workspace
   - Channel: `#leads`
   - [ ] Notification posted

6. **Verify HubSpot** (if configured)
   - Go to HubSpot Dashboard
   - Contacts section
   - [ ] New contact created
   - [ ] Contact data is accurate

---

## ✅ Success Criteria

### Build & Deployment
- [ ] Vercel build succeeded
- [ ] No build errors in logs
- [ ] No Puppeteer-related errors
- [ ] All routes compiled successfully

### Environment Variables
- [ ] All n8n webhook URLs set
- [ ] Existing variables still set
- [ ] Variables available in production

### Functionality
- [ ] Production forms submit successfully
- [ ] Data saves to Supabase correctly
- [ ] n8n workflows trigger
- [ ] Emails arrive
- [ ] Slack notifications work
- [ ] HubSpot integration works (if configured)

### Performance
- [ ] Page load times acceptable
- [ ] Form submissions are fast
- [ ] No timeout errors

---

## 🔄 Rollback Procedure

If deployment fails or issues are found:

### Quick Rollback

1. **Go to Vercel Deployments**
   - URL: https://vercel.com/martinc343-3347s-projects/rocky-web-studio/deployments

2. **Find Previous Working Deployment**
   - Look for last known good deployment
   - Check deployment timestamp
   - Verify it was working

3. **Redeploy Previous Version**
   - Click on previous deployment
   - Click "Redeploy" (three dots menu)
   - Confirm redeployment

4. **Verify Rollback**
   - Check site is working
   - Test critical functionality
   - Monitor for issues

### Alternative: Git Revert

If you need to revert code changes:

```bash
# Find the commit hash to revert to
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build fails with errors

**Solutions:**
1. Check build logs for specific error
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors: `npm run type-check`
4. Verify no Puppeteer imports remain
5. Clear Vercel build cache (Settings → General → Clear Build Cache)

### Environment Variables Not Loading

**Issue:** Environment variables not available in production

**Solutions:**
1. Verify variables are set for "Production" environment
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)
4. Verify no typos in variable names

### Forms Not Submitting

**Issue:** Forms fail to submit in production

**Solutions:**
1. Check browser console for errors
2. Check Vercel function logs
3. Verify API routes are deployed
4. Check Supabase connection
5. Verify environment variables are set

### n8n Workflows Not Triggering

**Issue:** Workflows don't execute

**Solutions:**
1. Verify webhook URLs are correct
2. Check n8n workflow is "Active"
3. Verify webhook URL in n8n matches environment variable
4. Check n8n execution logs for errors
5. Verify n8n instance is accessible from Vercel

### Database Errors

**Issue:** Data not saving to Supabase

**Solutions:**
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check Supabase table schema matches code
4. Verify RLS policies allow inserts
5. Check Supabase logs for errors

---

## 📊 Post-Deployment Monitoring

### Monitor for 24 Hours

1. **Check Vercel Logs**
   - Monitor function logs
   - Watch for errors
   - Check response times

2. **Monitor Supabase**
   - Check database inserts
   - Monitor query performance
   - Watch for errors

3. **Monitor n8n**
   - Check workflow executions
   - Watch for failures
   - Monitor execution times

4. **Monitor Email Delivery**
   - Check Resend dashboard
   - Monitor delivery rates
   - Watch for bounces

5. **Monitor Slack**
   - Verify notifications arrive
   - Check message formatting
   - Watch for missing notifications

---

## 📝 Deployment Log

**Date:** _______________

**Deployed By:** _______________

**Git Commit:** _______________

**Build Status:** [ ] Success [ ] Failed

**Environment Variables Added:**
- [ ] N8N_QUESTIONNAIRE_WEBHOOK_URL
- [ ] N8N_SERVICE_LEAD_WEBHOOK_URL
- [ ] N8N_LEAD_SCORING_WEBHOOK_URL
- [ ] N8N_NURTURE_WEBHOOK_URL

**Tests Performed:**
- [ ] Questionnaire submission
- [ ] Service lead submission
- [ ] Database verification
- [ ] n8n workflow execution
- [ ] Email delivery
- [ ] Slack notifications

**Issues Found:**
_________________________________________________
_________________________________________________

**Resolution:**
_________________________________________________
_________________________________________________

**Status:** [ ] Production Ready [ ] Needs Fixes

---

## 🎉 Deployment Complete!

Once all success criteria are met:

1. ✅ Document deployment in this log
2. ✅ Notify team of successful deployment
3. ✅ Monitor production for 24 hours
4. ✅ Update project documentation
5. ✅ Celebrate! 🎊
