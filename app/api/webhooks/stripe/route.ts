import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  sendOrderConfirmationEmail,
  sendInternalNotificationEmail,
  OrderEmailDetails,
} from "@/lib/email/customSongs";
import { getLogger } from "@/lib/logging";
import { kv } from "@vercel/kv";
import { ExternalServiceError } from "@/lib/errors";
import {
  trackPaymentConfirmedServer,
  trackSongRequestPurchasedServer,
} from "@/lib/analytics/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeLogger = getLogger("stripe.webhook");

if (!stripeSecretKey) {
  stripeLogger.error("STRIPE_SECRET_KEY is not set");
}

if (!webhookSecret) {
  stripeLogger.error("STRIPE_WEBHOOK_SECRET is not set");
}

// Initialize Stripe instance (matching the pattern from order route)
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

/**
 * Idempotency key for Stripe webhook events
 * Format: webhook:stripe:{eventId}
 * TTL: 7 days (Stripe retries for up to 3 days, but we keep longer for audit)
 */
const WEBHOOK_IDEMPOTENCY_KEY = (eventId: string) => `webhook:stripe:${eventId}`;
const WEBHOOK_IDEMPOTENCY_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Check if a webhook event has already been processed (idempotency check)
 * Uses atomic SET NX to prevent race conditions between concurrent webhook deliveries
 * 
 * @param eventId - Stripe event ID (unique per webhook delivery)
 * @returns true if event already processed, false if this is the first time
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    // First, check if key already exists (fast path)
    const existing = await kv.get(WEBHOOK_IDEMPOTENCY_KEY(eventId));
    if (existing) {
      return true; // Already processed
    }

    // Atomic SET with NX: only succeeds if key doesn't exist
    // This prevents race conditions where two webhook deliveries arrive simultaneously
    const acquired = await (kv as any).set(
      WEBHOOK_IDEMPOTENCY_KEY(eventId),
      {
        processedAt: new Date().toISOString(),
        eventId,
      },
      {
        nx: true, // Only set if key doesn't exist
        ex: WEBHOOK_IDEMPOTENCY_TTL, // Expire after 7 days
      }
    );

    // If SET NX returns "OK", we acquired the lock (first time processing)
    // If it returns null/undefined, key already exists (race condition - another request set it)
    // Redis SET NX returns "OK" on success, null on failure (key exists)
    if (acquired === "OK" || acquired === true) {
      return false; // First time processing
    }

    // Key was set by another concurrent request
    return true;
  } catch (error) {
    // If KV is down or SET fails, log error and assume not processed
    // This allows webhook to proceed, but we'll catch KV failures later
    stripeLogger.error("Failed to check webhook idempotency", { eventId }, error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Early return if Stripe is not configured
  if (!stripe || !webhookSecret) {
    stripeLogger.error("Stripe webhook secret or secret key is not configured");
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  try {
    // 1. Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      stripeLogger.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      stripeLogger.error("Webhook signature verification failed", undefined, error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 3. Idempotency check: ensure we don't process the same event twice
    // Stripe may retry webhooks on network failures, so we use event.id as idempotency key
    const eventId = event.id;
    const alreadyProcessed = await isEventProcessed(eventId);

    if (alreadyProcessed) {
      stripeLogger.info("Webhook event already processed, skipping", {
        eventId,
        eventType: event.type,
      });
      // Return 200 immediately - Stripe considers this success and won't retry
      return NextResponse.json({ received: true, idempotent: true }, { status: 200 });
    }

    stripeLogger.info("Processing new webhook event", {
      eventId,
      eventType: event.type,
    });

    // 4. Process payment_intent.succeeded events
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      // Validate required metadata fields
      // If metadata is invalid, return 200 to prevent Stripe retries (customer issue, not transient)
      if (
        !metadata.orderId ||
        !metadata.customerName ||
        !metadata.customerEmail ||
        !metadata.occasion ||
        !metadata.package ||
        !metadata.storyDetails
      ) {
        stripeLogger.warn("Missing required metadata in payment intent - returning 200 to prevent retry", {
          eventId,
          orderId: metadata.orderId,
          customerName: metadata.customerName,
          customerEmail: metadata.customerEmail,
          occasion: metadata.occasion,
          package: metadata.package,
          paymentIntentId: paymentIntent.id,
        });
        // Return 200 - this is a permanent issue (invalid customer data), not transient
        // Stripe won't retry, and we've already marked event as processed
        return NextResponse.json({ received: true, skipped: "invalid_metadata" }, { status: 200 });
      }

      // Log the payment success
      stripeLogger.info("Payment succeeded - processing order", {
        eventId,
        orderId: metadata.orderId,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        package: metadata.package,
        occasion: metadata.occasion,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      // Track payment_confirmed and song_request_purchased events (server-side)
      await Promise.all([
        trackPaymentConfirmedServer({
          transaction_id: paymentIntent.id,
          amount: paymentIntent.amount,
          service_type: "custom_song",
          currency: paymentIntent.currency || "AUD",
          order_id: metadata.orderId,
        }),
        trackSongRequestPurchasedServer({
          order_id: metadata.orderId,
          package_type: metadata.package,
          price: paymentIntent.amount,
          occasion: metadata.occasion,
          currency: paymentIntent.currency || "AUD",
        }),
      ]);

      // Build email details from metadata
      const emailDetails: OrderEmailDetails = {
        orderId: metadata.orderId,
        customerName: metadata.customerName,
        email: metadata.customerEmail,
        phone: metadata.phone || undefined,
        occasion: metadata.occasion,
        packageType: metadata.package,
        eventDate: metadata.eventDate || undefined,
        storyDetails: metadata.storyDetails,
        mood: metadata.mood || undefined,
        genre: metadata.genre || undefined,
        additionalInfo: metadata.additionalInfo || undefined,
      };

      // Send confirmation emails (await to catch errors)
      // If email fails, we throw and return 503 - Stripe will retry
      // This ensures emails are eventually sent on retry
      try {
        await Promise.all([
          sendOrderConfirmationEmail(emailDetails),
          sendInternalNotificationEmail(emailDetails),
        ]);

        stripeLogger.info("Email notifications sent successfully", {
          eventId,
          orderId: metadata.orderId,
        });
      } catch (emailError) {
        // Email send failed - log and rethrow to trigger 503
        // Stripe will retry the webhook, and emails will be sent on retry
        stripeLogger.error("Failed to send email notifications", {
          eventId,
          orderId: metadata.orderId,
        }, emailError);
        throw new ExternalServiceError(
          "Failed to send order confirmation emails",
          { eventId, orderId: metadata.orderId },
          true // retryable
        );
      }
    }

    // 5. Return success response for all webhook events
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Handle known error types
    if (error instanceof ExternalServiceError) {
      stripeLogger.error("External service error in webhook", {
        code: error.code,
        retryable: error.retryable,
      }, error);
      // Return 503 (Service Unavailable) for transient failures
      // Stripe will retry webhooks that return 5xx status codes
      return NextResponse.json(
        { error: 'Service temporarily unavailable', retryable: true },
        { status: 503 }
      );
    }

    // Catch any unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    stripeLogger.error("Unexpected error processing webhook", { errorMessage }, error);
    // Return 500 for unexpected errors - Stripe will retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}


