#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const siteUrl = process.env.SITE_URL || 'https://rockywebstudio.com.au';
const reportsDir = path.join(process.cwd(), 'reports');

// Create reports directory
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('🔍 Running accessibility audits...\n');
console.log(`Target: ${siteUrl}\n`);

// Run axe
console.log('1. Running axe-core...');
try {
  // Use --save to save JSON file directly
  execSync(`npx axe ${siteUrl} --save ${path.join(reportsDir, 'axe-results.json')}`, { 
    stdio: 'inherit',
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  console.log('✅ Axe audit complete\n');
} catch (error) {
  // Axe exits with non-zero if violations found, but file should still be created
  if (fs.existsSync(path.join(reportsDir, 'axe-results.json'))) {
    console.log('⚠️  Axe found violations (see report)\n');
  } else {
    console.log('❌ Axe audit failed - no report generated\n');
  }
}

// Run pa11y
console.log('2. Running pa11y...');
try {
  execSync(`npx pa11y ${siteUrl} --reporter json > ${path.join(reportsDir, 'pa11y-results.json')}`, { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Pa11y audit complete\n');
} catch (error) {
  console.log('⚠️  Pa11y found issues (see report)\n');
}

// Run Lighthouse
console.log('3. Running Lighthouse...');
console.log('   Note: Lighthouse requires Chrome/Chromium. If not installed, this will fail.');
console.log('   You can run Lighthouse manually in Chrome DevTools or install Chrome.\n');
try {
  execSync(`npx lighthouse ${siteUrl} --output=html --output-path=${path.join(reportsDir, 'lighthouse-report.html')} --only-categories=accessibility --quiet --chrome-flags="--headless"`, { 
    stdio: 'inherit',
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  console.log('✅ Lighthouse audit complete\n');
} catch (error) {
  console.log('⚠️  Lighthouse error: Chrome may not be installed or accessible');
  console.log('   Recommendation: Run Lighthouse manually in Chrome DevTools\n');
}

console.log('📊 Reports saved to ./reports/');
console.log('   - axe-results.json');
console.log('   - pa11y-results.json');
console.log('   - lighthouse-report.html');

