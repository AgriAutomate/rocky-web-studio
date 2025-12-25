# Existing Systems Audit
**Date:** January 23, 2025  
**Purpose:** Document all existing infrastructure before adding new features  
**Status:** Complete

## Overview

This document maps all existing systems, APIs, and infrastructure to prevent conflicts and identify integration points for new features (AI Assistant, Case Studies).

---

## Supabase Database

### Tables Identified

Based on migration files, the following tables exist:

#### 1. Chat System Tables
- **`chat_conversations`** - Stores chat widget conversations
- **`chat_messages`** - Stores individual chat messages
- **Purpose:** Customer support chat (Drift/Intercom/Crisp webhooks)
- **Schema:** Created in `20251219_create_ai_chat_support.sql`

#### 2. Client Management
- **`clients`** - Client information
- **Purpose:** Client data storage
- **Schema:** Created in `20250122_create_clients_table.sql`

#### 3. Questionnaire System
- **`questionnaire_responses`** - Questionnaire form responses
- **Purpose:** Discovery tree/questionnaire data
- **Schema:** Created in `20251219_create_questionnaire_responses.sql`

#### 4. PDF System
- **`pdf_components`** - PDF component templates
- **Purpose:** PDF generation system
- **Schema:** Created in `20251220_create_pdf_components.sql`

#### 5. Custom Songs
- **`song_orders`** - Custom song orders
- **Purpose:** Song ordering system
- **Schema:** Created in `20251207000001_create_song_orders.sql`

#### 6. Audit System
- Audit columns added to various tables
- **Schema:** `20250122_add_audit_columns.sql`, `20250123_add_audit_status.sql`

#### 7. Discovery Tree
- Discovery tree columns added
- **Schema:** `20250122_add_discovery_tree_columns.sql`

### Schema Conflicts Check

**✅ `case_studies` table name available**
- No existing table with this name
- Safe to create in Week 3-4

**✅ No conflicting column names**
- Standard columns (id, title, slug, etc.) are unique
- No conflicts expected

**✅ No conflicting indexes**
- Will create new indexes for case_studies
- No conflicts expected

### Recommendations

1. **Use existing audit columns pattern** - Follow same pattern for case_studies (created_at, updated_at, etc.)
2. **Use existing RLS pattern** - Follow same RLS policy structure
3. **Leverage existing client table** - May link case studies to clients if needed

---

## Existing Chat System

### Route: `/api/chat/webhook`

**Purpose:** 
- Receives webhooks from chat widgets (Drift, Intercom, Crisp)
- Stores conversations and messages in Supabase
- Triggers n8n workflow for AI processing

**Technology:**
- Next.js API route
- Supabase for storage
- n8n for workflow automation
- Zod for validation

**Integration Points:**
- Supabase: `chat_conversations`, `chat_messages` tables
- n8n: `N8N_AI_CHAT_WEBHOOK_URL` environment variable
- Logging: Uses `@/lib/logging`

**Usage:**
- External chat widgets send POST requests
- Stores conversation data
- Queues messages for AI processing via n8n

### Conflict Analysis

**✅ `/api/ai-assistant` won't conflict**
- Different route (`/api/ai-assistant` vs `/api/chat/webhook`)
- Different purpose:
  - Existing: Customer support chat (webhook receiver)
  - New: AI lead qualification chatbot (direct API)
- Different technology:
  - Existing: n8n workflow + chat widgets
  - New: Claude API + direct integration

**✅ Can coexist safely**
- No route conflicts
- Different use cases
- Different data storage (separate tables)

### Recommendations

1. **Keep existing system intact** - Don't modify `/api/chat/webhook`
2. **New system is separate** - `/api/ai-assistant` serves different purpose
3. **Consider integration later** - Could potentially link both systems in future

---

## API Routes Inventory

### Existing Routes (50+ routes)

#### Admin Routes
- `/api/admin/sms/*` - SMS management
- `/api/admin/sms-logs/*` - SMS log viewing

#### Authentication
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/auth/logout` - Logout
- `/api/auth/session` - Session management

#### Bookings
- `/api/bookings/availability` - Check availability
- `/api/bookings/create` - Create booking
- `/api/bookings/[bookingId]/cancel` - Cancel booking
- `/api/bookings/[bookingId]/reschedule` - Reschedule booking
- `/api/bookings/[bookingId]/sms` - Send SMS for booking

#### Chat
- `/api/chat/webhook` - Chat widget webhook (existing)

#### Consciousness Portal
- `/api/consciousness/analyze` - Analyze consciousness
- `/api/consciousness/generate` - Generate content
- `/api/consciousness/journey/[id]` - Get journey
- `/api/consciousness/library/[id]` - Get library item
- `/api/consciousness/progress` - Get progress
- `/api/consciousness/webhook/suno` - Suno webhook

#### Custom Songs
- `/api/custom-songs/order` - Create song order

#### Discovery Tree
- `/api/discovery-tree` - Discovery tree data

#### Notifications
- `/api/notifications/send-reminder` - Send reminder
- `/api/notifications/send-sms` - Send SMS

#### Questionnaire
- `/api/questionnaire` - Get questionnaire
- `/api/questionnaire/submit` - Submit questionnaire
- `/api/questionnaire/test-db` - Test database

#### Services
- `/api/service/lead-submit` - Submit lead

#### Webhooks
- `/api/webhooks/pdf-generate` - Generate PDF
- `/api/webhooks/stripe` - Stripe webhook

#### Xero Integration
- `/api/xero/callback` - OAuth callback
- `/api/xero/connect` - Connect Xero
- `/api/xero/create-invoice` - Create invoice
- `/api/xero/disconnect` - Disconnect
- `/api/xero/invoices` - List invoices
- `/api/xero/invoices/[id]` - Get invoice
- `/api/xero/status` - Get status

#### Test/Debug Routes
- `/api/test/*` - Various test endpoints

### New Routes Needed

**✅ Available Routes:**
- `/api/ai-assistant` - ✅ Available (new AI chatbot)
- `/api/case-studies` - ✅ Available (case studies CRUD)
- `/api/case-studies/[slug]` - ✅ Available (get by slug)

**No Conflicts Identified**

---

## Environment Variables

### Existing Variables (from codebase analysis)

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Authentication
- NextAuth variables (various)

#### External Services
- `N8N_AI_CHAT_WEBHOOK_URL` - n8n workflow
- `RESEND_API_KEY` - Email service
- `STRIPE_SECRET_KEY` - Payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhooks
- Mobile Message API variables
- Xero integration variables
- Sentry variables

### New Variables Needed

**✅ No Conflicts:**
- `ANTHROPIC_API_KEY` - For Claude API (Week 2-3)
- `NEXT_PUBLIC_FEATURE_AI_ASSISTANT` - Feature flag (Week 0)
- `NEXT_PUBLIC_FEATURE_CASE_STUDIES` - Feature flag (Week 0)
- `FEATURE_CASE_STUDIES_ADMIN` - Feature flag (Week 0)

**Recommendation:** Add to `.env.local` and Vercel environment variables

---

## Feature Dependencies

### Booking System
- **How it works:** Availability checking, booking creation, SMS notifications
- **Integration:** Uses Supabase, Mobile Message API, Stripe
- **Risk:** Low - Accessibility fixes shouldn't affect booking flow

### SMS System
- **How it works:** Mobile Message API integration, SMS templates, reminders
- **Integration:** Uses Mobile Message API, Supabase for logs
- **Risk:** Low - No conflicts with new features

### Payment System
- **How it works:** Stripe integration, webhook handling
- **Integration:** Uses Stripe API, webhooks
- **Risk:** Low - No conflicts with new features

### Chat System
- **How it works:** Webhook receiver, stores in Supabase, triggers n8n
- **Integration:** Supabase, n8n workflows
- **Risk:** None - New AI assistant is separate route

### Questionnaire System
- **How it works:** Discovery tree, form submissions, Supabase storage
- **Integration:** Supabase, form handling
- **Risk:** Low - No conflicts expected

---

## Integration Points for New Features

### AI Assistant (`/api/ai-assistant`)

**Will Integrate With:**
- ✅ Supabase - For chat history storage (new table: `ai_assistant_conversations`)
- ✅ Sentry - For error monitoring (existing)
- ✅ Resend - For email notifications (existing)
- ✅ Feature flags - For gradual rollout

**Won't Integrate With:**
- ❌ Existing `/api/chat/webhook` - Separate systems
- ❌ n8n workflows - Direct Claude API integration

### Case Studies System

**Will Integrate With:**
- ✅ Supabase - New `case_studies` table
- ✅ Existing admin dashboard - Add case studies admin UI
- ✅ PDF system - Use existing `@react-pdf/renderer` for PDF generation
- ✅ Image storage - Use Supabase Storage (existing)

**Won't Integrate With:**
- ❌ Sanity.io - Using Supabase instead

---

## Recommendations

### For AI Assistant Implementation
1. **Create new Supabase tables:**
   - `ai_assistant_conversations` - Store conversations
   - `ai_assistant_messages` - Store messages
   - Follow existing chat table patterns

2. **Use existing infrastructure:**
   - Sentry for error monitoring
   - Resend for email (if needed)
   - Feature flags for rollout

3. **Keep separate from existing chat:**
   - Different route
   - Different purpose
   - Different storage

### For Case Studies Implementation
1. **Create `case_studies` table:**
   - Use schema from `SUPABASE_CASE_STUDIES_SCHEMA.md`
   - Follow existing table patterns (audit columns, RLS)

2. **Leverage existing systems:**
   - Use existing admin dashboard structure
   - Use existing PDF generation system
   - Use Supabase Storage for images

3. **No conflicts expected:**
   - Table name available
   - Route names available
   - No schema conflicts

---

## Risk Assessment

### Low Risk Areas
- ✅ Route conflicts: None identified
- ✅ Database conflicts: None identified
- ✅ Environment variables: No conflicts
- ✅ Integration points: Well-defined

### Medium Risk Areas
- ⚠️ **Feature interactions:** Need to test that new features don't break existing
- ⚠️ **Performance:** New queries may impact database performance (mitigate with indexes)

### Mitigation Strategies
1. **Integration testing** after each new feature
2. **Feature flags** for safe rollout
3. **Database indexes** for performance
4. **Monitoring** via Sentry

---

## Next Steps

### Week 1-2: Accessibility
- ✅ No conflicts expected
- ✅ Test booking/payment flows after fixes

### Week 2-3: AI Assistant
- ✅ Create new Supabase tables
- ✅ Implement `/api/ai-assistant` route
- ✅ Test existing chat system still works

### Week 3-4: Case Studies
- ✅ Create `case_studies` table
- ✅ Build admin UI
- ✅ Test existing admin dashboard still works

---

**Audit Complete:** January 23, 2025  
**Status:** Ready for Week 1 execution  
**Conflicts:** None identified  
**Confidence:** High - Safe to proceed

