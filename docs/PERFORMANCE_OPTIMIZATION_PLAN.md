# Performance Optimization Plan
**Date:** December 27, 2025  
**Current Performance:** 70/100 (Mobile), 72/100 (Desktop)  
**Target Performance:** 90+/100  
**Priority:** High (affects user experience and SEO)

---

## Executive Summary

PageSpeed Insights has identified specific performance bottlenecks:
- **220 KiB unused JavaScript** (166.2 KiB own code, 54 KiB Google Tag Manager)
- **Render blocking CSS** (150ms delay)
- **Legacy JavaScript polyfills** (25 KiB)
- **Image optimization** (12.8 KiB savings)
- **Google Tag Manager** causing long main-thread tasks (107ms, 90ms)
- **Large DOM** (509 elements)

---

## Priority 1: Quick Wins (1-2 hours, High Impact)

### 1.1 Optimize Logo Image
**Issue:** Logo is 640x640 but displayed as 224x224 (12.8 KiB savings)  
**Location:** `components/hero-section.tsx` or similar  
**Fix:**
- Use Next.js Image component with proper `width` and `height`
- Add `priority` only if above the fold
- Use `sizes` attribute for responsive images
- Consider WebP format

**Expected Impact:** 12.8 KiB savings, improved LCP

### 1.2 Defer Google Tag Manager
**Issue:** GTM loading synchronously, causing 107ms and 90ms long tasks  
**Current:** 141 KiB transfer, blocking main thread  
**Fix:**
- Load GTM asynchronously
- Defer until after page load
- Use `next/script` with `strategy="afterInteractive"` or `strategy="lazyOnload"`

**Expected Impact:** Reduce TBT by ~200ms, improve FCP/LCP

**Implementation:**
```tsx
// In app/layout.tsx or _document.tsx
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-G4PK1DL694"
  strategy="afterInteractive"
/>
```

**Expected Impact:** Significant TBT reduction, faster initial load

---

## Priority 2: Medium Effort (4-8 hours, High Impact)

### 2.1 Remove Legacy JavaScript Polyfills
**Issue:** 25 KiB of polyfills for modern features (Array.at, Array.flat, Object.fromEntries, etc.)  
**Current:** Next.js/Turbopack transpiling for older browsers  
**Fix:**
- Update `next.config.js` to target modern browsers only
- Set `browserslist` to modern browsers
- Remove unnecessary polyfills

**Implementation:**
```js
// next.config.js
module.exports = {
  // Target modern browsers only
  transpilePackages: [],
  // Or use browserslist in package.json
}
```

```json
// package.json
{
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}
```

**Expected Impact:** 25 KiB savings, faster JavaScript parsing

### 2.2 Optimize CSS Loading
**Issue:** 17.7 KiB CSS blocking render (150ms delay)  
**Fix:**
- Inline critical CSS for above-the-fold content
- Defer non-critical CSS
- Use CSS-in-JS or styled-components for critical styles
- Consider CSS modules with code splitting

**Implementation Options:**
1. **Critical CSS Extraction:**
   - Extract critical CSS for hero section
   - Inline in `<head>`
   - Load full CSS asynchronously

2. **CSS Code Splitting:**
   - Split CSS by route
   - Load only needed CSS per page

**Expected Impact:** 150ms FCP improvement

### 2.3 Image Optimization Audit
**Issue:** Images not fully optimized  
**Fix:**
- Audit all images
- Ensure all use Next.js Image component
- Add proper `sizes` attributes
- Use WebP format with fallbacks
- Implement lazy loading for below-fold images

**Expected Impact:** Improved LCP, reduced bandwidth

---

## Priority 3: Advanced Optimizations (1-2 days, Medium-High Impact)

### 3.1 Code Splitting & Tree Shaking
**Issue:** 220 KiB unused JavaScript (166.2 KiB own code)  
**Fix:**
- Implement route-based code splitting
- Use dynamic imports for heavy components
- Enable tree shaking in build process
- Lazy load components below the fold

**Implementation:**
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed for SSR
});
```

**Components to Lazy Load:**
- Testimonials carousel
- AI Assistant widget (if not critical)
- Contact form (if below fold)
- Case studies grid

**Expected Impact:** 100-150 KiB savings, faster initial load

### 3.2 Reduce DOM Size
**Issue:** 509 elements, depth of 11, 41 children on body  
**Fix:**
- Simplify component structure
- Remove unnecessary wrapper divs
- Use CSS Grid/Flexbox instead of nested divs
- Consider virtual scrolling for long lists

**Expected Impact:** Faster style calculations, reduced memory usage

### 3.3 Optimize Third-Party Scripts
**Issue:** Google Tag Manager and Analytics loading synchronously  
**Fix:**
- Load all third-party scripts asynchronously
- Use `next/script` with appropriate strategy
- Consider self-hosting analytics (Plausible, etc.)
- Defer non-critical third-party scripts

**Expected Impact:** Reduced TBT, faster page load

---

## Implementation Roadmap

### Week 1: Quick Wins
- [ ] Day 1: Optimize logo image (1 hour)
- [ ] Day 1: Defer Google Tag Manager (1 hour)
- **Expected Result:** 70 → 75-80/100

### Week 2: Medium Effort
- [ ] Day 1-2: Remove legacy JavaScript polyfills (4 hours)
- [ ] Day 3-4: Optimize CSS loading (4 hours)
- [ ] Day 5: Image optimization audit (2 hours)
- **Expected Result:** 75-80 → 85-90/100

### Week 3: Advanced Optimizations
- [ ] Day 1-3: Code splitting and tree shaking (12 hours)
- [ ] Day 4-5: Reduce DOM size (8 hours)
- [ ] Day 5: Optimize third-party scripts (2 hours)
- **Expected Result:** 85-90 → 90-95/100

---

## Expected Results

### Before Optimization
- Performance: 70/100 (Mobile), 72/100 (Desktop)
- FCP: 3.1-3.3s
- LCP: 5.2-5.5s
- TBT: 100-120ms
- JavaScript: 220 KiB unused

### After Quick Wins (Week 1)
- Performance: 75-80/100
- FCP: 2.5-2.8s (improved)
- LCP: 4.5-5.0s (improved)
- TBT: 50-80ms (improved)
- JavaScript: 220 KiB unused (unchanged)

### After Medium Effort (Week 2)
- Performance: 85-90/100
- FCP: 1.8-2.2s (target met)
- LCP: 3.0-3.5s (improved)
- TBT: 30-50ms (excellent)
- JavaScript: 195 KiB unused (25 KiB saved)

### After Advanced (Week 3)
- Performance: 90-95/100
- FCP: 1.5-1.8s (excellent)
- LCP: 2.0-2.5s (target met)
- TBT: 20-40ms (excellent)
- JavaScript: 50-100 KiB unused (120-170 KiB saved)

---

## Monitoring & Validation

### After Each Phase
1. Run PageSpeed Insights audit
2. Compare metrics before/after
3. Test on real devices (mobile/desktop)
4. Verify no functionality broken
5. Check Core Web Vitals in Google Search Console

### Success Criteria
- ✅ Performance score: 90+/100
- ✅ FCP: < 1.8s
- ✅ LCP: < 2.5s
- ✅ TBT: < 200ms
- ✅ CLS: < 0.1 (already perfect)
- ✅ No regressions in functionality

---

## Risk Mitigation

### Risk: Breaking Functionality
**Mitigation:** Test thoroughly after each change, use feature flags if needed

### Risk: SEO Impact
**Mitigation:** Ensure all optimizations maintain SEO best practices

### Risk: User Experience
**Mitigation:** Monitor real user metrics, A/B test if needed

---

## Notes

- All optimizations should maintain current functionality
- Test on multiple devices and browsers
- Monitor Core Web Vitals in production
- Keep accessibility at 100/100
- Maintain Best Practices at 100/100
- Keep SEO at 100/100

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Next Review:** After Week 1 quick wins

