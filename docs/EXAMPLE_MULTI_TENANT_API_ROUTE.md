# Example: Multi-Tenant API Route

## 📋 Example: Service Lead Submission with Multi-Tenant Support

This example shows how to create an API route that:
1. Validates API key
2. Extracts business context
3. Enforces usage limits
4. Checks feature flags
5. Scopes all queries to business_id

---

## 🔧 Implementation

### File: `app/api/service/lead-submit/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { withApiKeyAuth, hasFeature, isLimitReached } from '@/lib/middleware/api-key-auth';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { AuthenticatedRequest } from '@/lib/middleware/api-key-auth';

async function handleLeadSubmit(request: AuthenticatedRequest) {
  try {
    const businessId = request.businessId!;
    const business = request.business!;

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, email, phone, serviceType, urgency, location, description } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, phone' },
        { status: 400 }
      );
    }

    // Check lead limit for current month
    const supabase = createServerSupabaseClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { count: currentMonthLeads } = await supabase
      .from('service_leads')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (isLimitReached(business, 'leads', currentMonthLeads || 0)) {
      return NextResponse.json(
        {
          error: 'Monthly lead limit reached',
          limit: business.max_leads_per_month,
          current: currentMonthLeads,
          message: 'Please upgrade your plan to increase your monthly lead limit.',
        },
        { status: 403 }
      );
    }

    // Insert lead with business_id
    const { data: lead, error: insertError } = await supabase
      .from('service_leads')
      .insert({
        business_id: businessId,
        created_by: 'api', // or extract from API key metadata
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        service_type: serviceType || null,
        urgency: urgency || null,
        location: location || null,
        description: description || null,
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return NextResponse.json(
        { error: 'Failed to create lead', details: insertError.message },
        { status: 500 }
      );
    }

    // Trigger lead scoring (if feature enabled)
    if (hasFeature(business, 'lead_scoring')) {
      // Trigger n8n webhook for lead scoring
      const webhookUrl = process.env.N8N_LEAD_SCORING_WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            businessId: businessId,
            email,
            firstName,
            serviceType,
            urgency,
          }),
        }).catch((err) => {
          console.error('Failed to trigger lead scoring webhook:', err);
        });
      }
    }

    // Trigger general service lead webhook
    const serviceLeadWebhookUrl = process.env.N8N_SERVICE_LEAD_WEBHOOK_URL;
    if (serviceLeadWebhookUrl) {
      fetch(serviceLeadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          businessId: businessId,
          businessName: business.business_name,
          email,
          firstName,
          lastName,
          serviceType,
        }),
      }).catch((err) => {
        console.error('Failed to trigger service lead webhook:', err);
      });
    }

    return NextResponse.json(
      {
        success: true,
        leadId: lead.id,
        message: 'Lead created successfully',
        usage: {
          current: (currentMonthLeads || 0) + 1,
          limit: business.max_leads_per_month,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in lead submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export with API key authentication
export const POST = withApiKeyAuth(handleLeadSubmit);
```

---

## 🔍 Key Features

### 1. API Key Authentication
```typescript
export const POST = withApiKeyAuth(handleLeadSubmit);
```
- Automatically validates `X-API-Key` header
- Extracts `businessId` and `business` context
- Returns 401 if invalid

### 2. Usage Limit Enforcement
```typescript
if (isLimitReached(business, 'leads', currentMonthLeads || 0)) {
  return NextResponse.json({ error: 'Limit reached' }, { status: 403 });
}
```
- Checks current month's lead count
- Compares against `max_leads_per_month`
- Returns 403 with helpful message

### 3. Feature Flag Check
```typescript
if (hasFeature(business, 'lead_scoring')) {
  // Trigger lead scoring workflow
}
```
- Checks if feature is enabled for business
- Only executes if feature available

### 4. Business-Scoped Queries
```typescript
await supabase
  .from('service_leads')
  .select('id', { count: 'exact', head: true })
  .eq('business_id', businessId)  // Always filter by business_id
  .gte('created_at', startOfMonth)
  .lte('created_at', endOfMonth);
```
- All queries include `business_id` filter
- Ensures data isolation

---

## 🧪 Testing

### Test with API Key
```bash
curl -X POST http://localhost:3000/api/service/lead-submit \
  -H "X-API-Key: rws_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "serviceType": "emergency",
    "urgency": "today"
  }'
```

### Expected Response (Success)
```json
{
  "success": true,
  "leadId": "uuid-here",
  "message": "Lead created successfully",
  "usage": {
    "current": 1,
    "limit": 100
  }
}
```

### Expected Response (Limit Reached)
```json
{
  "error": "Monthly lead limit reached",
  "limit": 100,
  "current": 100,
  "message": "Please upgrade your plan to increase your monthly lead limit."
}
```

### Expected Response (Invalid API Key)
```json
{
  "error": "Invalid API key or business account inactive."
}
```

---

## 📚 Related Documentation

- **Middleware:** `lib/middleware/api-key-auth.ts`
- **Architecture:** `docs/MULTI_TENANT_ARCHITECTURE.md`
- **Pricing:** `docs/MULTI_TENANT_PRICING_TIERS.md`

---

## ✅ Best Practices

1. **Always filter by business_id** in all queries
2. **Check limits** before creating resources
3. **Check features** before using premium functionality
4. **Log business_id** in all operations for audit trail
5. **Return helpful errors** with upgrade suggestions

---

This example demonstrates the complete multi-tenant API route pattern.
