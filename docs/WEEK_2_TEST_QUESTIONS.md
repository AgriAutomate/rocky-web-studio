# Week 2: Test Questions & Scenarios
**Date:** January 26, 2025  
**Purpose:** Comprehensive test questions for AI Assistant chat widget

---

## 🎯 Test Question Categories

### Category 1: Basic Functionality (Start Here)
**Purpose:** Verify basic chat functionality works

1. **Simple Greeting**
   - User: "Hello"
   - Expected: Friendly greeting response
   - Test: Basic connection works

2. **Question About Services**
   - User: "What services do you offer?"
   - Expected: Information about Rocky Web Studio services
   - Test: Knowledge base integration works

3. **Pricing Question**
   - User: "How much does a website cost?"
   - Expected: Pricing information or guidance
   - Test: Pricing knowledge in system prompt

4. **Contact Question**
   - User: "How can I contact you?"
   - Expected: Contact information or booking link
   - Test: Contact information accessibility

---

### Category 2: Service-Specific Questions
**Purpose:** Test knowledge of specific services

5. **Web Development**
   - User: "Do you build custom websites?"
   - Expected: Information about web development services

6. **AI Automation**
   - User: "What AI automation services do you provide?"
   - Expected: Details about AI automation offerings

7. **Accessibility**
   - User: "Can you help with website accessibility?"
   - Expected: Information about accessibility services

8. **E-commerce**
   - User: "Do you build e-commerce sites?"
   - Expected: E-commerce service information

---

### Category 3: Edge Cases & Error Handling
**Purpose:** Test error handling and edge cases

9. **Empty Message** (Should be blocked by validation)
   - User: "" (empty)
   - Expected: Input validation prevents sending

10. **Very Long Message**
    - User: [5000+ character message]
    - Expected: Validation error or graceful handling

11. **Special Characters**
    - User: "What's the cost? It's $1000+ for <website> design!"
    - Expected: Handles special characters correctly

12. **Multiple Questions at Once**
    - User: "What services do you offer? How much does it cost? How long does it take?"
    - Expected: Responds to all questions or asks for clarification

13. **Non-English Text** (if applicable)
    - User: "¿Hablas español?"
    - Expected: Graceful handling (may or may not respond in Spanish)

---

### Category 4: Conversational Flow
**Purpose:** Test conversation continuity

14. **Follow-up Question**
    - User: "Tell me about your services"
    - Assistant: [Response]
    - User: "How much does that cost?"
    - Expected: Maintains context, understands "that" refers to services

15. **Context Switching**
    - User: "What is web development?"
    - Assistant: [Response]
    - User: "What about AI automation?"
    - Expected: Switches context smoothly

16. **Clarification Request**
    - User: "I need help"
    - Expected: Asks for clarification or provides helpful guidance

---

### Category 5: Business-Related Questions
**Purpose:** Test business knowledge

17. **Timeline Question**
    - User: "How long does it take to build a website?"
    - Expected: Timeline information

18. **Process Question**
    - User: "What's your development process?"
    - Expected: Process information

19. **Portfolio/Case Studies**
    - User: "Can you show me examples of your work?"
    - Expected: Mentions case studies or portfolio

20. **Availability Question**
    - User: "Are you available for a new project?"
    - Expected: Availability information or booking link

---

### Category 6: Technical Questions
**Purpose:** Test technical knowledge

21. **Technology Stack**
    - User: "What technologies do you use?"
    - Expected: Mentions Next.js, TypeScript, etc.

22. **Accessibility Standards**
    - User: "Do you follow WCAG guidelines?"
    - Expected: Mentions WCAG 2.1 AA compliance

23. **Hosting/Deployment**
    - User: "Where do you host websites?"
    - Expected: Hosting information (Vercel, etc.)

---

### Category 7: Lead Qualification Questions
**Purpose:** Test lead capture functionality

24. **Project Inquiry**
    - User: "I need a website for my business"
    - Expected: Helpful response, may ask for more details

25. **Budget Discussion**
    - User: "My budget is $5000"
    - Expected: Acknowledges budget, provides guidance

26. **Timeline Discussion**
    - User: "I need this done in 2 months"
    - Expected: Acknowledges timeline, discusses feasibility

27. **Email Capture** (if implemented)
    - User: "Can you send me more information? My email is test@example.com"
    - Expected: Email captured (if Week 6 feature implemented)

---

## 📋 Quick Test Sequence (10 Questions)

**For quick validation, test these 10 questions in order:**

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

---

## 🔍 Testing Checklist Per Question

For each question, verify:

- [ ] Message sends successfully
- [ ] Response appears (streaming works)
- [ ] Response is relevant/helpful
- [ ] Response completes (not cut off)
- [ ] No console errors (F12 → Console)
- [ ] Response time is reasonable (< 5 seconds)
- [ ] Conversation persists (refresh page, check history)

---

## ⚠️ Error Scenario Tests

### Network Errors

28. **Simulate Network Disconnect**
    - Disconnect internet
    - Send message
    - Expected: Error message appears
    - Reconnect: Message should send successfully

29. **Slow Network Simulation**
    - Use browser dev tools → Network → Throttle to "Slow 3G"
    - Send message
    - Expected: Streaming still works (may be slower)

### Rate Limiting

30. **Rate Limit Test**
    - Send 11 messages rapidly (limit is 10/minute)
    - Expected: 11th message shows rate limit error
    - Wait 1 minute: Should work again

### Invalid Input

31. **Very Long Message**
    - Send message > 5000 characters
    - Expected: Validation error or graceful handling

32. **Special Characters Only**
    - Send: "!@#$%^&*()"
    - Expected: Graceful handling

---

## 📊 Test Results Template

For each question, document:

```
Question #: [Number]
Question: "[Exact question]"
Status: ✅ Pass / ❌ Fail / ⚠️ Partial
Response Time: [seconds]
Response Quality: Good / Fair / Poor
Notes: [Any issues or observations]
```

---

## 🎯 Priority Test Questions

**Must Test (Critical):**
1. "Hello" - Basic functionality
2. "What services do you offer?" - Core knowledge
3. "How much does a website cost?" - Business info
4. Network disconnect - Error handling
5. Rate limit - Error handling

**Should Test (Important):**
6. Follow-up questions - Conversation flow
7. Service-specific questions - Knowledge depth
8. Long messages - Input validation
9. Multiple browsers - Compatibility

**Nice to Test (Comprehensive):**
10. All other questions - Full coverage

---

## 🚀 Automated Testing Script

See: `scripts/test-ai-assistant.ps1` (if exists) or use the manual questions above.

For automated testing, the script should:
1. Send each test question
2. Wait for response
3. Verify response received
4. Check for errors
5. Log results

---

**Last Updated:** January 26, 2025  
**Use this:** For systematic testing of the chat widget

