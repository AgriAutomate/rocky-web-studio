# Google Analytics 4 (GA4) Event Tracking Documentation

## Overview

This document describes the Google Analytics 4 (GA4) event tracking implementation for the Custom Songs order flow in Rocky Web Studio. All tracking follows GA4 e-commerce best practices and includes both standard e-commerce events and custom events.

## Configuration

### Environment Variable

Set the following environment variable in `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID from Google Analytics.

### Installation

GA4 is automatically loaded in `app/layout.tsx` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured. The script is loaded asynchronously and initializes the data layer.

## Standard E-commerce Events

### 1. `begin_checkout`

**When:** Triggered when the order page loads or when a package is selected.

**Parameters:**
```typescript
{
  currency: "AUD",
  value: number, // Total value in AUD
  items: [
    {
      item_id: string, // Package type (express, standard, wedding)
      item_name: string, // Package display name
      price: number, // Package price in AUD
      quantity: number // Always 1
    }
  ]
}
```

**Implementation:** `lib/analytics.ts` → `trackBeginCheckout()`

**Example:**
```javascript
{
  currency: "AUD",
  value: 29,
  items: [
    {
      item_id: "standard",
      item_name: "Standard Occasion",
      price: 29,
      quantity: 1
    }
  ]
}
```

---

### 2. `add_payment_info`

**When:** Triggered when a package is selected from the dropdown.

**Parameters:**
```typescript
{
  currency: "AUD",
  value: number, // Package price
  items: [
    {
      item_id: string,
      item_name: string,
      price: number,
      quantity: number,
      item_category: "custom_songs" // Always "custom_songs"
    }
  ]
}
```

**Implementation:** `lib/analytics.ts` → `trackAddPaymentInfo()`

**Example:**
```javascript
{
  currency: "AUD",
  value: 49,
  items: [
    {
      item_id: "express",
      item_name: "Express Personal",
      price: 49,
      quantity: 1,
      item_category: "custom_songs"
    }
  ]
}
```

---

### 3. `apply_promotion`

**When:** Triggered when a valid discount code is successfully applied.

**Parameters:**
```typescript
{
  currency: "AUD",
  promotion_id: string, // Promo code (e.g., "LAUNCH20")
  promotion_name: string, // Display name (e.g., "LAUNCH20 - 20% Off")
  value: number // Discount amount in AUD
}
```

**Implementation:** `lib/analytics.ts` → `trackApplyPromotion()`

**Example:**
```javascript
{
  currency: "AUD",
  promotion_id: "LAUNCH20",
  promotion_name: "LAUNCH20 - 20% Off",
  value: 5.8 // 20% of $29
}
```

---

### 4. `purchase`

**When:** Triggered when payment is successfully completed.

**Parameters:**
```typescript
{
  transaction_id: string, // Stripe Payment Intent ID
  currency: "AUD",
  value: number, // Final amount paid
  items: [
    {
      item_id: string,
      item_name: string,
      price: number, // Final price after discount
      quantity: number
    }
  ],
  discount?: number, // Optional: discount amount
  promotion_id?: string // Optional: promo code used
}
```

**Implementation:** `lib/analytics.ts` → `trackPurchase()`

**Example:**
```javascript
{
  transaction_id: "pi_1234567890abcdef",
  currency: "AUD",
  value: 23.2,
  items: [
    {
      item_id: "standard",
      item_name: "Standard Occasion",
      price: 23.2,
      quantity: 1
    }
  ],
  discount: 5.8,
  promotion_id: "LAUNCH20"
}
```

## Custom Events

### 1. `discount_code_applied`

**When:** Triggered when a valid discount code is successfully applied.

**Parameters:**
```typescript
{
  event_category: "Custom Songs",
  event_label: string, // Promo code (e.g., "LAUNCH20")
  value: number, // Discount amount
  currency: "AUD",
  promotion_id: string,
  promotion_name: string
}
```

**Implementation:** `lib/analytics.ts` → `trackDiscountCodeApplied()`

---

### 2. `discount_code_failed`

**When:** Triggered when an invalid discount code is entered.

**Parameters:**
```typescript
{
  event_category: "Custom Songs",
  event_label: string // Invalid code entered
}
```

**Implementation:** `lib/analytics.ts` → `trackDiscountCodeFailed()`

---

### 3. `package_selected`

**When:** Triggered when a package is selected from the dropdown.

**Parameters:**
```typescript
{
  event_category: "Custom Songs",
  event_label: string, // Package display name
  value: number, // Package price
  currency: "AUD",
  package_type: string // Package ID (express, standard, wedding)
}
```

**Implementation:** `lib/analytics.ts` → `trackPackageSelected()`

---

### 4. `form_abandoned`

**When:** Triggered when a user leaves the page before completing the order (via `beforeunload` event).

**Parameters:**
```typescript
{
  event_category: "Custom Songs",
  event_label: string, // Step where abandoned (e.g., "order_form")
  value: number, // Completion percentage (0-100)
  completion_percentage: number // Same as value
}
```

**Implementation:** `lib/analytics.ts` → `trackFormAbandoned()`

**Note:** Only tracks if at least one field has been completed and user is on the form step.

## Event Flow

### Typical User Journey

1. **User lands on order page**
   - `begin_checkout` (with empty items if no package pre-selected)

2. **User selects a package**
   - `package_selected` (custom event)
   - `add_payment_info` (standard e-commerce event)
   - `begin_checkout` (updated with package details)

3. **User applies discount code**
   - If valid:
     - `discount_code_applied` (custom event)
     - `apply_promotion` (standard e-commerce event)
   - If invalid:
     - `discount_code_failed` (custom event)

4. **User completes payment**
   - `purchase` (standard e-commerce event with transaction details)

5. **User abandons form** (if applicable)
   - `form_abandoned` (custom event with completion percentage)

## Package Information

### Package Types

| Package ID | Display Name | Price (AUD) | Turnaround |
|-----------|---------------|-------------|------------|
| `express` | Express Personal | $49 | 24-48 hours |
| `standard` | Standard Occasion | $29 | 3-5 days |
| `wedding` | Wedding Trio | $149 | 5-7 days |

### Discount Codes

Currently supported:
- **LAUNCH20**: 20% discount on any package

## Testing

### GA4 DebugView

1. Enable DebugView in Google Analytics:
   - Go to Admin → DebugView
   - Or use the GA Debugger Chrome extension

2. Test events locally:
   - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`
   - Run `npm run dev`
   - Open the order page and interact with the form
   - Check DebugView for real-time events

3. Verify event parameters:
   - Each event should include all required parameters
   - Currency should always be "AUD"
   - Prices should be in AUD (not cents)
   - Transaction IDs should match Stripe Payment Intent IDs

### Common Issues

1. **Events not appearing:**
   - Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
   - Verify GA4 script is loading (check browser console)
   - Check for ad blockers or privacy extensions

2. **Incorrect values:**
   - Ensure prices are in AUD, not cents
   - Verify package IDs match exactly (express, standard, wedding)

3. **Missing events:**
   - Check browser console for errors
   - Verify `window.gtag` is available before tracking

## Implementation Files

- **GA4 Script:** `app/layout.tsx`
- **Analytics Functions:** `lib/analytics.ts`
- **Order Page Tracking:** `app/services/custom-songs/order/page.tsx`

## Best Practices

1. **Always check for `window.gtag`** before tracking to avoid errors in SSR
2. **Use consistent naming** for event parameters
3. **Include currency** in all monetary events
4. **Track both standard and custom events** for comprehensive analytics
5. **Test in DebugView** before deploying to production

## Future Enhancements

- Add tracking for form field interactions
- Track time spent on each step
- Add conversion funnel analysis
- Implement enhanced e-commerce tracking for refunds/cancellations
- Add A/B testing event tracking

