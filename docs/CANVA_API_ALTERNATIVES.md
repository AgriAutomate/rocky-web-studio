# Canva API & Programmatic Design Alternatives
## Rocky Web Studio - Automated Capability Statement Generation

**Purpose:** Evaluate Canva API capabilities and alternatives for programmatic PDF generation  
**Goal:** Automate capability statement creation instead of manual Canva design

---

## CANVA API CAPABILITIES

### What Canva APIs Offer

**1. Canva Connect APIs**
- **Purpose:** Integrate Canva into your platform/app
- **Capabilities:**
  - Upload assets to Canva folders
  - Create designs from templates (requires user interaction)
  - Export finished designs
  - Sync comments and collaboration
- **Limitation:** Not designed for fully automated design creation from scratch
- **Use Case:** Allow users to edit pre-made templates in Canva

**2. Canva Apps SDK**
- **Purpose:** Build apps that run inside Canva editor
- **Capabilities:**
  - Import content into designs
  - Add custom elements
  - Automate repetitive tasks within Canva
- **Limitation:** Requires Canva editor to be open (not headless)
- **Use Case:** Browser extensions or plugins for Canva users

### What Canva APIs CANNOT Do

❌ **Fully automated design creation from code**  
❌ **Headless PDF generation** (without user interaction)  
❌ **Direct API access to create complete designs programmatically**  
❌ **Batch generation of multiple designs without user involvement**

**Why:** Canva's APIs are designed for integration and collaboration, not for replacing the design interface entirely.

---

## RECOMMENDED ALTERNATIVES

### Option 1: PDF Generation Library (Recommended)

**Best Choice:** Use a PDF generation library directly in your Next.js app

#### Libraries to Consider

**1. `@react-pdf/renderer` (React-based)**
- **Pros:**
  - React components → PDF
  - TypeScript support
  - Good for complex layouts
  - Can use your existing React components
- **Cons:**
  - Learning curve
  - Limited design flexibility compared to Canva
- **Installation:**
  ```bash
  npm install @react-pdf/renderer
  ```
- **Example:**
  ```tsx
  import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

  const styles = StyleSheet.create({
    page: { backgroundColor: '#fcfcf9', padding: 40 },
    title: { fontSize: 48, color: '#218092', marginBottom: 20 },
  });

  const CapabilityStatement = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Production-Ready Digital Services</Text>
        {/* More content */}
      </Page>
    </Document>
  );
  ```

**2. `pdfkit` (Node.js)**
- **Pros:**
  - Mature, stable library
  - Full control over PDF generation
  - Good for server-side generation
- **Cons:**
  - Lower-level API (more code required)
  - No React component support
- **Installation:**
  ```bash
  npm install pdfkit
  ```

**3. `puppeteer` + HTML/CSS (Headless Chrome)**
- **Pros:**
  - Use HTML/CSS (familiar)
  - Can use Tailwind CSS
  - Renders exactly as browser
  - Can screenshot or generate PDF
- **Cons:**
  - Requires headless Chrome (larger deployment)
  - Slower generation
  - More resource-intensive
- **Installation:**
  ```bash
  npm install puppeteer
  ```
- **Example:**
  ```typescript
  import puppeteer from 'puppeteer';

  async function generatePDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdf;
  }
  ```

**4. `jsPDF` (Client-side)**
- **Pros:**
  - Lightweight
  - Works in browser
  - Simple API
- **Cons:**
  - Limited layout capabilities
  - Not ideal for complex designs
- **Installation:**
  ```bash
  npm install jspdf
  ```

### Option 2: Hybrid Approach (Canva Template + API)

**Workflow:**
1. Create a Canva template with placeholders
2. Use Canva Connect API to:
   - Upload assets (logo, images)
   - Create design from template
   - Replace placeholder text with actual content
   - Export as PDF
3. **Limitation:** Still requires some manual steps or user interaction

**When to Use:** If you need Canva's design flexibility but want some automation.

### Option 3: Markdown → PDF (Current Approach)

**What You're Already Doing:**
- Markdown content → `md-to-pdf` → PDF
- **Pros:** Simple, text-based, version-controlled
- **Cons:** Limited design control, basic styling

**Enhancement:** Use a more powerful Markdown renderer with custom CSS:
- `markdown-pdf` with custom CSS
- `md-to-pdf` with custom stylesheet
- Better typography and layout control

---

## RECOMMENDED SOLUTION FOR ROCKY WEB STUDIO

### **Option: `@react-pdf/renderer` + TypeScript**

**Why:**
1. ✅ **TypeScript support** (matches your stack)
2. ✅ **React components** (familiar syntax)
3. ✅ **Full control** over design and layout
4. ✅ **Server-side generation** (API route)
5. ✅ **Version controlled** (design in code)
6. ✅ **Automated** (no manual Canva steps)
7. ✅ **Consistent** (same design every time)

### Implementation Plan

**Step 1: Create PDF Component**
```typescript
// components/pdf/CapabilityStatementPDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fcfcf9',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 48,
    color: '#218092',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  // ... more styles
});

export const CapabilityStatementPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Page 1: Cover */}
      <Text style={styles.title}>Production-Ready Digital Services</Text>
      {/* More content */}
    </Page>
    {/* More pages */}
  </Document>
);
```

**Step 2: Create API Route**
```typescript
// app/api/capability-statement/pdf/route.ts
import { renderToStream } from '@react-pdf/renderer';
import { CapabilityStatementPDF } from '@/components/pdf/CapabilityStatementPDF';

export async function GET() {
  const stream = await renderToStream(
    <CapabilityStatementPDF data={capabilityData} />
  );
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Capability-Statement-Gov-Enterprise.pdf"',
    },
  });
}
```

**Step 3: Generate on Build or On-Demand**
- **On Build:** Generate PDF during build, save to `/public/`
- **On-Demand:** Generate PDF when requested (API route)
- **Hybrid:** Generate on first request, cache result

### Advantages Over Canva

✅ **Fully automated** - No manual steps  
✅ **Version controlled** - Design changes tracked in Git  
✅ **Consistent** - Same output every time  
✅ **Customizable** - Full control over design  
✅ **Fast** - No external API calls  
✅ **Free** - No Canva subscription needed  
✅ **Type-safe** - TypeScript ensures correctness  

### Disadvantages

❌ **More code** - Need to build design in code  
❌ **Learning curve** - New library to learn  
❌ **Less visual** - Can't see design in Canva's visual editor  
❌ **Manual updates** - Design changes require code changes  

---

## COMPARISON TABLE

| Solution | Automation | Design Flexibility | Learning Curve | Cost | Best For |
|----------|------------|-------------------|----------------|------|----------|
| **Canva Manual** | ❌ Manual | ✅✅✅ High | ✅ Low | 💰 Paid | One-time designs |
| **Canva API** | ⚠️ Partial | ✅✅✅ High | ⚠️ Medium | 💰 Paid | User-editable templates |
| **@react-pdf/renderer** | ✅✅✅ Full | ✅✅ Medium | ⚠️ Medium | ✅ Free | Automated, version-controlled |
| **puppeteer + HTML** | ✅✅✅ Full | ✅✅✅ High | ⚠️ Medium | ✅ Free | HTML/CSS designers |
| **pdfkit** | ✅✅✅ Full | ✅✅ Medium | ❌ High | ✅ Free | Low-level control |
| **md-to-pdf** | ✅✅✅ Full | ❌ Low | ✅ Low | ✅ Free | Simple documents |

---

## RECOMMENDATION

### For Rocky Web Studio's Capability Statement:

**Use `@react-pdf/renderer`** because:

1. **You already have the content** in Markdown
2. **You want automation** (no manual Canva steps)
3. **You need consistency** (same design every time)
4. **You use TypeScript** (type-safe PDF generation)
5. **You want version control** (design changes in Git)
6. **You want it free** (no Canva subscription)

### Implementation Timeline

**Week 1:**
- Install `@react-pdf/renderer`
- Create basic PDF component structure
- Implement Page 1 (Cover)

**Week 2:**
- Implement Pages 2-4 (Core content)
- Add styling and layout

**Week 3:**
- Implement Pages 5-8 (Remaining pages)
- Add images and icons
- Finalize styling

**Week 4:**
- Create API route for on-demand generation
- Add caching (optional)
- Test and deploy

**Total Time:** ~2-4 weeks (vs. 6 hours manual Canva, but fully automated after)

---

## QUICK START: @react-pdf/renderer

### Installation

```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf-renderer
```

### Basic Example

```typescript
// components/pdf/CapabilityStatement.tsx
'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fcfcf9',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 48,
    color: '#218092',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#1f2121',
    textAlign: 'center',
    marginBottom: 40,
  },
});

export const CapabilityStatement = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.title}>
          Production-Ready Digital Services
        </Text>
        <Text style={styles.subtitle}>
          For Government & Enterprise
        </Text>
      </View>
    </Page>
  </Document>
);
```

### API Route for PDF Generation

```typescript
// app/api/capability-statement/pdf/route.ts
import { renderToStream } from '@react-pdf/renderer';
import { CapabilityStatement } from '@/components/pdf/CapabilityStatement';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stream = await renderToStream(<CapabilityStatement />);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Capability-Statement-Gov-Enterprise.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response('Error generating PDF', { status: 500 });
  }
}
```

### Usage

**Option 1: Direct Download**
```tsx
// In a component
<a href="/api/capability-statement/pdf" download>
  Download Capability Statement
</a>
```

**Option 2: Generate on Build**
```typescript
// scripts/generate-capability-statement.ts
import { renderToFile } from '@react-pdf/renderer';
import { CapabilityStatement } from '@/components/pdf/CapabilityStatement';
import { writeFileSync } from 'fs';

async function generatePDF() {
  const pdfPath = './public/Capability-Statement-Gov-Enterprise.pdf';
  await renderToFile(<CapabilityStatement />, pdfPath);
  console.log('PDF generated:', pdfPath);
}

generatePDF();
```

---

## CONCLUSION

**Canva API:** Not suitable for fully automated design creation. Designed for integration and collaboration, not headless generation.

**Recommended:** Use `@react-pdf/renderer` for programmatic PDF generation. It provides:
- Full automation
- TypeScript support
- Version control
- No external dependencies
- Free and open source

**Next Steps:**
1. Install `@react-pdf/renderer`
2. Create PDF component structure
3. Migrate content from Markdown to React PDF components
4. Generate PDF on-demand or during build
5. Deploy and test

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**For:** Rocky Web Studio Capability Statement Automation

