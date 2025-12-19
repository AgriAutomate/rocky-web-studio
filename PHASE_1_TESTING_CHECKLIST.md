# Phase 1 Local Testing Checklist

## ✅ Pre-Testing Verification

### Step 1: Dependencies Installed
```bash
npm install
```
**Status:** ✅ Completed - All dependencies up to date

### Step 2: Type Check
```bash
npm run type-check
```
**Status:** ✅ Passed - No TypeScript errors

### Step 3: Build
```bash
npm run build
```
**Status:** ✅ Passed - Build successful, NO Puppeteer errors

**Verified Routes:**
- ✅ `/api/questionnaire/submit` - Loaded successfully
- ✅ `/api/service/lead-submit` - Loaded successfully

---

## 🚀 Step 4: Start Development Server

```bash
npm run dev
```

**Expected:** 
- Server starts at `http://localhost:3000`
- No errors in console
- Routes accessible

**Verify:**
- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Can access `http://localhost:3000/questionnaire`
- [ ] Can access service lead form (if page exists)

---

## 📝 Step 5: Test Questionnaire Submission

### Test Steps:

1. **Navigate to Questionnaire Form**
   - URL: `http://localhost:3000/questionnaire`
   - [ ] Form loads correctly
   - [ ] All fields are visible

2. **Fill All Required Fields**
   - [ ] First Name
   - [ ] Last Name
   - [ ] Business Name
   - [ ] Business Email
   - [ ] Business Phone
   - [ ] Sector (select one)
   - [ ] Employee Count
   - [ ] Pain Points (select at least one)
   - [ ] Other required fields

3. **Submit Form**
   - [ ] Click submit button
   - [ ] Form shows loading state
   - [ ] Success message appears
   - [ ] Form clears (if implemented)

4. **Verify Supabase Database**
   - Go to Supabase Dashboard → Table Editor → `questionnaire_responses`
   - [ ] New row created
   - [ ] `status` = `'submitted'`
   - [ ] All fields populated correctly:
     - [ ] `first_name`
     - [ ] `last_name`
     - [ ] `email`
     - [ ] `phone`
     - [ ] `company_name`
     - [ ] `sector`
     - [ ] `pain_points` (array)
     - [ ] `challenges` (array of IDs)
     - [ ] `utm_source` (if provided)
     - [ ] `utm_campaign` (if provided)

5. **Verify n8n Workflow Execution**
   - Open n8n Dashboard: `http://localhost:5678`
   - Go to **Executions** tab
   - [ ] Find "RWS Questionnaire" workflow execution
   - [ ] Execution status: Success
   - [ ] Check execution data:
     - [ ] `responseId` present
     - [ ] `formData` present
     - [ ] `timestamp` present

6. **Verify Slack Notification**
   - Check Slack workspace
   - Navigate to `#questionnaires` channel
   - [ ] New message appears
   - [ ] Message contains form data
   - [ ] Message formatted correctly

7. **Verify Email (if workflow sends email)**
   - Check email inbox (use test email from form)
   - [ ] Email received
   - [ ] Email contains expected content
   - [ ] Check spam folder if not in inbox

---

## 📋 Step 6: Test Service Lead Submission

### Test Steps:

1. **Navigate to Service Lead Form**
   - URL: Check if form page exists (may need to create test page)
   - Or use: `http://localhost:3000/api/service/lead-submit` (direct API test)
   - [ ] Form loads correctly (if page exists)
   - [ ] All fields are visible

2. **Fill All Required Fields**
   - [ ] First Name
   - [ ] Last Name
   - [ ] Email
   - [ ] Phone
   - [ ] Service Type (optional)
   - [ ] Urgency (optional)
   - [ ] Location (optional)
   - [ ] Description (optional)

3. **Submit Form**
   - [ ] Click submit button
   - [ ] Form shows loading state
   - [ ] Success message appears: "Thank you! We will be in touch shortly."
   - [ ] Response includes `leadId`
   - [ ] Form clears (if implemented)

4. **Verify Supabase Database**
   - Go to Supabase Dashboard → Table Editor → `service_leads`
   - [ ] New row created
   - [ ] `status` = `'new'`
   - [ ] `is_urgent` = `true` if urgency is 'today', else `false`
   - [ ] All fields populated correctly:
     - [ ] `first_name`
     - [ ] `last_name`
     - [ ] `email`
     - [ ] `phone`
     - [ ] `service_type` (if provided)
     - [ ] `urgency` (if provided)
     - [ ] `location` (if provided)
     - [ ] `description` (if provided)

5. **Verify n8n Workflow Execution**
   - Open n8n Dashboard: `http://localhost:5678`
   - Go to **Executions** tab
   - [ ] Find "Service Lead Intake" workflow execution
   - [ ] Execution status: Success
   - [ ] Check execution data:
     - [ ] `leadId` present
     - [ ] `formData` present
     - [ ] `timestamp` present

6. **Verify Slack Notification**
   - Check Slack workspace
   - Navigate to `#leads` channel
   - [ ] New message appears
   - [ ] Message contains lead data
   - [ ] Message formatted correctly

7. **Verify HubSpot Integration**
   - Go to HubSpot Dashboard
   - Navigate to Contacts
   - [ ] New contact created
   - [ ] Contact details match form submission:
     - [ ] First Name
     - [ ] Last Name
     - [ ] Email
     - [ ] Phone
   - [ ] Contact properties populated correctly

---

## ✅ Step 7: End-to-End Verification

### Success Criteria Checklist:

#### Form Submissions
- [ ] Questionnaire form submits without errors
- [ ] Service lead form submits without errors
- [ ] Both forms return success responses
- [ ] Error handling works (test with invalid data)

#### Database Storage
- [ ] Questionnaire data saves to `questionnaire_responses` table
- [ ] Service lead data saves to `service_leads` table
- [ ] All required fields are saved
- [ ] Optional fields save when provided
- [ ] Status fields set correctly

#### n8n Workflow Execution
- [ ] Questionnaire workflow executes (check execution logs)
- [ ] Service lead workflow executes (check execution logs)
- [ ] Workflows receive correct data structure
- [ ] No workflow errors in execution logs

#### Email Delivery
- [ ] Emails arrive (check mailbox)
- [ ] Email content is correct
- [ ] Email formatting is correct
- [ ] Check spam folder if emails missing

#### Slack Notifications
- [ ] Slack notifications appear
- [ ] Notifications in correct channels
- [ ] Notification content is correct
- [ ] Notification formatting is correct

#### HubSpot Integration
- [ ] HubSpot contacts created
- [ ] Contact data is accurate
- [ ] Contact properties mapped correctly

---

## 🔧 Troubleshooting Guide

### If n8n Workflows Don't Trigger:

1. **Check Environment Variables**
   ```bash
   # Verify .env.local has:
   N8N_QUESTIONNAIRE_WEBHOOK_URL=http://localhost:5678/webhook/questionnaire
   N8N_SERVICE_LEAD_WEBHOOK_URL=http://localhost:5678/webhook/service-lead
   ```

2. **Verify n8n is Running**
   ```bash
   docker ps | Select-String "rocky-n8n"
   # Should show running container
   ```

3. **Check n8n Workflow Status**
   - Open n8n: `http://localhost:5678`
   - Go to Workflows
   - [ ] Workflow is "Active" (toggle ON)
   - [ ] Webhook node is configured
   - [ ] Webhook URL matches environment variable

4. **Check n8n Execution Logs**
   - Go to Executions tab
   - Look for failed executions
   - Check error messages
   - Verify webhook received data

5. **Restart Dev Server**
   ```bash
   # Stop dev server (Ctrl+C)
   # Restart:
   npm run dev
   ```

### If Emails Don't Arrive:

1. **Check Resend Dashboard**
   - Go to https://resend.com/emails
   - Check for failed sends
   - Verify API key is active

2. **Verify RESEND_API_KEY**
   ```bash
   # Check .env.local has:
   RESEND_API_KEY=re_...
   ```

3. **Check Email Domain**
   - Verify domain is verified in Resend
   - Check domain status in Resend dashboard

4. **Check Spam Folder**
   - Emails may be filtered to spam
   - Check spam/junk folder

5. **Check n8n Email Node**
   - If using n8n to send emails
   - Verify email node is configured
   - Check SMTP/API credentials

### If Build Fails:

1. **Reinstall Dependencies**
   ```bash
   npm install
   ```

2. **Verify Puppeteer Removed**
   ```bash
   # Check package.json has NO:
   # - puppeteer
   # - puppeteer-core
   # - @sparticuz/chromium
   ```

3. **Check for Puppeteer Imports**
   ```bash
   # Search for any remaining Puppeteer references:
   grep -r "puppeteer" app/ lib/
   # Should return no results
   ```

4. **Run Type Check for Specific Errors**
   ```bash
   npm run type-check
   # Fix any TypeScript errors shown
   ```

5. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run build
   ```

### If Database Saves Fail:

1. **Check Supabase Connection**
   - Verify `SUPABASE_URL` in `.env.local`
   - Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - Test connection in Supabase dashboard

2. **Verify Table Schema**
   - Check `questionnaire_responses` table exists
   - Check `service_leads` table exists
   - Verify columns match expected schema

3. **Check Application Logs**
   - Look for database error messages
   - Check Supabase logs in dashboard
   - Verify RLS policies allow inserts

---

## 📊 Test Results Summary

**Date:** _______________

**Tester:** _______________

### Questionnaire Submission
- [ ] Form loads
- [ ] Submission succeeds
- [ ] Data saves to Supabase
- [ ] n8n workflow executes
- [ ] Slack notification sent
- [ ] Email received (if applicable)

### Service Lead Submission
- [ ] Form loads
- [ ] Submission succeeds
- [ ] Data saves to Supabase
- [ ] n8n workflow executes
- [ ] Slack notification sent
- [ ] HubSpot contact created

### Overall Status
- [ ] All tests passed
- [ ] Ready for production deployment
- [ ] Issues found (see notes below)

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

## 🎯 Next Steps After Testing

1. **Fix Any Issues Found**
   - Document issues in this checklist
   - Create fixes
   - Re-test affected areas

2. **Update Environment Variables**
   - Update Vercel with actual n8n webhook URLs
   - Update production environment variables

3. **Deploy to Production**
   - Push changes to main branch
   - Verify production deployment
   - Test in production environment

4. **Monitor Production**
   - Check application logs
   - Monitor n8n executions
   - Verify email delivery
   - Check Slack notifications
