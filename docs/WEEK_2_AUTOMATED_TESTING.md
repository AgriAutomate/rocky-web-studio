# Week 2: Automated Testing Guide
**Date:** January 26, 2025  
**Purpose:** Automated testing for AI Assistant chat widget

---

## 🚀 Quick Start

### Option 1: Run Automated Test Script

```powershell
# Make sure dev server is running first
npm run dev

# In another terminal, run the test script
.\scripts\test-ai-assistant-week2.ps1
```

### Option 2: Use Test Questions List

See: `docs/WEEK_2_TEST_QUESTIONS.md` for comprehensive manual test questions.

---

## 📋 Automated Test Script Features

The script (`scripts/test-ai-assistant-week2.ps1`) tests:

### ✅ What It Tests

1. **API Connectivity**
   - Verifies dev server is running
   - Tests API endpoint responds

2. **Basic Functionality** (8 tests)
   - Greeting responses
   - Service information
   - Pricing questions
   - Timeline questions
   - Technical questions
   - Follow-up questions

3. **Response Quality**
   - Response time measurement
   - Response completeness
   - Error handling

4. **Streaming**
   - Verifies streaming responses work
   - Checks response chunks are received

### 📊 Test Results

The script outputs:
- ✅ Pass/Fail for each test
- Response time for each question
- Response length (character count)
- Error messages (if any)
- Summary statistics

---

## 🎯 Test Questions in Script

1. "Hello" - Basic greeting
2. "What services do you offer?" - Core knowledge
3. "How much does a website cost?" - Pricing
4. "How long does it take to build a website?" - Timeline
5. "Do you help with website accessibility?" - Service-specific
6. "What technologies do you use?" - Technical knowledge
7. "How can I contact you?" - Contact info
8. "Tell me more about that" - Follow-up (requires context)

---

## 🔧 How to Use

### Step 1: Start Dev Server

```powershell
npm run dev
```

Wait for: "Ready in X.Xs" message

### Step 2: Run Test Script

```powershell
.\scripts\test-ai-assistant-week2.ps1
```

### Step 3: Review Results

The script will output:
- Individual test results (✅/❌)
- Response times
- Summary statistics
- Error messages (if any)

### Step 4: Document Results

Copy results into `docs/WEEK_2_TESTING_REPORT.md`

---

## 📝 Expected Results

### Successful Test Run

```
🧪 Week 2: AI Assistant Comprehensive Testing
=============================================

✅ Dev server is running

Starting tests...

Test #1 : Basic Functionality
Question: "Hello"
✅ PASS
   Response Time: 1.2s
   Response Length: 150 chars

Test #2 : Basic Functionality
Question: "What services do you offer?"
✅ PASS
   Response Time: 1.5s
   Response Length: 450 chars

...

=============================================
Test Summary
=============================================
Total Tests: 8
Passed: 8
Failed: 0

🎉 All tests passed!
```

### If Tests Fail

The script will show:
- ❌ FAIL for failed tests
- Error messages
- Status codes
- Which test failed

---

## 🔍 Manual Testing Checklist

After automated tests pass, manually verify:

### Browser Testing
- [ ] Chrome - Widget appears and works
- [ ] Firefox - Widget appears and works
- [ ] Safari - Widget appears and works
- [ ] Edge - Widget appears and works

### Mobile Testing
- [ ] iPhone Safari - Widget responsive
- [ ] Android Chrome - Widget responsive
- [ ] Touch interactions work

### Error Scenarios
- [ ] Network disconnect - Error message appears
- [ ] Rate limit - Error message appears
- [ ] Invalid input - Handled gracefully

### Integration
- [ ] Widget on homepage
- [ ] Widget on all pages
- [ ] Conversations stored in Supabase
- [ ] No console errors (F12)

---

## 🐛 Troubleshooting

### Script Fails: "Dev server is not running"

**Fix:**
```powershell
npm run dev
# Wait for "Ready" message, then run script again
```

### Script Fails: "Cannot connect to API"

**Check:**
1. Dev server is running on port 3000
2. No firewall blocking localhost
3. API endpoint is correct: `http://localhost:3000/api/ai-assistant`

### Tests Fail: "401 Unauthorized" or "403 Forbidden"

**Check:**
1. `ANTHROPIC_API_KEY` is set in `.env.local`
2. API key is valid
3. Anthropic account has credits

### Tests Fail: "429 Rate Limit"

**Fix:**
- Wait 1 minute between test runs
- Script includes 500ms delay between tests
- If still failing, increase delay in script

---

## 📊 Integration with Testing Report

After running automated tests:

1. **Copy Results** to `docs/WEEK_2_TESTING_REPORT.md`
2. **Mark Automated Tests Complete**
3. **Fill in Manual Tests** (browser/mobile)
4. **Document Any Issues**

---

## 🎯 Next Steps After Automated Testing

1. ✅ Run automated test script
2. ✅ Review results
3. ⏳ Test manually on different browsers
4. ⏳ Test manually on mobile devices
5. ⏳ Test error scenarios manually
6. ⏳ Document all results in testing report

---

## 💡 Tips

- Run automated tests first (fast validation)
- Then do manual testing (browser/mobile)
- Document everything in testing report
- Take screenshots of any issues
- Test during different times (rate limits reset)

---

**Last Updated:** January 26, 2025  
**Script Location:** `scripts/test-ai-assistant-week2.ps1`  
**Test Questions:** `docs/WEEK_2_TEST_QUESTIONS.md`

