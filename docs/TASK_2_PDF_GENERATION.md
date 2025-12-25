# Task 2: Case Study PDF Generation - Instructions
**Date:** December 25, 2025  
**Status:** Ready to Execute  
**Time:** 30-60 minutes

## Overview

Generate a professional PDF version of the accessibility case study for government tender submissions.

---

## Source File

**Main File:** `case-studies/accessibility/case-study-complete.md`

This file contains the complete case study with all sections combined, ready for PDF conversion.

---

## Recommended Method: VS Code Extension

### Step 1: Install Markdown PDF Extension
1. Open VS Code
2. Press `Ctrl+Shift+X` (or Cmd+Shift+X on Mac)
3. Search for: **"Markdown PDF"**
4. Install: **"Markdown PDF" by yzane**

### Step 2: Open Case Study File
1. Navigate to: `case-studies/accessibility/case-study-complete.md`
2. Open in VS Code

### Step 3: Generate PDF
1. Right-click anywhere in the editor
2. Select: **"Markdown PDF: Export (pdf)"**
3. Wait for generation (~10-30 seconds)
4. PDF will be saved as: `case-study-complete.pdf` in the same directory

### Step 4: Review PDF
- [ ] Check formatting looks good
- [ ] Verify all sections included
- [ ] Check page numbers (if added)
- [ ] Review tables and code blocks
- [ ] Verify metrics are accurate

---

## Alternative Methods

### Method 2: Online Converter (Easiest if no VS Code)
1. Go to: https://www.markdowntopdf.com/
2. Open `case-study-complete.md` in a text editor
3. Copy all content
4. Paste into converter
5. Click "Convert"
6. Download PDF
7. Save as: `case-studies/accessibility/case-study.pdf`

### Method 3: Pandoc (Advanced)
```bash
# Install Pandoc: https://pandoc.org/installing.html
pandoc case-studies/accessibility/case-study-complete.md \
  -o case-studies/accessibility/case-study.pdf \
  --pdf-engine=wkhtmltopdf \
  -V geometry:margin=1in \
  --toc
```

---

## PDF Quality Checklist

After generation, verify:

- [ ] **Cover Page:** Title, date, company name
- [ ] **All Sections:** Executive summary, challenge, approach, results
- [ ] **Metrics:** Before/after tables formatted correctly
- [ ] **Code Samples:** Monospace font, readable
- [ ] **Tables:** Borders visible, data aligned
- [ ] **Page Numbers:** Present (if added)
- [ ] **File Size:** Reasonable (<5MB)
- [ ] **Formatting:** Professional appearance

---

## Customization (Optional)

### Add Cover Page
If the PDF doesn't have a cover page, you can add one manually:

1. Open PDF in PDF editor (Adobe, online tool)
2. Add cover page with:
   - Title: "Achieving WCAG 2.1 AA Compliance"
   - Subtitle: "Rocky Web Studio Case Study"
   - Date: January 2025
   - Company logo (if available)

### Add Page Numbers
Most PDF generators add page numbers automatically. If not:
1. Use PDF editor to add page numbers
2. Or use Pandoc with `--toc` flag

### Branding
- Add company logo to header/footer
- Use brand colors in headers
- Add contact information

---

## File Organization

**Save PDF as:**
```
case-studies/accessibility/case-study.pdf
```

**Optional versions:**
- `case-study-full.pdf` - Complete version
- `case-study-summary.pdf` - Executive summary only (if needed)

---

## Troubleshooting

### Issue: Extension not found
**Solution:** Search for "Markdown PDF" or "yzane" in VS Code extensions

### Issue: PDF formatting poor
**Solution:** 
- Try different extension (Markdown Preview Enhanced)
- Use online converter
- Use Pandoc for better control

### Issue: Code blocks not formatting
**Solution:** 
- Check Markdown syntax
- Use code fences (```)
- Try different PDF generator

### Issue: Tables breaking
**Solution:**
- Simplify table structure
- Use online converter
- Use Word/Google Docs method

---

## Quick Start (Fastest)

1. **Install VS Code extension:** "Markdown PDF" by yzane
2. **Open:** `case-studies/accessibility/case-study-complete.md`
3. **Right-click:** "Markdown PDF: Export (pdf)"
4. **Done!** PDF generated in same directory

**Time:** ~5-10 minutes

---

## Next Steps After PDF Generation

1. **Review PDF:**
   - Check formatting
   - Verify content
   - Test on different devices

2. **Update Documentation:**
   - Note PDF location
   - Update case study references

3. **Prepare for Tenders:**
   - PDF ready to attach
   - Can customize per tender
   - Keep source Markdown for updates

---

**Created:** December 25, 2025  
**Status:** Ready to Execute  
**Method:** VS Code Extension (Recommended)  
**Time:** 30-60 minutes (5-10 min with extension)

