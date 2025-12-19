# Multi-Tenant Architecture Documentation

## 📋 Overview

Rocky Web Studio now supports **multi-tenant architecture**, allowing multiple businesses to use the platform with complete data isolation, custom branding, and tiered pricing.

---

## 🏗️ Architecture Principles

### 1. Data Isolation

**Every tenant-scoped table includes `business_id`:**
- `service_leads.business_id`
- `service_bookings.business_id`
- `service_types.business_id`
- `technician_availability.business_id`
- `technician_skills.business_id`
- And all other tenant-scoped tables

**All queries must filter by `business_id`:**
```sql
SELECT * FROM service_leads
WHERE business_id = $1  -- Always required
  AND status = 'new';
```

---

### 2. Row Level Security (RLS)

**RLS policies enforce data isolation at the database level:**

- **Enabled on all tenant-scoped tables**
- **Policies check `business_id` from API key or JWT**
- **Prevents cross-tenant data access**

**Example Policy:**
```sql
CREATE POLICY "leads_select_business"
  ON public.service_leads
  FOR SELECT
  USING (
    business_id = public.get_business_id_from_api_key(
      current_setting('app.business_id', true)::BIGINT
    )
  );
```

---

### 3. API Key Authentication

**Each business gets a unique API key:**
- Format: `rws_<base64-encoded-random-bytes>`
- Stored in `service_businesses.api_key`
- Validated via `X-API-Key` header

**Middleware validates API key:**
```typescript
import { withApiKeyAuth } from '@/lib/middleware/api-key-auth';

export const POST = withApiKeyAuth(async (request) => {
  const businessId = request.businessId; // Automatically set
  // ... handler logic
});
```

---

## 🗄️ Database Schema

### Core Tables

#### `service_businesses`
Multi-tenant business accounts with:
- **API key authentication**
- **Subscription management** (tier, status, limits)
- **Branding** (logo, colors)
- **Feature flags** (JSONB)
- **Stripe integration**

#### `service_categories`
Service category taxonomy (can be shared or business-specific)

#### Extended Tables
All existing tables now include `business_id` for tenant isolation.

---

## 🔐 Authentication Flow

### API Key Authentication

**1. Client sends request with API key:**
```bash
curl -X POST https://api.rockywebstudio.com.au/api/service/lead-submit \
  -H "X-API-Key: rws_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", ...}'
```

**2. Middleware validates API key:**
- Queries `service_businesses` by `api_key`
- Checks `status = 'active'` and `subscription_status = 'active'`
- Extracts `business_id` and attaches to request

**3. Handler uses business context:**
```typescript
const businessId = request.businessId;
const business = request.business;

// All queries scoped to business_id
await supabase
  .from('service_leads')
  .insert({ ...data, business_id: businessId });
```

---

## 💰 Pricing Tiers

### Starter: $99/month
- **100 leads/month**
- **1 service type**
- **Basic email nurture**
- **No recurring billing**
- **Email support**

### Pro: $299/month
- **1,000 leads/month**
- **5 service types**
- **Advanced nurture + lead scoring**
- **Recurring billing**
- **SMS notifications**
- **Priority support**

### Enterprise: Custom
- **Unlimited leads**
- **Unlimited service types**
- **Custom integrations**
- **Dedicated account manager**
- **SLA support**

---

## 🎨 Customization

### Branding
Each business can customize:
- **Logo** (`logo_url`)
- **Primary color** (`primary_color`)
- **Secondary color** (`secondary_color`)
- **Favicon** (`favicon_url`)

### Service Types
- **Custom service types** per business
- **Shared service types** (business_id = NULL)
- **Skill requirements** (JSONB)
- **Pricing models** (fixed, hourly, tiered)

### Features
Feature flags stored in `features` JSONB:
```json
{
  "recurring_billing": true,
  "sms_notifications": true,
  "lead_scoring": true,
  "nps_surveys": true,
  "hubspot_integration": true
}
```

---

## 📊 Revenue Projections

### Year 1: 3-5 Clients
- **Average:** $300/month per client
- **MRR:** $10K-15K
- **ARR:** $120K-180K

### Year 2: 10-15 Clients
- **Average:** $300/month per client
- **MRR:** $30K-45K
- **ARR:** $360K-540K

### Year 3: 30-50 Clients
- **Average:** $300/month per client
- **MRR:** $90K-150K
- **ARR:** $1.08M-1.8M

---

## 🤝 MLM Opportunity

### White-Label Reseller Program

**Agencies can resell to their service business clients:**
- **30% revenue share** to agency
- **70% revenue** to Rocky Web Studio
- **Dedicated partner portal**
- **Co-branded marketing materials**

**Example:**
- Agency signs 10 clients at $299/month
- Agency earns: 10 × $299 × 30% = $897/month
- Rocky Web Studio earns: 10 × $299 × 70% = $2,093/month

---

## 🔧 Implementation Checklist

### Database Setup
- [ ] Run `database/schema/multi_tenant_expansion.sql`
- [ ] Run `database/schema/rls_policies.sql`
- [ ] Verify RLS policies enabled
- [ ] Create default business for existing data

### API Routes
- [ ] Add `withApiKeyAuth` middleware to all tenant-scoped routes
- [ ] Update queries to include `business_id` filter
- [ ] Test API key validation
- [ ] Verify data isolation

### Frontend
- [ ] Add API key input to business settings
- [ ] Display business branding (logo, colors)
- [ ] Show subscription tier and limits
- [ ] Implement feature flag checks

### Testing
- [ ] Test data isolation (no cross-tenant access)
- [ ] Test API key authentication
- [ ] Test RLS policies
- [ ] Test pricing tier limits
- [ ] Test feature flags

---

## 📚 Related Documentation

- **Database Schema:** `database/schema/multi_tenant_expansion.sql`
- **RLS Policies:** `database/schema/rls_policies.sql`
- **API Middleware:** `lib/middleware/api-key-auth.ts`
- **Pricing Tiers:** See `PRICING_TIER_LIMITS` in middleware file

---

## 🚀 Next Steps

1. **Run database migrations**
2. **Create first business account**
3. **Generate API key**
4. **Test API authentication**
5. **Verify data isolation**
6. **Launch multi-tenant platform**

---

## ✅ Success Criteria

- [ ] Complete data isolation between tenants
- [ ] API key authentication working
- [ ] RLS policies enforced
- [ ] Pricing tier limits enforced
- [ ] Custom branding per business
- [ ] Feature flags working
- [ ] No cross-tenant data access

The multi-tenant architecture provides secure, scalable, and customizable service management for multiple businesses.
