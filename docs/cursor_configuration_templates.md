# Cursor IDE Configuration for Rocky Web Studio
Production-Ready Templates

## FILE 1: .cursorrules (Project Root)
Copy this entire content to your project root as `.cursorrules`:

```
# Rocky Web Studio Development Standards
# Version 1.0 - December 25, 2025

## Core Philosophy
You are assisting a solo founder building case studies for government contracts.
Every line must be production-ready - no TODOs, no shortcuts.
Accessibility is non-negotiable (WCAG 2.1 AA minimum).

---

## ACCESSIBILITY FIRST

### WCAG 2.1 AA Compliance Mandatory
- All interactive elements keyboard accessible (Tab, Enter, Escape)
- Never remove focus indicators without replacement
- Use semantic HTML (<nav>, <main>, <article>) not <div>
- Every form input requires <label for="id">
- Color contrast minimum: 4.5:1 normal text, 3:1 large
- Alt text describes content, not "image of..."
- Test with axe DevTools before committing

### Testing Required
- Run: npx axe rockywebstudio.com.au before commits
- Lighthouse accessibility score must be 90+/100
- Screen reader (NVDA) testing before final commit

---

## TYPESCRIPT STRICT

- No `any` types - use proper interfaces
- All functions have parameter and return types
- Strict null checks enabled
- Create interfaces over types when possible

---

## AI INTEGRATION

### API Standards
- All API routes in /app/api/[route]/route.ts
- Every endpoint: error handling, TypeScript types, logging
- Claude API: rate limiting, token counting, fallback
- Streaming responses for real-time UX
- Never expose ANTHROPIC_API_KEY in frontend

### Rate Limiting
- 10 requests/minute for public APIs
- Use Upstash Redis or in-memory store
- Return 429 status with Retry-After header

---

## SANITY.IO INTEGRATION

- All schemas in /sanity/schemas/ with TypeScript
- All GROQ queries in /sanity/lib/queries.ts using defineQuery
- Content must have: _id, _type, slug
- Image optimization: urlFor() + Next.js Image component
- Metadata: generateMetadata() for SEO

---

## CODE ORGANIZATION

/app # Next.js pages and API routes
/components # Reusable React components
/lib # Utility functions, API clients
/sanity # Sanity configuration
/types # TypeScript interfaces
/scripts # Automation scripts
/reports # Audit results
/.cursor/rules # AI instruction files

---

## GIT & VERSION CONTROL

### Commit Format
- type(scope): description
- type: feat|fix|docs|style|refactor|test|a11y
- Example: `feat(a11y): add aria-label to submit button`

### Always Review
- Review all diffs before committing
- Write helpful commit messages (what & why)
- Experiment in feature branches

---

## PERFORMANCE & SECURITY

- Images: Next.js Image component with optimization
- Data: validate all inputs (frontend & backend)
- Secrets: .env.local only, never commit
- Rate limiting: 10 req/min public APIs
- HTTPS only: all external API calls

---

## WHEN TO PROMPT CURSOR

### ✅ GOOD: Specific Prompts
- "Add TypeScript type for case study with nested testimonial"
- "Fix accessibility: make button keyboard accessible with Enter support"
- "Create GROQ query fetching featured case studies by date"

### ❌ AVOID: Vague Prompts
- "Make this better"
- "Fix accessibility" (without specifying what)
- "Add error handling" (where? what errors?)

---

## ACCESSIBILITY DETAIL

### Common Fixes

**Missing Form Labels:**
```jsx
// WRONG
<input type="email" placeholder="Email" />

// RIGHT
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

**Focus Indicators:**
```css
/* WRONG */
button { outline: none; }

/* RIGHT */
button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**Screen Reader Hidden:**
```jsx
// Visual only (decorative)
<span aria-hidden="true">→</span>

// Screen reader only
<span className="sr-only">Screen reader text</span>
```

**Alt Text:**
```jsx
// WRONG
<img src="case.png" alt="image" />

// RIGHT
<img src="case.png" alt="Healthcare dashboard with patient portal" />
```

This .cursorrules file is your AI copilot's instruction manual.
Commit to Git so you can reference previous versions.

Last updated: December 25, 2025
Author: Martin Carroll, Rocky Web Studio
```

---

## FILE 2: .cursor/rules/accessibility.mdc

Copy this to `.cursor/rules/accessibility.mdc`:

```markdown
---
description: WCAG 2.1 AA compliance standards
tags:
  - accessibility
  - wcag
  - a11y
---

# Accessibility Compliance Rules

## Mandatory Semantic HTML

### Document Structure
- One `<h1>` per page only
- Heading hierarchy: h1 → h2 → h3 (never skip)
- Use `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`
- Avoid `<div>` for semantic content

### Forms
- Every `<input>` has `<label for="id">`
- Use `<fieldset>` and `<legend>` for grouped controls
- Error messages: `aria-describedby="error-id"`

## Color & Contrast

### Ratios
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 for focus indicators

### Testing
- WebAIM Contrast Checker
- Lighthouse DevTools

## Keyboard Navigation

### Tab Order
- Logical: top-to-bottom, left-to-right
- Never use `tabindex` except special cases
- No keyboard traps (can always Tab away)

### Focus Indicators
```css
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Screen Reader Requirements

### Alt Text
- Decorative: `alt=""` (empty)
- Content: Describe what's in image
- Icons: `aria-label="Close dialog"`

### ARIA Labels
- `aria-label` when visual label insufficient
- `aria-describedby="id"` to connect description
- `aria-hidden="true"` for decorative elements

## Testing Procedures

### Automated (Before Every Commit)
```bash
npx axe rockywebstudio.com.au
npx pa11y-ci https://rockywebstudio.com.au
npx lighthouse https://rockywebstudio.com.au --view
```

### Manual (Weekly)
- Keyboard: Tab through entire page
- Screen reader: NVDA or VoiceOver
- Color contrast: WebAIM checker
- Zoom: Test at 200%

Enforce this standard on every commit. No exceptions.
```

---

## FILE 3: .cursor/rules/nextjs-sanity.mdc

Copy this to `.cursor/rules/nextjs-sanity.mdc`:

```markdown
---
description: Next.js 14 + Sanity.io patterns
tags:
  - nextjs
  - sanity
  - cms
---

# Next.js 14 + Sanity.io Standards

## Project Structure

```
/app # Next.js App Router
/components # React components
/sanity # Sanity configuration
  /schemas # Content schemas
  /lib
    /client.ts # Sanity client
    /queries.ts # GROQ queries
/lib # Utilities
/types # TypeScript types
```

## Sanity Configuration

### Client Setup
```typescript
// sanity/lib/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: 'v2025-03-04',
  useCdn: true,
})
```

## GROQ Queries

### Requirements
- Use `defineQuery()` from next-sanity
- Always include `_id` and `_type`
- Use `slug` for routing
- Export as constants

### Example
```typescript
import { defineQuery } from 'next-sanity'

export const CASE_STUDIES = defineQuery(`
  *[_type == "caseStudy"] | order(publishedAt desc) {
    _id, title, slug, excerpt
  }
`)
```

## Image Handling
```typescript
// sanity/lib/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

// Usage:
<Image
  src={urlFor(image).url()}
  alt={image.alt}
  width={800}
  height={600}
/>
```

## Content Schemas
```typescript
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' }
    })
  ]
})
```

## Best Practices
- Query efficiency: Use fields array
- Caching: Leverage Next.js cache
- Types: Generate from schemas
- SEO: generateMetadata from content
- Images: Optimize with Next.js Image
- Webhooks: Auto-revalidate on changes

Production-grade setup. No shortcuts.
```

---

## SETUP SCRIPT

Save as `setup-cursor.sh`:

```bash
#!/bin/bash
# Setup Cursor IDE for Rocky Web Studio

echo "📦 Setting up Cursor project..."

# Create directories
mkdir -p .cursor/rules
mkdir -p sanity/lib
mkdir -p components
mkdir -p lib
mkdir -p types
mkdir -p reports
mkdir -p docs

# Create placeholder files
touch .cursorrules
touch .cursor/rules/accessibility.mdc
touch .cursor/rules/nextjs-sanity.mdc

# Git setup
git init
echo ".env.local" >> .gitignore
echo ".next/" >> .gitignore
echo "node_modules/" >> .gitignore

echo "✅ Project structure created!"
echo ""
echo "Next steps:"
echo "1. Copy .cursorrules content"
echo "2. Copy .cursor/rules/*.mdc files"
echo "3. Run: npm init -y"
echo "4. Run: npm install next react react-dom"
echo ""
echo "Good luck! 🚀"
```

## QUICK CURSOR COMMANDS
```
Cmd+K / Ctrl+K        - Open chat
Select → Right-click  - Inline prompt
Cmd+G / Ctrl+G       - Review diff
Cmd+Shift+A          - Accept all
@ in chat            - Reference files
```

## BEST PRACTICES

### When Writing Prompts

**Good:**
```
"Create TypeScript function that validates email:
- Use regex pattern for RFC 5322
- Return boolean
- Handle edge cases (null, empty)
- Include JSDoc comments"
```

**Bad:**
```
"Make email validation"
```

### When Accepting Changes
- ALWAYS review diff
- Understand what changed
- Test the change
- Commit with clear message

---

These configurations enforce quality automatically. Copy them now. 🎯

