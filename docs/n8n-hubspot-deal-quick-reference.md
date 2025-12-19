# HubSpot Deal Lifecycle - Quick Reference

## 🎯 Workflow Summary

**Name:** HubSpot Deal Lifecycle Management

**Triggers:**
- Booking created → Deal creation
- Booking status change → Deal stage update
- Payment received → Deal won
- Payment overdue → Deal lost

**Purpose:** Automatically manage HubSpot deals through the sales pipeline

---

## 🔄 Deal Stage Flow

| Booking Status | HubSpot Deal Stage | Trigger |
|----------------|-------------------|---------|
| `scheduled` | **Scheduled** | Booking created |
| `completed` | **Pending Approval** | Service completed |
| `paid` | **Won** | Payment received |
| Overdue 30+ days | **Lost** | Scheduled check |

---

## 📊 Deal Properties

### Standard Properties
- `dealname`: `[firstName] [lastName] - [service_type]`
- `pipeline`: "Service Pipeline"
- `dealstage`: Based on booking status
- `amount`: `estimated_cost` / `actual_cost`
- `closedate`: `scheduled_date` / payment date

### Custom Properties
- `lead_score`: Engagement score
- `service_type`: Service type
- `lead_source`: UTM source
- `lead_quality`: Qualification status
- `scheduled_date`: Booking date
- `technician_assigned`: Technician name
- `service_notes`: Description
- `customer_feedback`: Empty initially

---

## 📈 Analytics Queries

### Pipeline Velocity
```sql
SELECT dealstage, AVG(days_in_stage) as avg_days
FROM deals
WHERE pipeline = 'Service Pipeline'
GROUP BY dealstage;
```

### Win Rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE dealstage = 'Won') as won,
  COUNT(*) as total,
  (won::DECIMAL / total) * 100 as win_rate
FROM deals
WHERE pipeline = 'Service Pipeline';
```

### Revenue Forecast
```sql
SELECT 
  DATE_TRUNC('month', closedate) as month,
  SUM(amount) as forecasted_revenue
FROM deals
WHERE dealstage IN ('Scheduled', 'Pending Approval')
GROUP BY month;
```

---

## 🚀 Setup Checklist

- [ ] Create "Service Pipeline" in HubSpot
- [ ] Configure deal stages
- [ ] Create custom properties
- [ ] Set up webhook endpoints
- [ ] Configure HubSpot API credentials
- [ ] Test deal creation
- [ ] Test stage transitions
- [ ] Set up scheduled overdue check
- [ ] Configure reports
- [ ] Workflow activated

---

## 📚 Full Documentation

See `docs/n8n-hubspot-deal-lifecycle-workflow.md` for complete setup instructions.
