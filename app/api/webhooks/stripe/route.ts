import { NextRequest } from "next/server";
import Stripe from "stripe";
import {
  sendOrderConfirmationEmail,
  sendInternalNotificationEmail,
  OrderEmailDetails,
} from "@/lib/email/customSongs";
import { sendPaymentSuccessSMS } from "@/lib/mobile-message/send-payment-sms";
import { getLogger } from "@/lib/logging";
import { kv } from "@vercel/kv";
import { ExternalServiceError, ValidationError } from "@/lib/errors";
import { withApiHandler } from "@/lib/api/handlers";
import {
  trackPaymentConfirmedServer,
  trackSongRequestPurchasedServer,
} from "@/lib/analytics/server";
import type { StripePaymentIntentMetadata } from "@/types/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { SongOrderInsert } from "@/types/supabase";

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

async function handlePost(req: NextRequest, requestId: string) {
  // Early validation: Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    stripeLogger.error("Stripe webhook secret or secret key is not configured", { requestId });
    throw new ExternalServiceError(
      "Webhook configuration error",
      { requestId },
      false // Not retryable - configuration issue
    );
  }

  // 1. Get raw body and signature
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    stripeLogger.error("Missing stripe-signature header", { requestId });
    throw new ValidationError("Missing stripe-signature header", { requestId });
  }

  // 2. Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    stripeLogger.error("Webhook signature verification failed", { requestId }, error);
    throw new ValidationError("Invalid webhook signature", { requestId });
  }

  // 3. Idempotency check: ensure we don't process the same event twice
  // Stripe may retry webhooks on network failures, so we use event.id as idempotency key
  const eventId = event.id;
  const alreadyProcessed = await isEventProcessed(eventId);

  if (alreadyProcessed) {
    stripeLogger.info("Webhook event already processed, skipping", {
      requestId,
      eventId,
      eventType: event.type,
    });
    // Return success immediately - Stripe considers this success and won't retry
    return { received: true, idempotent: true };
  }

  stripeLogger.info("Processing new webhook event", {
    requestId,
    eventId,
    eventType: event.type,
  });

  // 4. Process payment_intent.succeeded events
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata as StripePaymentIntentMetadata;

    // Validate required metadata fields
    // If metadata is invalid, log warning and return success (permanent issue, not transient)
    // Stripe won't retry, and we've already marked event as processed
    if (
      !metadata.orderId ||
      !metadata.customerName ||
      !metadata.customerEmail ||
      !metadata.occasion ||
      !metadata.package ||
      !metadata.storyDetails
    ) {
      stripeLogger.warn("Missing required metadata in payment intent - skipping processing", {
        requestId,
        eventId,
        orderId: metadata.orderId,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        occasion: metadata.occasion,
        package: metadata.package,
        paymentIntentId: paymentIntent.id,
      });
      // Return success - this is a permanent issue (invalid customer data), not transient
      // Stripe won't retry, and we've already marked event as processed
      return { received: true, skipped: "invalid_metadata" };
    }

    // Log the payment success
    stripeLogger.info("Payment succeeded - processing order", {
      requestId,
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
    // These are non-blocking - fire and forget
    Promise.all([
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
    ]).catch((analyticsError) => {
      stripeLogger.error("Failed to track analytics events (non-blocking)", {
        requestId,
        eventId,
        orderId: metadata.orderId,
      }, analyticsError);
    });

    // Save order to Supabase database
    try {
      const supabase = createServerSupabaseClient(true); // Use service role for bypass RLS

      // Store additional metadata in notes as JSON
      const additionalMetadata = {
        occasion: metadata.occasion,
        mood: metadata.mood,
        genre: metadata.genre,
        eventDate: metadata.eventDate,
        additionalInfo: metadata.additionalInfo,
      };
      const notesContent = [
        metadata.additionalInfo,
        JSON.stringify(additionalMetadata),
      ].filter(Boolean).join('\n\n---\n\n');

      const orderData: SongOrderInsert = {
        order_id: metadata.orderId,
        stripe_payment_id: paymentIntent.id,
        customer_name: metadata.customerName,
        customer_email: metadata.customerEmail,
        customer_phone: metadata.phone || null,
        song_brief: metadata.storyDetails,
        package_type: metadata.package,
        status: 'PENDING',
        notes: notesContent || null,
      };

      const { data: insertedOrder, error: dbError } = await supabase
        .from('song_orders')
        .insert([orderData] as any)
        .select()
        .single() as { data: { id: string } | null; error: any };

      if (dbError) {
        stripeLogger.error("Failed to save order to Supabase", {
          requestId,
          eventId,
          orderId: metadata.orderId,
          paymentIntentId: paymentIntent.id,
          error: dbError.message,
          errorCode: dbError.code,
          errorDetails: dbError.details,
        });
        // Don't throw - continue processing webhook even if DB save fails
        // The order is still paid, we just need to handle it manually
      } else if (insertedOrder) {
        stripeLogger.info("Order saved to Supabase successfully", {
          requestId,
          eventId,
          orderId: metadata.orderId,
          paymentIntentId: paymentIntent.id,
          databaseId: insertedOrder.id,
        });
      }
    } catch (supabaseError) {
      const error = supabaseError instanceof Error ? supabaseError : new Error("Unknown Supabase error");
      stripeLogger.error("Exception while saving order to Supabase", {
        requestId,
        eventId,
        orderId: metadata.orderId,
        paymentIntentId: paymentIntent.id,
        error: error.message,
      }, error);
      // Don't throw - continue processing webhook
    }

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

    // Send confirmation emails (NON-BLOCKING - fire and forget)
    // This ensures we return 200 OK immediately to Stripe
    // Errors are logged but don't block the webhook response
    Promise.all([
      sendOrderConfirmationEmail(emailDetails),
      sendInternalNotificationEmail(emailDetails),
    ]).then(() => {
      stripeLogger.info("Email notifications sent successfully", {
        requestId,
        eventId,
        orderId: metadata.orderId,
      });
    }).catch((emailError) => {
      // Email send failed - log error but don't block response
      // Note: This means emails may not be sent if they fail
      // Consider implementing a retry queue for failed emails
      stripeLogger.error("Failed to send email notifications (non-blocking)", {
        requestId,
        eventId,
        orderId: metadata.orderId,
      }, emailError);
    });

    // Send SMS notification (NON-BLOCKING - fire and forget)
    // Check if mobile_number exists in metadata (also check 'phone' as fallback)
    const mobileNumber = metadata.mobile_number || metadata.phone;
    if (mobileNumber) {
      try {
        const smsResult = await sendPaymentSuccessSMS({
          mobile_number: mobileNumber,
          customer_name: metadata.customerName || "Customer",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency || "AUD",
          order_id: metadata.orderId || paymentIntent.id,
          payment_id: paymentIntent.id,
        });

        if (smsResult.success) {
          console.log("SMS notification sent:", smsResult);
          stripeLogger.info("SMS notification sent successfully", {
            requestId,
            eventId,
            orderId: metadata.orderId,
            paymentIntentId: paymentIntent.id,
          });
        } else {
          console.error("SMS notification failed:", smsResult.error);
          stripeLogger.error("SMS notification failed", {
            requestId,
            eventId,
            orderId: metadata.orderId,
            paymentIntentId: paymentIntent.id,
            error: smsResult.error,
            status: smsResult.status,
          });
        }
      } catch (smsError) {
        // SMS send failed - log error but don't block response
        // Webhook processing continues normally even if SMS fails
        console.error("SMS notification failed:", smsError);
        stripeLogger.error("Failed to send SMS notification (non-blocking)", {
          requestId,
          eventId,
          orderId: metadata.orderId,
          paymentIntentId: paymentIntent.id,
        }, smsError);
      }
    }
  }

  // Return success response for all webhook events
  return { received: true };
}

// Note: Webhooks have special response requirements for Stripe
// We use withApiHandler for consistent error handling, but webhooks
// need to return 200 OK quickly, so emails are non-blocking
export const POST = withApiHandler(handlePost);


