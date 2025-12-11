# v0.app Integration Guide for Rocky Web Studio
**Date:** December 11, 2025  
**Status:** ACTIONABLE - Ready to implement

---

## What v0.app Is (For RWS Context)

**v0 is a design-to-code AI builder** (owned by Vercel, makers of Next.js).

What it does:
- ✅ Convert design mockups, screenshots, or text descriptions into **production-ready React/Next.js components**
- ✅ Generates **Tailwind CSS + shadcn/ui** code automatically
- ✅ Full-stack apps: UI + Server Actions + Database scaffolding
- ✅ Iterate via chat: "Add a search bar", "Make button blue", "Add form validation"
- ✅ Deploy directly to Vercel in 1 click

**Key point for RWS:** v0 outputs plain Next.js code. You own it. You control it.

---

## How v0 Fits Into Your Current Stack

### Current RWS Stack:
- ✅ **Next.js + TypeScript** (your codebase)
- ✅ **Cursor + Claude** (your development environment)
- ✅ **Vercel** (your hosting)
- ✅ **Tailwind + shadcn/ui** (your design system)
- ✅ **n8n** (your automation engine)

### Adding v0:
```
Design/Mockup
    ↓
v0.app (AI generates React code)
    ↓
Copy code into your Cursor project
    ↓
Refine in Cursor (connect to APIs, add logic)
    ↓
Deploy to Vercel
```

**v0 doesn't replace Cursor.** v0 handles UI scaffolding faster. Cursor handles business logic, integrations, refinement.

---

## Where v0.app Wins For RWS

### 1. **Marketing Sites & Landing Pages** ⭐⭐⭐⭐⭐
**Time saved:** 4-8 hours per page

**Example workflow:**
1. Client says: "Build a landing page for a plumbing service in Rockhampton"
2. You describe or upload a screenshot: "Hero section, services grid (3 columns), testimonials, contact form, footer"
3. v0 generates full page in 2 minutes
4. You adjust: "Change to Rockhampton plumber color scheme", "Add phone number button"
5. Deploy to Vercel

**RWS use case:** Regional businesses need fast, high-quality landing pages. v0 cuts design-to-deploy from weeks to hours.

---

### 2. **Dashboard Components** ⭐⭐⭐⭐⭐
**Time saved:** 3-6 hours per dashboard

**Example:**
1. You describe: "Create an admin dashboard with user metrics (cards), activity chart, recent orders table"
2. v0 generates with data placeholders
3. You integrate it with your API routes in Cursor
4. Done

**RWS use case:** Client automation dashboards for n8n workflows. v0 scaffolds the UI, you connect the data.

---

### 3. **CRUD Interfaces** ⭐⭐⭐⭐
**Time saved:** 4-8 hours

**Example:**
1. "Create a form to add/edit products with name, price, description, image upload"
2. v0 generates form + basic validation
3. You add database queries in Cursor
4. Ship

**RWS use case:** E-commerce sites, client management tools, inventory systems.

---

### 4. **Prototyping & Client Feedback** ⭐⭐⭐⭐
**Time saved:** 1-2 hours per iteration

**Workflow:**
1. Client: "Show me how this would look"
2. You prompt v0 with their requirements
3. v0 generates working prototype in minutes
4. Share live link with client immediately
5. Client feedback → You iterate in v0 → Share again

**RWS use case:** Speed up client approval cycles. Instead of static mockups, they see interactive prototypes.

---

### 5. **Component Library Building** ⭐⭐⭐
**Time saved:** 2-4 hours per component set

**Example:**
1. Define all client brand colors, fonts, spacing
2. Feed into v0 as design system requirements
3. v0 generates matching component set
4. Reuse across all their sites

**RWS use case:** Once you build a component library for a client, every new page reuses it automatically.

---

## Where v0 Does NOT Win

### ❌ Complex Backend Logic
v0 can scaffold Server Actions, but complex API integration still needs Cursor.

**Example:** "Generate a webhook handler for Stripe" → v0 creates skeleton, you flesh it out in Cursor.

### ❌ Existing Codebases
If you're adding a page to an existing 200-page app, v0 isn't the fastest path.

**Better approach:** Use Cursor to add the page directly.

### ❌ Custom Design Systems
If your design system has radical customizations, v0 struggles.

**Workaround:** Feed v0 your custom shadcn config (see Design System section below).

### ❌ Performance-Critical Components
v0 optimizes for features, not performance (yet). You'll refine in Cursor.

---

## Achieving Consistency: The System

### Consistency Challenge
If you build 10 pages in v0 without controls, you get 10 different color interpretations, spacing variations, button styles.

### Solution: Design System Registry

**What is it?** A single source of truth for your colors, components, fonts, spacing. v0 uses this automatically.

---

## Step-by-Step: Set Up Your RWS Design System

### Phase 1: Define Your Design Tokens (30 min)

Create a file `design-tokens.json` in your RWS project:

```json
{
  "colors": {
    "primary": "#218085",
    "primaryHover": "#1d7480",
    "primaryActive": "#1a6473",
    "secondary": "#5e5240",
    "danger": "#c01527",
    "success": "#218085",
    "text": "#134252",
    "textSecondary": "#626c71",
    "background": "#fcfcf9",
    "surface": "#ffffff"
  },
  "typography": {
    "fontFamily": {
      "base": "FKGroteskNeue, system-ui, -apple-system",
      "mono": "Berkeley Mono, monospace"
    },
    "fontSize": {
      "xs": "11px",
      "sm": "12px",
      "base": "14px",
      "lg": "16px",
      "xl": "18px",
      "2xl": "20px",
      "3xl": "24px"
    }
  },
  "spacing": {
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "20": "20px",
    "24": "24px",
    "32": "32px"
  }
}
```

### Phase 2: Create Tailwind Config with Design Tokens (20 min)

Update your `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#218085',
          hover: '#1d7480',
          active: '#1a6473',
        },
        secondary: '#5e5240',
        danger: '#c01527',
        success: '#218085',
      },
      fontFamily: {
        base: ['FKGroteskNeue', 'system-ui', '-apple-system'],
        mono: ['Berkeley Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

### Phase 3: Document Design System in v0 Prompt (Template)

When you open v0, use this system prompt in every chat:

```
DESIGN SYSTEM GUIDELINES FOR ALL GENERATIONS:

Colors (use ONLY these):
- Primary CTA buttons: #218085 (Teal)
- Secondary buttons: #5e5240 (Brown, 12% opacity for background)
- Links: #218085
- Text: #134252 (Charcoal-700)
- Background: #fcfcf9 (Cream-50)
- Card background: #ffffff (white)
- Borders: rgba(94, 82, 64, 0.2) (brown with transparency)
- Error: #c01527
- Success: #218085

Typography:
- Font family: "FKGroteskNeue", system-ui, -apple-system, sans-serif
- Headings: semibold (550 weight), tight line height (1.2)
- Body text: normal (400 weight), 1.5 line height
- Use sizes: base (14px), lg (16px), xl (18px), 2xl (20px), 3xl (24px)

Spacing:
- Use only: 4px, 8px, 12px, 16px, 20px, 24px, 32px
- Card padding: 16px
- Section spacing: 32px

Components:
- Use shadcn/ui components only
- Button variants: primary (solid teal), secondary (outline)
- Forms: labels above inputs, validation states
- Cards: white background, border: 1px solid rgba(94,82,64,0.12)

Ensure ALL generated code uses ONLY these colors and spacing values.
```

**Copy this prompt into every v0 conversation.** v0 will maintain consistency automatically.

---

## Workflow: v0 → Cursor → Vercel

### Step 1: Generate in v0
```
Open v0.app
→ New chat
→ Paste design system prompt (above)
→ Describe what you want:

"Create a landing page for a pest control business with:
- Hero section with company name and CTA button
- 3-column service grid
- Testimonials section
- Contact form
- Footer

Use the design system colors and spacing specified above."

→ v0 generates working page in 2 minutes
→ Click "Code" to see source
→ Click "Copy code"
```

### Step 2: Import into Your Project (Cursor)
```
1. Create new file: src/app/pages/pest-control/page.tsx
2. Paste v0 code
3. Update imports if needed
4. Add TypeScript types
5. Connect to APIs/database
6. Test locally: npm run dev
```

### Step 3: Iterate in Cursor
```
"Add form validation to contact form"
"Connect database queries"
"Add error handling"
"Deploy to Vercel"
```

---

## Consistency Maintenance: Quick Checklist

Use this before every v0 generation:

- [ ] Copy design system prompt into v0 chat
- [ ] Specify client brand colors in the prompt
- [ ] Request shadcn/ui components only
- [ ] Review generated colors in output
- [ ] Run locally and test on mobile
- [ ] Check accessibility (keyboard nav, labels)

---

## Real-World RWS Example: Vet Clinic Website

### Timeline: 5 Days

**Day 1-2: v0 Rapid Prototyping**
1. Create design system (RWS brand colors)
2. In v0: "Landing page for vet clinic: hero, services, team bios, appointment booking"
3. v0 generates in 5 minutes
4. Share prototype link with client

**Day 2-3: v0 Iteration**
1. Client feedback: "Change team photo layout, add emergency contact"
2. Paste feedback into v0
3. v0 regenerates in 2 minutes

**Day 3-4: Cursor Integration**
1. Copy v0 code into Cursor project
2. Connect appointment booking to n8n workflow
3. Add Stripe payment integration
4. Email reminders setup

**Day 4-5: Deployment**
1. Deploy to Vercel
2. Configure custom domain
3. Handoff to client

**Total time:** 5 days (vs. 3-4 weeks traditional)

---

## Cost & Credits

### v0 Pricing (December 2025)
- **Pro plan:** ~$20/month
- **Generalist plan (Enterprise):** Custom pricing

**For RWS:** One Pro plan covers 5-10 projects/month.

---

## When NOT to Use v0

1. **Modifying existing pages** → Use Cursor directly
2. **Complex backend logic** → Cursor only
3. **WebGL/Canvas** → Hand-code in Cursor
4. **Proprietary API integration** → Cursor only

---

## Action Plan: Get Started

### Week 1
- [ ] Set up design-tokens.json with RWS brand colors
- [ ] Create tailwind.config.ts
- [ ] Create design system prompt template
- [ ] Create v0 account ($20/month Pro)

### Week 2
- [ ] Generate 1 simple landing page in v0
- [ ] Copy into Cursor project
- [ ] Deploy to Vercel
- [ ] Share with team

### Week 3
- [ ] Create client design system templates
- [ ] Use v0 on next real client project
- [ ] Measure time saved

---

## Summary

**v0 is a 40% time-saver for frontend scaffolding.**

- ✅ **Use for:** Marketing sites, dashboards, CRUD interfaces, prototyping
- ❌ **Don't use for:** Complex logic, existing codebases, custom styling
- 🎯 **Key:** Maintain consistency with design system prompt + tailwind config
- 💰 **Cost:** $20/month (pays for itself on first project)
- 📈 **Impact:** 40-60 hours saved/month across all clients

**v0 + Cursor = Maximum Efficiency:**
- v0 = UI scaffolding (fast)
- Cursor = Business logic & integrations (powerful)
- Together = Ship 40% faster

---

**Status:** Ready to implement. Start with Phase 1 design tokens setup.
