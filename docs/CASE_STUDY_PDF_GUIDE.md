# Case Study PDF Generation Guide
**Date:** January 23, 2025  
**Purpose:** Create professional PDF for government tenders  
**Time:** 30-60 minutes

## Overview

Convert the accessibility case study from Markdown to a professional PDF document suitable for government tender submissions.

---

## Source Files

The case study is already documented in:
1. `case-studies/accessibility/case-study.md` - Full narrative (1,200+ words)
2. `case-studies/accessibility/before-after-metrics.md` - Metrics and data
3. `case-studies/accessibility/code-samples.md` - Technical proof

---

## PDF Generation Options

### Option 1: Markdown to PDF (Recommended)
**Tools:**
- **Pandoc** (command-line, free)
- **Markdown to PDF** (VS Code extension)
- **Online converters** (markdowntopdf.com, etc.)

**Pros:**
- Preserves formatting
- Professional output
- Easy to update

### Option 2: Word/Google Docs
**Steps:**
1. Copy Markdown content
2. Paste into Word/Google Docs
3. Format professionally
4. Export as PDF

**Pros:**
- Full control over formatting
- Easy to add branding
- Professional layout

### Option 3: HTML to PDF
**Steps:**
1. Convert Markdown to HTML
2. Style with CSS
3. Print to PDF (browser)

**Pros:**
- Custom styling
- Professional appearance

---

## Recommended: Pandoc Method

### Step 1: Install Pandoc
**Windows:**
```bash
# Download from: https://pandoc.org/installing.html
# Or use Chocolatey:
choco install pandoc
```

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc
```

### Step 2: Combine Case Study Files
Create a single Markdown file with all content:

```bash
# Combine files
cat case-studies/accessibility/case-study.md \
    case-studies/accessibility/before-after-metrics.md \
    case-studies/accessibility/code-samples.md \
    > case-studies/accessibility/case-study-complete.md
```

### Step 3: Generate PDF
```bash
pandoc case-studies/accessibility/case-study-complete.md \
  -o case-studies/accessibility/case-study.pdf \
  --pdf-engine=wkhtmltopdf \
  -V geometry:margin=1in \
  --toc \
  --highlight-style=tango
```

**Alternative (if wkhtmltopdf not available):**
```bash
pandoc case-studies/accessibility/case-study-complete.md \
  -o case-studies/accessibility/case-study.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  --toc
```

---

## PDF Content Structure

### 1. Cover Page
- Title: "Achieving WCAG 2.1 AA Compliance for Rocky Web Studio"
- Subtitle: "Accessibility Remediation Case Study"
- Date: January 2025
- Company: Rocky Web Studio
- Logo (if available)

### 2. Executive Summary
- Key results (0 violations, 98/100 score)
- Time investment
- ROI

### 3. Full Case Study
- Challenge
- Approach
- Implementation
- Results
- Technical details

### 4. Metrics & Data
- Before/after comparison
- Detailed violation breakdown
- Time investment

### 5. Technical Proof (Optional)
- Code samples
- Implementation details

### 6. Appendix (Optional)
- Screenshots
- Test results
- References

---

## Formatting Guidelines

### Professional Styling
- **Font:** Arial or Calibri (11-12pt)
- **Headings:** Bold, larger font
- **Margins:** 1 inch all sides
- **Line spacing:** 1.15 or 1.5
- **Page numbers:** Bottom center

### Branding
- Add company logo (if available)
- Use brand colors in headers/footers
- Include contact information

### Tables
- Use clear borders
- Alternating row colors
- Bold headers

### Code Samples
- Monospace font
- Light gray background
- Borders around code blocks

---

## Quick Method: VS Code Extension

### Step 1: Install Extension
1. Open VS Code
2. Install "Markdown PDF" extension
3. Or "Markdown Preview Enhanced"

### Step 2: Generate PDF
1. Open `case-studies/accessibility/case-study.md`
2. Right-click in editor
3. Select "Markdown PDF: Export (pdf)"
4. PDF generated in same directory

**Customize:**
- Add CSS styling
- Configure page size
- Add headers/footers

---

## Online Converter Method

### Step 1: Prepare Content
1. Combine all case study files into one
2. Clean up formatting
3. Save as single `.md` file

### Step 2: Convert Online
1. Go to: https://www.markdowntopdf.com/
2. Upload or paste Markdown
3. Click "Convert"
4. Download PDF

**Alternative sites:**
- https://dillinger.io/ (export as PDF)
- https://stackedit.io/ (export as PDF)

---

## Manual Method: Word/Google Docs

### Step 1: Copy Content
1. Open `case-studies/accessibility/case-study.md`
2. Copy all content
3. Paste into Word/Google Docs

### Step 2: Format
1. Apply heading styles
2. Format tables
3. Add page numbers
4. Insert cover page
5. Add table of contents

### Step 3: Export
1. File → Export → PDF
2. Save as: `case-studies/accessibility/case-study.pdf`

---

## Quality Checklist

Before finalizing PDF:

- [ ] Cover page included
- [ ] Table of contents (if long)
- [ ] Page numbers
- [ ] Professional formatting
- [ ] All sections included
- [ ] Metrics accurate
- [ ] Code samples formatted correctly
- [ ] Branding applied (if available)
- [ ] No formatting errors
- [ ] File size reasonable (<5MB)

---

## File Organization

**Save PDF as:**
```
case-studies/accessibility/case-study.pdf
```

**Optional versions:**
- `case-study-full.pdf` - Complete with code samples
- `case-study-summary.pdf` - Executive summary only
- `case-study-technical.pdf` - Technical details only

---

## Next Steps After PDF Creation

1. **Review PDF:**
   - Check formatting
   - Verify all content included
   - Test on different devices

2. **Update Documentation:**
   - Note PDF location in case study
   - Update README if needed

3. **Prepare for Tenders:**
   - PDF ready to attach
   - Can customize per tender
   - Keep source Markdown for updates

---

## Troubleshooting

### Issue: Pandoc not found
**Solution:** Install Pandoc or use alternative method

### Issue: PDF formatting poor
**Solution:** Use Word/Google Docs for better control

### Issue: Code samples not formatting
**Solution:** Use code block syntax in Markdown

### Issue: Tables breaking
**Solution:** Simplify tables or use Word for better control

---

## Quick Reference

**Fastest Method:** VS Code Markdown PDF extension  
**Most Control:** Word/Google Docs  
**Most Professional:** Pandoc with custom styling  
**Easiest:** Online converter

---

**Created:** January 23, 2025  
**Status:** Ready to Execute  
**Time:** 30-60 minutes  
**Output:** Professional PDF case study

