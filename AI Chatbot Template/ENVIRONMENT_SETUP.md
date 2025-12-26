# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_URL=https://your-domain.com

# Optional: Sentry (for error monitoring)
SENTRY_DSN=your-sentry-dsn
```

## Setup Instructions

### 1. Anthropic API Key
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)
5. Add to `.env.local` as `ANTHROPIC_API_KEY`

### 2. Supabase Setup
1. Create account at https://supabase.com/
2. Create a new project
3. Go to Project Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Run the migration:
   ```sql
   -- Run: supabase/migrations/20250125_create_ai_assistant_tables.sql
   ```

### 3. Application URL
- For local development: `http://localhost:3000`
- For production: Your actual domain (e.g., `https://yourdomain.com`)

## Verification

After setting up environment variables, verify:

```bash
# Check if variables are loaded
npm run dev

# Test API endpoint
curl http://localhost:3000/api/ai-assistant \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Security Notes

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Use service role key only on server-side
- ⚠️ Keep API keys secure and rotate regularly
- ⚠️ Use environment variables in production (Vercel, etc.)

