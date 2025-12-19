# Multi-Tenant Architecture - Quick Reference

## 🎯 Overview

Multi-tenant architecture with complete data isolation, API key authentication, and tiered pricing.

---

## 🔑 API Key Authentication

### Client Request
```bash
curl -X POST https://api.rockywebstudio.com.au/api/service/lead-submit \
  -H "X-API-Key: rws_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", ...}'
```

### Server Route
```typescript
import { withApiKeyAuth } from '@/lib/middleware/api-key-auth';

export const POST = withApiKeyAuth(async (request) => {
  const businessId = request.businessId; // Automatically set
  const business = request.business; // Business context
  
  // All queries scoped to business_id
  await supabase
    .from('service_leads')
    .insert({ ...data, business_id: businessId });
});
```

---

## 💰 Pricing Tiers

| Tier | Price | Leads/Month | Service Types | Features |
|------|-------|-------------|---------------|----------|
| **Starter** | $99 | 100 | 1 | Basic |
| **Pro** | $299 | 1,000 | 5 | Advanced |
| **Enterprise** | Custom | Unlimited | Unlimited | All |

---

## 🗄️ Database Queries

### Always Filter by business_id
```sql
SELECT * FROM service_leads
WHERE business_id = $1  -- Required
  AND status = 'new';
```

### Check Limits
```typescript
// Check lead limit
if (isLimitReached(business, 'leads', currentCount)) {
  return NextResponse.json({ error: 'Limit reached' }, { status: 403 });
}
```

### Check Features
```typescript
// Check feature access
if (!hasFeature(business, 'recurring_billing')) {
  return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
}
```

---

## 📊 Revenue Projections

- **Year 1:** $10K-15K MRR (3-5 clients)
- **Year 2:** $30K-45K MRR (10-15 clients)
- **Year 3:** $90K-150K MRR (30-50 clients)

---

## 🔧 Setup Checklist

- [ ] Run `database/schema/multi_tenant_expansion.sql`
- [ ] Run `database/schema/rls_policies.sql`
- [ ] Create first business account
- [ ] Generate API key
- [ ] Test API authentication
- [ ] Verify data isolation

---

## 📚 Full Documentation

- **Architecture:** `docs/MULTI_TENANT_ARCHITECTURE.md`
- **Pricing:** `docs/MULTI_TENANT_PRICING_TIERS.md`
- **Middleware:** `lib/middleware/api-key-auth.ts`
