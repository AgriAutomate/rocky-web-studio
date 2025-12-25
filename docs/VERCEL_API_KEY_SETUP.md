# Setting ANTHROPIC_API_KEY in Vercel

## Quick Fix: Add API Key to Vercel

The "AI service configuration error" means `ANTHROPIC_API_KEY` is not set in your Vercel production environment.

### Step-by-Step Instructions

1. **Get Your Claude API Key**
   - Go to https://console.anthropic.com/
   - Navigate to API Keys
   - Copy your API key (starts with `sk-ant-...`)
   - If you don't have one, create a new API key

2. **Add to Vercel**
   - Go to https://vercel.com/dashboard
   - Select your project (rocky-web-studio)
   - Click **Settings** (top navigation)
   - Click **Environment Variables** (left sidebar)
   - Click **Add New**

3. **Configure the Variable**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Paste your API key (e.g., `sk-ant-...`)
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Redeploy**
   - After adding the variable, Vercel will prompt you to redeploy
   - Or go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

5. **Verify**
   - Once deployed, test the chat widget again
   - The error should be gone
   - The AI Assistant should respond normally

### Important Notes

- ⚠️ **Never commit your API key to Git** - it should only be in Vercel environment variables
- 🔒 The API key is encrypted and only available to server-side code
- 🔄 You may need to wait 1-2 minutes after adding the variable for it to be available
- ✅ Make sure to select all environments (Production, Preview, Development) so it works everywhere

### Troubleshooting

**If the error persists after adding the key:**
1. Verify the key is correct (no extra spaces, complete key)
2. Check that all environments are selected
3. Make sure you redeployed after adding the variable
4. Check Vercel logs to see if there are other errors

**To verify the key is set:**
- Go to Vercel → Your Project → Settings → Environment Variables
- You should see `ANTHROPIC_API_KEY` listed
- The value will be hidden (showing as `••••••••`)

### Security Best Practices

- ✅ Use different API keys for different environments if needed
- ✅ Rotate keys periodically
- ✅ Monitor API usage in Anthropic console
- ✅ Set up rate limiting (already configured in the code)
- ❌ Never expose the key in client-side code (it's already server-side only)

