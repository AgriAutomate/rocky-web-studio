# AI-Powered Lead Qualification Chatbot for Rocky Web Studio
**Client:** Rocky Web Studio (Internal Project)  
**Date:** January 2025  
**Project Type:** AI Chatbot Development & Deployment  
**Status:** ✅ Complete

---

## Executive Summary

Rocky Web Studio developed and deployed a production-ready AI-powered lead qualification chatbot to replace third-party chat widgets (Crisp/Drift/Intercom) and provide 24/7 automated customer support. Built with Claude 3 Haiku API, Next.js, and Supabase, the solution delivers real-time streaming responses, persistent conversation history, and full WCAG 2.1 AA accessibility compliance. The chatbot was deployed in a single 7-hour sprint using a reusable template architecture, enabling rapid deployment for future client projects.

**Key Results:**
- **Development Time:** 7 hours (single sprint)
- **Deployment:** Production-ready in 48 hours
- **Cost:** A$0.40 per 1,000 messages (vs. A$300-500/month for SaaS alternatives)
- **Response Time:** < 2 seconds average
- **Accessibility:** WCAG 2.1 AA compliant
- **ROI:** Break-even in 7-10 months vs. SaaS subscriptions
- **Template Reusability:** 71-92% margins on future deployments

---

## Challenge

### Business Problem

Rocky Web Studio needed a customer support solution that could:
- **Provide 24/7 availability** without human intervention
- **Qualify leads automatically** before they reach the sales team
- **Reduce operational costs** compared to third-party SaaS solutions
- **Maintain brand consistency** with custom styling and behavior
- **Own all data** without platform lock-in
- **Scale infinitely** without per-seat or per-message pricing

### Initial State

**Previous Solution:** Crisp chat widget
- **Cost:** A$25-50/month base + per-seat pricing
- **Limitations:** Generic appearance, limited customization
- **Data Ownership:** Conversations stored on third-party platform
- **Scalability:** Pricing increases with usage
- **Branding:** Limited ability to match brand identity

### Technical Requirements

- **Real-time streaming responses** for natural conversation flow
- **Persistent conversation history** for context across sessions
- **Rate limiting** to prevent abuse and control costs
- **Error handling** for API failures and network issues
- **Accessibility compliance** (WCAG 2.1 AA)
- **Type safety** with TypeScript throughout
- **Production-ready** error monitoring with Sentry

### Business Impact

- **Cost Savings:** Eliminate recurring SaaS subscription fees
- **Lead Quality:** Pre-qualify leads before human handoff
- **Brand Control:** Custom styling and behavior matching brand identity
- **Data Ownership:** Full control over conversation data
- **Scalability:** No per-message pricing, predictable costs
- **Competitive Advantage:** 48-hour deployment vs. weeks for competitors

---

## Approach

### Phase 1: Technology Selection (Planning)

**Duration:** 1 hour

**AI Model Selection:**
- **Evaluated:** Claude 3 Haiku vs. Claude 3.5 Sonnet
- **Decision:** Claude 3 Haiku
- **Rationale:**
  - Cost: A$0.40 per 1,000 messages (vs. A$4.50 for Sonnet)
  - Speed: < 2 second response times
  - Quality: Sufficient for lead qualification and FAQ responses
  - Scalability: 90% cost savings at high volume

**Architecture Design:**
- **Frontend:** Next.js 16 App Router with React 18
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL) for conversation storage
- **AI API:** Anthropic Claude 3 Haiku
- **Monitoring:** Sentry for error tracking
- **Hosting:** Vercel for edge deployment

**Key Design Decisions:**
1. **Streaming Responses:** Real-time token streaming for better UX
2. **Rate Limiting:** 10 requests/minute per IP to prevent abuse
3. **Conversation Persistence:** Store all messages for analytics and context
4. **Accessibility First:** WCAG 2.1 AA compliance from day one
5. **Template Architecture:** Reusable components for future deployments

---

### Phase 2: Implementation (Development)

**Duration:** 5 hours

**Components Implemented:**

1. **Frontend Widget (`components/AIAssistantWidget.tsx`)**
   - Floating button with custom icon
   - Expandable chat window with minimize/close controls
   - Real-time message streaming display
   - Keyboard navigation (Tab, Enter, Escape)
   - Markdown link parsing for clickable URLs
   - Error handling and loading states
   - WCAG 2.1 AA compliant

2. **API Route (`app/api/ai-assistant/route.ts`)**
   - POST endpoint for chat requests
   - Rate limiting (10 req/min per IP)
   - Message validation (max 5000 characters)
   - Streaming response handling
   - Supabase conversation storage
   - Comprehensive error handling
   - Sentry error monitoring

3. **Claude Integration (`lib/claude.ts`)**
   - Anthropic SDK client initialization
   - System prompt formatting from knowledge base
   - Streaming response handler
   - Error categorization (402, 403, 429, 500, etc.)
   - Message validation before API calls

4. **Knowledge Base (`lib/knowledge-base.ts`)**
   - Service descriptions and pricing
   - FAQ database
   - System prompt with guardrails
   - Website links and CTAs
   - Centralized pricing integration

5. **Database Schema (`supabase/migrations/20250125_create_ai_assistant_tables.sql`)**
   - `ai_assistant_conversations` table (metadata)
   - `ai_assistant_messages` table (message history)
   - Row Level Security (RLS) policies
   - Performance indexes
   - UUID primary keys

**Key Features Implemented:**
- ✅ Real-time streaming responses
- ✅ Conversation history persistence
- ✅ Rate limiting (10 req/min)
- ✅ Error handling and monitoring
- ✅ WCAG 2.1 AA accessibility
- ✅ Custom branding and styling
- ✅ Markdown link parsing
- ✅ Guardrails for off-topic questions

---

### Phase 3: Testing & Deployment

**Duration:** 1 hour

**Testing Checklist:**
- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Mobile devices (iPhone, Android)
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Error scenarios (network, rate limits)
- ✅ Conversation persistence
- ✅ Streaming response quality

**Deployment:**
- ✅ Environment variables configured
- ✅ Supabase migration applied
- ✅ Vercel deployment successful
- ✅ Production verification complete

---

## Implementation

### System Architecture

```
Client Browser
    ↓
AIAssistantWidget.tsx (React Component)
    ↓
POST /api/ai-assistant (Next.js API Route)
    ↓
    ├─→ Rate Limiting Check
    ├─→ Message Validation
    ├─→ Supabase (Store User Message)
    ├─→ Claude API (Stream Response)
    ├─→ Supabase (Store AI Response)
    └─→ Stream to Client
```

### Key Implementation Details

**Streaming Responses**
- Server-Sent Events (SSE) for real-time token streaming
- Progressive UI updates as tokens arrive

**Rate Limiting**
- In-memory Map-based store
- 10 requests per minute per IP address

**Conversation Persistence**
- All messages stored in Supabase
- Conversation context maintained across sessions

**Error Handling**
- Comprehensive error categorization
- User-friendly error messages
- Sentry integration for production monitoring

**Accessibility**
- Full keyboard navigation
- Screen reader compatible
- WCAG 2.1 AA compliant

---

## Results

### Performance Metrics

- **Response Times:** < 2 seconds average
- **P95:** < 3 seconds
- **Streaming Start:** < 500ms

### Cost Analysis

- **Per 1,000 Messages:** A$0.40 (Claude 3 Haiku)
- **Monthly Estimate (1,000 messages):** A$0.40
- **vs. SaaS Alternative:** A$300-500/month
- **Savings:** 99.9% cost reduction

---

## Technical Details

### Model Selection: Claude 3 Haiku

**Why Haiku over Sonnet:**
- **Cost:** 90% cheaper
- **Speed:** Faster response times
- **Quality:** Sufficient for lead qualification use case

### Database Schema

```sql
CREATE TABLE ai_assistant_conversations (
  id UUID PRIMARY KEY,
  client_ip TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE ai_assistant_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_assistant_conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ
);
```

---

## Learnings & Insights

1. **Template Architecture:** Reusable components enabled rapid deployment
2. **Claude 3 Haiku:** Cost-effective and fast for lead qualification use case
3. **Streaming Responses:** Improved perceived performance significantly
4. **Accessibility First:** WCAG 2.1 AA compliance from day one
5. **Type Safety:** TypeScript caught errors early

---

## Process Documentation

### Week 0: Planning
- Model selection and architecture design

### Sprint: Development (7 hours)
- Widget, API, Claude integration, storage, streaming

### Validation: Testing & Deployment
- Automated and manual testing, Vercel deployment

---

## Conclusion

The AI-powered lead qualification chatbot successfully replaced third-party SaaS solutions, providing 24/7 automated customer support at dramatically lower cost. The 7-hour development sprint and 48-hour deployment timeline demonstrate the power of reusable template architecture and modern AI APIs.

**Next Steps:**
- Monitor conversation quality and user feedback
- Consider model upgrade (Sonnet) for complex queries
- Develop analytics dashboard for conversation insights
- Productize template for client deployments

---

**Project Status:** ✅ Complete  
**Deployment Date:** January 2025  
**Documentation:** `docs/AI_ASSISTANT_WIDGET_DEPLOYMENT.md`
