import { NextRequest } from "next/server";
import Stripe from "stripe";
import {
  OrderEmailDetails,
  packagePrices,
  sendOrderConfirmationEmail,
  sendInternalNotificationEmail,
} from "@/lib/email/customSongs";
import { getLogger } from "@/lib/logging";
import { withApiHandler } from "@/lib/api/handlers";
import { ExternalServiceError, ValidationError } from "@/lib/errors";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const orderLogger = getLogger("custom-songs.order");

if (!stripeSecretKey) {
  orderLogger.error("STRIPE_SECRET_KEY is not set - payment processing will fail");
}

// Initialize Stripe instance with latest stable API version
// Note: Using '2025-11-17.clover' - verify this is correct for your Stripe account
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    })
  : null;

interface CustomSongOrderRequest {
  name: string;
  email: string;
  phone?: string;
  occasion: string;
  package: string;
  eventDate?: string;
  storyDetails: string;
  mood?: string;
  genre?: string;
  additionalInfo?: string;
  promoCode?: string;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CS-${timestamp}-${randomPart}`;
}

async function handlePost(request: NextRequest, requestId: string) {
  const body: CustomSongOrderRequest = await request.json();

  // Validate required fields
  if (!body.name || !body.email || !body.occasion || !body.package || !body.storyDetails) {
    throw new ValidationError("Missing required fields", {
      missingFields: [
        !body.name && "name",
        !body.email && "email",
        !body.occasion && "occasion",
        !body.package && "package",
        !body.storyDetails && "storyDetails",
      ].filter(Boolean),
    });
  }

  // Get package price
  const packageInfo = packagePrices[body.package];
  if (!packageInfo) {
    throw new ValidationError("Invalid package selected", {
      package: body.package,
      availablePackages: Object.keys(packagePrices),
    });
  }

    // Calculate price with discount if applicable
    const originalPriceInDollars = packageInfo.price;
    let finalAmountInDollars = originalPriceInDollars;
    let discountApplied = false;
    const promoCode = body.promoCode?.trim().toUpperCase() || "";
    
    if (promoCode === "LAUNCH20") {
      finalAmountInDollars = originalPriceInDollars * 0.8; // 20% discount
      discountApplied = true;
    }

    // Convert to cents for Stripe (prices are stored in dollars, convert to cents)
    const originalPriceInCents = Math.round(originalPriceInDollars * 100);
    const finalAmountInCents = Math.round(finalAmountInDollars * 100);

    // Generate order ID
    const orderId = generateOrderId();

  // Check if Stripe is configured
  if (!stripe) {
    orderLogger.error("Stripe is not configured - cannot process payment", {
      requestId,
      orderId,
    });
    throw new ExternalServiceError(
      "Payment processing is not configured",
      { requestId, orderId },
      false // Not retryable - configuration issue
    );
  }

  // Create Stripe PaymentIntent
  let paymentIntentId: string;
  let clientSecret: string;

  try {
    orderLogger.info("Creating Stripe PaymentIntent", {
      requestId,
      orderId,
      amount: finalAmountInCents,
      package: body.package,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountInCents,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId,
        customerName: body.name,
        customerEmail: body.email,
        phone: body.phone || "",
        package: body.package,
        occasion: body.occasion,
        eventDate: body.eventDate || "",
        storyDetails: body.storyDetails,
        mood: body.mood || "",
        genre: body.genre || "",
        additionalInfo: body.additionalInfo || "",
        promoCode: promoCode || "none",
        discountApplied: discountApplied.toString(),
        originalPrice: originalPriceInCents.toString(),
        finalPrice: finalAmountInCents.toString(),
      },
      description: `Custom Song - ${packageInfo.name} - ${body.occasion}`,
      receipt_email: body.email,
    });

    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret || "";

    if (!clientSecret) {
      throw new Error("PaymentIntent created but client_secret is missing");
    }

    orderLogger.info("Stripe PaymentIntent created successfully", {
      requestId,
      orderId,
      paymentIntentId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Stripe error";
    orderLogger.error("Failed to create Stripe PaymentIntent", {
      requestId,
      orderId,
      error: errorMessage,
    }, error);

    throw new ExternalServiceError(
      "Failed to create payment intent",
      {
        requestId,
        orderId,
        stripeError: errorMessage,
      },
      true // Retryable - transient Stripe API issue
    );
  }

  // Prepare email details
  const emailDetails: OrderEmailDetails = {
    orderId,
    customerName: body.name,
    email: body.email,
    phone: body.phone,
    occasion: body.occasion,
    packageType: body.package,
    eventDate: body.eventDate,
    storyDetails: body.storyDetails,
    mood: body.mood,
    genre: body.genre,
    additionalInfo: body.additionalInfo,
  };

  // Send confirmation emails (non-blocking - don't await to avoid blocking response)
  // Emails will be sent, but errors won't block the order creation
  Promise.all([
    sendOrderConfirmationEmail(emailDetails),
    sendInternalNotificationEmail(emailDetails),
  ]).catch((emailError) => {
    orderLogger.error("Failed to send order confirmation emails (non-blocking)", {
      requestId,
      orderId,
    }, emailError);
  });

  orderLogger.info("Custom song order created successfully", {
    requestId,
    orderId,
    paymentIntentId,
    package: body.package,
    amount: finalAmountInCents,
  });

  return {
    success: true,
    orderId,
    message: "Order received successfully",
    paymentIntentId,
    clientSecret,
    discountApplied,
    finalAmount: finalAmountInCents, // Return in cents as specified
    originalAmount: originalPriceInCents, // Return in cents
  };
}

export const POST = withApiHandler(handlePost);
