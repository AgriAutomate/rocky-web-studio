# AI Chatbot Template Structure

## 📁 Folder Structure

```
AI Chatbot Template/
├── components/
│   ├── ui/
│   │   └── button.tsx              # UI button component
│   └── AIAssistantWidget.tsx       # Main chat widget component
├── app/
│   └── api/
│       └── ai-assistant/
│           └── route.ts            # API endpoint for chat
├── lib/
│   ├── config/
│   │   └── ai-assistant-template.ts # Client configuration
│   ├── supabase/
│   │   └── client.ts                # Supabase client setup
│   ├── claude.ts                   # Claude API integration
│   ├── knowledge-base.ts            # Knowledge base (customize per client)
│   ├── rate-limit.ts               # Rate limiting logic
│   └── utils.ts                    # Utility functions
├── types/
│   └── ai-assistant.ts             # TypeScript type definitions
├── supabase/
│   └── migrations/
│       └── 20250125_create_ai_assistant_tables.sql  # Database schema
├── docs/
│   ├── AI_ASSISTANT_TEMPLATE_GUIDE.md
│   └── AI_ASSISTANT_PRODUCTIZATION_SUMMARY.md
├── scripts/
│   ├── deploy-ai-assistant-template.sh    # Bash deployment script
│   └── deploy-ai-assistant-template.ps1   # PowerShell deployment script
├── README.md                        # Template overview
├── ENVIRONMENT_SETUP.md             # Environment setup guide
├── TEMPLATE_STRUCTURE.md            # This file
├── .gitignore                       # Git ignore rules
└── package.json.template            # Dependencies template
```

## 📋 File Descriptions

### Core Components
- **AIAssistantWidget.tsx** - Floating chat widget UI with streaming support
- **route.ts** - API endpoint handling chat requests, rate limiting, storage

### Configuration
- **ai-assistant-template.ts** - Centralized client configuration
- **knowledge-base.ts** - Services, FAQs, and system prompt (customize per client)

### Integration
- **claude.ts** - Claude API integration with streaming
- **client.ts** - Supabase database client
- **rate-limit.ts** - Rate limiting (10 req/min)

### Database
- **20250125_create_ai_assistant_tables.sql** - Database schema for conversations and messages

### Documentation
- **AI_ASSISTANT_TEMPLATE_GUIDE.md** - Complete deployment guide
- **AI_ASSISTANT_PRODUCTIZATION_SUMMARY.md** - Business model and strategy

### Scripts
- **deploy-ai-assistant-template.sh** - Automated deployment (Bash)
- **deploy-ai-assistant-template.ps1** - Automated deployment (PowerShell)

## 🎯 Customization Points

### Required Customization (Per Client)
1. **lib/config/ai-assistant-template.ts**
   - Company name, location, business type
   - Services list
   - FAQs
   - Website links
   - Branding colors

2. **lib/knowledge-base.ts**
   - Update services array
   - Update FAQs array
   - Update website links
   - Customize system prompt

### Optional Customization
- Widget styling (colors, position)
- Rate limit settings
- Max tokens configuration

## 🚀 Quick Start

1. Copy this template to client project
2. Update `lib/config/ai-assistant-template.ts`
3. Update `lib/knowledge-base.ts`
4. Set up environment variables (see `ENVIRONMENT_SETUP.md`)
5. Run database migrations
6. Deploy to Vercel

## 📦 Dependencies

See `package.json.template` for required npm packages:
- Next.js 16
- React 19
- @anthropic-ai/sdk
- @supabase/supabase-js
- lucide-react (icons)
- tailwindcss

## ✅ Deployment Checklist

See `docs/AI_ASSISTANT_TEMPLATE_GUIDE.md` for complete checklist.

**Estimated Time:** 48 hours (10 hours actual work)

