# Homepage CTA Implementation Guide

## Overview

Three production-ready call-to-action components for driving government/enterprise traffic to:
- `/Capability-Statement-Gov-Enterprise.pdf` (download)
- `/accessibility` (view page)

All components are WCAG 2.1 AA compliant, mobile-responsive, and use Tailwind CSS only.

---

## Quick Start

1. **Import the components** in your homepage (`app/page.tsx`):
```tsx
import { FooterCTA, StickyBannerCTA, HeroSectionCTA } from '@/components/homepage-ctas';
```

2. **Add to your page structure**:
```tsx
export default function HomePage() {
  return (
    <main>
      <StickyBannerCTA /> {/* Option B - Top of main */}
      
      {/* Your hero section */}
      <HeroSection /> 
      
      <HeroSectionCTA /> {/* Option C - After hero */}
      
      {/* Your services section */}
      <ServicesSection />
      
      {/* Rest of your content */}
      
      <FooterCTA /> {/* Option A - Before footer */}
      
      <footer>
        {/* Your footer content */}
      </footer>
    </main>
  );
}
```

---

## Component Details

### Option A: Footer CTA (Recommended)

**Best for:** Professional, non-intrusive approach

**Placement:** Just before `<footer>` tag

**Features:**
- Teal background (#218092) with cream border top
- Centered layout
- Two buttons: Primary (white) and Secondary (outlined)
- Mobile: Buttons stack vertically

**When to use:**
- You want a subtle, professional CTA
- Footer placement doesn't interfere with main content
- Good for users who scroll to bottom

---

### Option B: Sticky Banner (High Visibility)

**Best for:** Maximum visibility, time-sensitive announcements

**Placement:** Top of `<main>` element

**Features:**
- Sticky to top (z-50)
- Gradient background (teal to darker teal)
- Dismissable with close button (X)
- Uses React `useState` for dismissal
- Mobile: Text wraps, buttons remain accessible

**When to use:**
- You want high visibility
- Time-sensitive announcement
- Can be dismissed by users
- Note: Dismissal resets on page reload (add localStorage for persistence if needed)

**To Add Persistence:**
```tsx
// In StickyBannerCTA component, add:
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

### Option C: Hero Section CTA (Balanced)

**Best for:** Balanced visibility with good CTR

**Placement:** After hero section or before services section

**Features:**
- Gradient background (light teal to blue)
- White card with left border accent (4px solid teal)
- Benefit-focused copy
- Two buttons: Primary (teal) and Secondary (outlined)
- Mobile: Buttons stack vertically

**When to use:**
- You want prominent but not intrusive
- Good placement for users reading through content
- Benefit-focused messaging works well here

---

## File Requirements

### PDF File Location

Ensure the PDF file exists at:
```
public/Capability-Statement-Gov-Enterprise.pdf
```

**File naming is case-sensitive!** The component links to exactly:
- `/Capability-Statement-Gov-Enterprise.pdf`

### Accessibility Page

Ensure the accessibility page exists at:
```
app/accessibility/page.tsx
```

---

## Testing Checklist

### Mobile Responsiveness (375px)
- [ ] No horizontal scroll
- [ ] Text is readable (minimum 16px)
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
- [ ] PDF download link works (file exists at correct path)
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

## Customization

### Colors
All colors use Tailwind's color system or custom hex values:
- Primary Teal: `#218092`
- Cream: `#fcfcf9`
- Dark Text: `#1f2121`
- White: `#ffffff`

To customize, replace hex codes in className attributes.

### Spacing
- Adjust `py-*` and `px-*` classes for padding
- Adjust `mb-*` and `mt-*` for margins
- Adjust `gap-*` for spacing between flex items

### Text
Update copy in the component JSX to match your brand voice.

### Buttons
Swap primary/secondary styles by changing:
- `bg-[#218092]` → `bg-white border-2 border-[#218092]`
- `text-white` → `text-[#218092]`

### Layout
Change `flex-col sm:flex-row` to `flex-row` if you want buttons side-by-side on mobile.

---

## Implementation Notes

### Option A (Footer CTA)
- Uses `<section>` with proper ARIA label
- Centered text layout
- Buttons have `min-w-[200px]` for consistent sizing
- Mobile: Stacks vertically (`flex-col`), desktop: Horizontal (`sm:flex-row`)

### Option B (Sticky Banner)
- Uses `<aside>` with `role="banner"`
- Sticky positioning (`sticky top-0 z-50`)
- Close button uses SVG icon with `sr-only` text for screen readers
- Dismissal state managed with `useState` (not persisted)

### Option C (Hero Section CTA)
- Uses gradient background with white card overlay
- Left border accent (`border-l-4`) for visual interest
- Benefit list uses semantic `<ul>` with proper list styling
- Prose classes for readable body text

---

## Troubleshooting

### PDF Not Downloading
1. Check file exists at `public/Capability-Statement-Gov-Enterprise.pdf`
2. Verify filename matches exactly (case-sensitive)
3. Check browser console for 404 errors
4. Ensure file is not corrupted

### Links Not Working
1. Verify `/accessibility` page exists
2. Check Next.js routing (should be `app/accessibility/page.tsx`)
3. Test links in browser dev tools

### Styling Issues
1. Ensure Tailwind CSS is properly configured
2. Check for conflicting CSS classes
3. Verify custom colors are defined in `tailwind.config.js` if needed

### Accessibility Issues
1. Run Lighthouse accessibility audit
2. Test with keyboard navigation (Tab key)
3. Test with screen reader (NVDA, VoiceOver)
4. Check color contrast with WebAIM Contrast Checker

---

## Best Practices

1. **Use one or two options maximum** - Don't overwhelm users with multiple CTAs
2. **Test on real devices** - Don't rely only on browser dev tools
3. **Monitor analytics** - Track clicks on PDF download and accessibility page
4. **A/B test** - Try different placements and copy
5. **Keep it updated** - Ensure PDF is current and links work

---

## Support

For issues or questions:
- Check component code comments
- Review this implementation guide
- Test with Lighthouse and axe DevTools
- Verify all file paths are correct

