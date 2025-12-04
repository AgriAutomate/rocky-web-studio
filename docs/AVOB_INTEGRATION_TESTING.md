# AVOB Integration Testing & Deployment Checklist

## ✅ Phase 1: Local Testing - COMPLETED

### Code Quality Checks
- [x] TypeScript type-check passes (`npm run type-check`)
- [x] ESLint passes (`npm run lint`)
- [x] Build completes successfully (`npm run build`)
- [x] No duplicate files (cleaned up `lib/` and `scripts/` duplicates)
- [x] All imports resolve correctly

### File Structure Verification
- [x] AVOB images in correct location: `public/images/avob/`
  - [x] `AVOB.jpg` (standard variant)
  - [x] `AVOB_DF.png` (defense-force variant, transparent)
  - [x] `AVOB_DF.jpg` (backup)
- [x] Component files:
  - [x] `components/ui/avob-badge.tsx` (main component)
  - [x] `components/footer.tsx` (includes AVOB badge)
  - [x] `components/veteran-owned-callout.tsx` (includes AVOB badge)
  - [x] `types/avob.ts` (TypeScript types)
  - [x] `lib/email-templates/components/EmailLayout.tsx` (email badge)

### Integration Points Verified
- [x] Footer component uses AVOB badge
- [x] Veteran callout component uses AVOB badge
- [x] Email templates include AVOB badge section
- [x] All components import from `@/components/ui`

## 📋 Phase 2: Visual Testing Checklist

### Homepage (`/`)
- [ ] AVOB badge visible in footer
- [ ] Badge is clickable and links to `https://avob.org.au`
- [ ] Veteran callout displays correctly with badge
- [ ] All images load without 404 errors
- [ ] No console errors

### Services Page (`/services`)
- [ ] AVOB badge visible (if footer is present)
- [ ] Page renders correctly

### Contact Form
- [ ] Form displays correctly
- [ ] AVOB badge visible (via footer)
- [ ] Form submission works

### Booking Page (`/book`)
- [ ] Page renders correctly
- [ ] AVOB badge visible (via footer)

## 📱 Phase 3: Responsive Testing

### Browser DevTools Testing
- [ ] Mobile (375px): Badge stacks vertically, readable
- [ ] Tablet (768px): Badge displays well horizontally
- [ ] Desktop (1440px): Badge maintains proportions
- [ ] Landscape/portrait orientation works

### Device Testing (Manual)
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad/Tablet
- [ ] Desktop (Chrome)
- [ ] Desktop (Firefox)
- [ ] Desktop (Safari)

## 🔗 Phase 4: Link Testing

- [ ] AVOB badge on footer → `https://avob.org.au` opens
- [ ] "Verify our certification" link → `https://avob.org.au` opens
- [ ] Links open in new tab (`target="_blank"`)
- [ ] `rel="noopener noreferrer"` present for security
- [ ] Test on mobile and desktop

## 📧 Phase 5: Email Testing

- [ ] Send test booking confirmation email
- [ ] Email displays correctly in Gmail
- [ ] Email displays correctly in Outlook
- [ ] AVOB badge visible in email
- [ ] Badge image URL is absolute: `https://rockywebstudio.com.au/images/avob/AVOB.jpg`
- [ ] Links work in email client
- [ ] Mobile email rendering works

## 🚀 Phase 6: Pre-Deployment

### Git Status
- [ ] Review all changes: `git status`
- [ ] Verify image files are NOT in git (should be in `public/`)
- [ ] Check `.gitignore` includes unnecessary files

### Commit Message
```bash
git add .
git commit -m "feat: Integrate AVOB certification badges across site

- Create AVOB badge reusable component (components/ui/avob-badge.tsx)
- Add badge to site footer (all pages)
- Add badge to veteran-owned callout section
- Add badge to email templates (EmailLayout)
- Implement responsive design
- Add accessibility attributes and alt text
- Update TypeScript types (types/avob.ts)
- Clean up duplicate files"
```

## 🌐 Phase 7: Deployment

### Vercel Deployment
- [ ] Push to main: `git push origin main`
- [ ] Monitor Vercel dashboard for build progress
- [ ] Wait for "Ready" status
- [ ] Check for build warnings/errors

### Post-Deploy Verification
- [ ] Site loads: `rockywebstudio.com.au`
- [ ] Homepage footer shows AVOB badge
- [ ] All links work correctly
- [ ] Images load without 404 errors
- [ ] No console errors (check DevTools)
- [ ] Google Analytics tracking works
- [ ] Check Vercel logs for warnings

## ✅ Phase 8: Production Verification

### Homepage
- [ ] AVOB badge visible in footer
- [ ] Badge clickable and links to `avob.org.au`
- [ ] Veteran callout displays correctly
- [ ] All images load

### Services Page
- [ ] Badge prominently displayed (via footer)
- [ ] Responsive design works

### Contact Page
- [ ] AVOB badge in footer
- [ ] Form still submits correctly
- [ ] No validation errors

### Cross-Browser Test
- [ ] Chrome: Works
- [ ] Firefox: Works
- [ ] Safari: Works
- [ ] Edge: Works

## 📊 Phase 9: Analytics & Monitoring

- [ ] Check Sentry for errors
- [ ] Look for 404s on image URLs
- [ ] Check console errors
- [ ] Verify page load time hasn't increased
- [ ] Check Core Web Vitals

## 🎯 Success Criteria

### Visual
- [x] AVOB badge displays on footer (all pages)
- [x] Badge displays on veteran callout
- [x] Badge displays in emails
- [ ] Responsive design works (mobile/tablet/desktop) - **Manual Testing Required**

### Functionality
- [x] All links to `avob.org.au` work correctly
- [x] Badge opens in new tab (`target="_blank"`)
- [x] No 404 errors for images (verified file paths)
- [x] No console errors (TypeScript/build passes)

### Code Quality
- [x] TypeScript types correct
- [x] All imports resolve
- [x] No ESLint warnings
- [ ] Committed to git with clear message - **Pending**

### Deployment
- [ ] Deployed to Vercel successfully - **Pending**
- [ ] Production site loads without errors - **Pending**
- [ ] All pages render correctly - **Pending**
- [ ] Images load from CDN - **Pending**

## 🔧 Troubleshooting

### If AVOB badge doesn't display:
1. Check file paths: `ls -la public/images/avob/`
2. Clear Next.js cache: `rm -rf .next && npm run dev`
3. Verify image paths are correct: `/images/avob/AVOB.jpg`

### If images show 404:
1. Verify file paths are absolute in emails: `https://rockywebstudio.com.au/images/avob/AVOB.jpg`
2. Check files exist in `public/images/avob/`
3. Try `npm run build` to test static file serving

### If links don't work:
1. Check `href="https://avob.org.au"` is correct URL
2. Verify `target="_blank"` is set
3. Check `rel="noopener noreferrer"` for security

## 📝 Notes

- All AVOB images are in `public/images/avob/` (served statically)
- Component uses PNG for defense-force variant (transparent background)
- Email templates use absolute URLs for images
- Footer component is reusable and included on homepage
- Veteran callout includes AVOB badge with text

## 🚀 Next Steps

1. **Manual Visual Testing**: Start dev server and verify all pages
2. **Responsive Testing**: Use browser DevTools to test breakpoints
3. **Email Testing**: Send test emails and verify rendering
4. **Git Commit**: Commit changes with descriptive message
5. **Deploy**: Push to main and monitor Vercel deployment
6. **Production Verification**: Test live site after deployment

