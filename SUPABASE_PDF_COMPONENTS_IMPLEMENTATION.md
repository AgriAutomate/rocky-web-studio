# 📄 Supabase PDF Components - Implementation Guide

## ✅ What's Been Created

1. **Database Migration** - `supabase/migrations/20251220_create_pdf_components.sql`
   - `pdf_components` table - Stores individual components
   - `pdf_templates` table - Defines component assembly

2. **Service Files:**
   - `lib/pdf/fetchComponents.ts` - Fetch components and templates from Supabase
   - `lib/pdf/generateFromComponents.ts` - Assemble HTML from components

---

## 🚀 Next Steps

### Step 1: Run Database Migration

**In Supabase SQL Editor:**
1. Open `supabase/migrations/20251220_create_pdf_components.sql`
2. Copy and paste into Supabase SQL Editor
3. Click **Run**

### Step 2: Seed Initial Components

**Create sample components:**

```sql
-- Header Component
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order
) VALUES (
  'header',
  'header',
  'Report Header',
  '<div class="header">
    <h1>Custom Deep-Dive Report</h1>
    <p>Prepared for <strong>{{businessName}}</strong></p>
    <p>Generated: {{generatedDate}}</p>
  </div>',
  1
);

-- Intro Section
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order
) VALUES (
  'intro',
  'section',
  'Introduction',
  '<div class="intro">
    <h2>Thank You, {{clientName}}!</h2>
    <p>We''ve analyzed your responses and prepared a tailored deep-dive report for <strong>{{businessName}}</strong> in the <strong>{{sector}}</strong> sector.</p>
  </div>',
  2
);

-- Challenges Section (uses {{challenges}} placeholder)
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order
) VALUES (
  'challenges',
  'section',
  'Top Challenges',
  '<div class="challenges">
    <h2>Your Top Digital Challenges</h2>
    {{challenges}}
  </div>',
  10
);

-- Footer Component
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order
) VALUES (
  'footer',
  'footer',
  'Report Footer',
  '<div class="footer">
    <p><strong>Martin Carroll</strong></p>
    <p>Founder, Rocky Web Studio</p>
    <p>martin@rockywebstudio.com.au | rockywebstudio.com.au</p>
  </div>',
  100
);
```

### Step 3: Create Template

```sql
INSERT INTO pdf_templates (
  template_key,
  template_name,
  component_keys,
  page_size,
  orientation
) VALUES (
  'questionnaire-report',
  'Questionnaire Deep-Dive Report',
  ARRAY['header', 'intro', 'challenges', 'footer'],
  'A4',
  'portrait'
);
```

### Step 4: Choose PDF Generation Library

**Option A: Puppeteer (HTML → PDF)**
```bash
npm install puppeteer-core @sparticuz/chromium
```

**Option B: @react-pdf/renderer (React-based)**
```bash
npm install @react-pdf/renderer
```

**Option C: External API Service**
- Use a service like PDFShift, HTMLPDF, or similar

### Step 5: Integrate with Email Route

**Update:** `app/api/questionnaire/submit/route.ts`

```typescript
import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";

// After database save, before email send:

// Generate PDF from Supabase components
try {
  const { html, pdfBuffer } = await generatePDFFromComponents(
    'questionnaire-report',
    reportData
  );

  // If PDF buffer is available, attach to email
  if (pdfBuffer) {
    const pdfBase64 = pdfBuffer.toString('base64');
    
    await resend.emails.send({
      // ... existing email config ...
      attachments: [
        {
          filename: `RockyWebStudio-Report-${reportData.generatedDate}.pdf`,
          content: pdfBase64,
          contentType: "application/pdf",
        },
      ],
    });
  } else {
    // Fallback: Send email without PDF (or log that PDF generation needs implementation)
    await resend.emails.send({
      // ... existing email config ...
    });
  }
} catch (pdfError) {
  // Log error but still send email
  await logger.error("PDF generation failed", { error: String(pdfError) });
  
  // Send email without PDF
  await resend.emails.send({
    // ... existing email config ...
  });
}
```

---

## 📋 Component Placeholders

Components support these placeholders:
- `{{clientName}}` - Client's first name
- `{{businessName}}` - Business name
- `{{sector}}` - Sector name
- `{{generatedDate}}` - Report generation date
- `{{challenges}}` - Formatted challenges HTML (auto-generated)

---

## 🎨 Component Management

### Add New Component

```sql
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order
) VALUES (
  'custom-section',
  'section',
  'Custom Section Title',
  '<div><h2>Custom Content</h2><p>{{businessName}}</p></div>',
  50
);
```

### Update Component

```sql
UPDATE pdf_components
SET 
  content_html = '<div>Updated content</div>',
  updated_at = NOW()
WHERE component_key = 'header';
```

### Sector-Specific Components

```sql
-- Component only for healthcare sector
INSERT INTO pdf_components (
  component_key,
  component_type,
  content_html,
  sector_filter,
  display_order
) VALUES (
  'healthcare-specific',
  'section',
  '<div>Healthcare-specific content</div>',
  ARRAY['healthcare'],
  20
);
```

---

## ✅ Benefits

1. **No Code Changes** - Update PDF content via Supabase dashboard
2. **Sector Personalization** - Different components for different sectors
3. **Version Control** - Track component changes
4. **Reusability** - Share components across templates
5. **Easy Testing** - Preview components before deploying

---

## 🔧 Current Status

- ✅ Database schema created
- ✅ Component fetching service implemented
- ✅ HTML assembly implemented
- ⏳ PDF generation library integration needed
- ⏳ Email route integration needed

---

**Next:** Choose PDF library and integrate with email route!
