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
export type PackageType = "express" | "standard" | "wedding";

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
};
