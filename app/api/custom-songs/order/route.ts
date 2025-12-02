import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  OrderEmailDetails,
  packagePrices,
  sendOrderConfirmationEmail,
  sendInternalNotificationEmail,
} from "@/lib/email/customSongs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set');
}

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

export async function POST(request: NextRequest) {
  try {
    const body: CustomSongOrderRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.occasion || !body.package || !body.storyDetails) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get package price
    const packageInfo = packagePrices[body.package];
    if (!packageInfo) {
      return NextResponse.json(
        { success: false, error: "Invalid package selected" },
        { status: 400 }
      );
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

    // Create Stripe PaymentIntent if Stripe is configured
    let paymentIntentId: string | null = null;
    let clientSecret: string | null = null;
    let stripeError: Error | null = null;

    if (stripe) {
      try {
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
        clientSecret = paymentIntent.client_secret;
      } catch (error) {
        stripeError = error instanceof Error ? error : new Error("Unknown Stripe error");
        console.error("Error creating Stripe PaymentIntent:", stripeError);
        // Return error if Stripe fails (don't continue without payment)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create payment intent",
            details: stripeError.message,
          },
          { status: 500 }
        );
      }
    } else {
      // If Stripe is not configured, return error
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing is not configured",
        },
        { status: 500 }
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

    // Send confirmation emails (non-blocking)
    sendOrderConfirmationEmail(emailDetails);
    sendInternalNotificationEmail(emailDetails);

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order received successfully",
      paymentIntentId,
      clientSecret,
      discountApplied,
      finalAmount: finalAmountInCents, // Return in cents as specified
      originalAmount: originalPriceInCents, // Return in cents
    });
  } catch (error) {
    console.error("Error processing custom song order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process order" },
      { status: 500 }
    );
  }
}
