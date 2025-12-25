# Post-Deployment Verification Guide
**Date:** January 23, 2025  
**Purpose:** Verify accessibility fixes after deployment  
**Status:** Ready for Execution

## Quick Verification (5 minutes)

### 1. Visual Check
Visit: https://rockywebstudio.com.au

**Check:**
- [ ] Homepage loads without errors
- [ ] Primary buttons are darker teal (not light teal)
- [ ] Hero section button looks good
- [ ] Service badges are readable
- [ ] No broken layouts

### 2. Quick Accessibility Test
```bash
npm run test:accessibility
```

**Expected:**
- ✅ 0 pa11y violations (was 6)
- ✅ Reports generated in `reports/` directory

---

## Full Verification (30-60 minutes)

### Step 1: Automated Accessibility Audit

#### Run Full Audit
```bash
npm run test:accessibility
```

#### Check Results
```bash
# View pa11y results
cat reports/pa11y-results.json

# Check for violations
# Should be empty array: []
```

**Success Criteria:**
- ✅ 0 violations in pa11y-results.json
- ✅ No critical errors in axe-results.json (if available)

#### Update Metrics
- [ ] Document final violation count (should be 0)
- [ ] Update `case-studies/accessibility/before-after-metrics.md`
- [ ] Update case study with final results

---

### Step 2: Integration Testing

Follow the checklist in `docs/WEEK_1_INTEGRATION_TESTING.md`

#### Quick Tests
- [ ] **Booking System:** Visit `/book`, verify calendar works
- [ ] **Contact Form:** Fill out form on homepage, submit
- [ ] **Service Pages:** Click service cards, verify pages load
- [ ] **Navigation:** Test main menu, all links work

#### Detailed Tests
- [ ] Complete booking flow end-to-end
- [ ] Test payment system (if applicable)
- [ ] Verify all forms submit correctly
- [ ] Check mobile responsiveness

**Document Results:**
- [ ] Fill out test results template
- [ ] Note any issues found
- [ ] Verify all tests pass

---

### Step 3: Manual Accessibility Testing

#### Keyboard Navigation
1. Visit homepage
2. Press Tab repeatedly
3. Verify:
   - [ ] Focus indicators visible on all interactive elements
   - [ ] Can reach all buttons and links
   - [ ] No keyboard traps
   - [ ] Tab order is logical

#### Browser Zoom
1. Open homepage
2. Zoom to 200% (Ctrl/Cmd + +)
3. Verify:
   - [ ] Content remains readable
   - [ ] No horizontal scrolling issues
   - [ ] Layout doesn't break
   - [ ] Buttons still clickable

#### Screen Reader (Optional)
If NVDA installed:
- [ ] Navigate homepage with screen reader
- [ ] Verify all content announced
- [ ] Buttons have descriptive labels
- [ ] Forms are navigable

---

### Step 4: Visual Regression Check

**Compare Before/After:**
- [ ] Primary buttons: Darker teal (maintains brand)
- [ ] Hero section: Still visually appealing
- [ ] Service badges: More readable
- [ ] Overall design: Consistent

**Take Screenshots:**
- [ ] Homepage (hero section)
- [ ] Services section
- [ ] Contact form
- [ ] Any other key pages

---

## Verification Checklist

### Automated Tests
- [ ] `npm run test:accessibility` - 0 violations
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] No TypeScript errors

### Integration Tests
- [ ] Booking system works
- [ ] Payment system works
- [ ] Contact form works
- [ ] All forms accessible
- [ ] Navigation works

### Manual Tests
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Browser zoom works (200%)
- [ ] Mobile responsive

### Visual Checks
- [ ] Design maintained
- [ ] Colors look good
- [ ] No layout breaks
- [ ] Brand consistency

---

## Expected Results

### Accessibility Metrics
```
Before: 6 violations, Lighthouse 72/100
After:  0 violations, Lighthouse 98/100 ✅
```

### WCAG Compliance
```
Before: Non-compliant
After:  WCAG 2.1 AA compliant ✅
```

### Functionality
```
Before: All systems working
After:  All systems working ✅ (no regressions)
```

---

## If Issues Found

### Issue: Still Have Violations
1. Check which violations remain
2. Review `reports/pa11y-results.json`
3. Identify missed components
4. Apply additional fixes
5. Re-deploy and re-test

### Issue: Broken Functionality
1. Identify which feature broken
2. Check browser console for errors
3. Review deployment logs
4. Apply hotfix if needed
5. Re-test

### Issue: Visual Problems
1. Check if CSS loaded correctly
2. Verify color variables applied
3. Check browser cache (hard refresh)
4. Test in multiple browsers

---

## Success Confirmation

✅ **All checks pass:**
- 0 accessibility violations
- All systems functional
- Design maintained
- Ready for case study finalization

**Next Steps:**
1. Update case study with final metrics
2. Generate PDF version
3. Prepare for government tenders
4. Begin Week 2 manual testing

---

## Verification Report Template

**Date:** _______________  
**Tester:** _______________  
**Environment:** Production

### Results
- **Accessibility Violations:** 0 / 6 (before)
- **Lighthouse Score:** ___ / 100
- **Integration Tests:** Pass / Fail
- **Manual Tests:** Pass / Fail

### Issues Found
1. 
2. 
3. 

### Resolution
- [ ] All issues resolved
- [ ] Ready for Week 2

---

**Created:** January 23, 2025  
**Status:** Ready for Post-Deployment  
**Next:** Execute after deployment

