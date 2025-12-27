# Capability Statement Quick-Start Guide (React PDF)
## Rocky Web Studio - Get It Done This Weekend

**Purpose:** Hyper-specific, time-aware action plan to create your 8-page capability statement using @react-pdf/renderer  
**Timeline:** Saturday afternoon → Monday evening  
**Prerequisites:** Node.js installed, TypeScript knowledge, content document ready

---

## SECTION 1: RIGHT NOW (Next 10 Minutes)

**Goal:** Install dependencies and set up project structure

### Step 1: Install Dependencies
- [ ] Open terminal in project root
- [ ] Run: `npm install @react-pdf/renderer`
- [ ] Run: `npm install --save-dev @types/react-pdf-renderer`
- [ ] Verify installation: Check `package.json` for `@react-pdf/renderer`

### Step 2: Create Project Structure
- [ ] Create folder: `components/pdf/`
- [ ] Create folder: `components/pdf/pages/`
- [ ] Create folder: `components/pdf/styles/`
- [ ] Create folder: `components/pdf/assets/`
- [ ] Create folder: `public/icons/` (if not exists)

### Step 3: Create Style Files
- [ ] Create `components/pdf/styles/colors.ts` with color constants
- [ ] Create `components/pdf/styles/typography.ts` with typography styles
- [ ] Create `components/pdf/styles/layout.ts` with layout utilities

**✅ CHECKPOINT:** Project structure should be set up with dependencies installed.

---

## SECTION 2: THIS AFTERNOON (2-3 Hours)

**Goal:** Set up base styles and create Page 1 (Cover Page)

### Step 1: Create Color Constants
- [ ] Open `components/pdf/styles/colors.ts`
- [ ] Add color constants:
  ```typescript
  export const colors = {
    primary: '#218092',
    background: '#fcfcf9',
    text: '#1f2121',
    accentGray: '#a7a9a9',
    accentTeal: '#32b8c6',
    white: '#ffffff',
  } as const;
  ```

### Step 2: Create Typography Styles
- [ ] Open `components/pdf/styles/typography.ts`
- [ ] Import `StyleSheet` and `colors`
- [ ] Create typography styles (H1, H2, H3, body, small, bullet)
- [ ] Reference design guide for exact sizes and weights

### Step 3: Create Layout Utilities
- [ ] Open `components/pdf/styles/layout.ts`
- [ ] Create layout styles (page, section, twoColumn, threeColumn, grid, card)
- [ ] Use Flexbox for all layouts

### Step 4: Create Cover Page Component
- [ ] Create `components/pdf/pages/CoverPage.tsx`
- [ ] Import necessary components: `Page, Text, View, Image, StyleSheet`
- [ ] Import style files: `colors, typography, layout`
- [ ] Implement cover page with:
  - Logo (top left, 120x120px)
  - Main headline (48px, Bold, Teal, centered)
  - Subheadline (16px, Regular, Dark, centered)
  - Credentials badges (4 badges with icons)
  - Contact information
  - Page number (bottom right)

### Step 5: Add Logo and Icons
- [ ] Copy logo to `public/logo.png` (or appropriate path)
- [ ] Download Feather/Tabler icons as SVG:
  - Checkmark icon
  - Shield icon
  - Star icon
  - Clock icon
- [ ] Save icons to `public/icons/`
- [ ] Update image paths in `CoverPage.tsx`

### Step 6: Create Main Document Component
- [ ] Create `components/pdf/CapabilityStatement.tsx`
- [ ] Import `Document` from `@react-pdf/renderer`
- [ ] Import `CoverPage`
- [ ] Create document structure:
  ```typescript
  export const CapabilityStatement = () => (
    <Document>
      <CoverPage />
    </Document>
  );
  ```

### Step 7: Create API Route
- [ ] Create `app/api/capability-statement/pdf/route.ts`
- [ ] Import `renderToStream` and `CapabilityStatement`
- [ ] Create GET handler that generates PDF
- [ ] Test locally: `http://localhost:3000/api/capability-statement/pdf`

**✅ CHECKPOINT:** Page 1 should render correctly when accessing API route.

---

## SECTION 3: TOMORROW MORNING (3-4 Hours)

**Goal:** Complete Pages 2, 3, and 4

### Page 2: What We Deliver (2x2 Grid)

- [ ] Create `components/pdf/pages/ServicesPage.tsx`
- [ ] Implement 2x2 grid layout using Flexbox
- [ ] Create `ServiceCard` component
- [ ] Add 4 service cards:
  1. Web Design & Development
  2. Accessibility & Compliance
  3. AI-Powered Solutions
  4. Lead Capture & CRM
- [ ] Add icons for each service
- [ ] Add section header "What We Deliver" (28px, Teal, centered)
- [ ] Add page number "Page 2 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify layout

### Page 3: Technical Foundation (3-Column)

- [ ] Create `components/pdf/pages/TechnicalPage.tsx`
- [ ] Implement 3-column layout using Flexbox
- [ ] Create `TechnicalColumn` component
- [ ] Add 3 columns:
  1. Build Stack
  2. Security
  3. Accessibility Testing
- [ ] Add icons for each column
- [ ] Add section header "Technical Foundation" (28px, Teal, centered)
- [ ] Add page number "Page 3 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify columns align

### Page 4: Engagement Model (Two-Column)

- [ ] Create `components/pdf/pages/EngagementPage.tsx`
- [ ] Implement two-column layout
- [ ] Left column: Timeline (8 weeks, vertical)
- [ ] Right column: Team Structure and SLAs
- [ ] Add section header "Engagement Model & Timeline" (28px, Teal, centered)
- [ ] Add page number "Page 4 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify timeline displays correctly

**✅ CHECKPOINT:** Pages 2-4 should render correctly with proper layouts.

---

## SECTION 4: SUNDAY (2-3 Hours)

**Goal:** Complete Pages 5, 6, 7, and 8

### Page 5: Proof Points (Case Studies)

- [ ] Create `components/pdf/pages/ProofPointsPage.tsx`
- [ ] Create `CaseStudy` component
- [ ] Add 2 case studies:
  1. WCAG 2.1 AA Compliance
  2. AI-Powered Lead Qualification Chatbot
- [ ] Add metrics boxes (teal background, white text)
- [ ] Add Lighthouse screenshot (if available) or placeholder
- [ ] Add section header "Proof Points" (28px, Teal, centered)
- [ ] Add page number "Page 5 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify case studies display

### Page 6: Pricing

- [ ] Create `components/pdf/pages/PricingPage.tsx`
- [ ] Create `PricingCard` component
- [ ] Implement 3-column layout for pricing cards
- [ ] Add 3 pricing cards:
  1. Strategic Intensive
  2. Website Build
  3. Ongoing Support
- [ ] Add checkmark icons for features
- [ ] Add section header "Pricing & Packages" (28px, Teal, centered)
- [ ] Add page number "Page 6 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify pricing cards align

### Page 7: Team & Continuity

- [ ] Create `components/pdf/pages/TeamPage.tsx`
- [ ] Implement two-column layout
- [ ] Left column: Profile section (photo, name, title, credentials, AVOB badge)
- [ ] Right column: Text content (Why RWS, Escalation flowchart, Business Continuity)
- [ ] Create simple flowchart using View/Text components
- [ ] Add section header "Team & Continuity" (28px, Teal, centered)
- [ ] Add page number "Page 7 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify profile and flowchart display

### Page 8: Contact & Next Steps

- [ ] Create `components/pdf/pages/ContactPage.tsx`
- [ ] Add "What Happens Next?" section (3 steps with icons)
- [ ] Add "Contact Information" section (email, website, location with icons)
- [ ] Add "Our Credentials" section (4 badges)
- [ ] Add "Client Testimonials" section (2 quotes in teal boxes)
- [ ] Add section header "Contact & Next Steps" (28px, Teal, centered)
- [ ] Add page number "Page 8 of 8"
- [ ] Import and add to `CapabilityStatement.tsx`
- [ ] Test: Generate PDF and verify all sections display

**✅ CHECKPOINT:** All 8 pages should render correctly.

---

## SECTION 5: SUNDAY AFTERNOON (1-2 Hours)

**Goal:** Review, test, and optimize

### Step 1: Review All Pages
- [ ] Generate PDF via API route
- [ ] Open PDF in browser/PDF viewer
- [ ] Check each page:
  - [ ] Text is readable (no overlapping)
  - [ ] Colors are correct (teal #218092, cream #fcfcf9, dark #1f2121)
  - [ ] Spacing is consistent (40px margins, 20px gaps)
  - [ ] Icons display correctly
  - [ ] Images load (logo, screenshots)
  - [ ] Page numbers visible (bottom right)
  - [ ] Layouts align properly (grids, columns)

### Step 2: Fix Issues
- [ ] Adjust any layout issues (Flexbox properties)
- [ ] Fix text overflow (reduce font size or split lines)
- [ ] Verify icon paths are correct
- [ ] Check image paths and sizes
- [ ] Ensure page numbers are on all pages

### Step 3: Optimize
- [ ] Compress images if PDF is too large (>2MB)
- [ ] Optimize SVG icons
- [ ] Check file size (target: <2MB)

### Step 4: Generate Static PDF (Optional)
- [ ] Create `scripts/generate-capability-statement.ts`
- [ ] Use `renderToFile` to generate PDF
- [ ] Save to `public/Capability-Statement-Gov-Enterprise.pdf`
- [ ] Add script to `package.json`: `"generate:pdf": "tsx scripts/generate-capability-statement.ts"`
- [ ] Run: `npm run generate:pdf`
- [ ] Verify PDF is in `public/` folder

**✅ CHECKPOINT:** PDF should be complete, high quality, and ready to deploy.

---

## SECTION 6: SUNDAY EVENING (30 Minutes)

**Goal:** Deploy and test on live site

### Step 1: Commit Changes
- [ ] Stage all files: `git add .`
- [ ] Commit: `git commit -m "feat: implement capability statement PDF with @react-pdf/renderer"`
- [ ] Push: `git push`

### Step 2: Verify Deployment
- [ ] Wait for Vercel deployment
- [ ] Test API route: `https://rockywebstudio.com.au/api/capability-statement/pdf`
- [ ] PDF should download or open in browser
- [ ] Verify all 8 pages are visible

### Step 3: Test Download Link
- [ ] If using static PDF, verify: `https://rockywebstudio.com.au/Capability-Statement-Gov-Enterprise.pdf`
- [ ] If using API route, verify homepage CTA links to API route
- [ ] Test download functionality

**✅ CHECKPOINT:** PDF should be accessible on live site.

---

## SECTION 7: MONDAY (30 Minutes)

**Goal:** Update homepage CTA (if needed)

### Step 1: Verify Homepage CTA
- [ ] Check `components/homepage-ctas.tsx` or `app/page.tsx`
- [ ] Verify download link points to:
  - API route: `/api/capability-statement/pdf`
  - OR static file: `/Capability-Statement-Gov-Enterprise.pdf`
- [ ] Update link if needed

### Step 2: Test on Live Site
- [ ] Visit homepage: `https://rockywebstudio.com.au`
- [ ] Click download button/link
- [ ] PDF should download successfully
- [ ] Verify PDF opens correctly

**✅ CHECKPOINT:** Homepage CTA should work correctly.

---

## TROUBLESHOOTING

### Icons Not Displaying
- **Issue:** Icons don't appear in PDF
- **Solution:** 
  - Verify SVG files are in `/public/icons/`
  - Check image paths in components (should be `/icons/checkmark.svg`)
  - Ensure SVG files are valid

### Layout Not Aligning
- **Issue:** Grid or columns don't align correctly
- **Solution:**
  - Use `display: 'flex'` and `flexDirection: 'row'` for horizontal layouts
  - Use `width: '48%'` for 2-column grid (with `gap: 40`)
  - Use `flex: 1` for equal-width columns
  - Check `gap` property for spacing

### Text Overflowing
- **Issue:** Text cuts off or overlaps
- **Solution:**
  - Reduce font size
  - Increase container width
  - Split text into multiple lines
  - Use `flexWrap: 'wrap'` for grids

### PDF Generation Fails
- **Issue:** API route returns error
- **Solution:**
  - Check server logs for errors
  - Verify all imports are correct
  - Ensure `@react-pdf/renderer` is installed
  - Check that all image paths are valid

### Colors Not Applied
- **Issue:** Colors don't match design
- **Solution:**
  - Verify color constants in `colors.ts`
  - Check that styles are imported correctly
  - Ensure hex codes are correct (#218092, #fcfcf9, #1f2121)

---

## QUICK TIMELINE SUMMARY

**Saturday Afternoon (2-3 hours):**
- ✅ Install dependencies
- ✅ Set up project structure
- ✅ Create base styles
- ✅ Implement Page 1 (Cover)
- **Target:** Cover page working by end of day

**Sunday Morning (3-4 hours):**
- ✅ Implement Pages 2, 3, 4
- **Target:** First 4 pages done by noon

**Sunday Afternoon (2-3 hours):**
- ✅ Implement Pages 5, 6, 7, 8
- ✅ Review and test
- **Target:** All 8 pages complete by 5 PM

**Sunday Evening (30 mins):**
- ✅ Deploy and test
- **Target:** PDF live on site

**Monday (30 mins):**
- ✅ Verify homepage CTA
- **Target:** Everything working by Monday night

**Total Time:** ~8-10 hours over weekend + 30 mins Monday

---

## NEXT STEPS

Once capability statement is complete and live:

1. **Monitor:** Track PDF downloads in analytics
2. **Update:** Make design/content changes in code (version controlled)
3. **Iterate:** Improve based on feedback
4. **Automate:** Set up build-time generation if using static PDF

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Technology:** @react-pdf/renderer, React, TypeScript

