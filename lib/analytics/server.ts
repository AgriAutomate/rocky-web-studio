/**
 * Server-side Google Analytics 4 tracking using Measurement Protocol API
 * 
 * For tracking events from API routes, webhooks, and server-side code.
 * Requires GA4 Measurement Protocol API Secret.
 */

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

/**
 * Track event using GA4 Measurement Protocol
 * 
 * @param eventName - Event name (e.g., "payment_confirmed")
 * @param params - Event parameters
 */
export async function trackServerEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): Promise<void> {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    // Silently fail if GA4 not configured (server-side tracking is optional)
    return;
  }

  try {
    const clientId = `server_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const payload = {
      client_id: clientId,
      events: [
        {
          name: eventName,
          params: {
            ...params,
            // Add timestamp
            timestamp_micros: Date.now() * 1000,
          },
        },
      ],
    };

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error(`[Analytics] Server event tracking failed: ${eventName}`, {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (error) {
    // Silently fail - don't break webhook processing if analytics fails
    console.error(`[Analytics] Server event tracking error: ${eventName}`, error);
  }
}

/**
 * Track payment_confirmed event from server-side (e.g., Stripe webhook)
 */
export async function trackPaymentConfirmedServer(params: {
  transaction_id: string;
  amount: number;
  service_type: string;
  currency?: string;
  booking_id?: string;
  order_id?: string;
}): Promise<void> {
  await trackServerEvent("payment_confirmed", {
    transaction_id: params.transaction_id,
    value: params.amount,
    currency: params.currency || "AUD",
    service_type: params.service_type,
    ...(params.booking_id && { booking_id: params.booking_id }),
    ...(params.order_id && { order_id: params.order_id }),
  });
}

/**
 * Track song_request_purchased event from server-side (e.g., Stripe webhook)
 */
export async function trackSongRequestPurchasedServer(params: {
  order_id: string;
  package_type: string;
  price: number;
  occasion?: string;
  currency?: string;
}): Promise<void> {
  await trackServerEvent("song_request_purchased", {
    order_id: params.order_id,
    package_type: params.package_type,
    value: params.price,
    currency: params.currency || "AUD",
    ...(params.occasion && { occasion: params.occasion }),
  });
}

