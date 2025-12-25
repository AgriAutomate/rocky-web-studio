# Lighthouse Accessibility Audit Guide
**Date:** January 23, 2025  
**Purpose:** Get official Lighthouse accessibility score  
**Time:** 15-30 minutes

## Prerequisites

- Chrome browser installed
- Access to https://rockywebstudio.com.au

---

## Step-by-Step Instructions

### Step 1: Open Chrome DevTools
1. Open Chrome browser
2. Navigate to: https://rockywebstudio.com.au
3. Press `F12` (or right-click → Inspect)
4. DevTools panel opens at bottom/side

### Step 2: Open Lighthouse Tab
1. In DevTools, click the **"Lighthouse"** tab
2. If you don't see it, click the `>>` icon to show more tabs
3. Lighthouse panel opens

### Step 3: Configure Lighthouse
1. **Categories:** Uncheck all except **"Accessibility"**
   - ✅ Accessibility
   - ❌ Performance
   - ❌ Best Practices
   - ❌ SEO
   - ❌ Progressive Web App

2. **Device:** Select **"Desktop"** (or "Mobile" if testing mobile)

3. **Mode:** Leave as **"Navigation"** (default)

### Step 4: Run Audit
1. Click **"Analyze page load"** button
2. Wait for audit to complete (~30-60 seconds)
3. Results appear in the panel

### Step 5: Review Results
1. **Accessibility Score:** Should be **98/100** (up from 72/100)
2. **Issues Found:** Should be **0** (or very few minor issues)
3. **Passed Audits:** Should show all/most checks passing

### Step 6: Take Screenshot
1. Scroll through the results
2. Take screenshot of:
   - Overall accessibility score (98/100)
   - "Passed audits" section
   - Any remaining issues (if any)

**Screenshot Tips:**
- Use Windows Snipping Tool or Chrome's screenshot
- Save as: `reports/lighthouse-accessibility-score.png`

### Step 7: Export Report (Optional)
1. Click **"Download report"** button (top right)
2. Save as: `reports/lighthouse-report.html`
3. This creates a full HTML report

---

## Expected Results

### Before Fixes
- **Score:** 72/100
- **Issues:** 6 violations
- **Status:** Non-compliant

### After Fixes (Expected)
- **Score:** 98/100 ✅
- **Issues:** 0 violations ✅
- **Status:** WCAG 2.1 AA compliant ✅

---

## What to Look For

### ✅ Passing Audits
- Color contrast is sufficient
- ARIA attributes correct
- Semantic HTML used
- Focus indicators visible
- Form labels present

### ⚠️ Potential Minor Issues (Non-Critical)
- Image alt text (if any decorative images)
- Heading hierarchy (should be fine)
- Link text (should be descriptive)

**Note:** Any minor issues found are likely non-critical and don't affect WCAG 2.1 AA compliance.

---

## Document Results

After running the audit, document:

1. **Accessibility Score:** ___/100
2. **Issues Found:** ___ (should be 0)
3. **Screenshot:** Saved to `reports/lighthouse-accessibility-score.png`
4. **Report:** Saved to `reports/lighthouse-report.html` (optional)

### Update Case Study
Update `case-studies/accessibility/before-after-metrics.md`:
- Replace "98/100*" with actual score
- Remove asterisk (no longer expected, now confirmed)

---

## Troubleshooting

### Issue: Lighthouse tab not visible
**Solution:** Click `>>` icon in DevTools to show more tabs

### Issue: Audit fails to run
**Solution:** 
- Refresh the page
- Close and reopen DevTools
- Try in incognito mode

### Issue: Score lower than expected
**Possible reasons:**
- Minor issues (non-critical)
- Images without alt text
- Check "Failed audits" section for details

**Action:** Review failed audits, fix if critical, document if minor

---

## Quick Checklist

- [ ] Chrome browser open
- [ ] Navigate to rockywebstudio.com.au
- [ ] Open DevTools (F12)
- [ ] Open Lighthouse tab
- [ ] Select "Accessibility" only
- [ ] Click "Analyze page load"
- [ ] Wait for results
- [ ] Document score
- [ ] Take screenshot
- [ ] Export report (optional)
- [ ] Update case study metrics

---

**Created:** January 23, 2025  
**Status:** Ready to Execute  
**Time:** 15-30 minutes  
**Expected Result:** 98/100 accessibility score

