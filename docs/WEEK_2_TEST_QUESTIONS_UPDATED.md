# Week 2: Updated Test Questions
**Date:** January 26, 2025  
**Purpose:** Comprehensive test questions including guardrail testing

---

## 🎯 Test Categories

### Category 1: On-Topic Questions (Should Answer) ✅

**Basic Services**
1. "What services do you offer?"
2. "What can Rocky Web Studio do for me?"
3. "Tell me about your web development services"
4. "Do you build websites?"

**Pricing & Timeline**
5. "How much does a website cost?"
6. "What's your pricing?"
7. "How long does it take to build a website?"
8. "What's the typical timeline for an e-commerce site?"

**Specific Services**
9. "Do you build e-commerce websites?"
10. "Can you help with AI automation?"
11. "Do you do website redesigns?"
12. "Can you help with accessibility?"
13. "Do you provide SEO services?"

**Technology & Expertise**
14. "What technologies do you use?"
15. "Do you use React?"
16. "What's your tech stack?"
17. "Are you experienced with Next.js?"

**Certifications & Credentials**
18. "What is AVOB certification?"
19. "Are you AVOB certified?"
20. "Do you work with government clients?"
21. "Are you WCAG compliant?"

**Contact & Process**
22. "How can I contact you?"
23. "How do I get started?"
24. "What's your development process?"
25. "Can I book a consultation?"

**Project-Specific**
26. "I need a website for my business"
27. "I want to build an online store"
28. "Can you help with a healthcare website?"
29. "Do you integrate with Xero?"
30. "Can you integrate with Stripe?"

---

### Category 2: Off-Topic Questions (Should Redirect) ❌

**General Knowledge**
31. "What's the weather today?"
32. "What's the capital of France?"
33. "Who won the World Cup?"
34. "What's 2 + 2?"
35. "Tell me about quantum physics"
36. "What's the population of Australia?"

**Personal/Advice**
37. "How do I cook pasta?"
38. "What should I have for dinner?"
39. "Can you help me with my homework?"
40. "What's the best restaurant in Rockhampton?"
41. "How do I lose weight?"

**Other Businesses**
42. "Tell me about Wix"
43. "How does Shopify compare to your services?"
44. "What do you think about WordPress?"
45. "Who are your competitors?"

**Technical Tutorials (Unrelated)**
46. "How do I install Python?"
47. "How do I fix my car?"
48. "How do I change my password on Facebook?"
49. "Can you write me a Python script?"
50. "How do I use Git?"

**Entertainment/General**
51. "Tell me a joke"
52. "What's your favorite color?"
53. "Do you like pizza?"
54. "What's the meaning of life?"
55. "Can you write a poem?"

**Current Events**
56. "What happened in the news today?"
57. "What's happening in politics?"
58. "Tell me about the latest tech trends"

---

### Category 3: Edge Cases & Boundary Testing 🧪

**Vaguely Related (Should Redirect or Clarify)**
59. "I need help with my website" (too vague - should ask for clarification)
60. "Can you help me?" (too vague - should redirect)
61. "What do you do?" (should answer about services)
62. "Tell me about web development" (general - should redirect to our services)

**Mixed Questions**
63. "What services do you offer and what's the weather?" (should answer services, ignore weather)
64. "How much does a website cost and can you write code for me?" (should answer pricing, redirect code request)

**Follow-Up Questions**
65. "What services do you offer?" → "How much does that cost?" (should maintain context)
66. "Tell me about e-commerce" → "What technologies do you use for that?" (should maintain context)

**AVOB Specific (Test Fix)**
67. "What is AVOB?"
68. "Tell me about AVOB certification"
69. "Are you AVOB certified?"
70. "What does AVOB stand for?"
71. "How do I verify your AVOB certification?"

**Guardrail Testing**
72. "What's the weather?" (should redirect)
73. "Tell me a joke" (should redirect)
74. "How do I cook pasta?" (should redirect)
75. "What's 2 + 2?" (should redirect)

---

### Category 4: Lead Qualification Questions 💼

**Project Inquiries**
76. "I need a website"
77. "I want to start an online store"
78. "My business needs a website"
79. "I'm looking for a web developer"
80. "Can you help me build a website?"

**Budget Questions**
81. "My budget is $5000, what can you do?"
82. "I have $10,000 for a website"
83. "What can I get for $3000?"

**Timeline Questions**
84. "I need this done in 2 months"
85. "Can you finish by next month?"
86. "What's the fastest you can build a website?"

**Specific Requirements**
87. "I need a website with a booking system"
88. "Can you integrate with my CRM?"
89. "I need a multilingual website"
90. "Do you do mobile apps?"

---

## 📋 Quick Test Sequence (Priority Order)

**For quick validation, test these 15 questions in order:**

### On-Topic (Should Answer)
1. "Hello"
2. "What services do you offer?"
3. "How much does a website cost?"
4. "What is AVOB certification?"
5. "How long does it take?"
6. "What technologies do you use?"
7. "How can I contact you?"

### Off-Topic (Should Redirect)
8. "What's the weather today?"
9. "Tell me a joke"
10. "How do I cook pasta?"
11. "What's the capital of France?"
12. "Can you help me with my homework?"

### Edge Cases
13. "I need help with my website" (vague - should clarify)
14. "What services do you offer and what's the weather?" (mixed - should answer services, ignore weather)
15. "What services do you offer?" → "How much does that cost?" (follow-up - should maintain context)

---

## ✅ Testing Checklist Per Question

For each question, verify:

**On-Topic Questions:**
- [ ] AI answers the question
- [ ] Response is relevant and helpful
- [ ] Response includes relevant information
- [ ] Response ends with consultation invitation
- [ ] No console errors
- [ ] Response time < 5 seconds

**Off-Topic Questions:**
- [ ] AI redirects (does NOT answer the question)
- [ ] Redirect is polite and professional
- [ ] Mentions Rocky Web Studio services
- [ ] Offers to help with web development needs
- [ ] Suggests booking a consultation
- [ ] No console errors

**AVOB Questions:**
- [ ] Correct definition: "Australian Veteran Owned Business"
- [ ] Includes verification link: https://www.avob.org.au/
- [ ] NO mention of "Accessibility for Victorians with Disability"
- [ ] Explains benefits (government contracts, etc.)

**Follow-Up Questions:**
- [ ] Maintains conversation context
- [ ] Understands "that" refers to previous topic
- [ ] Provides relevant follow-up information

---

## 🎯 Priority Test Matrix

| Priority | Category | Questions | Purpose |
|----------|----------|-----------|---------|
| **P0** | Basic Services | 1-4 | Core functionality |
| **P0** | AVOB Fix | 67-71 | Verify fix works |
| **P0** | Guardrails | 31-35, 72-75 | Verify redirects work |
| **P1** | Pricing | 5-8 | Business info |
| **P1** | Contact | 22-25 | Lead capture |
| **P2** | Specific Services | 9-13 | Service knowledge |
| **P2** | Technology | 14-17 | Technical knowledge |
| **P3** | Edge Cases | 59-66 | Boundary testing |
| **P3** | Lead Qualification | 76-90 | Business value |

---

## 📊 Test Results Template

```
Question #: [Number]
Question: "[Exact question]"
Category: [On-Topic / Off-Topic / Edge Case]
Expected: [Answer / Redirect / Clarify]
Actual: [Answer / Redirect / Clarify]
Status: ✅ Pass / ❌ Fail / ⚠️ Partial
Response Time: [seconds]
Response Quality: Good / Fair / Poor
Notes: [Any issues or observations]
```

---

## 🚀 Automated Test Script Questions

The automated test script (`scripts/test-ai-assistant-week2.ps1`) tests these 8 questions:

1. "Hello"
2. "What services do you offer?"
3. "How much does a website cost?"
4. "How long does it take to build a website?"
5. "Do you help with website accessibility?"
6. "What technologies do you use?"
7. "How can I contact you?"
8. "Tell me more about that" (follow-up)

---

## 💡 Testing Tips

1. **Start with automated tests** - Quick validation
2. **Test guardrails first** - Verify off-topic redirects work
3. **Test AVOB fix** - Verify correct definition
4. **Test on-topic questions** - Verify core functionality
5. **Test edge cases** - Verify boundary handling
6. **Document everything** - Fill in testing report

---

## 🔍 What to Look For

### ✅ Good Responses (On-Topic)
- Relevant information provided
- Professional and helpful tone
- Ends with consultation invitation
- Includes relevant links (AVOB, contact, etc.)

### ✅ Good Redirects (Off-Topic)
- Polite acknowledgment
- Clear redirect to services
- Offers value (mentions services)
- Suggests consultation
- Does NOT answer the off-topic question

### ❌ Bad Responses
- Answers off-topic questions
- Provides general knowledge
- Discusses competitors
- Gives personal advice
- Mentions incorrect AVOB definition

---

**Last Updated:** January 26, 2025  
**Total Questions:** 90  
**Quick Test:** 15 questions  
**Automated Test:** 8 questions

