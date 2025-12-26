# AI Assistant Guardrails
**Date:** January 26, 2025  
**Purpose:** Keep AI Assistant focused on Rocky Web Studio topics only

---

## 🛡️ Guardrails Implemented

### 1. Scope Definition
**Clear boundaries of what the AI can discuss:**

✅ **ALLOWED Topics:**
- Rocky Web Studio services (web development, design, e-commerce, AI automation, etc.)
- Our pricing, timelines, and processes
- Our certifications (AVOB, WCAG 2.1 AA)
- Our technology stack and expertise
- How to contact us or book a consultation
- Project inquiries and lead qualification

❌ **BLOCKED Topics:**
- General knowledge questions (history, science, current events, etc.)
- Questions about other companies or competitors
- Personal advice or opinions unrelated to web development
- Technical tutorials or how-to guides (unless directly related to our services)
- Questions about topics completely unrelated to web development or our business
- Requests to write code, solve problems, or provide services outside our scope

---

### 2. Off-Topic Question Handling

**When asked an off-topic question, the AI will:**

1. **Acknowledge briefly:** "I'm here to help with questions about Rocky Web Studio's services."
2. **Redirect:** "I'd be happy to discuss how we can help with your web development needs."
3. **Offer value:** Mention a relevant service or suggest booking a consultation
4. **Example response:** "I'm focused on helping with Rocky Web Studio's web development services. Would you like to know about our website design, e-commerce solutions, or AI automation services? I can also help you book a consultation to discuss your specific needs."

---

### 3. Enhanced Guidelines

**Added to system prompt:**
- Stay strictly within your scope - only discuss Rocky Web Studio services
- If a question is completely off-topic, redirect immediately - do not attempt to answer it
- Always redirect back to our services when asked irrelevant questions

---

## 🧪 Testing the Guardrails

### Test Scenarios

#### ✅ Should Answer (On-Topic)
1. "What services do you offer?"
2. "How much does a website cost?"
3. "What is AVOB certification?"
4. "Do you work with government clients?"
5. "What technologies do you use?"
6. "How can I contact you?"

#### ❌ Should Redirect (Off-Topic)
1. "What's the weather today?"
2. "Tell me about quantum physics"
3. "Who won the World Cup?"
4. "How do I cook pasta?"
5. "What's the capital of France?"
6. "Can you help me with my homework?"
7. "Tell me a joke"
8. "What's the best restaurant in Rockhampton?"
9. "How do I fix my car?"
10. "What's your opinion on [political topic]?"

**Expected Behavior:** AI should politely redirect to Rocky Web Studio services

---

## 📋 Example Responses

### Good Response (On-Topic)
**User:** "What services do you offer?"

**AI:** "Rocky Web Studio offers a range of web development services including:
- Website Design & Development ($4,000 - $35,000, 4-12 weeks)
- E-Commerce Development ($8,000 - $40,000, 8-16 weeks)
- AI & Automation ($5,000 - $30,000, 4-10 weeks)
- And more...

Would you like to know more about a specific service, or would you like to book a consultation to discuss your project?"

### Good Response (Off-Topic - Redirected)
**User:** "What's the weather today?"

**AI:** "I'm here to help with questions about Rocky Web Studio's services. I'd be happy to discuss how we can help with your web development needs. Would you like to know about our website design, e-commerce solutions, or AI automation services? I can also help you book a consultation to discuss your specific needs."

### Bad Response (Should NOT Happen)
**User:** "What's the weather today?"

**AI:** "I don't have access to current weather data..." ❌ (This should NOT happen - should redirect instead)

---

## 🔧 Implementation Details

**File:** `lib/knowledge-base.ts`  
**Function:** `formatSystemPrompt()`

**Key Sections Added:**
1. **YOUR SCOPE** - Explicit list of allowed topics
2. **STRICT BOUNDARIES** - Explicit list of blocked topics
3. **OFF-TOPIC QUESTION HANDLING** - Step-by-step redirect process
4. **Enhanced GUIDELINES** - Additional instructions to stay on topic

---

## 📊 Monitoring & Refinement

### How to Monitor

1. **Test regularly** with off-topic questions
2. **Review chat logs** in Supabase to see if AI is answering off-topic questions
3. **Adjust system prompt** if AI is not redirecting properly

### If Guardrails Aren't Working

1. Check system prompt in `lib/knowledge-base.ts`
2. Verify the prompt is being used (check `lib/claude.ts`)
3. Test with various off-topic questions
4. Adjust the "STRICT BOUNDARIES" section if needed
5. Make redirect instructions more explicit

---

## 🎯 Success Criteria

Guardrails are working when:
- ✅ AI answers on-topic questions about Rocky Web Studio
- ✅ AI redirects off-topic questions back to services
- ✅ AI doesn't provide general knowledge answers
- ✅ AI doesn't discuss competitors or other businesses
- ✅ AI maintains professional, helpful tone even when redirecting

---

## 📝 Notes

- Guardrails are enforced through the system prompt (not code-level filtering)
- Claude 3 Haiku follows system prompt instructions well
- May need refinement based on actual user interactions
- Consider adding more specific examples if certain off-topic questions slip through

---

**Last Updated:** January 26, 2025  
**Status:** ✅ Implemented  
**Next:** Test with various off-topic questions to verify effectiveness

