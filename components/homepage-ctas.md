# Homepage CTA Components for Rocky Web Studio

## OPTION A: FOOTER CTA (Recommended - Professional, Non-Intrusive)

```tsx
/**
 * Footer CTA Component
 * 
 * Professional, non-intrusive call-to-action for government/enterprise traffic
 * Placement: Add just before existing <footer> tag in your homepage
 * 
 * Features:
 * - Teal background with cream border top
 * - Two-button layout (primary download, secondary view page)
 * - Mobile-responsive (stacks vertically on mobile)
 * - WCAG 2.1 AA compliant
 */

'use client';

import Link from 'next/link';

export function FooterCTA() {
  return (
    <section 
      className="bg-[#218092] border-t-4 border-[#fcfcf9] py-12 px-4"
      aria-labelledby="gov-enterprise-cta-heading"
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h2 
          id="gov-enterprise-cta-heading"
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          🇦🇺 Government & Enterprise Services
        </h2>
        
        {/* Subtext */}
        <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
          AVOB certified. WCAG 2.1 AA compliant. Production-ready.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          {/* Primary: Download PDF */}
          <a
            href="/Capability-Statement-Gov-Enterprise.pdf"
            download="Rocky-Web-Studio-Capability-Statement.pdf"
            className="bg-white text-[#218092] px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] min-w-[200px] text-center"
            aria-label="Download Government Capability Statement PDF"
          >
            Download Capability Statement
          </a>
          
          {/* Secondary: View Accessibility */}
          <Link
            href="/accessibility"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#218092] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] min-w-[200px] text-center"
            aria-label="View accessibility and compliance information"
          >
            View Accessibility Details
          </Link>
        </div>
        
        {/* Closing Text */}
        <p className="text-teal-100 text-sm max-w-2xl mx-auto">
          Ready for government tenders and enterprise procurement. 
          Our capability statement includes compliance certifications, 
          security practices, and service level agreements.
        </p>
      </div>
    </section>
  );
}
```

**Implementation Notes:**
- Place this component just before your existing `<footer>` tag
- The PDF file should be in the `public` folder as `Capability-Statement-Gov-Enterprise.pdf`
- Ensure the PDF filename matches exactly (case-sensitive)
- The `download` attribute triggers browser download
- Mobile: Buttons stack vertically (`flex-col`) on mobile, horizontal (`sm:flex-row`) on larger screens
- Accessibility: Proper heading hierarchy, descriptive link text, keyboard focus states

---

## OPTION B: STICKY BANNER (High Visibility - Dismissable)

```tsx
/**
 * Sticky Banner CTA Component
 * 
 * High-visibility, dismissable banner for government/enterprise traffic
 * Placement: Top of <main> element in your homepage
 * 
 * Features:
 * - Sticky to top (z-50)
 * - Dismissable with close button
 * - Gradient background
 * - Responsive layout
 * - WCAG 2.1 AA compliant
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

export function StickyBannerCTA() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <aside
      className="sticky top-0 z-50 bg-gradient-to-r from-[#218092] to-[#0f5d6f] text-white shadow-lg"
      role="banner"
      aria-label="Government and enterprise services announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Text Content */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm sm:text-base font-medium">
              🇦🇺 <strong>Government & Enterprise:</strong> Tender-ready services available
            </p>
          </div>
          
          {/* Right: Action Links */}
          <div className="flex items-center gap-4">
            {/* Capability Statement Link */}
            <a
              href="/Capability-Statement-Gov-Enterprise.pdf"
              download="Rocky-Web-Studio-Capability-Statement.pdf"
              className="text-white underline hover:text-teal-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] rounded px-2 py-1 text-sm font-semibold whitespace-nowrap"
              aria-label="Download Government Capability Statement PDF"
            >
              Capability Statement
            </a>
            
            {/* Close Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white hover:text-teal-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] rounded p-1 transition-colors"
              aria-label="Dismiss banner"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Implementation Notes:**
- Place this component at the very top of your `<main>` element
- Uses React `useState` to manage dismissal state
- Dismissal state is stored in component state (not persisted across page reloads)
- To persist dismissal: Use `localStorage` or cookies (add `useEffect` hook)
- Mobile: Text wraps, buttons remain accessible
- Accessibility: Close button has proper ARIA label, keyboard accessible
- The banner reappears on page reload (if you want persistence, add localStorage)

**To Add Persistence (Optional):**
```tsx
// Add this useEffect after useState declaration
useEffect(() => {
  const dismissed = localStorage.getItem('gov-banner-dismissed');
  if (dismissed === 'true') {
    setIsDismissed(true);
  }
}, []);

// Update dismiss handler:
const handleDismiss = () => {
  setIsDismissed(true);
  localStorage.setItem('gov-banner-dismissed', 'true');
};
```

---

## OPTION C: HERO SECTION CTA (Balanced - Good CTR)

```tsx
/**
 * Hero Section CTA Component
 * 
 * Balanced call-to-action section for government/enterprise traffic
 * Placement: After hero section or before services section
 * 
 * Features:
 * - Gradient background
 * - Left border accent
 * - Two-button layout
 * - Benefit-focused copy
 * - Mobile-responsive
 * - WCAG 2.1 AA compliant
 */

'use client';

import Link from 'next/link';

export function HeroSectionCTA() {
  return (
    <section
      className="bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 py-16 px-4"
      aria-labelledby="tender-cta-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#218092] p-8 md:p-12">
          {/* Heading */}
          <h2
            id="tender-cta-heading"
            className="text-3xl md:text-4xl font-bold text-[#1f2121] mb-4"
          >
            Bidding on Government Tenders?
          </h2>
          
          {/* Body Text */}
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Rocky Web Studio delivers production-ready digital services designed 
              for government and enterprise procurement. Our capability statement 
              includes everything you need for tender submissions.
            </p>
            
            {/* Benefits List */}
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>WCAG 2.1 AA Compliant:</strong> Automated and manual accessibility testing</li>
              <li><strong>Lead Capture & CRM:</strong> Built-in contact forms and admin dashboards</li>
              <li><strong>Enterprise Infrastructure:</strong> 99.9% uptime SLA, daily backups, security headers</li>
              <li><strong>AVOB Certified:</strong> Verified Australian business, ready for government contracts</li>
            </ul>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary: Download Statement */}
            <a
              href="/Capability-Statement-Gov-Enterprise.pdf"
              download="Rocky-Web-Studio-Capability-Statement.pdf"
              className="bg-[#218092] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0f5d6f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 text-center"
              aria-label="Download Government Capability Statement PDF"
            >
              Download Capability Statement
            </a>
            
            {/* Secondary: View Security */}
            <Link
              href="/accessibility"
              className="bg-white border-2 border-[#218092] text-[#218092] px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 text-center"
              aria-label="View accessibility, security, and compliance details"
            >
              View Security & Compliance
            </Link>
          </div>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-600 mt-6">
            Includes compliance certifications, security practices, SLAs, and 
            technical specifications for government tender submissions.
          </p>
        </div>
      </div>
    </section>
  );
}
```

**Implementation Notes:**
- Place after your hero section or before your services section
- The gradient background uses Tailwind's gradient utilities
- Left border (`border-l-4`) provides visual accent
- Mobile: Buttons stack vertically on mobile, horizontal on larger screens
- The white card container provides contrast against the gradient background
- Accessibility: Proper heading hierarchy, descriptive link text, keyboard focus states

---

## Testing Checklist

### Mobile Responsiveness (375px)
- [ ] No horizontal scroll
- [ ] Text is readable (minimum 16px font size)
- [ ] Buttons are full-width or appropriately sized (min 44x44px touch target)
- [ ] Spacing is adequate (no cramped elements)
- [ ] All interactive elements are accessible

### Tablet (768px)
- [ ] Layout adapts appropriately
- [ ] Buttons may be side-by-side if designed that way
- [ ] Text remains readable
- [ ] No layout breaks

### Desktop (1024px+)
- [ ] Maximum width containers work correctly
- [ ] Buttons are appropriately sized (not too wide)
- [ ] Spacing is balanced
- [ ] Hover states work correctly

### Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] All interactive elements have focus states (visible outline)
- [ ] Keyboard navigation works (Tab through all elements)
- [ ] Screen reader friendly (proper ARIA labels, semantic HTML)
- [ ] Link text is descriptive (not "click here")
- [ ] Heading hierarchy is correct (h1 → h2 → h3)

### Functionality
- [ ] PDF download link works (file exists at `/Capability-Statement-Gov-Enterprise.pdf`)
- [ ] `/accessibility` page link works
- [ ] Close button works (Option B)
- [ ] Hover states work on all interactive elements
- [ ] Focus states are visible and accessible

### Performance
- [ ] No layout shift (CLS)
- [ ] Components load quickly
- [ ] No console errors
- [ ] Images/icons are optimized (if any)

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Quick Implementation Guide

1. **Choose your option** (A, B, or C - or use multiple)
2. **Copy the component code** into your project
3. **Place in appropriate location:**
   - Option A: Just before `<footer>` tag
   - Option B: Top of `<main>` element
   - Option C: After hero or before services section
4. **Import the component** in your homepage:
   ```tsx
   import { FooterCTA } from '@/components/homepage-ctas';
   // or
   import { StickyBannerCTA } from '@/components/homepage-ctas';
   // or
   import { HeroSectionCTA } from '@/components/homepage-ctas';
   ```
5. **Add to your page:**
   ```tsx
   <StickyBannerCTA /> {/* If using Option B */}
   {/* Your existing hero content */}
   <HeroSectionCTA /> {/* If using Option C */}
   {/* Your services section */}
   <FooterCTA /> {/* If using Option A */}
   <footer>...</footer>
   ```
6. **Verify PDF file exists** at `public/Capability-Statement-Gov-Enterprise.pdf`
7. **Test all links and functionality**
8. **Run accessibility audit** (Lighthouse, axe DevTools)

---

## Customization Tips

- **Colors:** All colors use Tailwind's color system or custom hex values. Modify the hex codes to match your exact brand colors.
- **Spacing:** Adjust `py-*` and `px-*` classes to change padding, `mb-*` for margins.
- **Text:** Update copy to match your brand voice and messaging.
- **Buttons:** Swap primary/secondary styles by changing `bg-*` and `border-*` classes.
- **Layout:** Change `flex-col sm:flex-row` to `flex-row` if you want buttons side-by-side on mobile.

---

## File Structure Recommendation

Create a new file: `components/homepage-ctas.tsx`

```tsx
// components/homepage-ctas.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Option A: Footer CTA
export function FooterCTA() {
  // ... (paste Option A code here)
}

// Option B: Sticky Banner
export function StickyBannerCTA() {
  // ... (paste Option B code here)
}

// Option C: Hero Section CTA
export function HeroSectionCTA() {
  // ... (paste Option C code here)
}
```

Then import what you need in your homepage:
```tsx
import { FooterCTA, StickyBannerCTA, HeroSectionCTA } from '@/components/homepage-ctas';
```

