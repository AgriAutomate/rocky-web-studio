#!/bin/bash

# AI Assistant Widget Template Deployment Script
# 
# This script automates the deployment of the AI Assistant widget template
# for a new client.
#
# Usage: ./scripts/deploy-ai-assistant-template.sh CLIENT_NAME

set -e

CLIENT_NAME=${1:-"new-client"}
CLIENT_DIR="clients/${CLIENT_NAME}"

echo "🚀 Deploying AI Assistant Widget Template for: ${CLIENT_NAME}"
echo ""

# Step 1: Create client directory
echo "📁 Creating client directory..."
mkdir -p "${CLIENT_DIR}"
cd "${CLIENT_DIR}"

# Step 2: Copy template files
echo "📋 Copying template files..."
cp -r ../../components/AIAssistantWidget.tsx ./components/
cp -r ../../app/api/ai-assistant ./app/api/
cp -r ../../lib/claude.ts ./lib/
cp -r ../../lib/rate-limit.ts ./lib/
cp -r ../../lib/config/ai-assistant-template.ts ./lib/config/
cp -r ../../types/ai-assistant.ts ./types/
cp -r ../../supabase/migrations/20250125_create_ai_assistant_tables.sql ./supabase/migrations/

# Step 3: Create configuration file
echo "⚙️  Creating configuration file..."
cat > lib/config/client-config.ts << 'EOF'
/**
 * Client Configuration
 * 
 * Update this file with client-specific information
 */

import { CLIENT_CONFIG } from './ai-assistant-template';

// Update CLIENT_CONFIG in ai-assistant-template.ts with client-specific data
export { CLIENT_CONFIG };
EOF

# Step 4: Create .env.example
echo "📝 Creating environment template..."
cat > .env.example << 'EOF'
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_URL=https://your-domain.com

# Optional: Sentry
SENTRY_DSN=your-sentry-dsn
EOF

# Step 5: Create README
echo "📖 Creating deployment README..."
cat > README.md << EOF
# AI Assistant Widget - ${CLIENT_NAME}

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure client settings:**
   - Edit \`lib/config/ai-assistant-template.ts\`
   - Update CLIENT_CONFIG with client-specific data

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   \`\`\`

4. **Set up Supabase:**
   - Create new Supabase project
   - Run migration: \`supabase/migrations/20250125_create_ai_assistant_tables.sql\`

5. **Deploy:**
   \`\`\`bash
   npm run build
   vercel deploy --prod
   \`\`\`

## Customization Checklist

- [ ] Update company name, location, business type
- [ ] Update services list
- [ ] Update FAQs
- [ ] Update website links
- [ ] Customize branding (colors, logo)
- [ ] Update system prompt customizations
- [ ] Test knowledge base accuracy
- [ ] Deploy to production

## Support

For questions or issues, contact Rocky Web Studio.
EOF

# Step 6: Create deployment checklist
echo "✅ Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Phase 1: Setup (2 hours)
- [ ] Clone/create project
- [ ] Install dependencies
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Set up Vercel project
- [ ] Configure environment variables

## Phase 2: Customization (4 hours)
- [ ] Update client configuration (lib/config/ai-assistant-template.ts)
- [ ] Update knowledge base (services, FAQs)
- [ ] Customize system prompt
- [ ] Update website links
- [ ] Configure branding (colors, logo)
- [ ] Test knowledge base accuracy

## Phase 3: Integration (2 hours)
- [ ] Add widget to layout (app/layout.tsx)
- [ ] Configure widget position/styling
- [ ] Test widget on all pages
- [ ] Verify accessibility (WCAG 2.1 AA)

## Phase 4: Testing & Launch (2 hours)
- [ ] Test conversation flow
- [ ] Verify rate limiting
- [ ] Test error handling
- [ ] Check mobile responsiveness
- [ ] Deploy to production
- [ ] Monitor for 24 hours

**Total Time:** ~10 hours (48 hours with buffer)
EOF

echo ""
echo "✅ Template deployment complete!"
echo ""
echo "Next steps:"
echo "1. cd ${CLIENT_DIR}"
echo "2. Edit lib/config/ai-assistant-template.ts with client data"
echo "3. Follow DEPLOYMENT_CHECKLIST.md"
echo ""
echo "📚 Documentation: docs/AI_ASSISTANT_TEMPLATE_GUIDE.md"

