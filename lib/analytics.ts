// Google Analytics event tracking utility
// Used for tracking Custom Songs and other service conversions

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Custom Songs Event Types
export type CustomSongsEvent =
  | "view_custom_songs_page"
  | "view_custom_songs_order"
  | "start_order_form"
  | "select_package"
  | "submit_order"
  | "order_success"
  | "order_error";

// Package types for analytics
export type PackageType = "express" | "standard" | "wedding" | "test"; // TODO: REMOVE "test" AFTER PRODUCTION VERIFICATION

interface CustomSongsEventParams {
  event_category: "Custom Songs";
  event_label?: string;
  package_type?: PackageType;
  occasion_type?: string;
  value?: number;
}

/**
 * Track Custom Songs events in Google Analytics
 */
export function trackCustomSongsEvent(
  eventName: CustomSongsEvent,
  params?: Partial<CustomSongsEventParams>
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available:", eventName, params);
    return;
  }

  const eventParams: CustomSongsEventParams = {
    event_category: "Custom Songs",
    ...params,
  };

  window.gtag("event", eventName, eventParams);
}

/**
 * Track page views for Custom Songs pages
 */
export function trackCustomSongsPageView(pagePath: string, pageTitle: string): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });
}

/**
 * Track conversion events (for Google Ads/Analytics goals)
 */
export function trackConversion(
  conversionType: "custom_song_order" | "custom_song_inquiry",
  value?: number,
  currency: string = "AUD"
): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: "AW-CONVERSION_ID/CONVERSION_LABEL", // Replace with actual conversion ID
    value: value,
    currency: currency,
    transaction_id: `cs_${Date.now()}`,
  });

  // Also track as a GA4 event
  window.gtag("event", conversionType, {
    event_category: "Conversions",
    event_label: "Custom Songs",
    value: value,
    currency: currency,
  });
}

/**
 * Package price mapping for value tracking
 */
export const packagePrices: Record<PackageType, number> = {
  express: 49,
  standard: 29,
  wedding: 149,
  // TODO: REMOVE AFTER PRODUCTION VERIFICATION
  test: 1,
};

/**
 * Package name mapping for display
 */
export const packageNames: Record<PackageType, string> = {
  express: "Express Personal",
  standard: "Standard Occasion",
  wedding: "Wedding Trio",
  // TODO: REMOVE AFTER PRODUCTION VERIFICATION
  test: "LIVE SYSTEM TEST",
};

// ============================================================================
// GA4 E-commerce Tracking Functions
// ============================================================================

/**
 * Track begin_checkout event (when user lands on order page)
 */
export function trackBeginCheckout(items: Array<{
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}>): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: begin_checkout", items);
    return;
  }

  window.gtag("event", "begin_checkout", {
    currency: "AUD",
    value: items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    items: items,
  });
}

/**
 * Track add_payment_info event (when package is selected)
 */
export function trackAddPaymentInfo(
  packageType: PackageType,
  packagePrice: number
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: add_payment_info", { packageType, packagePrice });
    return;
  }

  window.gtag("event", "add_payment_info", {
    currency: "AUD",
    value: packagePrice,
    items: [
      {
        item_id: packageType,
        item_name: packageNames[packageType] || packageType,
        price: packagePrice,
        quantity: 1,
        item_category: "custom_songs",
      },
    ],
  });
}

/**
 * Track apply_promotion event (when discount code is applied)
 */
export function trackApplyPromotion(
  promotionId: string,
  promotionName: string,
  discountAmount: number
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: apply_promotion", {
      promotionId,
      promotionName,
      discountAmount,
    });
    return;
  }

  window.gtag("event", "apply_promotion", {
    currency: "AUD",
    promotion_id: promotionId,
    promotion_name: promotionName,
    value: discountAmount,
  });
}

/**
 * Track purchase event (on successful payment)
 */
export function trackPurchase(
  transactionId: string,
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity?: number;
  }>,
  totalValue: number,
  discount?: number,
  promotionId?: string
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: purchase", {
      transactionId,
      items,
      totalValue,
      discount,
    });
    return;
  }

  window.gtag("event", "purchase", {
    transaction_id: transactionId,
    currency: "AUD",
    value: totalValue,
    items: items,
    ...(discount && { discount: discount }),
    ...(promotionId && { promotion_id: promotionId }),
  });
}

// ============================================================================
// Booking Funnel Event Tracking
// ============================================================================

/**
 * Track booking_started event (when user views booking form)
 */
export function trackBookingStarted(): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: booking_started");
    return;
  }

  window.gtag("event", "booking_started", {
    event_category: "Booking",
    event_label: "Booking Form Viewed",
  });
}

/**
 * Track booking_completed event (when booking is submitted successfully)
 */
export function trackBookingCompleted(params: {
  service_type: string;
  date: string;
  time: string;
  booking_id: string;
  duration?: string;
  price?: number;
}): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: booking_completed", params);
    return;
  }

  window.gtag("event", "booking_completed", {
    event_category: "Booking",
    event_label: params.service_type,
    service_type: params.service_type,
    booking_date: params.date,
    booking_time: params.time,
    booking_id: params.booking_id,
    ...(params.duration && { duration: params.duration }),
    ...(params.price && { value: params.price, currency: "AUD" }),
  });
}

/**
 * Track payment_initiated event (when user enters payment details)
 * Note: Bookings don't currently require payment, but this is for future use
 */
export function trackPaymentInitiated(params: {
  service_type: string;
  amount: number;
  currency?: string;
  booking_id?: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: payment_initiated", params);
    return;
  }

  window.gtag("event", "payment_initiated", {
    event_category: "Payment",
    event_label: params.service_type,
    service_type: params.service_type,
    value: params.amount,
    currency: params.currency || "AUD",
    ...(params.booking_id && { booking_id: params.booking_id }),
  });
}

/**
 * Track payment_confirmed event (when Stripe confirms payment)
 * This is called from the Stripe webhook handler
 */
export function trackPaymentConfirmed(params: {
  transaction_id: string;
  amount: number;
  service_type: string;
  currency?: string;
  booking_id?: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: payment_confirmed", params);
    return;
  }

  window.gtag("event", "payment_confirmed", {
    event_category: "Payment",
    event_label: params.service_type,
    transaction_id: params.transaction_id,
    value: params.amount,
    currency: params.currency || "AUD",
    service_type: params.service_type,
    ...(params.booking_id && { booking_id: params.booking_id }),
  });
}

/**
 * Track booking_cancelled event (when user cancels booking)
 */
export function trackBookingCancelled(params: {
  booking_id: string;
  service_type?: string;
  reason?: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: booking_cancelled", params);
    return;
  }

  window.gtag("event", "booking_cancelled", {
    event_category: "Booking",
    event_label: params.service_type || "Unknown",
    booking_id: params.booking_id,
    ...(params.service_type && { service_type: params.service_type }),
    ...(params.reason && { cancellation_reason: params.reason }),
  });
}

/**
 * Track song_request_viewed event (when user views custom song page)
 */
export function trackSongRequestViewed(): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: song_request_viewed");
    return;
  }

  window.gtag("event", "song_request_viewed", {
    event_category: "Custom Songs",
    event_label: "Custom Song Page Viewed",
  });
}

/**
 * Track song_request_purchased event (when user purchases custom song)
 */
export function trackSongRequestPurchased(params: {
  order_id: string;
  package_type: PackageType;
  price: number;
  occasion?: string;
  currency?: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: song_request_purchased", params);
    return;
  }

  window.gtag("event", "song_request_purchased", {
    event_category: "Custom Songs",
    event_label: packageNames[params.package_type] || params.package_type,
    order_id: params.order_id,
    package_type: params.package_type,
    value: params.price,
    currency: params.currency || "AUD",
    ...(params.occasion && { occasion: params.occasion }),
  });
}

// ============================================================================
// Custom Event Tracking
// ============================================================================

/**
 * Track discount_code_applied event
 */
export function trackDiscountCodeApplied(code: string, discountAmount: number): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: discount_code_applied", { code, discountAmount });
    return;
  }

  window.gtag("event", "discount_code_applied", {
    event_category: "Custom Songs",
    event_label: code,
    value: discountAmount,
    currency: "AUD",
    promotion_id: code,
    promotion_name: code,
  });
}

/**
 * Track discount_code_failed event
 */
export function trackDiscountCodeFailed(code: string): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: discount_code_failed", { code });
    return;
  }

  window.gtag("event", "discount_code_failed", {
    event_category: "Custom Songs",
    event_label: code,
  });
}

/**
 * Track package_selected event
 */
export function trackPackageSelected(packageType: PackageType, packagePrice: number): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: package_selected", { packageType, packagePrice });
    return;
  }

  window.gtag("event", "package_selected", {
    event_category: "Custom Songs",
    event_label: packageNames[packageType] || packageType,
    value: packagePrice,
    currency: "AUD",
    package_type: packageType,
  });
}

/**
 * Track form_abandoned event (when user leaves mid-completion)
 */
export function trackFormAbandoned(
  step: string,
  fieldsCompleted: number,
  totalFields: number
): void {
  if (typeof window === "undefined" || !window.gtag) {
    console.log("[Analytics] GA not available: form_abandoned", {
      step,
      fieldsCompleted,
      totalFields,
    });
    return;
  }

  window.gtag("event", "form_abandoned", {
    event_category: "Custom Songs",
    event_label: step,
    value: Math.round((fieldsCompleted / totalFields) * 100),
    completion_percentage: Math.round((fieldsCompleted / totalFields) * 100),
  });
}
