# Email Templates Documentation

This document describes the redesigned email templates for Rocky Web Studio, including branding, responsive design, and best practices.

## Overview

All email templates use:
- **Brand Colors:** Teal (#218081), Cream (#fcfcf9)
- **Mobile-First Design:** Responsive layouts that work on all devices
- **Clear CTAs:** Prominent call-to-action buttons
- **Professional Footer:** Contact info, social links, unsubscribe option

---

## Template Components

### Shared Components

Located in `lib/email-templates/components/`:

1. **EmailLayout** - Base layout with header, content area, and footer
2. **Button** - Styled CTA buttons (primary/secondary variants)
3. **DetailsBox** - Styled information boxes with brand colors

### Templates

1. **CustomerOrderConfirmation** - Order confirmation for customers
2. **AdminOrderNotification** - Internal notification for new orders
3. **BookingConfirmation** - Booking confirmation for appointments

---

## Brand Colors

```typescript
const BRAND_TEAL = "#218081";    // Primary brand color
const BRAND_CREAM = "#fcfcf9";   // Background color
```

**Usage:**
- Teal: Headers, links, buttons, accents
- Cream: Background, info boxes
- White: Main content area

---

## Template Details

### 1. CustomerOrderConfirmation

**Purpose:** Confirms custom song order to customer

**Features:**
- Hero section with confirmation message
- Order details box with all order information
- CTA button: "View Order Details"
- Next steps section
- Payment confirmation
- Contact information

**Props:**
```typescript
interface CustomerOrderConfirmationProps {
  orderId: string;
  customerName: string;
  packageName: string;
  packagePrice: number;
  occasion: string;
  turnaround: string;
  eventDate?: string;
  originalPrice?: number;
  finalPrice: number;
  discountApplied: boolean;
  promoCode?: string;
  paymentIntentId: string;
}
```

### 2. AdminOrderNotification

**Purpose:** Notifies admin team of new order

**Features:**
- Alert banner with order ID
- Customer information section
- Order details with pricing
- Customer's story section
- Payment information
- CTA button: "View Order in Dashboard"
- Action required section

**Props:**
```typescript
interface AdminOrderNotificationProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageName: string;
  packagePrice: number;
  occasion: string;
  turnaround: string;
  eventDate?: string;
  storyDetails: string;
  mood?: string;
  genre?: string;
  additionalInfo?: string;
  originalPrice?: number;
  finalPrice: number;
  discountApplied: boolean;
  promoCode?: string;
  paymentIntentId: string;
  amountPaid: number;
}
```

### 3. BookingConfirmation

**Purpose:** Confirms booking appointment

**Features:**
- Hero section with confirmation message
- Booking details box
- CTA buttons: "View Booking Details" and "Cancel Booking"
- Location & contact information
- What to expect section

**Props:**
```typescript
interface BookingConfirmationProps {
  bookingId: string;
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
}
```

---

## Responsive Design

### Mobile-First Approach

All templates are designed mobile-first with:
- **Max Width:** 600px (standard email width)
- **Padding:** 24px on mobile, 32px on desktop
- **Font Sizes:** 14-16px base, larger for headings
- **Button Sizes:** Minimum 44x44px touch targets
- **Table Layouts:** Stack on mobile, side-by-side on desktop

### Email Client Compatibility

Tested and optimized for:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail (iOS, macOS)
- ✅ Yahoo Mail
- ✅ Mobile email clients

---

## Footer

All templates include a consistent footer with:

1. **Brand Name:** Rocky Web Studio
2. **Tagline:** Bold web experiences for ambitious teams
3. **Contact Info:**
   - Email: hello@rockywebstudio.com.au
   - Phone: +61 400 000 000
4. **Social Links:**
   - Website
   - Facebook
   - Instagram
5. **Unsubscribe Link:** (for customer emails only)
6. **Copyright:** © {year} Rocky Web Studio

---

## Logo

**Current Status:** Placeholder text logo

**To Add Logo:**
1. Add logo file to `public/logo.png`
2. Update `EmailLayout` component:
   ```tsx
   const logoUrl = `${baseUrl}/logo.png`;
   ```
3. Logo will automatically display in header

**Logo Specifications:**
- Format: PNG with transparent background
- Size: 180px width (height auto)
- Max file size: 50KB

---

## Testing

### Preview in Resend Dashboard

1. Go to Resend Dashboard → Emails → Templates
2. Upload template HTML
3. Preview on desktop, mobile, dark mode

### Test Endpoint

**Endpoint:** `GET /api/test/email-preview?template=customer-order`

**Available Templates:**
- `customer-order` - CustomerOrderConfirmation
- `admin-order` - AdminOrderNotification
- `booking` - BookingConfirmation

**Usage:**
```bash
curl http://localhost:3000/api/test/email-preview?template=customer-order
```

### Manual Testing

1. **Desktop:** Test in Gmail, Outlook, Apple Mail
2. **Mobile:** Test on iOS Mail, Gmail app, Outlook app
3. **Dark Mode:** Verify colors and contrast
4. **Links:** Verify all links are clickable and secure (HTTPS)
5. **Images:** Verify logo displays correctly (if added)

---

## Best Practices

### 1. Keep Content Scannable

- Use headings and sections
- Keep paragraphs short (2-3 sentences)
- Use bullet points for lists
- Highlight important information

### 2. Clear CTAs

- One primary CTA per email
- Button text should be action-oriented
- Use contrasting colors (teal on white)
- Minimum 44x44px touch target

### 3. Mobile Optimization

- Test on real devices
- Use responsive tables
- Ensure text is readable (minimum 14px)
- Keep buttons large enough to tap

### 4. Accessibility

- Use semantic HTML
- Provide alt text for images
- Ensure color contrast (WCAG AA)
- Use descriptive link text

### 5. Security

- All links use HTTPS
- No inline JavaScript
- No external scripts
- Sanitize user input

---

## Troubleshooting

### Images Not Displaying

**Symptoms:** Logo or images don't appear

**Solutions:**
1. Verify image URL is absolute (https://...)
2. Check image file exists in `public/` directory
3. Verify image file size < 50KB
4. Test image URL in browser

### Layout Broken in Outlook

**Symptoms:** Layout looks broken in Outlook

**Solutions:**
1. Use tables for layout (not flexbox)
2. Avoid CSS Grid
3. Use inline styles where possible
4. Test in Outlook 2016/2019

### Links Not Clickable

**Symptoms:** Links don't work

**Solutions:**
1. Verify links use `https://`
2. Check link URLs are correct
3. Ensure links are not blocked by email client
4. Test links in multiple email clients

### Dark Mode Issues

**Symptoms:** Text not visible in dark mode

**Solutions:**
1. Use explicit background colors
2. Avoid transparent backgrounds
3. Test in dark mode email clients
4. Use high contrast colors

---

## A/B Testing (Optional)

### Setup

1. Create variant templates (e.g., `CustomerOrderConfirmationV2`)
2. Randomly assign users to variants
3. Track open/click rates in analytics
4. Adopt winner after statistical significance

### Metrics to Track

- **Open Rate:** % of emails opened
- **Click Rate:** % of emails with clicks
- **CTA Click Rate:** % clicking primary CTA
- **Unsubscribe Rate:** % unsubscribing

### Tools

- Resend Analytics
- Google Analytics (UTM parameters)
- Custom tracking pixels (if needed)

---

## Future Enhancements

1. **Logo Integration:** Add actual logo file
2. **Personalization:** Dynamic content based on user
3. **Localization:** Multi-language support
4. **Rich Media:** Add images, videos (if needed)
5. **Interactive Elements:** AMP for Email (if supported)

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

