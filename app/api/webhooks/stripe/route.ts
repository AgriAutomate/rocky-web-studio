import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Stripe instance (matching the pattern from order route)
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

export async function POST(req: NextRequest) {
  // Early return if Stripe is not configured
  if (!stripe || !webhookSecret) {
    console.error('Stripe webhook secret or secret key is not configured');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  try {
    // 1. Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
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
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 3. Parse event and handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Extract metadata from paymentIntent
      const metadata = paymentIntent.metadata;
      const orderId = metadata.orderId;
      const customerName = metadata.customerName;
      const customerEmail = metadata.customerEmail;
      const packageType = metadata.package;
      const occasion = metadata.occasion;
      const promoCode = metadata.promoCode || 'none';
      const discountApplied = metadata.discountApplied === 'true';
      const originalPrice = metadata.originalPrice;
      const finalPrice = metadata.finalPrice;

      // Log order details
      console.log('✅ Payment succeeded - Processing order:', {
        orderId,
        customerName,
        customerEmail,
        package: packageType,
        occasion,
        promoCode,
        discountApplied,
        originalPrice: originalPrice ? `${(parseInt(originalPrice) / 100).toFixed(2)} AUD` : 'N/A',
        finalPrice: finalPrice ? `${(parseInt(finalPrice) / 100).toFixed(2)} AUD` : 'N/A',
        paymentIntentId: paymentIntent.id,
        amount: `${(paymentIntent.amount / 100).toFixed(2)} AUD`,
      });

      // TODO: Call sendEmail function here
      // Example: await sendOrderConfirmationEmail({ orderId, customerEmail, ... });

      // TODO: Store order in database
      // Example: await saveOrderToDatabase({ orderId, paymentIntentId: paymentIntent.id, ... });
    }

    // 4. Return success response for all webhook events
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    // Catch any unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing webhook:', errorMessage);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

