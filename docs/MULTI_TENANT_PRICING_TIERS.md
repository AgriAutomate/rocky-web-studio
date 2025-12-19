# Multi-Tenant Pricing Tiers

## 💰 Pricing Tiers Overview

Rocky Web Studio offers three pricing tiers for multi-tenant businesses:

---

## 🚀 Starter: $99/month

**Target:** Small service businesses just getting started

**Included:**
- ✅ **100 leads/month**
- ✅ **1 service type**
- ✅ **Basic email nurture** (5-email sequence)
- ✅ **Email support** (48-hour response)
- ✅ **Basic reporting**
- ❌ **No recurring billing**
- ❌ **No SMS notifications**
- ❌ **No lead scoring**
- ❌ **No NPS surveys**
- ❌ **No HubSpot integration**

**Best For:**
- Solo operators
- New businesses
- Testing the platform

---

## ⚡ Pro: $299/month

**Target:** Growing service businesses with multiple service types

**Included:**
- ✅ **1,000 leads/month**
- ✅ **5 service types**
- ✅ **Advanced email nurture** (5-email sequence + personalization)
- ✅ **Lead scoring & qualification**
- ✅ **Recurring billing & subscriptions**
- ✅ **SMS notifications** (Mobile Message - ACMA-approved Sender ID: "Rocky Web")
- ✅ **NPS surveys** (Typeform)
- ✅ **HubSpot integration**
- ✅ **Priority support** (24-hour response)
- ✅ **Advanced reporting** (ROI, funnel, NPS)
- ❌ **No custom integrations**
- ❌ **No dedicated account manager**

**Best For:**
- Established businesses
- Multiple service types
- Need for automation
- Growth-focused companies

---

## 🏆 Enterprise: Custom Pricing

**Target:** Large service businesses with complex needs

**Included:**
- ✅ **Unlimited leads/month**
- ✅ **Unlimited service types**
- ✅ **All Pro features**
- ✅ **Custom integrations** (API access)
- ✅ **Dedicated account manager**
- ✅ **SLA support** (4-hour response)
- ✅ **Custom branding** (white-label option)
- ✅ **Advanced analytics** (custom reports)
- ✅ **Multi-location support**
- ✅ **Custom workflows** (n8n)

**Best For:**
- Large enterprises
- Franchises
- Multi-location businesses
- Custom requirements

---

## 📊 Feature Comparison

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| **Monthly Leads** | 100 | 1,000 | Unlimited |
| **Service Types** | 1 | 5 | Unlimited |
| **Email Nurture** | Basic | Advanced | Advanced |
| **Lead Scoring** | ❌ | ✅ | ✅ |
| **Recurring Billing** | ❌ | ✅ | ✅ |
| **SMS Notifications** | ❌ | ✅ | ✅ |
| **NPS Surveys** | ❌ | ✅ | ✅ |
| **HubSpot Integration** | ❌ | ✅ | ✅ |
| **Custom Integrations** | ❌ | ❌ | ✅ |
| **Dedicated Support** | ❌ | ❌ | ✅ |
| **SLA** | ❌ | ❌ | ✅ |
| **White-Label** | ❌ | ❌ | ✅ |

---

## 💵 Revenue Projections

### Year 1: 3-5 Clients
- **Average tier:** Pro ($299/month)
- **MRR:** $897 - $1,495
- **ARR:** $10,764 - $17,940

### Year 2: 10-15 Clients
- **Average tier:** Pro ($299/month)
- **MRR:** $2,990 - $4,485
- **ARR:** $35,880 - $53,820

### Year 3: 30-50 Clients
- **Average tier:** Pro ($299/month)
- **MRR:** $8,970 - $14,950
- **ARR:** $107,640 - $179,400

**Note:** Enterprise clients at custom pricing would significantly increase these projections.

---

## 🔄 Upgrade Path

### Starter → Pro
**When to upgrade:**
- Exceeding 100 leads/month
- Need for multiple service types
- Want SMS notifications
- Need recurring billing

**Upgrade process:**
1. Business requests upgrade
2. Update `pricing_tier` in database
3. Update `max_leads_per_month` and `max_service_types`
4. Enable feature flags
5. Update Stripe subscription

### Pro → Enterprise
**When to upgrade:**
- Exceeding 1,000 leads/month
- Need custom integrations
- Require dedicated support
- Want white-label option

**Upgrade process:**
1. Contact sales for custom pricing
2. Negotiate terms
3. Update database with custom limits
4. Enable all feature flags
5. Assign dedicated account manager

---

## 🎯 Usage Limits Enforcement

### Leads Per Month
```typescript
// Check limit before creating lead
const currentMonthLeads = await supabase
  .from('service_leads')
  .select('id', { count: 'exact' })
  .eq('business_id', businessId)
  .gte('created_at', startOfMonth)
  .lte('created_at', endOfMonth);

if (currentMonthLeads.count >= business.max_leads_per_month) {
  return NextResponse.json(
    { error: 'Monthly lead limit reached. Upgrade to increase limit.' },
    { status: 403 }
  );
}
```

### Service Types
```typescript
// Check limit before creating service type
const serviceTypeCount = await supabase
  .from('service_types')
  .select('id', { count: 'exact' })
  .eq('business_id', businessId)
  .eq('is_active', true);

if (serviceTypeCount.count >= business.max_service_types) {
  return NextResponse.json(
    { error: 'Service type limit reached. Upgrade to add more.' },
    { status: 403 }
  );
}
```

---

## 📈 Growth Metrics

### Churn Rate Target
- **Goal:** < 5% monthly churn
- **Monitor:** Cancellations per month

### Upgrade Rate Target
- **Goal:** 20% of Starter clients upgrade to Pro within 6 months
- **Monitor:** Tier upgrades per month

### Expansion Revenue
- **Goal:** 10% of revenue from upgrades/expansions
- **Monitor:** MRR growth from existing clients

---

## 🎁 Promotional Offers

### First Month Free
- **Starter:** $0 first month, then $99/month
- **Pro:** $0 first month, then $299/month

### Annual Discount
- **Starter:** $990/year (save $198 = 2 months free)
- **Pro:** $2,990/year (save $598 = 2 months free)

### Referral Program
- **Referrer:** 1 month free
- **Referee:** 1 month free
- **Both:** Applied after 3 months of paid subscription

---

## 📚 Related Documentation

- **Multi-Tenant Architecture:** `docs/MULTI_TENANT_ARCHITECTURE.md`
- **API Middleware:** `lib/middleware/api-key-auth.ts`
- **Database Schema:** `database/schema/multi_tenant_expansion.sql`

---

## ✅ Success Criteria

- [ ] Pricing tiers defined and enforced
- [ ] Usage limits working
- [ ] Feature flags per tier
- [ ] Upgrade path clear
- [ ] Revenue projections tracked
- [ ] Churn rate < 5%
- [ ] Upgrade rate > 20%

The pricing tiers provide clear value propositions for businesses at different stages of growth.
