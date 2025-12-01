# Cursor Prompt: Fix Missing Prices on Custom Songs Service Page

## Task
Update the pricing cards on the Custom Songs service page (`/app/services/custom-songs/page.tsx`) to display the actual package prices instead of "Custom".

## Current Issue
The `pricingTiers` array in `/app/services/custom-songs/page.tsx` currently has:
- `price: "Custom"` for both "Basic Song" and "Premium Package"

## Required Changes

### Update Pricing Tiers Array

Replace the `pricingTiers` array (lines 27-51) with the following structure that matches the actual pricing:

```tsx
const pricingTiers = [
  {
    name: "Express Personal",
    price: "$49",
    description: "Fast delivery for urgent needs (24-48 hours)",
    features: [
      "Single custom song",
      "MP3 format",
      "1 revision round",
      "Priority processing",
    ],
  },
  {
    name: "Standard Occasion",
    price: "$29",
    description: "Perfect for personal occasions (3-5 days)",
    features: [
      "Single custom song",
      "MP3 + lyric sheet",
      "2 revision rounds",
      "Basic consultation",
    ],
  },
  {
    name: "Wedding Trio",
    price: "$149",
    description: "Complete wedding package (5-7 days)",
    features: [
      "3 custom songs",
      "MP3 + WAV formats",
      "3 revision rounds",
      "Extended consultation",
    ],
    highlighted: true,
  },
];
```

## Verification Steps

1. **Check the file:** `/app/services/custom-songs/page.tsx`
2. **Verify pricing matches:**
   - Standard: $29
   - Express: $49
   - Wedding: $149
3. **Ensure consistency:** Prices should match:
   - Order page (`/app/services/custom-songs/order/page.tsx`)
   - Terms page (`/app/services/custom-songs/terms/page.tsx`)
   - Analytics (`/lib/analytics.ts`)

## Expected Result

The ServicePricing component should display three pricing cards:
1. **Express Personal** - $49 (24-48 hours)
2. **Standard Occasion** - $29 (3-5 days)
3. **Wedding Trio** - $149 (5-7 days) - highlighted as "Most Popular"

All prices should be in AUD and match the pricing structure used throughout the site.

## Additional Notes

- Keep the `highlighted: true` property on the Wedding Trio package
- Ensure feature lists accurately reflect what's included in each package
- The pricing should align with the order form and terms page
- Format prices as strings with dollar sign: `"$29"`, `"$49"`, `"$149"`

