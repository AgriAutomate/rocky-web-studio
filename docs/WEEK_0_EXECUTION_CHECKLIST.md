# Week 0: Setup & Audit - Complete Execution Checklist
**Date:** January 24-31, 2025  
**Duration:** 10-15 hours  
**Status:** Ready to Execute  
**Goal:** Complete setup and audit before Week 1 begins

## Overview

Week 0 is critical for preventing conflicts and establishing baselines. Complete all tasks before starting Week 1.

---

## DAY 1-2: Cursor Configuration Installation (4-5 hours)

### Task 1.1: Create .cursorrules File
**Time:** 30 minutes

**Steps:**
1. Copy content from `docs/cursor_configuration_templates.md` (FILE 1)
2. Create `.cursorrules` in project root
3. Verify file is in `.gitignore` (should NOT be ignored - commit it)
4. Test: Open Cursor, verify rules are active

**Verification:**
```bash
# Check file exists
ls -la .cursorrules

# Verify content (should see "Rocky Web Studio Development Standards")
head -20 .cursorrules
```

**✅ Success Criteria:** Cursor IDE recognizes rules, shows in settings

---

### Task 1.2: Create .cursor/rules/ Directory Structure
**Time:** 1 hour

**Steps:**
1. Create directory: `mkdir -p .cursor/rules`
2. Copy `accessibility.mdc` from `docs/cursor_configuration_templates.md` (FILE 2)
3. Copy `nextjs-sanity.mdc` from template (FILE 3)
4. **UPDATE:** Rename to `nextjs-supabase.mdc` and update content:
   - Replace Sanity references with Supabase
   - Update GROQ queries to SQL
   - Add Supabase client patterns
5. Create `claude-api.mdc` from template (if provided) or create new:
   - Rate limiting patterns
   - Error handling
   - Streaming response validation

**Files to Create:**
```
.cursor/
  rules/
    accessibility.mdc
    nextjs-supabase.mdc  (updated from nextjs-sanity.mdc)
    claude-api.mdc
```

**Verification:**
```bash
# Check directory structure
tree .cursor/rules

# Verify files exist
ls -la .cursor/rules/*.mdc
```

**✅ Success Criteria:** All 3 .mdc files exist and are readable

---

### Task 1.3: Test Cursor Configuration
**Time:** 30 minutes

**Steps:**
1. Open Cursor IDE
2. Open any TypeScript file
3. Use Cursor chat (Cmd+K / Ctrl+K)
4. Ask: "What are the accessibility rules for this project?"
5. Verify Cursor references `.cursor/rules/accessibility.mdc`
6. Test inline prompt on code with accessibility issue

**✅ Success Criteria:** Cursor enforces rules and references configuration

---

## DAY 3-4: Install Accessibility Tools (3-4 hours)

### Task 2.1: Install npm Packages
**Time:** 30 minutes

**Commands:**
```bash
npm install --save-dev @axe-core/cli pa11y pa11y-ci lighthouse
npm install --save-dev jest-axe @axe-core/react
```

**Verification:**
```bash
# Check packages installed
npm list @axe-core/cli pa11y pa11y-ci lighthouse jest-axe

# Verify CLI tools work
npx axe --version
npx pa11y --version
npx lighthouse --version
```

**✅ Success Criteria:** All packages install without errors

---

### Task 2.2: Create Accessibility Test Scripts
**Time:** 1 hour

**Create:** `scripts/test-accessibility.js`

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const siteUrl = process.env.SITE_URL || 'https://rockywebstudio.com.au';
const reportsDir = './reports';

// Create reports directory
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('🔍 Running accessibility audits...\n');

// Run axe
console.log('1. Running axe-core...');
try {
  execSync(`npx axe ${siteUrl} --reporter json > ${reportsDir}/axe-results.json`, { stdio: 'inherit' });
  console.log('✅ Axe audit complete\n');
} catch (error) {
  console.log('⚠️  Axe found violations (see report)\n');
}

// Run pa11y
console.log('2. Running pa11y...');
try {
  execSync(`npx pa11y ${siteUrl} --reporter json > ${reportsDir}/pa11y-results.json`, { stdio: 'inherit' });
  console.log('✅ Pa11y audit complete\n');
} catch (error) {
  console.log('⚠️  Pa11y found issues (see report)\n');
}

// Run Lighthouse
console.log('3. Running Lighthouse...');
try {
  execSync(`npx lighthouse ${siteUrl} --output=html --output-path=${reportsDir}/lighthouse-report.html --only-categories=accessibility`, { stdio: 'inherit' });
  console.log('✅ Lighthouse audit complete\n');
} catch (error) {
  console.log('⚠️  Lighthouse error (see report)\n');
}

console.log('📊 Reports saved to ./reports/');
```

**Add to package.json:**
```json
{
  "scripts": {
    "test:accessibility": "node scripts/test-accessibility.js",
    "test:a11y": "npm run test:accessibility"
  }
}
```

**✅ Success Criteria:** Script runs and generates reports

---

### Task 2.3: Create CI/CD Workflow
**Time:** 1 hour

**Create:** `.github/workflows/accessibility.yml`

```yaml
name: Accessibility Audit

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:accessibility
        env:
          SITE_URL: ${{ secrets.SITE_URL || 'https://rockywebstudio.com.au' }}
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-reports
          path: reports/
```

**✅ Success Criteria:** Workflow file created (test on first PR)

---

### Task 2.4: Add Jest-Axe to Test Suite
**Time:** 30 minutes

**Update:** `__tests__/accessibility.test.ts`

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(/* your component */);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**✅ Success Criteria:** Accessibility tests run with Jest

---

## DAY 5: Run Comprehensive Baseline Audit (3-4 hours)

### Task 3.1: Create Reports Directory
**Time:** 5 minutes

```bash
mkdir -p reports
mkdir -p reports/baseline
```

---

### Task 3.2: Run Axe Baseline Audit
**Time:** 30 minutes

**Commands:**
```bash
# Run axe on production site
npx axe https://rockywebstudio.com.au --reporter json > reports/baseline/axe-baseline.json

# Also run on local dev (if available)
npm run dev
# In another terminal:
npx axe http://localhost:3000 --reporter json > reports/baseline/axe-local.json
```

**Document Findings:**
- Count violations by severity
- List all violation types
- Note any critical blockers

**✅ Success Criteria:** JSON report generated with violation count

---

### Task 3.3: Run Pa11y Baseline Audit
**Time:** 30 minutes

**Commands:**
```bash
npx pa11y https://rockywebstudio.com.au --reporter json > reports/baseline/pa11y-baseline.json
```

**Document Findings:**
- List all issues found
- Categorize by type
- Note WCAG criteria violated

**✅ Success Criteria:** JSON report generated

---

### Task 3.4: Run Lighthouse Baseline Audit
**Time:** 1 hour

**Commands:**
```bash
npx lighthouse https://rockywebstudio.com.au \
  --output=html \
  --output-path=./reports/baseline/lighthouse-baseline.html \
  --only-categories=accessibility,performance,best-practices,seo
```

**Document Findings:**
- Accessibility score
- Performance score
- Best practices score
- SEO score
- Opportunities for improvement

**✅ Success Criteria:** HTML report generated with scores

---

### Task 3.5: Document Baseline Findings
**Time:** 1-2 hours

**Create:** `reports/accessibility-baseline.md`

**Template:**
```markdown
# Accessibility Baseline Audit
**Date:** [Date]
**Site:** rockywebstudio.com.au
**Auditor:** [Your Name]

## Summary
- Axe Violations: [X] (Critical: [X], Serious: [X], Moderate: [X], Minor: [X])
- Pa11y Issues: [X]
- Lighthouse Accessibility Score: [X]/100
- Lighthouse Performance Score: [X]/100

## Critical Violations (Must Fix)
1. [Violation type] - [Description] - [WCAG Criterion]
2. ...

## Serious Violations (High Priority)
1. ...

## Moderate Violations (Medium Priority)
1. ...

## Minor Violations (Low Priority)
1. ...

## Performance Issues
- [Issue 1]
- [Issue 2]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps
- Week 1-2: Fix critical and serious violations
- Week 2: Re-audit to verify improvements
```

**✅ Success Criteria:** Comprehensive baseline document created

---

## DAY 6-7: Audit Existing Systems (4-5 hours)

### Task 4.1: Audit Supabase Database
**Time:** 1-2 hours

**Steps:**
1. Access Supabase dashboard
2. List all tables
3. Document schema for each table
4. Identify potential conflicts with `case_studies` table
5. Check for existing content management tables

**Create:** `docs/existing-systems-audit.md`

**Template:**
```markdown
# Existing Systems Audit

## Supabase Database

### Tables
| Table Name | Purpose | Columns | Potential Conflicts |
|------------|---------|---------|---------------------|
| [table] | [purpose] | [list] | [conflicts?] |

### Schema Conflicts Check
- ✅ `case_studies` table name available
- ✅ No conflicting column names
- ✅ No conflicting indexes

### Recommendations
- [Recommendations for schema design]
```

**✅ Success Criteria:** Database schema documented, conflicts identified

---

### Task 4.2: Audit Existing Chat System
**Time:** 1 hour

**Steps:**
1. Read `/app/api/chat/webhook/route.ts`
2. Document its purpose
3. Document its usage
4. Identify integration points
5. Verify it won't conflict with `/api/ai-assistant`

**Add to:** `docs/existing-systems-audit.md`

**Template:**
```markdown
## Existing Chat System

### Route: `/api/chat/webhook`
- **Purpose:** [What does it do?]
- **Usage:** [Who uses it?]
- **Technology:** [What tech stack?]
- **Integration Points:** [What connects to it?]

### Conflict Analysis
- ✅ `/api/ai-assistant` won't conflict (different route)
- ✅ Different purpose (customer support vs lead qualification)
- ✅ Can coexist safely

### Recommendations
- Keep existing system intact
- New AI assistant serves different purpose
```

**✅ Success Criteria:** Chat system documented, no conflicts identified

---

### Task 4.3: Audit All API Routes
**Time:** 1-2 hours

**Steps:**
1. List all routes in `/app/api/`
2. Document purpose of each
3. Identify routes that might conflict
4. Plan naming for new routes

**Add to:** `docs/existing-systems-audit.md`

**Template:**
```markdown
## API Routes Inventory

### Existing Routes
| Route | Method | Purpose | Conflicts? |
|-------|--------|---------|------------|
| `/api/chat/webhook` | POST | [purpose] | No |
| `/api/case-studies/*` | [methods] | [purpose] | ✅ Available |

### New Routes Needed
- `/api/ai-assistant` - ✅ Available
- `/api/case-studies` - ✅ Available
- `/api/case-studies/[slug]` - ✅ Available
```

**✅ Success Criteria:** All routes documented, conflicts identified

---

### Task 4.4: Audit Environment Variables
**Time:** 30 minutes

**Steps:**
1. List all `.env.local` variables
2. Document purpose of each
3. Identify new variables needed:
   - `ANTHROPIC_API_KEY` (for Claude)
   - Any Supabase variables (if not already set)

**Add to:** `docs/existing-systems-audit.md`

**Template:**
```markdown
## Environment Variables

### Existing Variables
| Variable | Purpose | Required? |
|----------|---------|-----------|
| [VAR] | [purpose] | Yes/No |

### New Variables Needed
- `ANTHROPIC_API_KEY` - For Claude API (Week 2-3)
- [Any others]

### Conflicts
- ✅ No conflicts identified
```

**✅ Success Criteria:** Environment variables documented

---

### Task 4.5: Audit Existing Client Projects
**Time:** 1-2 hours

**Steps:**
1. List all recent client projects
2. Identify which had accessibility work
3. Document results/metrics available
4. Identify best candidate for case study
5. Check if client permission likely

**Create:** `docs/existing-client-audit.md`

**Template:**
```markdown
# Existing Client Projects Audit

## Potential Case Study Candidates

### Client 1: [Name]
- **Project Type:** [Type]
- **Accessibility Work:** [Yes/No]
- **Results Available:** [Metrics]
- **Permission Likely:** [Yes/No/Unknown]
- **Case Study Potential:** [High/Medium/Low]

### Client 2: [Name]
...

## Recommended Candidate
**Client:** [Name]
**Reason:** [Why this one?]
**Next Step:** Contact client for permission

## Backup Options
- [Backup 1]
- [Backup 2]
```

**✅ Success Criteria:** Client audit complete, candidate identified

---

### Task 4.6: Design Supabase Schema for Case Studies
**Time:** 1 hour

**Create:** `docs/supabase-case-studies-schema.md`

**Schema Design:**
```sql
-- Case Studies Table
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB, -- Portable Text or Markdown
  featured BOOLEAN DEFAULT false,
  category TEXT, -- 'accessibility', 'ai', 'cms', etc.
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metrics
  before_metrics JSONB,
  after_metrics JSONB,
  
  -- Media
  hero_image_url TEXT,
  images JSONB, -- Array of image URLs
  
  -- Testimonial
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_company TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' -- 'draft', 'published', 'archived'
);

-- Indexes
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_status ON case_studies(status);
CREATE INDEX idx_case_studies_featured ON case_studies(featured);
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_published ON case_studies(published_at DESC);

-- RLS Policies (if needed)
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Allow public read for published case studies
CREATE POLICY "Public can read published case studies"
  ON case_studies FOR SELECT
  USING (status = 'published');

-- Admin can do everything (adjust based on your auth setup)
CREATE POLICY "Admins can manage case studies"
  ON case_studies FOR ALL
  USING (auth.role() = 'admin');
```

**✅ Success Criteria:** Schema designed, ready for Week 3-4

---

## WEEK 0 COMPLETION CHECKLIST

### Setup Complete
- [ ] `.cursorrules` file created and tested
- [ ] `.cursor/rules/` directory with 3 .mdc files
- [ ] Cursor configuration working

### Tools Installed
- [ ] Accessibility npm packages installed
- [ ] Test scripts created
- [ ] CI/CD workflow created
- [ ] Jest-axe integrated

### Baseline Audit Complete
- [ ] Axe baseline report generated
- [ ] Pa11y baseline report generated
- [ ] Lighthouse baseline report generated
- [ ] Baseline findings documented

### Systems Audit Complete
- [ ] Supabase database audited
- [ ] Existing chat system audited
- [ ] All API routes documented
- [ ] Environment variables audited
- [ ] Existing clients audited
- [ ] Case studies schema designed

### Documentation Complete
- [ ] `reports/accessibility-baseline.md` created
- [ ] `docs/existing-systems-audit.md` created
- [ ] `docs/existing-client-audit.md` created
- [ ] `docs/supabase-case-studies-schema.md` created

---

## WEEK 0 SUCCESS CRITERIA

✅ All setup tasks complete  
✅ Baseline accessibility audit done  
✅ Existing systems documented  
✅ No conflicts identified  
✅ Ready to start Week 1

**Time Spent:** 10-15 hours  
**Status:** Ready for Week 1

---

## NEXT STEPS

Once Week 0 is complete:
1. Review all audit documents
2. Confirm 3 key decisions (if not already done)
3. Begin Week 1: Accessibility Remediation
4. Reference baseline audit for prioritization

---

**Created:** January 23, 2025  
**Status:** Ready to Execute  
**Start Date:** January 24, 2025

