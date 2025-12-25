# Week 2-3: AI Assistant - Next Steps
**Date:** December 25, 2025  
**Status:** Core Implementation Complete - Ready for Testing

## ✅ What's Done

All core code is complete:
- ✅ API route with streaming
- ✅ React component with UI
- ✅ Claude API integration
- ✅ Knowledge base
- ✅ Rate limiting
- ✅ Supabase migration file
- ✅ TypeScript types
- ✅ Error handling
- ✅ Accessibility features

---

## 🚀 Immediate Next Steps (Required)

### 1. Set Environment Variable

Add to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**How to get API key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new key
5. Copy and add to `.env.local`

**For Production (Vercel):**
1. Go to Vercel dashboard
2. Project → Settings → Environment Variables
3. Add `ANTHROPIC_API_KEY` with your key
4. Redeploy

---

### 2. Run Supabase Migration

**Option A: Supabase CLI** (Recommended)
```bash
# If you have Supabase CLI installed
supabase db push

# Or apply specific migration
supabase migration up
```

**Option B: Supabase Dashboard**
1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20250125_create_ai_assistant_tables.sql`
4. Paste and run

**Option C: Manual SQL**
- Connect to your Supabase database
- Run the migration SQL file

**Verify:**
- Tables created: `ai_assistant_conversations`, `ai_assistant_messages`
- Indexes created
- RLS policies enabled

---

### 3. Update Supabase TypeScript Types

**Option A: Supabase CLI** (Recommended)
```bash
# Generate types from database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

**Option B: Manual Update**
Add to `types/supabase.ts`:
```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...
      ai_assistant_conversations: {
        Row: {
          id: string;
          last_message: string | null;
          message_count: number;
          client_ip: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          last_message?: string | null;
          message_count?: number;
          client_ip?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          last_message?: string | null;
          message_count?: number;
          client_ip?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_assistant_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
```

---

### 4. Test Locally

**Start Development Server:**
```bash
npm run dev
```

**Test API Route:**
```bash
# Test with curl
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What services do you offer?"}
    ]
  }'
```

**Test React Component:**
1. Add to a page (e.g., `app/page.tsx` or create test page)
2. Import and use:
   ```tsx
   import { AIAssistant } from '@/components/AIAssistant';
   
   export default function TestPage() {
     return (
       <div className="container mx-auto p-8">
         <AIAssistant />
       </div>
     );
   }
   ```
3. Navigate to page in browser
4. Test sending messages

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] API route responds correctly
- [ ] Streaming works (real-time updates)
- [ ] Messages stored in Supabase
- [ ] Rate limiting works (test 11 requests)
- [ ] Error handling works (test invalid input)
- [ ] Conversation ID persists

### UI Testing
- [ ] Component renders correctly
- [ ] Messages display (user right, AI left)
- [ ] Streaming updates in real-time
- [ ] Loading states show
- [ ] Error messages display
- [ ] Empty state shows
- [ ] Auto-scroll works

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Shift+Enter)
- [ ] Screen reader announces messages
- [ ] Focus management works
- [ ] ARIA labels correct
- [ ] Error announcements work

### Integration Testing
- [ ] Supabase storage works
- [ ] Sentry error tracking works
- [ ] Rate limiting persists
- [ ] Multiple conversations work

---

## 📍 Integration Points

### Add to Homepage
```tsx
// app/page.tsx or appropriate page
import { AIAssistant } from '@/components/AIAssistant';

// Add component where appropriate
<AIAssistant className="max-w-2xl mx-auto" />
```

### Or Create Dedicated Page
```tsx
// app/ai-assistant/page.tsx
import { AIAssistant } from '@/components/AIAssistant';

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
      <AIAssistant />
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### API Key Not Found
- Check `.env.local` exists
- Verify variable name: `ANTHROPIC_API_KEY`
- Restart dev server after adding

### Supabase Errors
- Check migration ran successfully
- Verify RLS policies allow service role
- Check table names match (case-sensitive)

### Streaming Not Working
- Check browser console for errors
- Verify API route returns SSE format
- Check network tab for streaming response

### Rate Limiting Issues
- Check IP detection works
- Verify rate limit store persists
- Test with different IPs

---

## 📊 Success Criteria

✅ **API Route:**
- Responds with streaming SSE
- Stores conversations in Supabase
- Handles errors gracefully
- Rate limits correctly

✅ **React Component:**
- Displays messages correctly
- Streams responses in real-time
- Keyboard accessible
- Screen reader compatible

✅ **Integration:**
- Supabase storage works
- Sentry tracking works
- No console errors
- Production ready

---

**Status:** Ready for testing  
**Next:** Set environment variable → Run migration → Test locally → Deploy

