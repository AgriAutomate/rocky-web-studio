# AI Assistant Complete Setup Checklist

## ✅ Pre-Deployment Verification

Use this checklist to ensure everything is configured correctly before testing.

### 1. Environment Variables (Vercel Production)

**Required Variables:**
- [ ] `ANTHROPIC_API_KEY` - Your Claude API key (starts with `sk-ant-...`)
  - Location: Vercel → Project → Settings → Environment Variables
  - Must be set for: Production, Preview, Development
  - Value should be your full API key from https://console.anthropic.com/

**How to Verify:**
1. Go to Vercel dashboard
2. Your Project → Settings → Environment Variables
3. Look for `ANTHROPIC_API_KEY` in the list
4. If missing, add it (see `docs/VERCEL_API_KEY_SETUP.md`)

### 2. Supabase Database Tables

**Required Tables:**
- [ ] `ai_assistant_conversations` table exists
- [ ] `ai_assistant_messages` table exists
- [ ] Row Level Security (RLS) policies are enabled
- [ ] Service role can access tables

**How to Verify:**
1. Go to Supabase Dashboard → Table Editor
2. Check for `ai_assistant_conversations` table
3. Check for `ai_assistant_messages` table
4. If missing, run migration (see below)

**Migration File:**
- Location: `supabase/migrations/20250125_create_ai_assistant_tables.sql`
- Run via Supabase Dashboard or CLI

**To Run Migration:**
```bash
# Option 1: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of supabase/migrations/20250125_create_ai_assistant_tables.sql
3. Paste and run

# Option 2: Supabase CLI
supabase db push
```

### 3. Supabase Connection

**Required:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (for server-side access)

**How to Verify:**
1. Vercel → Settings → Environment Variables
2. Check all three Supabase variables are present
3. Values should match your Supabase project settings

### 4. API Route Configuration

**File:** `app/api/ai-assistant/route.ts`

**Checks:**
- [ ] Route exports `POST` function
- [ ] Route has `dynamic = 'force-dynamic'`
- [ ] Route checks for `ANTHROPIC_API_KEY`
- [ ] Route uses `createServerSupabaseClient(true)` for service role

**How to Verify:**
- Check file exists: `app/api/ai-assistant/route.ts`
- Verify it matches the current version in the repo

### 5. Claude API Client

**File:** `lib/claude.ts`

**Checks:**
- [ ] Client initializes with `process.env.ANTHROPIC_API_KEY`
- [ ] `streamChatResponse` function exists
- [ ] Model is set to `claude-3-5-sonnet-20241022`

### 6. Frontend Component

**File:** `components/AIAssistantWidget.tsx`

**Checks:**
- [ ] Component is imported in `app/layout.tsx`
- [ ] Component makes POST request to `/api/ai-assistant`
- [ ] Component handles errors and displays them
- [ ] Component has timeout protection (60 seconds)

### 7. Deployment Status

**Checks:**
- [ ] Latest code is deployed to Vercel
- [ ] Deployment completed successfully (no build errors)
- [ ] Environment variables are available in production
- [ ] API route is accessible at `/api/ai-assistant`

**How to Verify:**
1. Vercel → Deployments
2. Latest deployment should be "Ready" (green)
3. Check build logs for any errors

---

## 🔍 Troubleshooting Steps

### Step 1: Check Vercel Function Logs

1. Go to Vercel → Your Project → Functions
2. Click on `/api/ai-assistant`
3. View recent logs
4. Look for error messages

**Common Log Messages:**
- `[AI Assistant] ANTHROPIC_API_KEY not set` → Missing API key
- `Claude API error: ...` → API key invalid or API issue
- `Failed to store conversation` → Supabase connection issue

### Step 2: Test API Endpoint Directly

**In Browser Console (on your live site):**
```javascript
fetch('/api/ai-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected Response (Success):**
- Streaming response with `data: {"chunk":"..."}`

**Expected Response (Error):**
- `{"error":"AI service configuration error",...}` → Missing API key
- `{"error":"ANTHROPIC_API_KEY environment variable is not set"}` → API key not set

### Step 3: Verify Supabase Tables

**In Supabase Dashboard:**
1. Go to Table Editor
2. Look for `ai_assistant_conversations`
3. Look for `ai_assistant_messages`
4. If missing, run the migration SQL

**Quick SQL Check:**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM ai_assistant_conversations;
SELECT COUNT(*) FROM ai_assistant_messages;
```

If these queries fail, tables don't exist → run migration.

### Step 4: Check Environment Variables

**In Vercel:**
1. Settings → Environment Variables
2. Verify these are set:
   - `ANTHROPIC_API_KEY` ✅
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
   - `SUPABASE_SERVICE_ROLE_KEY` ✅

**Important:** After adding variables, you MUST redeploy for them to take effect.

---

## 🚨 Common Issues & Solutions

### Issue 1: "AI service configuration error"

**Cause:** `ANTHROPIC_API_KEY` not set in Vercel

**Solution:**
1. Add `ANTHROPIC_API_KEY` to Vercel environment variables
2. Select all environments (Production, Preview, Development)
3. Redeploy the project
4. Wait 1-2 minutes for deployment to complete

### Issue 2: "Failed to store conversation"

**Cause:** Supabase tables don't exist or RLS blocking access

**Solution:**
1. Run migration: `supabase/migrations/20250125_create_ai_assistant_tables.sql`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
3. Check RLS policies allow service role access

### Issue 3: "Request timed out"

**Cause:** Claude API is slow or network issue

**Solution:**
1. Check Claude API status: https://status.anthropic.com/
2. Verify API key has available credits
3. Check Vercel function logs for detailed error

### Issue 4: Widget shows "AI is thinking..." forever

**Cause:** API request hanging or error not being caught

**Solution:**
1. Check browser console for errors
2. Check Vercel function logs
3. Verify API endpoint is accessible
4. Check network tab for failed requests

---

## ✅ Final Verification

Once all items are checked:

1. **Redeploy** (if you added environment variables)
2. **Wait** for deployment to complete (1-2 minutes)
3. **Test** the chat widget on your live site
4. **Check** Vercel logs if issues persist

### Expected Behavior (Success):
- Widget opens when clicking floating button
- Message sends when you type and press Enter
- "AI is thinking..." appears briefly
- Response streams in real-time
- Message is stored in Supabase

### If Still Not Working:
1. Check Vercel function logs for specific error
2. Test API endpoint directly (see Step 2 above)
3. Verify all environment variables are set
4. Confirm Supabase tables exist
5. Check Claude API key is valid and has credits

---

## 📞 Need Help?

If you've checked everything and it's still not working:

1. **Check Vercel Logs** - Most detailed error info
2. **Check Browser Console** - Client-side errors
3. **Test API Directly** - Isolate the issue
4. **Verify Each Checklist Item** - One might be missed

The most common issue is missing `ANTHROPIC_API_KEY` in Vercel production environment.

