#!/usr/bin/env node
/**
 * Markdown File Cleanup Script
 * 
 * Deletes obsolete, duplicate, and unnecessary .md files
 * Run with: node scripts/cleanup-markdown-files.js
 */

const fs = require('fs');
const path = require('path');

// Files to delete (organized by category)
const filesToDelete = [
  // Questionnaire Error Files (keep QUESTIONNAIRE_DEBUGGING_GUIDE.md if still useful)
  'QUESTIONNAIRE_ERROR_DIAGNOSTIC.md',
  'QUESTIONNAIRE_ERROR_DEEP_DIAGNOSTIC.md',
  'QUESTIONNAIRE_ERROR_SUMMARY.md',
  'QUESTIONNAIRE_ERROR_QUICK_FIX.md',
  'QUESTIONNAIRE_FIX_ACTION_PLAN.md',
  'QUESTIONNAIRE_FIX_COMPLETE.md',
  'QUESTIONNAIRE_FIX_NEXT_STEPS.md',
  'QUESTIONNAIRE_SCHEMA_FIX_COMPLETE.md',
  'QUESTIONNAIRE_CHALLENGES_COLUMN_FIX.md',
  'QUESTIONNAIRE_WEBHOOK_COMPLETE_FIX.md',
  'QUESTIONNAIRE_WORKFLOW_FILES.md',
  'COMET_QUESTIONNAIRE_ERROR_INVESTIGATION.md',
  
  // PDF System Files (keep PDF_SYSTEM_COMPLETE_SUMMARY.md)
  'PDF_COMPONENTS_INTEGRATION_COMPLETE.md',
  'PDF_STORAGE_MIGRATION_COMPLETE.md',
  'PDF_ENHANCEMENT_COMPLETE.md',
  'PDF_GENERATION_FIXES.md',
  'PDF_GENERATION_DEBUG_INFO.md',
  'PDF_DEBUG_CHECKLIST.md',
  'PDF_DATA_VALIDATION_FIXES.md',
  'PDF_DATA_SOURCES.md',
  'PDF_ALL_DATA_VERIFICATION.md',
  
  // Conversion Quick Wins
  'CONVERSION_QUICK_WINS_VALIDATION.md',
  'CONVERSION_QUICK_WINS_IMPLEMENTATION.md',
  'CONVERSION_QUICK_WINS_READY.md',
  'CONVERSION_QUICK_WINS_IMPLEMENTED.md',
  
  // CQ Advantage (keep CQ_ADVANTAGE_STATUS_REPORT.md)
  'CQ_ADVANTAGE_ALIGNMENT_COMPLETE.md',
  'CQ_ADVANTAGE_ALL_10_SECTORS_COMPLETE.md',
  'CQ_ADVANTAGE_ALL_15_SECTORS_COMPLETE.md',
  'CQ_ADVANTAGE_IMPLEMENTATION_COMPLETE.md',
  
  // Deployment Status
  'DEPLOYMENT_STATUS.md',
  'DEPLOYMENT_FINAL_SUMMARY.md',
  'DEPLOYMENT_COMMANDS.md',
  
  // Audit Reports
  'PROJECT_AUDIT_FINAL.md',
  'SYSTEM_AUDIT_COMPLETE.md',
  'TECHNICAL_AUDIT.md',
  'CONVERSION_AUDIT_REPORT.md',
  'KUDOSITY_REMOVAL_AUDIT_2025-12-02.md',
  
  // Implementation Complete
  'AI_CHAT_IMPLEMENTATION_COMPLETE.md',
  'AI_CHAT_SMS_DEPLOYMENT_COMPLETE.md',
  'AI_CHAT_SMS_FINALIZATION_COMPLETE.md',
  'AVOB_DEPLOYMENT_SUMMARY.md',
  'CONSCIOUSNESS_SCALE_IMPLEMENTATION.md',
  'EMAIL_TEMPLATES_REDESIGN_COMPLETE.md',
  'GA4_FUNNEL_TRACKING_COMPLETE.md',
  'GITHUB_ACTIONS_SETUP_COMPLETE.md',
  'MISSING_COMPONENTS_BUILD_COMPLETE.md',
  'ORGANIZATIONAL_FIXES_COMPLETE.md',
  'SENTRY_INTEGRATION_COMPLETE.md',
  'SMS_VERIFICATION_COMPLETE.md',
  'SMS_LOGGING_IMPLEMENTATION.md',
  
  // Verification Files
  'FILE_LOCATION_VERIFICATION.md',
  'PAYLOAD_VERIFICATION.md',
  'PRICING_CONSISTENCY_VERIFICATION.md',
  'STRIPE_PAYMENT_VERIFICATION.md',
  'STRIPE_VERIFICATION_REPORT.md',
  'PRODUCTION_READINESS_SUMMARY.md',
  'PRODUCTION_BUILD_CHECKLIST.md',
  
  // Debug Files
  'DEBUG_ROUTE_ERROR.md',
  'ENV_LOCAL_ISSUE_EXPLANATION.md',
  'ROUTE_VERIFICATION_SUMMARY.md',
  
  // Other Obsolete
  'N8N_DEPRECATION_WARNINGS_FIXED.md',
  'CURSOR_PROMPT_FIX_PRICING.md',
  'PROJECT_DETAILS.md',
  'PROJECT_STRUCTURE_SUMMARY.md',
  'PRIORITIZED_ACTION_PLAN.md',
  'README_LINT.md',
  
  // Stripe Diagnostic Files (docs/)
  'docs/STRIPE_DIAGNOSTIC_REPORT.md',
  'docs/STRIPE_FIXES_APPLIED.md',
  'docs/STRIPE_INTEGRATION_FIXES.md',
  'docs/STRIPE_INTEGRATION_IMPROVEMENTS.md',
  'docs/STRIPE_KEY_FIX_GUIDE.md',
  'docs/STRIPE_KEY_STATUS.md',
  'docs/STRIPE_KEY_UPDATE_COMMANDS.md',
  'docs/STRIPE_KEYS_UPDATED.md',
  'docs/STRIPE_LIVE_KEYS_UPDATED.md',
  'docs/STRIPE_WEBHOOK_VERIFICATION.md',
];

// Files in docs/ that might be obsolete (review these)
const docsFilesToReview = [
  'docs/TWILIO_MIGRATION_COMPLETE.md',
  'docs/TWILIO_MIGRATION_SUMMARY.md',
  'docs/TWILIO_TO_MOBILE_MESSAGE_MIGRATION.md',
  'docs/SMS_VERIFICATION_REPORT.md',
];

function deleteFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting ${filePath}:`, error.message);
      return false;
    }
  } else {
    console.log(`⚠️  Not found: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🧹 Starting Markdown File Cleanup...\n');
  console.log(`Files to delete: ${filesToDelete.length}\n`);
  
  let deleted = 0;
  let notFound = 0;
  let errors = 0;
  
  filesToDelete.forEach(file => {
    const result = deleteFile(file);
    if (result === true) {
      deleted++;
    } else if (result === false && fs.existsSync(path.join(process.cwd(), file))) {
      errors++;
    } else {
      notFound++;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`✅ Deleted: ${deleted}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n💡 Review these files manually: ${docsFilesToReview.length}`);
  docsFilesToReview.forEach(file => console.log(`   - ${file}`));
}

if (require.main === module) {
  main();
}

module.exports = { filesToDelete, deleteFile };
