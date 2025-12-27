#!/usr/bin/env node

/**
 * Convert key documentation files to PDF
 * 
 * This script identifies and converts important documentation files
 * that would benefit from PDF format for easier reading and sharing.
 */

const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

// Key documentation files to convert (prioritized list)
const docsToConvert = [
  // Priority 1: Main guides and overviews
  {
    input: 'docs/README-8-WEEK-PLAN.md',
    description: '8 Week Plan README - Main guide for using documentation'
  },
  {
    input: 'docs/CURSOR-PROTECTION-GUIDE.md',
    description: 'Cursor Protection Guide - Critical file protection rules'
  },
  {
    input: 'docs/DOCUMENTATION-MASTER-INDEX.md',
    description: 'Documentation Master Index - Navigation hub for all docs'
  },
  {
    input: 'docs/8_WEEK_PLAN_CORRECTED.md',
    description: '8 Week Plan Corrected - Main implementation roadmap'
  },
  
  // Priority 2: Architecture and technical guides
  {
    input: 'docs/ARCHITECTURE_OVERVIEW.md',
    description: 'AI Assistant Architecture Overview'
  },
  {
    input: 'docs/AI_ASSISTANT_TEMPLATE_GUIDE.md',
    description: 'AI Assistant Template Guide - Client deployment guide'
  },
  {
    input: 'docs/MODEL_SELECTION_GUIDE.md',
    description: 'Claude Model Selection Guide - Haiku vs Sonnet'
  },
  {
    input: 'docs/AI_ASSISTANT_DEPLOYMENT_CHECKLIST.md',
    description: 'AI Assistant Deployment Checklist'
  },
  
  // Priority 3: Week guides (if they exist and are comprehensive)
  {
    input: 'docs/WEEK_2_START_GUIDE.md',
    description: 'Week 2 Start Guide'
  },
];

async function convertDoc(inputFile, description) {
  try {
    const inputPath = path.resolve(inputFile);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.log(`⏭️  Skipping (not found): ${inputFile}`);
      return null;
    }

    // Generate output filename - place PDFs in docs/README/ folder
    const inputDir = path.dirname(inputPath);
    const inputBasename = path.basename(inputPath, '.md');
    const readmeDir = path.join(inputDir, 'README');
    
    // Create README directory if it doesn't exist
    if (!fs.existsSync(readmeDir)) {
      fs.mkdirSync(readmeDir, { recursive: true });
    }
    
    const outputPath = path.join(readmeDir, `${inputBasename}.pdf`);
    
    // Check if PDF already exists and is newer
    if (fs.existsSync(outputPath)) {
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      if (outputStats.mtime >= inputStats.mtime) {
        console.log(`✓ Already up-to-date: ${inputFile}`);
        return outputPath;
      }
    }

    console.log(`📄 Converting: ${description}`);
    console.log(`   ${inputFile} → ${path.basename(outputPath)}`);

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
        body_class: 'markdown-body',
        marked_options: {
          headerIds: true,
          mangle: false,
        },
      }
    );

    if (pdf) {
      console.log(`   ✅ Generated: ${outputPath}\n`);
      return outputPath;
    } else {
      console.log(`   ❌ Failed: ${inputFile}\n`);
      return null;
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function main() {
  console.log('🚀 Converting key documentation files to PDF...\n');
  console.log(`Found ${docsToConvert.length} files to process\n`);
  console.log('─'.repeat(60) + '\n');

  const results = {
    converted: [],
    skipped: [],
    failed: [],
  };

  for (const doc of docsToConvert) {
    const result = await convertDoc(doc.input, doc.description);
    if (result) {
      results.converted.push(result);
    } else if (!fs.existsSync(path.resolve(doc.input))) {
      results.skipped.push(doc.input);
    } else {
      results.failed.push(doc.input);
    }
  }

  console.log('─'.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`✅ Converted: ${results.converted.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.converted.length > 0) {
    console.log('\n✅ Successfully converted:');
    results.converted.forEach(file => {
      console.log(`   - ${file}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to convert:');
    results.failed.forEach(file => {
      console.log(`   - ${file}`);
    });
  }

  console.log('\n✨ Done!\n');
}

main().catch(console.error);

