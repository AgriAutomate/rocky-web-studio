# Accessibility Baseline Audit
**Date:** January 23, 2025  
**Site:** rockywebstudio.com.au  
**Auditor:** Automated Tools (axe-core, pa11y)  
**Status:** Baseline Established

## Summary

This document establishes the baseline accessibility state of rockywebstudio.com.au before Week 1-2 remediation work begins.

### Audit Tools Used
- **axe-core CLI** - Automated accessibility testing
- **pa11y** - WCAG 2.1 AA compliance checking
- **Lighthouse** - Not run (requires Chrome installation)

---

## Findings Overview

### Pa11y Results
**Total Issues Found:** 6 violations  
**All Issues:** Color contrast violations (WCAG 2.1 AA Principle 1.4.3)

### Violation Breakdown

#### 1. Button/Link Contrast Issue (2.49:1 ratio)
- **Location:** Main hero section button
- **Element:** `<a>` with class containing button styles
- **Issue:** Text color has insufficient contrast (2.49:1, needs 4.5:1)
- **Recommendation:** Change text colour to #008577
- **WCAG:** 1.4.3 Contrast (Minimum) - Level AA

#### 2. Badge/Accent Text Contrast (2.22:1 ratio)
- **Location:** Section with badge/span element
- **Element:** `<span>` with accent background
- **Issue:** Text has insufficient contrast (2.22:1, needs 4.5:1)
- **Recommendation:** Change text colour to #000202
- **WCAG:** 1.4.3 Contrast (Minimum) - Level AA

#### 3. Primary Button Contrast (2.38:1 ratio)
- **Location:** Multiple primary action buttons
- **Elements:** 
  - Main CTA button in section
  - Pricing section button
  - Contact form submit button
- **Issue:** Background/text combination has insufficient contrast (2.38:1, needs 4.5:1)
- **Recommendation:** Change background to #001714
- **WCAG:** 1.4.3 Contrast (Minimum) - Level AA

#### 4. Secondary Button Contrast (2.49:1 ratio)
- **Location:** Secondary action button
- **Element:** Border button with card background
- **Issue:** Text color has insufficient contrast (2.49:1, needs 4.5:1)
- **Recommendation:** Change text colour to #008577
- **WCAG:** 1.4.3 Contrast (Minimum) - Level AA

---

## Detailed Violations

### Violation 1: Hero Section Button
```
Selector: html > body > div:nth-child(2) > main > section:nth-child(1) > div > div > div:nth-child(2) > div:nth-child(1) > div > a:nth-child(1)
Contrast Ratio: 2.49:1
Required: 4.5:1
Recommendation: Change text colour to #008577
```

### Violation 2: Badge Element
```
Selector: html > body > div:nth-child(2) > main > section:nth-child(3) > div > div:nth-child(1) > div:nth-child(1) > span
Contrast Ratio: 2.22:1
Required: 4.5:1
Recommendation: Change text colour to #000202
```

### Violation 3: Primary CTA Button
```
Selector: html > body > div:nth-child(2) > main > section:nth-child(3) > div > div:nth-child(1) > div:nth-child(5) > a:nth-child(1)
Contrast Ratio: 2.38:1
Required: 4.5:1
Recommendation: Change background to #001714
```

### Violation 4: Secondary Button
```
Selector: html > body > div:nth-child(2) > main > section:nth-child(3) > div > div:nth-child(1) > div:nth-child(5) > a:nth-child(2)
Contrast Ratio: 2.49:1
Required: 4.5:1
Recommendation: Change text colour to #008577
```

### Violation 5: Pricing Section Button
```
Selector: #pricing > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > button
Contrast Ratio: 2.38:1
Required: 4.5:1
Recommendation: Change background to #001714
```

### Violation 6: Contact Form Submit Button
```
Selector: #contact > form > button
Contrast Ratio: 2.38:1
Required: 4.5:1
Recommendation: Change background to #001714
```

---

## Priority Classification

### Critical (Must Fix - Week 1)
All 6 violations are **Critical** because:
- They affect all users with visual impairments
- They violate WCAG 2.1 AA Level (required for government contracts)
- They impact primary user actions (buttons, CTAs)

### Impact Assessment
- **User Impact:** High - Affects readability for users with low vision
- **Business Impact:** High - Blocks government contract eligibility
- **Fix Complexity:** Low - Primarily CSS color adjustments
- **Estimated Time:** 2-4 hours

---

## Recommendations

### Immediate Actions (Week 1)
1. **Fix all color contrast violations**
   - Update button text colors to meet 4.5:1 ratio
   - Update background colors for primary buttons
   - Test with WebAIM Contrast Checker

2. **Verify fixes**
   - Re-run pa11y after changes
   - Test with axe-core
   - Manual visual inspection

3. **Run Lighthouse audit**
   - Install Chrome or use Chrome DevTools
   - Get full accessibility score
   - Document performance impact

### Testing Strategy
1. **Automated Testing**
   - Run `npm run test:accessibility` after each fix
   - Verify violations decrease
   - Target: 0 violations

2. **Manual Testing**
   - Test with NVDA screen reader
   - Test keyboard navigation
   - Test with browser zoom (200%)

3. **Visual Testing**
   - Verify color changes maintain design intent
   - Test in light/dark modes if applicable
   - Verify contrast in different lighting conditions

---

## Next Steps

### Week 1-2: Remediation
- [ ] Fix all 6 color contrast violations
- [ ] Re-run accessibility audits
- [ ] Document fixes in case study
- [ ] Verify 0 violations achieved

### Success Criteria
- ✅ 0 axe violations
- ✅ 0 pa11y violations
- ✅ Lighthouse accessibility score: 95+/100
- ✅ NVDA screen reader tested
- ✅ Keyboard navigation verified

---

## Notes

- **Lighthouse:** Not run in baseline (requires Chrome). Will run in Week 1 after Chrome setup or use DevTools.
- **axe-core:** Report generated but needs verification of format
- **Manual Testing:** Scheduled for Week 1 Days 3-4 (NVDA screen reader testing)

---

**Baseline Established:** January 23, 2025  
**Next Audit:** After Week 1 remediation  
**Target:** 0 violations, WCAG 2.1 AA compliant

