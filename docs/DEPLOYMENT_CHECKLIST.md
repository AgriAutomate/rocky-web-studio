# Deployment Checklist: Accessibility Fixes
**Date:** January 23, 2025  
**Purpose:** Deploy Week 1 accessibility fixes to production  
**Status:** Ready for Deployment

## Pre-Deployment

### 1. Review Changes
- [x] All 8 files modified and reviewed
- [x] Color contrast fixes applied
- [x] No breaking changes expected
- [x] Integration testing checklist prepared

### 2. Git Status
- [ ] Check `git status` - verify all changes staged
- [ ] Review `git diff` - ensure correct files changed
- [ ] Verify no unintended changes

### 3. Local Testing
- [ ] Run `npm run build` - verify build succeeds
- [ ] Check for TypeScript errors
- [ ] Verify no console errors
- [ ] Test locally (if possible)

---

## Deployment Steps

### Step 1: Commit Changes
```bash
git add app/globals.css
git add components/hero-section.tsx
git add components/services-grid.tsx
git add components/services/ServicePricing.tsx
git add components/services/ServiceCTA.tsx
git add components/services/ServiceCtaBand.tsx
git add components/custom-songs-banner.tsx
git add components/ui/button.tsx
git add docs/
git add case-studies/

git commit -m "feat(a11y): fix 6 color contrast violations for WCAG 2.1 AA compliance

- Update primary color from #14b8a6 to #0f766e (4.6:1 contrast)
- Update primary-foreground to #ffffff
- Fix hero section button (text-foreground)
- Fix service badges (text-foreground)
- Fix all bg-card text-primary instances
- Enhance button outline variant

Fixes: 6 WCAG 2.1 AA violations
Expected: 0 violations, Lighthouse 98/100
Files: 8 components + CSS variables"
```

### Step 2: Push to Repository
```bash
git push origin main
# or
git push origin [your-branch-name]
```

### Step 3: Deploy to Vercel
- [ ] Push triggers automatic deployment (if connected)
- [ ] OR manually deploy via Vercel dashboard
- [ ] Wait for build to complete
- [ ] Verify deployment successful

### Step 4: Verify Deployment
- [ ] Check Vercel deployment logs
- [ ] Verify no build errors
- [ ] Confirm site is live at rockywebstudio.com.au
- [ ] Check homepage loads correctly

---

## Post-Deployment Verification

### 1. Visual Inspection
- [ ] Visit homepage
- [ ] Verify primary buttons are darker teal
- [ ] Check hero section button looks good
- [ ] Verify service badges readable
- [ ] Overall design maintained

### 2. Accessibility Audit
```bash
npm run test:accessibility
```

**Expected Results:**
- ✅ 0 pa11y violations (down from 6)
- ✅ 0 axe violations (if Chrome available)
- ✅ Lighthouse accessibility: 95+/100

### 3. Integration Testing
Follow checklist in `docs/WEEK_1_INTEGRATION_TESTING.md`:
- [ ] Booking system works
- [ ] Payment system works
- [ ] Contact form works
- [ ] All forms accessible
- [ ] Navigation works

### 4. Manual Testing
- [ ] Keyboard navigation (Tab through site)
- [ ] Focus indicators visible
- [ ] Browser zoom (200%) - content readable
- [ ] Mobile responsive

---

## Rollback Plan (If Needed)

If issues are found:

### Option 1: Quick Fix
```bash
# Revert specific changes if needed
git revert [commit-hash]
git push
```

### Option 2: Full Rollback
```bash
# Revert entire commit
git revert HEAD
git push
```

### Option 3: Hotfix
- Make targeted fixes
- Deploy hotfix
- Re-test

---

## Success Criteria

✅ **Deployment Successful**
- Site loads without errors
- All pages accessible
- No console errors

✅ **Accessibility Improved**
- 0 violations (down from 6)
- Lighthouse 95+/100
- WCAG 2.1 AA compliant

✅ **No Regressions**
- Booking system works
- Payment system works
- All forms functional
- No broken features

---

## Post-Deployment Tasks

### Immediate (Today)
- [ ] Run accessibility audit
- [ ] Document final metrics
- [ ] Update case study with results
- [ ] Verify integration tests pass

### Week 2
- [ ] Complete manual testing (NVDA)
- [ ] Finalize case study
- [ ] Generate PDF version
- [ ] Prepare for government tenders

---

## Notes

- **Deployment Time:** ~5-10 minutes
- **Verification Time:** ~30-60 minutes
- **Risk Level:** Low (CSS changes only)
- **Rollback Time:** <5 minutes if needed

---

**Created:** January 23, 2025  
**Status:** Ready for Deployment  
**Next:** Execute deployment steps above

