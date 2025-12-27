# Lighthouse Audit Instructions

## Option 1: Chrome DevTools (Recommended - Most Accurate)

1. Open Chrome browser
2. Navigate to: https://rockywebstudio.com.au
3. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac) to open DevTools
4. Click the **Lighthouse** tab
5. Select all categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
6. Select **Desktop** or **Mobile** (or both)
7. Click **Analyze page load**
8. Wait for the audit to complete
9. Review scores and download report (click the download icon)

## Option 2: Lighthouse CLI (Requires Chrome)

If you have Chrome installed:

```bash
npx lighthouse https://rockywebstudio.com.au --only-categories=accessibility,performance,seo,best-practices --output=json --output-path=./reports/lighthouse-audit-live.json --chrome-flags="--headless"
```

## Option 3: Online Lighthouse Tools

- **PageSpeed Insights**: https://pagespeed.web.dev/analysis?url=https://rockywebstudio.com.au
- **WebPageTest**: https://www.webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/

## Expected Scores (Based on Previous Audits)

- **Performance**: 90-100/100 (Desktop), 70-90/100 (Mobile)
- **Accessibility**: 91-98/100
- **Best Practices**: 100/100
- **SEO**: 91/100

## What to Look For

### Accessibility
- Color contrast ratios (should be 4.5:1+)
- Missing alt text on images
- Missing form labels
- Keyboard navigation issues
- Focus indicators

### Performance
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1

### SEO
- Meta descriptions
- Heading structure
- Image alt text
- Mobile-friendly
- Fast load times

### Best Practices
- HTTPS usage
- No console errors
- Proper image formats
- Modern JavaScript

