/**
 * Lighthouse Audit Script
 * 
 * Uses PageSpeed Insights API to get Lighthouse scores
 * Requires: GOOGLE_PAGESPEED_API_KEY environment variable (optional but recommended)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rockywebstudio.com.au';
const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY || '';
const OUTPUT_FILE = path.join(__dirname, '../reports/lighthouse-audit-live.json');

// PageSpeed Insights API endpoint
const API_URL = API_KEY
  ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE_URL)}&key=${API_KEY}&category=ACCESSIBILITY&category=PERFORMANCE&category=SEO&category=BEST_PRACTICES&strategy=desktop`
  : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE_URL)}&category=ACCESSIBILITY&category=PERFORMANCE&category=SEO&category=BEST_PRACTICES&strategy=desktop`;

console.log('🔍 Running Lighthouse audit via PageSpeed Insights API...');
console.log(`📊 Auditing: ${SITE_URL}`);
if (API_KEY) {
  console.log('✅ Using API key (higher rate limits)');
} else {
  console.log('⚠️  No API key - using free tier (may have rate limits)');
}
console.log('');

https.get(API_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.error) {
        console.error('❌ API Error:', result.error.message);
        if (result.error.message.includes('API key')) {
          console.error('💡 Tip: Set GOOGLE_PAGESPEED_API_KEY environment variable');
          console.error('   Get API key from: https://developers.google.com/speed/docs/insights/v5/get-started');
        }
        process.exit(1);
      }

      // Extract Lighthouse scores
      const lighthouse = result.lighthouseResult;
      const categories = lighthouse.categories;

      console.log('📊 Lighthouse Scores:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const scores = {
        performance: Math.round(categories.performance?.score * 100) || 0,
        accessibility: Math.round(categories.accessibility?.score * 100) || 0,
        bestPractices: Math.round(categories['best-practices']?.score * 100) || 0,
        seo: Math.round(categories.seo?.score * 100) || 0,
      };

      console.log(`🚀 Performance:     ${scores.performance}/100 ${getScoreEmoji(scores.performance)}`);
      console.log(`♿ Accessibility:   ${scores.accessibility}/100 ${getScoreEmoji(scores.accessibility)}`);
      console.log(`✅ Best Practices:  ${scores.bestPractices}/100 ${getScoreEmoji(scores.bestPractices)}`);
      console.log(`🔍 SEO:             ${scores.seo}/100 ${getScoreEmoji(scores.seo)}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const average = Math.round((scores.performance + scores.accessibility + scores.bestPractices + scores.seo) / 4);
      console.log(`📈 Average Score:   ${average}/100 ${getScoreEmoji(average)}`);
      console.log('');

      // Save full results
      const outputDir = path.dirname(OUTPUT_FILE);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
      console.log(`💾 Full results saved to: ${OUTPUT_FILE}`);
      console.log('');

      // Show key metrics
      if (lighthouse.audits) {
        console.log('📋 Key Metrics:');
        const metrics = [
          'first-contentful-paint',
          'largest-contentful-paint',
          'total-blocking-time',
          'cumulative-layout-shift',
          'speed-index',
        ];

        metrics.forEach(metric => {
          const audit = lighthouse.audits[metric];
          if (audit) {
            const value = audit.numericValue !== undefined 
              ? `${(audit.numericValue / 1000).toFixed(2)}s`
              : audit.displayValue || 'N/A';
            console.log(`   ${audit.title}: ${value}`);
          }
        });
        console.log('');
      }

      // Show accessibility issues
      if (lighthouse.audits && lighthouse.audits['accessibility']) {
        const a11yAudit = lighthouse.audits['accessibility'];
        if (a11yAudit.details && a11yAudit.details.items) {
          const issues = a11yAudit.details.items;
          if (issues.length > 0) {
            console.log(`⚠️  Accessibility Issues Found: ${issues.length}`);
            issues.slice(0, 5).forEach((issue, index) => {
              console.log(`   ${index + 1}. ${issue.rule?.title || 'Unknown issue'}`);
            });
            if (issues.length > 5) {
              console.log(`   ... and ${issues.length - 5} more`);
            }
            console.log('');
          } else {
            console.log('✅ No accessibility issues found!');
            console.log('');
          }
        }
      }

      console.log('✅ Audit complete!');
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Response:', data.substring(0, 500));
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

