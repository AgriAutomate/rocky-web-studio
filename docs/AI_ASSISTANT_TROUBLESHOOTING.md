# AI Assistant Troubleshooting Guide

## Issue: Chat Widget Taking Too Long to Respond

If the AI Assistant is stuck on "AI is thinking..." or taking a very long time to respond, check the following:

### 1. Check Environment Variables

**In Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Verify `ANTHROPIC_API_KEY` is set and correct
4. Make sure it's available in the correct environment (Production, Preview, Development)

**In Local Development:**
```bash
# Check if variable is set
echo $ANTHROPIC_API_KEY

# Or check .env.local file
cat .env.local | grep ANTHROPIC_API_KEY
```

### 2. Check API Route Logs

**In Vercel:**
1. Go to your project → Functions → View Logs
2. Look for errors related to `/api/ai-assistant`
3. Check for:
   - "ANTHROPIC_API_KEY not set" errors
   - Claude API errors
   - Timeout errors

**Common Error Messages:**
- `ANTHROPIC_API_KEY environment variable is not set` → API key missing
- `AI service temporarily unavailable` → Claude API issue
- `Request timed out` → Network or API timeout

### 3. Test the API Directly

You can test the API endpoint directly:

```bash
curl -X POST https://your-domain.com/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, test message"
      }
    ]
  }'
```

### 4. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when sending a message
4. Check Network tab for failed requests to `/api/ai-assistant`

### 5. Verify Claude API Key

1. Go to https://console.anthropic.com/
2. Check your API key is active
3. Verify you have available credits/quota
4. Check if there are any rate limits or restrictions

### 6. Common Fixes

**If API key is missing:**
```bash
# Add to Vercel environment variables
ANTHROPIC_API_KEY=sk-ant-...

# Or add to .env.local for local testing
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local
```

**If timeout occurs:**
- The widget now has a 60-second timeout
- If requests consistently timeout, check Claude API status
- Consider increasing timeout if needed

**If rate limited:**
- Check rate limit settings in `lib/rate-limit.ts`
- Default is 10 requests per minute per IP
- Adjust if needed for your use case

### 7. Debug Mode

To enable more detailed logging, check the server logs in Vercel. The API route now logs:
- When Claude API calls start
- When they complete
- Response lengths and durations
- Any errors encountered

### 8. Quick Health Check

Run this in your browser console on the live site:

```javascript
fetch('/api/ai-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }]
  })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

This will show you the raw response and any errors.

## Still Having Issues?

1. Check Vercel function logs for detailed error messages
2. Verify Supabase connection (conversations are stored there)
3. Test with a simple message first
4. Check network connectivity
5. Verify Claude API status page: https://status.anthropic.com/

