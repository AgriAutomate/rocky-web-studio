# Comet Browser Assistant Prompts
## Rocky Web Studio - Scaling & Capacity Planning Verification Tasks

**Purpose:** Browser-actionable prompts for Comet (Codeium) to verify subscriptions, check usage limits, and gather capacity planning data  
**Target:** Verify all service subscriptions and document actual limits for capacity planning  
**Prerequisites:** Access to all service dashboards (Vercel, Supabase, Anthropic, Perplexity, etc.)

---

## HOW TO USE THESE PROMPTS

1. **Open Comet Browser Assistant** (Codeium extension in browser)
2. **Copy and paste** each prompt section into Comet
3. **Execute one service at a time** (wait for completion before next)
4. **Document findings** in `docs/scaling/current-subscriptions.md`
5. **Take screenshots** of usage dashboards for reference

**Note:** Some services may require manual login. Have credentials ready or be logged in before starting.

---

## PROMPT SET 1: VERCEL SUBSCRIPTION VERIFICATION

### Prompt 1.1: Navigate to Vercel Dashboard

```
Navigate to vercel.com and log in with my account. Once logged in, click on my profile/account icon in the top right corner, then select "Settings" or "Account Settings" from the dropdown menu. In the settings page, find and click on "Billing" or "Subscription" in the left sidebar. This will show my current plan tier and subscription details.
```

### Prompt 1.2: Document Vercel Plan Details

```
On the Vercel billing/subscription page, I need you to identify and document the following information:
1. Current plan tier (Hobby/Pro/Enterprise)
2. Monthly cost (if visible)
3. Function execution limits (GB-hours/month) - look for "Function Execution" or "Serverless Function" limits
4. Bandwidth limits (GB/month) - look for "Bandwidth" or "Data Transfer" limits
5. Build minutes limits (Minutes/month) - look for "Build Minutes" or "Build Time" limits
6. Team member limits - look for "Team Members" or "Collaborators" count
7. Edge function limits - look for "Edge Functions" or "Edge Requests" limits

Take a screenshot of this page for reference. Then, create a summary of these details in a format I can copy.
```

### Prompt 1.3: Check Vercel Usage Analytics

```
In the Vercel dashboard, navigate to the "Analytics" or "Usage" section (usually in the left sidebar or top navigation). Find the current month's usage statistics. Document:
1. Current function execution usage (GB-hours used vs. limit)
2. Current bandwidth usage (GB used vs. limit)
3. Current build minutes usage (minutes used vs. limit)
4. Any other usage metrics visible

Take a screenshot of the usage dashboard. Calculate the utilization percentage for each metric (used / limit × 100).
```

**✅ CHECKPOINT:** Should have Vercel plan tier, limits, and current usage documented.

---

## PROMPT SET 2: SUPABASE SUBSCRIPTION VERIFICATION

### Prompt 2.1: Navigate to Supabase Dashboard

```
Navigate to supabase.com and log in with my account. Once logged in, select my project from the project list. In the project dashboard, click on "Settings" in the left sidebar, then select "Billing" or "Subscription" from the settings menu.
```

### Prompt 2.2: Document Supabase Plan Details

```
On the Supabase billing/subscription page, identify and document:
1. Current plan tier (Free/Pro/Team/Enterprise)
2. Monthly cost (if visible)
3. Database size limit (GB) - look for "Database Size" or "Database Storage" limit
4. API requests/month limit - look for "API Requests" or "API Calls" limit
5. Bandwidth limit (GB/month) - look for "Bandwidth" or "Data Transfer" limit
6. Auth users limit - look for "Auth Users" or "Active Users" limit
7. Storage limit (GB) - look for "Storage" or "File Storage" limit
8. Database connections limit - look for "Database Connections" or "Connection Pool" limit

Take a screenshot of this page. Create a summary of these details.
```

### Prompt 2.3: Check Supabase Usage

```
In the Supabase project dashboard, navigate to "Usage" or "Statistics" section (usually in the left sidebar). Document the current month's usage:
1. Database size used (GB) vs. limit
2. API requests used vs. limit
3. Bandwidth used (GB) vs. limit
4. Storage used (GB) vs. limit
5. Auth users count vs. limit
6. Database connections used vs. limit

Calculate utilization percentage for each metric. Take a screenshot of the usage dashboard.
```

**✅ CHECKPOINT:** Should have Supabase plan tier, limits, and current usage documented.

---

## PROMPT SET 3: ANTHROPIC (CLAUDE API) VERIFICATION

### Prompt 3.1: Navigate to Anthropic Dashboard

```
Navigate to console.anthropic.com and log in with my account. Once logged in, navigate to the "Billing" or "Usage" section (usually in the left sidebar or top navigation).
```

### Prompt 3.2: Document Anthropic Pricing and Limits

```
On the Anthropic billing/usage page, identify and document:
1. Current pricing tier (Pay-as-you-go/Enterprise)
2. Rate limits:
   - Requests per minute (RPM) - look for "Rate Limits" or "API Limits"
   - Tokens per day (TPD) - look for "Daily Limits" or "Token Limits"
3. Cost per token/request - look for "Pricing" or "Cost" information
4. Current usage:
   - API calls made this month
   - Tokens used this month
   - Monthly cost

Take a screenshot. Create a summary of pricing and limits.
```

**✅ CHECKPOINT:** Should have Anthropic pricing tier, rate limits, and usage documented.

---

## PROMPT SET 4: PERPLEXITY PRO VERIFICATION

### Prompt 4.1: Navigate to Perplexity Dashboard

```
Navigate to perplexity.ai and log in with my account. Once logged in, navigate to "Settings" or "Account" section, then look for "Subscription" or "Billing" information.
```

### Prompt 4.2: Document Perplexity PRO Details

```
On the Perplexity subscription/billing page, verify and document:
1. Current plan: PRO (should be $20/month or $339/year)
2. Daily searches limit: 300 searches/day (CRITICAL LIMIT)
3. Monthly searches: ~9,000 searches/month (300 × 30)
4. Current usage:
   - Searches used today
   - Searches used this month
   - Remaining searches today

Take a screenshot. Note: The 300/day limit is a HARD LIMIT and is the primary bottleneck for scaling.
```

### Prompt 4.3: Check Perplexity Usage History

```
If available in the Perplexity dashboard, navigate to "Usage" or "History" section. Document:
1. Daily usage for the last 7 days
2. Peak usage days
3. Average searches per day
4. Any usage trends

Take a screenshot of the usage history if available.
```

**✅ CHECKPOINT:** Should have Perplexity PRO subscription confirmed with 300/day limit documented.

---

## PROMPT SET 5: OTHER SERVICES VERIFICATION

### Prompt 5.1: Canva Business Verification

```
Navigate to canva.com and log in with my Canva Business account. Go to "Account Settings" or "Billing" section. Document:
1. Current plan: Business (not Teams)
2. Monthly cost
3. Usage limits:
   - Designs created
   - Exports/downloads per month
   - Storage limit (GB)
   - Team member limits (if applicable)
   - API usage limits (if used programmatically)

Take a screenshot of the billing/subscription page.
```

### Prompt 5.2: Email Service Verification (Resend/SendGrid)

```
Navigate to the email service provider dashboard (resend.com or sendgrid.com) and log in. Go to "Billing" or "Settings" section. Document:
1. Current plan tier
2. Monthly cost
3. Email sends per month limit
4. Current usage (emails sent this month)
5. Utilization percentage

Take a screenshot.
```

### Prompt 5.3: SMS Service Verification (Mobile Message/Twilio)

```
Navigate to the SMS service provider dashboard and log in. Go to "Billing" or "Account" section. Document:
1. Current plan tier
2. Monthly cost
3. SMS sends per month limit
4. Current usage (SMS sent this month)
5. Utilization percentage

Take a screenshot.
```

### Prompt 5.4: Stripe Verification

```
Navigate to dashboard.stripe.com and log in. Go to "Settings" > "Billing" or "Account" section. Document:
1. Current plan tier
2. Transaction fees structure
3. Monthly cost (if any fixed fees)
4. Current month transaction volume
5. Any usage limits

Take a screenshot.
```

### Prompt 5.5: Sentry Verification

```
Navigate to sentry.io and log in. Go to "Settings" > "Billing" or "Subscription" section. Document:
1. Current plan tier
2. Monthly cost
3. Events per month limit
4. Current usage (events this month)
5. Utilization percentage

Take a screenshot.
```

**✅ CHECKPOINT:** Should have all service subscriptions verified and documented.

---

## PROMPT SET 6: UPDATE DOCUMENTATION

### Prompt 6.1: Update Current Subscriptions Document

```
Open the file docs/scaling/current-subscriptions.md in my code editor. For each service section (Vercel, Supabase, Anthropic, Perplexity, etc.), replace the placeholder values with the actual values I documented:
- Replace "[Verify]" with actual plan tier
- Replace "[Verify]" with actual monthly cost
- Replace "[Verify]" with actual limit values
- Replace "[Check Dashboard]" with actual current usage
- Update status from "⚠️ Needs Verification" to "✅ Verified" for completed services

Keep the structure and formatting, just update the values.
```

### Prompt 6.2: Update Subscription Limits Matrix

```
Open the file docs/scaling/subscription-limits.md. Update the limits matrix table with the actual values:
- Update "Plan Tier" column with actual tiers
- Update "Limit Value" column with actual limits
- Update "Current Usage" column with actual usage
- Calculate "Utilization %" (Current Usage / Limit Value × 100)
- Update "Status" column to "✅ Verified" for completed services

Keep the table structure, just update the data.
```

### Prompt 6.3: Create Summary Report

```
Create a new markdown file called docs/scaling/subscription-verification-report.md with:
1. Date of verification
2. Summary of all verified subscriptions
3. Key findings (especially Perplexity 300/day limit)
4. Critical limits that need monitoring
5. Recommended next steps

Format it as a clear, concise report.
```

**✅ CHECKPOINT:** Documentation should be updated with actual subscription values.

---

## PROMPT SET 7: SET UP MONITORING ALERTS

### Prompt 7.1: Check Vercel Alert Settings

```
In the Vercel dashboard, navigate to "Settings" > "Notifications" or "Alerts". Check if there are options to set up alerts for:
- Function execution limits (e.g., alert at 80% usage)
- Bandwidth limits
- Build minutes limits

If alerts can be configured, document the process. If not available, note that manual monitoring is required.
```

### Prompt 7.2: Check Supabase Alert Settings

```
In the Supabase dashboard, navigate to "Settings" > "Alerts" or "Notifications". Check if there are options to set up alerts for:
- Database size limits
- API request limits
- Bandwidth limits
- Storage limits

Document the alert configuration options available.
```

### Prompt 7.3: Document Alert Requirements

```
Create a document listing all the alerts that need to be set up:
1. Perplexity: Alert at 200, 250, 290 searches/day (critical)
2. Vercel: Alert at 80% of function execution, bandwidth, build minutes
3. Supabase: Alert at 80% of database size, API requests, storage
4. Anthropic: Alert at 80% of rate limits
5. Other services: Alert at 80% of usage limits

For each alert, specify:
- Threshold (e.g., 80% utilization)
- Alert method (email, SMS, webhook)
- Action required when alert triggers
```

**✅ CHECKPOINT:** Should have alert requirements documented and configured where possible.

---

## QUICK REFERENCE CHECKLIST

### Verification Tasks
- [ ] Vercel plan tier and limits verified
- [ ] Vercel current usage documented
- [ ] Supabase plan tier and limits verified
- [ ] Supabase current usage documented
- [ ] Anthropic pricing and rate limits verified
- [ ] Anthropic current usage documented
- [ ] Perplexity PRO subscription verified (300/day limit confirmed)
- [ ] Perplexity current usage documented
- [ ] Canva Business plan verified
- [ ] Email service plan verified
- [ ] SMS service plan verified
- [ ] Stripe plan verified
- [ ] Sentry plan verified

### Documentation Tasks
- [ ] Updated `current-subscriptions.md` with actual values
- [ ] Updated `subscription-limits.md` with actual values
- [ ] Created verification report
- [ ] Documented alert requirements

### Next Steps
- [ ] Set up Perplexity usage tracking (database migration applied)
- [ ] Integrate Perplexity tracking into API routes
- [ ] Configure alerts for critical limits
- [ ] Create capacity monitoring dashboard

---

## TROUBLESHOOTING

**If Comet can't access a dashboard:**
- Manually log in first, then have Comet navigate
- Some dashboards may require 2FA - handle manually
- Take screenshots manually if Comet can't access

**If limits aren't visible:**
- Check "Billing" or "Subscription" sections
- Look for "Usage" or "Analytics" sections
- Some limits may be in "Settings" > "Limits"
- Contact support if limits aren't documented in dashboard

**If usage data isn't available:**
- Some services show usage in "Analytics" or "Reports" sections
- Check "Billing" > "Usage" or "Invoices" for historical data
- May need to wait for end of billing cycle for accurate data

---

## EXPECTED OUTCOME

After completing all prompts:
1. All service subscriptions verified and documented
2. Actual limits and usage recorded in documentation
3. Capacity planning can proceed with accurate data
4. Monitoring alerts configured where possible
5. Critical bottlenecks identified (especially Perplexity 300/day limit)

---

## NOTES

- **Perplexity 300/day limit is CRITICAL** - This is the primary bottleneck
- Some services may not show all limits in dashboard - may need to check documentation or contact support
- Usage data may vary by billing cycle - document the date of verification
- Take screenshots for reference - they'll be useful for future capacity planning

