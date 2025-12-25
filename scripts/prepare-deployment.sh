#!/bin/bash
# Prepare Accessibility Fixes for Deployment
# This script stages only the accessibility-related files

echo "📦 Preparing accessibility fixes for deployment..."

# Stage accessibility fix files
echo "Staging accessibility fixes..."
git add app/globals.css
git add components/hero-section.tsx
git add components/services-grid.tsx
git add components/services/ServicePricing.tsx
git add components/services/ServiceCTA.tsx
git add components/services/ServiceCtaBand.tsx
git add components/custom-songs-banner.tsx
git add components/ui/button.tsx

# Stage documentation
echo "Staging documentation..."
git add docs/WEEK_0_*.md
git add docs/WEEK_1_*.md
git add docs/DEPLOYMENT_CHECKLIST.md
git add docs/existing-systems-audit.md
git add docs/existing-client-audit.md

# Stage case studies
echo "Staging case studies..."
git add case-studies/

# Stage accessibility tools
echo "Staging accessibility tools..."
git add scripts/test-accessibility.js
git add .github/workflows/accessibility.yml
git add package.json package-lock.json

# Stage reports directory (if needed)
if [ -d "reports" ]; then
    echo "Staging reports..."
    git add reports/
fi

echo ""
echo "✅ Files staged for commit"
echo ""
echo "Review changes with: git status"
echo "Commit with: git commit -m 'feat(a11y): fix 6 color contrast violations for WCAG 2.1 AA compliance'"
echo ""

