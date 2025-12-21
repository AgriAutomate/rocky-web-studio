# 📄 Supabase PDF Components Architecture

## 🎯 Concept

Store PDF components/templates in Supabase, fetch and assemble them dynamically, then generate a single PDF file to attach to the email response.

## ✅ Benefits

1. **Template Management** - Update PDF content without code changes
2. **Component Reusability** - Share components across different PDF types
3. **Dynamic Content** - Personalize PDFs based on questionnaire responses
4. **Admin-Friendly** - Manage templates through Supabase dashboard or admin UI
5. **Version Control** - Track component changes over time

---

## 📊 Database Schema

### Table: `pdf_components`

```sql
CREATE TABLE IF NOT EXISTS public.pdf_components (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Component Metadata
  component_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'header', 'challenge-1', 'footer'
  component_type VARCHAR(50) NOT NULL, -- 'header', 'section', 'challenge', 'footer', 'cta'
  title VARCHAR(255),
  description TEXT,
  
  -- Component Content
  content_html TEXT, -- HTML template with placeholders
  content_json JSONB, -- Structured data for complex components
  styles JSONB, -- CSS styles or component styling config
  
  -- Component Configuration
  display_order INTEGER DEFAULT 0, -- Order in which component appears
  is_active BOOLEAN DEFAULT TRUE,
  sector_filter VARCHAR(100)[], -- Which sectors this component applies to (empty = all)
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_component_id BIGINT REFERENCES pdf_components(id), -- For component variants
  
  -- Metadata
  created_by VARCHAR(100),
  notes TEXT
);

-- Indexes
CREATE INDEX idx_pdf_components_key ON pdf_components(component_key);
CREATE INDEX idx_pdf_components_type ON pdf_components(component_type);
CREATE INDEX idx_pdf_components_active ON pdf_components(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_pdf_components_order ON pdf_components(display_order);
```

### Table: `pdf_templates`

```sql
CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Template Metadata
  template_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'questionnaire-report', 'service-quote'
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Component Assembly
  component_keys TEXT[] NOT NULL, -- Array of component_key values in order
  -- Example: ['header', 'intro', 'challenge-1', 'challenge-2', 'challenge-3', 'cta', 'footer']
  
  -- Template Configuration
  page_size VARCHAR(20) DEFAULT 'A4', -- A4, Letter, etc.
  orientation VARCHAR(10) DEFAULT 'portrait', -- portrait, landscape
  margins JSONB DEFAULT '{"top": 40, "right": 40, "bottom": 40, "left": 40}'::jsonb,
  
  -- Styling
  theme JSONB, -- Colors, fonts, spacing
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Versioning
  version INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX idx_pdf_templates_key ON pdf_templates(template_key);
CREATE INDEX idx_pdf_templates_active ON pdf_templates(is_active) WHERE is_active = TRUE;
```

---

## 🔧 Implementation Approach

### Option 1: HTML Templates → PDF (Recommended)

**Library:** `@react-pdf/renderer` or `puppeteer` (headless Chrome)

**Flow:**
1. Fetch components from Supabase
2. Replace placeholders with actual data
3. Assemble HTML
4. Convert HTML to PDF
5. Attach to email

### Option 2: React PDF Components

**Library:** `@react-pdf/renderer`

**Flow:**
1. Fetch component definitions from Supabase
2. Map to React PDF components
3. Render to PDF buffer
4. Attach to email

---

## 💻 Code Implementation

### 1. Database Migration

Create migration file: `supabase/migrations/20251220_create_pdf_components.sql`

```sql
-- PDF Components Table
CREATE TABLE IF NOT EXISTS public.pdf_components (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  component_key VARCHAR(100) NOT NULL UNIQUE,
  component_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  
  content_html TEXT,
  content_json JSONB,
  styles JSONB,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sector_filter VARCHAR(100)[],
  
  version INTEGER DEFAULT 1,
  parent_component_id BIGINT REFERENCES pdf_components(id),
  
  created_by VARCHAR(100),
  notes TEXT
);

-- PDF Templates Table
CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  template_key VARCHAR(100) NOT NULL UNIQUE,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  component_keys TEXT[] NOT NULL,
  
  page_size VARCHAR(20) DEFAULT 'A4',
  orientation VARCHAR(10) DEFAULT 'portrait',
  margins JSONB DEFAULT '{"top": 40, "right": 40, "bottom": 40, "left": 40}'::jsonb,
  
  theme JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1
);

-- Indexes
CREATE INDEX idx_pdf_components_key ON pdf_components(component_key);
CREATE INDEX idx_pdf_components_type ON pdf_components(component_type);
CREATE INDEX idx_pdf_components_active ON pdf_components(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_pdf_templates_key ON pdf_templates(template_key);
```

### 2. Service: Fetch Components

**File:** `lib/pdf/fetchComponents.ts`

```typescript
import { createServerSupabaseClient } from "@/lib/supabase/client";

export interface PDFComponent {
  id: number;
  component_key: string;
  component_type: string;
  content_html: string;
  content_json: any;
  styles: any;
  display_order: number;
}

export interface PDFTemplate {
  id: number;
  template_key: string;
  component_keys: string[];
  page_size: string;
  orientation: string;
  margins: any;
  theme: any;
}

/**
 * Fetch PDF template by key
 */
export async function fetchPDFTemplate(templateKey: string): Promise<PDFTemplate | null> {
  const supabase = createServerSupabaseClient(true);
  
  const { data, error } = await (supabase as any)
    .from('pdf_templates')
    .select('*')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PDFTemplate;
}

/**
 * Fetch PDF components by keys
 */
export async function fetchPDFComponents(
  componentKeys: string[],
  sector?: string
): Promise<PDFComponent[]> {
  const supabase = createServerSupabaseClient(true);
  
  let query = (supabase as any)
    .from('pdf_components')
    .select('*')
    .in('component_key', componentKeys)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Filter by sector if provided
  if (sector) {
    query = query.or(`sector_filter.is.null,sector_filter.cs.{${sector}}`);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as PDFComponent[];
}
```

### 3. Service: Assemble & Generate PDF

**File:** `lib/pdf/generateFromComponents.ts`

```typescript
import { fetchPDFTemplate, fetchPDFComponents } from "./fetchComponents";
import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
// OR use puppeteer for HTML → PDF
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

interface ReportData {
  clientName: string;
  businessName: string;
  sector: string;
  topChallenges: Array<{
    number: number;
    title: string;
    sections: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  generatedDate: string;
}

/**
 * Replace placeholders in HTML template with actual data
 */
function replacePlaceholders(html: string, data: ReportData): string {
  return html
    .replace(/\{\{clientName\}\}/g, data.clientName)
    .replace(/\{\{businessName\}\}/g, data.businessName)
    .replace(/\{\{sector\}\}/g, data.sector)
    .replace(/\{\{generatedDate\}\}/g, data.generatedDate)
    .replace(/\{\{challenges\}\}/g, formatChallenges(data.topChallenges));
}

function formatChallenges(challenges: ReportData['topChallenges']): string {
  return challenges.map((challenge, index) => `
    <div class="challenge">
      <h3>Challenge ${challenge.number}: ${challenge.title}</h3>
      ${challenge.sections.map(section => `<p>${section}</p>`).join('')}
      <p><strong>ROI Timeline:</strong> ${challenge.roiTimeline}</p>
      <p><strong>Investment Range:</strong> ${challenge.projectCostRange}</p>
    </div>
  `).join('');
}

/**
 * Generate PDF from Supabase components
 */
export async function generatePDFFromComponents(
  templateKey: string,
  reportData: ReportData
): Promise<Buffer> {
  // 1. Fetch template
  const template = await fetchPDFTemplate(templateKey);
  if (!template) {
    throw new Error(`Template not found: ${templateKey}`);
  }

  // 2. Fetch components
  const components = await fetchPDFComponents(template.component_keys, reportData.sector);
  if (components.length === 0) {
    throw new Error(`No components found for template: ${templateKey}`);
  }

  // 3. Assemble HTML
  const htmlParts = components.map(component => {
    const processedHtml = replacePlaceholders(component.content_html, reportData);
    return `<div class="component ${component.component_type}">${processedHtml}</div>`;
  });

  const fullHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .component { margin-bottom: 30px; }
          .header { text-align: center; }
          .challenge { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
          h1 { color: #208091; }
          h2 { color: #134252; }
        </style>
      </head>
      <body>
        ${htmlParts.join('\n')}
      </body>
    </html>
  `;

  // 4. Convert HTML to PDF using Puppeteer
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: template.page_size as any,
    orientation: template.orientation as any,
    margin: template.margins,
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
}
```

### 4. Update Email Route

**File:** `app/api/questionnaire/submit/route.ts`

```typescript
import { generatePDFFromComponents } from "@/lib/pdf/generateFromComponents";

// In the POST handler, after database save:

// STEP 3: GENERATE PDF FROM SUPABASE COMPONENTS
let pdfBuffer: Buffer | null = null;
try {
  pdfBuffer = await generatePDFFromComponents('questionnaire-report', reportData);
  const pdfBase64 = pdfBuffer.toString('base64');
  
  // STEP 4: SEND EMAIL WITH PDF ATTACHMENT
  await resend.emails.send({
    from: RESEND_FROM,
    to: formData.businessEmail,
    subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
    react: React.createElement(ClientAcknowledgementEmail, {
      clientFirstName: formData.firstName,
      businessName: formData.businessName,
      sector: reportData.sector,
    }),
    attachments: [
      {
        filename: `RockyWebStudio-Deep-Dive-Report-${reportData.generatedDate}.pdf`,
        content: pdfBase64,
        contentType: "application/pdf",
      },
    ],
  });
} catch (pdfError) {
  // Log error but still send email without PDF
  await logger.error("PDF generation failed", { 
    error: String(pdfError),
    responseId,
  });
  
  // Send email without PDF attachment
  await resend.emails.send({
    from: RESEND_FROM,
    to: formData.businessEmail,
    subject: `Your Custom Deep-Dive Report – ${formData.businessName}`,
    react: React.createElement(ClientAcknowledgementEmail, {
      clientFirstName: formData.firstName,
      businessName: formData.businessName,
      sector: reportData.sector,
    }),
  });
}
```

---

## 📝 Sample Component Data

### Header Component

```sql
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
    <p>Prepared for {{businessName}}</p>
    <p>Generated: {{generatedDate}}</p>
  </div>',
  1
);
```

### Challenge Component Template

```sql
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  content_html,
  display_order,
  sector_filter
) VALUES (
  'challenge-template',
  'challenge',
  'Challenge Section Template',
  '<div class="challenge">
    <h2>{{challengeTitle}}</h2>
    <p>{{challengeDescription}}</p>
    <p><strong>ROI Timeline:</strong> {{roiTimeline}}</p>
    <p><strong>Investment Range:</strong> {{projectCostRange}}</p>
  </div>',
  10,
  ARRAY[]::VARCHAR[] -- Applies to all sectors
);
```

### Template Definition

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
  ARRAY['header', 'intro', 'challenge-1', 'challenge-2', 'challenge-3', 'cta', 'footer'],
  'A4',
  'portrait'
);
```

---

## 🎨 Admin UI (Optional)

Create an admin interface to:
- Manage PDF components
- Preview components
- Assemble templates
- Test PDF generation

---

## ✅ Benefits Summary

1. **Flexibility** - Update PDF content without code deployment
2. **Personalization** - Sector-specific components
3. **Reusability** - Share components across templates
4. **Versioning** - Track component changes
5. **Scalability** - Easy to add new components/templates

---

**Next Steps:**
1. Create database migration
2. Implement component fetching service
3. Implement PDF generation from components
4. Update email route to use new PDF generation
5. Seed initial components

Would you like me to implement this system?
