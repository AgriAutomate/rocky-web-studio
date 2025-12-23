# Markdown File Cleanup Plan

## Analysis Summary
- **Total .md files found:** 226
- **Root directory:** ~50+ files
- **docs/ directory:** ~98 files
- **lib/data/challenges/:** ~10 files (keep - these are content)

## Categories

### ✅ KEEP - Essential Documentation

#### Core Documentation
- `README.md` - Main project readme
- `ARCHITECTURE_DETAILS.md` - System architecture
- `DEPLOYMENT.md` - Active deployment guide
- `docs/PRODUCTION_READINESS.md` - Production checklist
- `docs/DISCOVERY_TREE_API.md` - Active API docs
- `docs/FEATURE_ESTIMATION_USAGE.md` - Active feature docs
- `DISCOVERY_TREE_IMPLEMENTATION.md` - Recent implementation
- `DISCOVERY_TREE_UI_IMPLEMENTATION.md` - Recent implementation
- `FEATURE_ESTIMATION_IMPLEMENTATION.md` - Recent implementation
- `QUESTIONNAIRE_PROJECT_PLANNING_ANALYSIS.md` - Active analysis

#### Active Guides (docs/)
- `docs/consultation-call-script.md`
- `docs/STRIPE_INTEGRATION.md`
- `docs/XERO_INTEGRATION.md`
- `docs/SENTRY_SETUP.md`
- `docs/RESEND_DOMAIN_SETUP.md`
- `docs/GITHUB_ACTIONS_SETUP.md`
- `docs/N8N_QUICK_START.md`
- `docs/N8N_CONFIGURATION.md`
- All `docs/n8n-*.md` workflow files (active references)
- `docs/email-templates/README.md`
- `docs/email-campaigns/*.md`

#### Content Files (keep)
- `lib/data/challenges/*.md` - Content files, not docs

### 🗑️ DELETE - Duplicates & Obsolete Status Reports

#### Questionnaire Error Files (23 files → consolidate to 1)
- `QUESTIONNAIRE_ERROR_DIAGNOSTIC.md`
- `QUESTIONNAIRE_ERROR_DEEP_DIAGNOSTIC.md`
- `QUESTIONNAIRE_ERROR_SUMMARY.md`
- `QUESTIONNAIRE_ERROR_QUICK_FIX.md`
- `QUESTIONNAIRE_FIX_ACTION_PLAN.md`
- `QUESTIONNAIRE_FIX_COMPLETE.md`
- `QUESTIONNAIRE_FIX_NEXT_STEPS.md`
- `QUESTIONNAIRE_SCHEMA_FIX_COMPLETE.md`
- `QUESTIONNAIRE_CHALLENGES_COLUMN_FIX.md`
- `QUESTIONNAIRE_WEBHOOK_COMPLETE_FIX.md`
- `QUESTIONNAIRE_WORKFLOW_FILES.md`
- `COMET_QUESTIONNAIRE_ERROR_INVESTIGATION.md`
- `QUESTIONNAIRE_DEBUGGING_GUIDE.md` (keep if still useful, otherwise delete)
- `QUESTIONNAIRE_WEBHOOK_SETUP_GUIDE.md` (keep if still useful)

#### PDF System Files (19 files → consolidate to 1-2)
- `PDF_COMPONENTS_INTEGRATION_COMPLETE.md`
- `PDF_STORAGE_MIGRATION_COMPLETE.md`
- `PDF_ENHANCEMENT_COMPLETE.md`
- `PDF_GENERATION_FIXES.md`
- `PDF_GENERATION_DEBUG_INFO.md`
- `PDF_DEBUG_CHECKLIST.md`
- `PDF_DATA_VALIDATION_FIXES.md`
- `PDF_DATA_SOURCES.md`
- `PDF_ALL_DATA_VERIFICATION.md`
- `PDF_SYSTEM_COMPLETE_SUMMARY.md` (keep this one as summary)

#### Conversion Quick Wins (4 files → delete all)
- `CONVERSION_QUICK_WINS_VALIDATION.md`
- `CONVERSION_QUICK_WINS_IMPLEMENTATION.md`
- `CONVERSION_QUICK_WINS_READY.md`
- `CONVERSION_QUICK_WINS_IMPLEMENTED.md`

#### CQ Advantage Files (5 files → keep 1 summary)
- `CQ_ADVANTAGE_ALIGNMENT_COMPLETE.md`
- `CQ_ADVANTAGE_ALL_10_SECTORS_COMPLETE.md`
- `CQ_ADVANTAGE_ALL_15_SECTORS_COMPLETE.md`
- `CQ_ADVANTAGE_IMPLEMENTATION_COMPLETE.md`
- `CQ_ADVANTAGE_STATUS_REPORT.md` (keep this one)

#### Deployment Status Files (multiple → keep 1-2)
- `DEPLOYMENT_STATUS.md` (delete)
- `DEPLOYMENT_FINAL_SUMMARY.md` (delete)
- `DEPLOYMENT_COMMANDS.md` (delete if commands are in DEPLOYMENT.md)
- `PHASE_1_DEPLOYMENT_GUIDE.md` (keep if different from DEPLOYMENT.md)
- `PHASE_1_QUICK_START.md` (keep if useful)
- `PHASE_1_TESTING_CHECKLIST.md` (keep if useful)

#### Audit/Status Reports (multiple → keep 1-2)
- `PROJECT_AUDIT_REPORT.md`
- `PROJECT_AUDIT_FINAL.md` (delete - duplicate)
- `SYSTEM_AUDIT_COMPLETE.md` (delete - status report)
- `TECHNICAL_BASELINE_AUDIT.md`
- `TECHNICAL_AUDIT.md` (delete if duplicate)
- `CONVERSION_AUDIT_REPORT.md` (delete - old audit)
- `KUDOSITY_REMOVAL_AUDIT_2025-12-02.md` (delete - one-time audit)

#### Implementation Complete Files (multiple → delete)
- `AI_CHAT_IMPLEMENTATION_COMPLETE.md`
- `AI_CHAT_SMS_DEPLOYMENT_COMPLETE.md`
- `AI_CHAT_SMS_FINALIZATION_COMPLETE.md`
- `AVOB_DEPLOYMENT_SUMMARY.md`
- `CONSCIOUSNESS_SCALE_IMPLEMENTATION.md`
- `EMAIL_TEMPLATES_REDESIGN_COMPLETE.md`
- `GA4_FUNNEL_TRACKING_COMPLETE.md`
- `GITHUB_ACTIONS_SETUP_COMPLETE.md`
- `MISSING_COMPONENTS_BUILD_COMPLETE.md`
- `ORGANIZATIONAL_FIXES_COMPLETE.md`
- `SENTRY_INTEGRATION_COMPLETE.md`
- `SMS_VERIFICATION_COMPLETE.md`
- `SMS_LOGGING_IMPLEMENTATION.md`

#### Verification/Status Files (multiple → delete)
- `FILE_LOCATION_VERIFICATION.md`
- `PAYLOAD_VERIFICATION.md`
- `PRICING_CONSISTENCY_VERIFICATION.md`
- `STRIPE_PAYMENT_VERIFICATION.md`
- `STRIPE_VERIFICATION_REPORT.md`
- `PRODUCTION_READINESS_SUMMARY.md` (keep PRODUCTION_READINESS_CHECKLIST.md)
- `PRODUCTION_BUILD_CHECKLIST.md` (keep if different from PRODUCTION_READINESS.md)

#### Debug/Troubleshooting (keep only active ones)
- `SMS_DEBUGGING_GUIDE.md` (keep - active troubleshooting)
- `SMS_DEBUG_QUICK_REFERENCE.md` (keep if useful)
- `DEBUG_ROUTE_ERROR.md` (delete - one-time debug)
- `ENV_LOCAL_ISSUE_EXPLANATION.md` (delete - one-time issue)

#### Stripe Files (multiple → consolidate)
- `docs/STRIPE_DIAGNOSTIC_REPORT.md` (delete)
- `docs/STRIPE_FIXES_APPLIED.md` (delete)
- `docs/STRIPE_INTEGRATION_FIXES.md` (delete)
- `docs/STRIPE_INTEGRATION_IMPROVEMENTS.md` (delete)
- `docs/STRIPE_KEY_FIX_GUIDE.md` (delete)
- `docs/STRIPE_KEY_STATUS.md` (delete)
- `docs/STRIPE_KEY_UPDATE_COMMANDS.md` (delete)
- `docs/STRIPE_KEYS_UPDATED.md` (delete)
- `docs/STRIPE_LIVE_KEYS_UPDATED.md` (delete)
- `docs/STRIPE_WEBHOOK_VERIFICATION.md` (delete)
- Keep: `docs/STRIPE_INTEGRATION.md` (main doc)

#### Other Obsolete Files
- `N8N_DEPRECATION_WARNINGS_FIXED.md` (delete)
- `N8N_WEBHOOK_URL_FINDER.md` (delete if obsolete)
- `CURSOR_PROMPT_FIX_PRICING.md` (delete)
- `ROUTE_VERIFICATION_SUMMARY.md` (delete)
- `README_LINT.md` (delete)
- `PROJECT_DETAILS.md` (delete if duplicate of ARCHITECTURE_DETAILS.md)
- `PROJECT_STRUCTURE_SUMMARY.md` (delete)
- `PRIORITIZED_ACTION_PLAN.md` (delete if obsolete)

## Summary

### Files to Delete: ~120-130 files
### Files to Keep: ~90-100 files (including content files)

## Action Plan

1. Create `docs/archive/` directory for historical reference
2. Move truly historical files there (optional)
3. Delete all obsolete status/completion reports
4. Consolidate duplicate documentation
5. Update README.md to reference only active docs
