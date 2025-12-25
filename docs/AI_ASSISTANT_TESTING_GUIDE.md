# AI Assistant Testing Guide
**Date:** December 25, 2025  
**Purpose:** Test the AI Assistant API and React component

---

## Prerequisites

✅ Migration applied  
✅ Supabase types updated  
⏳ `ANTHROPIC_API_KEY` set in `.env.local`

---

## Step 1: Set Environment Variable

### Add to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

**Get your API key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env.local`

**Important:** Never commit `.env.local` to Git!

---

## Step 2: Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

---

## Step 3: Test API Route

### Option A: Using curl (Command Line)

**Basic Test:**
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What services do you offer?"}]}'
```

**Expected Response:**
- Server-Sent Events (SSE) stream
- Real-time text chunks
- Final message with `done: true`

**Test with Conversation History:**
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What services do you offer?"},
      {"role": "assistant", "content": "We offer web development, AI automation, and more."},
      {"role": "user", "content": "How much does a website cost?"}
    ]
  }'
```

### Option B: Using Browser (Fetch API)

Open browser console and run:
```javascript
fetch('http://localhost:3000/api/ai-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What services do you offer?' }]
  })
})
.then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  function readStream() {
    reader.read().then(({ done, value }) => {
      if (done) {
        console.log('Stream complete');
        return;
      }
      const chunk = decoder.decode(value);
      console.log('Chunk:', chunk);
      readStream();
    });
  }
  readStream();
});
```

### Option C: Using Postman/Insomnia

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/ai-assistant`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (JSON):**
   ```json
   {
     "messages": [
       {
         "role": "user",
         "content": "What services do you offer?"
       }
     ]
   }
   ```
5. **Response:** Should stream as Server-Sent Events

---

## Step 4: Test React Component

### Create Test Page

Create `app/test-ai/page.tsx`:
```tsx
import { AIAssistant } from '@/components/AIAssistant';

export default function TestAIPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI Assistant Test</h1>
      <AIAssistant />
    </div>
  );
}
```

### Navigate to Test Page

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/test-ai`
3. Test the chatbot:
   - Type a message
   - Press Enter or click Send
   - Watch streaming response
   - Check Supabase for stored messages

---

## Step 5: Verify Supabase Storage

### Check Conversations Table

In Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM ai_assistant_conversations 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Messages Table

```sql
SELECT * FROM ai_assistant_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Conversation with Messages

```sql
SELECT 
  c.id as conversation_id,
  c.last_message,
  c.message_count,
  c.created_at,
  COUNT(m.id) as actual_message_count
FROM ai_assistant_conversations c
LEFT JOIN ai_assistant_messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 5;
```

---

## Step 6: Test Error Handling

### Test Rate Limiting

Send 11 requests quickly:
```bash
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/ai-assistant \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Test '${i}'"}]}'
  echo ""
done
```

**Expected:** 11th request should return `429 Too Many Requests`

### Test Invalid Input

**Empty message:**
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": ""}]}'
```

**Expected:** `400 Bad Request` with error message

**Message too long:**
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "'$(python -c "print('x' * 5001)")'"}]}'
```

**Expected:** `400 Bad Request` with "Message too long" error

---

## Step 7: Test Accessibility

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Press Enter to send message
- ✅ Press Shift+Enter for new line
- ✅ Verify focus indicators visible

### Screen Reader
- ✅ Test with NVDA (Windows) or VoiceOver (Mac)
- ✅ Verify messages are announced
- ✅ Verify loading states announced
- ✅ Verify error messages announced

---

## Expected Results

### ✅ API Route Should:
- Return streaming SSE responses
- Store conversations in Supabase
- Handle rate limiting (10/min)
- Validate input
- Return proper error messages

### ✅ React Component Should:
- Display messages correctly
- Stream responses in real-time
- Handle errors gracefully
- Be keyboard accessible
- Work on mobile devices

### ✅ Supabase Should:
- Store all conversations
- Store all messages
- Link messages to conversations
- Update conversation metadata

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY environment variable is not set"
**Fix:** Add key to `.env.local` and restart dev server

### Error: "Rate limit exceeded"
**Fix:** Wait 1 minute or test from different IP

### Error: "AI service temporarily unavailable"
**Fix:** Check API key is valid, check Anthropic status

### No messages in Supabase
**Fix:** Check RLS policies allow service role access

### Streaming not working
**Fix:** Check browser console for errors, verify API route returns SSE

---

## Success Criteria

✅ API responds with streaming data  
✅ Messages stored in Supabase  
✅ React component displays correctly  
✅ Keyboard navigation works  
✅ Error handling works  
✅ Rate limiting works  

---

**Status:** Ready for Testing  
**Next:** Set API key and run tests

