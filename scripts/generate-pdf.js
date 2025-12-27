#!/usr/bin/env node

/**
 * Generate PDF from Markdown file
 * 
 * Usage:
 *   node scripts/generate-pdf.js <input.md> [output.pdf]
 * 
 * Examples:
 *   node scripts/generate-pdf.js case-studies/ai-assistant/case-study.md
 *   node scripts/generate-pdf.js case-studies/accessibility/case-study.md output.pdf
 */

const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

async function generatePDF(inputFile, outputFile) {
  try {
    // Resolve input file path
    const inputPath = path.resolve(inputFile);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }

    // Generate output filename if not provided
    const outputPath = outputFile 
      ? path.resolve(outputFile)
      : inputPath.replace(/\.md$/, '.pdf');

    console.log(`📄 Generating PDF from: ${inputPath}`);
    console.log(`💾 Output will be saved to: ${outputPath}`);

    // Generate PDF
    const pdf = await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm',
          },
          printBackground: true,
        },
        stylesheet: [
          // Add custom styles if needed
          // You can create a CSS file and reference it here
        ],
        body_class: 'markdown-body',
        marked_options: {
          headerIds: true,
          mangle: false,
        },
      }
    );

    if (pdf) {
      console.log(`✅ PDF generated successfully: ${outputPath}`);
      return outputPath;
    } else {
      console.error('❌ Error: PDF generation returned no result');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node scripts/generate-pdf.js <input.md> [output.pdf]

Examples:
  node scripts/generate-pdf.js case-studies/ai-assistant/case-study.md
  node scripts/generate-pdf.js case-studies/accessibility/case-study.md output.pdf
`);
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

generatePDF(inputFile, outputFile);

