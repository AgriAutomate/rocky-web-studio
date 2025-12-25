# Accessibility Case Study - PDF Generation Instructions

## Quick Method: VS Code Extension

### Step 1: Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Markdown PDF"
4. Install "Markdown PDF" by yzane

### Step 2: Generate PDF
1. Open `case-study-complete.md` in VS Code
2. Right-click in the editor
3. Select **"Markdown PDF: Export (pdf)"**
4. PDF will be generated in the same directory

### Step 3: Review PDF
- Check formatting
- Verify all content included
- Review page numbers (if added)

---

## Alternative Methods

### Method 2: Online Converter
1. Go to https://www.markdowntopdf.com/
2. Copy content from `case-study-complete.md`
3. Paste into converter
4. Click "Convert"
5. Download PDF

### Method 3: Pandoc (Command-line)
```bash
# Install Pandoc first: https://pandoc.org/installing.html
pandoc case-study-complete.md -o case-study.pdf --pdf-engine=wkhtmltopdf
```

---

## File Structure

- `case-study.md` - Original case study
- `case-study-complete.md` - Combined version for PDF (includes all sections)
- `before-after-metrics.md` - Detailed metrics
- `code-samples.md` - Technical proof

---

**Recommended:** Use VS Code Markdown PDF extension (easiest method)

