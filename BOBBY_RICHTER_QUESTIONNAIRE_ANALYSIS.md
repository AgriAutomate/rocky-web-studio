# Questionnaire Analysis: Bobby Richter (DJ Equipment Hire)

## Client Requirements Summary

**Bobby Richter / DJ Richter** - Local DJ offering:
1. Audio/Visual equipment hire (wet/dry hire)
2. DJ services booking
3. Equipment catalog with pricing
4. Booking system integration
5. Payment processing

---

## Current Questionnaire Capabilities ✅

### What CAN Be Captured:

1. **Basic Business Information** ✅
   - Business name, email, phone
   - Sector selection (can use "events-entertainment" or "arts-music-creative")
   - Contact details

2. **General Business Context** ✅
   - Goals (includes "grow-revenue-ecommerce", "enhance-customer-experience", "streamline-operations")
   - Challenges (includes "digital-transformation", "operating-costs")
   - Primary offers (includes "creative-media" which fits entertainment)

3. **Budget & Timeline** ✅
   - Budget ranges ($800-$25k)
   - Timeline preferences

4. **Sector-Specific Questions** ⚠️
   - Currently: hospitality, trades, retail, professional
   - **Does NOT have "events-entertainment" specific questions**
   - Would need to use generic text areas or fall back to "professional" or "hospitality" questions

---

## Critical Gaps ❌

### What CANNOT Be Captured (Structured):

1. **Equipment Catalog Details** ❌
   - No fields for equipment listings
   - No equipment specifications
   - No equipment categories/types
   - No SKU or inventory tracking fields

2. **Pricing Structure** ❌
   - No fields for wet hire vs dry hire pricing
   - No per-item pricing fields
   - No package/bundle pricing options
   - No pricing tiers or discounts

3. **Service Details** ❌
   - No structured fields for DJ service packages
   - No service duration options
   - No add-on services configuration

4. **Booking Model Configuration** ❌
   - No specific questions about booking workflows
   - No availability calendar requirements
   - No rental duration options (daily, weekly, etc.)

5. **Payment Methods** ❌
   - No fields to specify required payment methods
   - No deposit/booking fee structure
   - No payment terms configuration

---

## Workarounds (Not Ideal)

### Using Current System:

1. **Text Areas for Additional Context**
   - Could use sector-specific textarea fields (e.g., hospitality "h8", "h9", "h10")
   - Could store equipment details in `additionalContext` field
   - **Problem**: Unstructured data, harder to process programmatically

2. **Database Storage**
   - Current schema stores responses in structured fields + JSONB arrays
   - Could store equipment list as JSON in `additionalContext` or custom JSONB field
   - **Problem**: Would need manual extraction and parsing

3. **Post-Questionnaire Collection**
   - Use questionnaire for initial discovery
   - Follow up via email/consultation to gather equipment details
   - **Better approach**: More structured data collection

---

## Recommendations

### Option 1: Enhanced Questionnaire (Recommended) ⭐

**Add a new sector-specific question set for "events-entertainment":**

```typescript
{
  id: "events-entertainment",
  sector: "events-entertainment",
  questions: [
    {
      id: "e6",
      type: "checkbox",
      label: "Booking model",
      options: [
        { value: "equipment-hire", label: "Equipment hire (wet/dry)" },
        { value: "services-only", label: "Services only (DJ, MC, etc.)" },
        { value: "packages", label: "Service + equipment packages" }
      ]
    },
    {
      id: "e7",
      type: "textarea",
      label: "Equipment catalog summary (list main categories and quantities)",
      placeholder: "e.g., Speakers: 4x PA systems, Lighting: 10x LED panels, DJ Equipment: 2x full setups..."
    },
    {
      id: "e8",
      type: "textarea",
      label: "Pricing structure (wet hire vs dry hire, typical rates)",
      placeholder: "e.g., Wet hire (with operator): $500/day, Dry hire (equipment only): $200/day..."
    },
    {
      id: "e9",
      type: "checkbox",
      label: "Required booking features",
      options: [
        { value: "online-booking", label: "Online booking calendar" },
        { value: "availability-check", label: "Real-time availability" },
        { value: "payment-processing", label: "Online payment processing" },
        { value: "deposits", label: "Deposit/booking fees" },
        { value: "invoices", label: "Automated invoices" }
      ]
    },
    {
      id: "e10",
      type: "textarea",
      label: "Special requirements or custom needs",
      placeholder: "e.g., Equipment delivery, setup services, insurance requirements..."
    }
  ]
}
```

**Benefits:**
- Structured data capture
- Better qualification
- Automated processing possible
- Aligns with existing questionnaire architecture

**Effort:** Medium (1-2 hours development + testing)

---

### Option 2: Use Current System + Consultation Follow-up

**Steps:**
1. Client completes current questionnaire
   - Select "arts-music-creative" or "events-entertainment" sector
   - Use textarea fields to provide basic equipment overview
   - Specify goals and budget

2. Use `additionalContext` field for free-form equipment details

3. Schedule follow-up consultation to gather:
   - Complete equipment catalog
   - Detailed pricing structure
   - Booking workflow requirements
   - Payment method preferences

**Benefits:**
- No code changes required
- Can start immediately
- Consultation allows for detailed discussion

**Limitations:**
- Less structured initial data
- Manual data entry required
- Slower initial assessment

---

### Option 3: Custom Equipment Data Collection Form

**Create a separate lightweight form for equipment details:**

- Standalone form accessible after questionnaire submission
- Structured fields for: equipment name, category, quantity, wet/dry pricing
- Stores data linked to questionnaire response ID
- Could be built as a Supabase table + simple form

**Benefits:**
- Keeps questionnaire focused on discovery
- Structured equipment data
- Can be built incrementally

**Effort:** Medium-High (separate form + database table + API)

---

## Database Schema Considerations

### Current Schema (`questionnaire_responses`):
- Basic business info ✅
- Goals, challenges (JSONB arrays) ✅
- `additionalContext` (TEXT) - could store equipment list but unstructured ❌

### Needed for Equipment Hire:
```sql
-- Option: Add JSONB column for structured equipment data
ALTER TABLE questionnaire_responses 
ADD COLUMN equipment_catalog JSONB DEFAULT '[]'::jsonb;

-- Or: Create separate equipment_catalog table (better normalization)
CREATE TABLE equipment_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_response_id BIGINT REFERENCES questionnaire_responses(id),
  equipment_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER,
  wet_hire_price DECIMAL(10,2),
  dry_hire_price DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Next Steps Recommendation

### Immediate Action (This Week):
1. **Use current questionnaire** for initial discovery
   - Select "events-entertainment" sector
   - Provide equipment overview in textarea fields
   - Complete budget and timeline questions

2. **Schedule consultation call** to gather:
   - Complete equipment list with specifications
   - Detailed pricing (wet vs dry hire)
   - Booking workflow preferences
   - Payment method requirements

### Short-term Enhancement (Next 1-2 Weeks):
3. **Add "events-entertainment" question set** to questionnaire
   - Provides better structured data capture
   - Improves future client qualification
   - Aligns with existing architecture

4. **Consider equipment catalog form** if multiple similar clients expected
   - Reusable for future equipment hire clients
   - Structured data for easier website development

---

## Conclusion

**Current Questionnaire Status:** ⚠️ **Partially Suitable**

The questionnaire can capture:
- Basic business info ✅
- General goals and context ✅
- Budget and timeline ✅

But **cannot** capture structured:
- Equipment catalogs ❌
- Pricing structures ❌
- Booking configurations ❌

**Recommendation:** Use current questionnaire for initial qualification, then supplement with consultation or enhanced question set for detailed equipment/pricing information.

---

**Prepared by:** AI Assistant  
**Date:** 2025-01-27  
**For:** Rocky Web Studio - Bobby Richter Project Planning

