# Week 2: Testing Quick Start Guide
**Date:** January 26, 2025  
**Purpose:** Quick reference for testing AI Assistant

---

## 🚀 Two Ways to Test

### Option 1: Automated Testing (Recommended - Start Here)

**Fastest way to validate everything works:**

```powershell
# 1. Make sure dev server is running
npm run dev

# 2. In another terminal, run automated tests
.\scripts\test-ai-assistant-week2.ps1
```

**What it does:**
- ✅ Tests 8 critical questions automatically
- ✅ Measures response times
- ✅ Validates API connectivity
- ✅ Checks streaming responses
- ✅ Provides pass/fail summary

**Time:** ~2-3 minutes

---

### Option 2: Manual Testing (Comprehensive)

**Use the test questions list for detailed testing:**

1. **Open:** `docs/WEEK_2_TEST_QUESTIONS.md`
2. **Start with:** "Quick Test Sequence" (10 questions)
3. **Then test:** Priority questions (5 critical tests)
4. **Finally:** Full test suite (32+ questions)

**Time:** ~30-60 minutes for full suite

---

## 📋 Quick Test Sequence (10 Questions)

**For quick manual validation, ask these 10 questions:**

1. "Hello"
2. "What services do you offer?"
3. "How much does a website cost?"
4. "How long does it take?"
5. "Can you show me examples?"
6. "What technologies do you use?"
7. "Do you help with accessibility?"
8. "I need a website for my business"
9. "How can I contact you?"
10. "Thank you"

**How to test:**
1. Open `http://localhost:3000`
2. Click chat widget (bottom-right)
3. Type each question
4. Verify response received
5. Check for errors (F12 → Console)

---

## ✅ Testing Checklist

### Must Test (Critical)
- [ ] Run automated test script → All pass
- [ ] Basic greeting works ("Hello")
- [ ] Services question works ("What services do you offer?")
- [ ] Network disconnect shows error
- [ ] No console errors (F12)

### Should Test (Important)
- [ ] Test on Chrome
- [ ] Test on Firefox  
- [ ] Test on mobile (iPhone/Android)
- [ ] Test follow-up questions
- [ ] Verify Supabase storage

### Nice to Test (Comprehensive)
- [ ] All 32+ test questions
- [ ] All browsers (Safari, Edge)
- [ ] Error scenarios
- [ ] Rate limiting

---

## 📊 Test Results Template

For each question/test:

```
✅ PASS / ❌ FAIL
Question: "[question]"
Response Time: X.Xs
Response Quality: Good/Fair/Poor
Notes: [any issues]
```

---

## 🎯 Priority Order

1. **Run automated tests first** (quick validation)
2. **Test 10 quick questions** (manual basic test)
3. **Test on different browsers** (compatibility)
4. **Test on mobile** (responsive)
5. **Test error scenarios** (error handling)
6. **Full test suite** (if time permits)

---

## 📝 Document Your Results

Update `docs/WEEK_2_TESTING_REPORT.md` with:
- Automated test results
- Manual test results
- Browser compatibility results
- Mobile test results
- Any issues found

---

## 🐛 Quick Troubleshooting

**Automated tests fail?**
→ Check dev server is running: `npm run dev`

**Chat widget not appearing?**
→ Check browser console (F12) for errors
→ Verify `app/layout.tsx` includes `<AIAssistantWidget />`

**API errors?**
→ Check `ANTHROPIC_API_KEY` in `.env.local`
→ Verify Anthropic account has credits

**Rate limit errors?**
→ Wait 1 minute, then retry
→ Script includes delays to prevent this

---

## 📚 Full Documentation

- **Automated Testing:** `docs/WEEK_2_AUTOMATED_TESTING.md`
- **Test Questions:** `docs/WEEK_2_TEST_QUESTIONS.md` (32+ questions)
- **Testing Report:** `docs/WEEK_2_TESTING_REPORT.md` (fill this in)
- **Progress Tracker:** `docs/WEEK_2_PROGRESS.md`

---

## ⚡ Quick Commands

```powershell
# Start dev server
npm run dev

# Run automated tests
.\scripts\test-ai-assistant-week2.ps1

# Run TypeScript check
npm run build

# Check for console errors
# (Open browser: F12 → Console)
```

---

**Last Updated:** January 26, 2025  
**Start Here:** Run automated test script first! 🚀

