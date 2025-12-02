import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  sendOrderConfirmationEmail,
  sendInternalNotificationEmail,
  OrderEmailDetails,
} from '@/lib/email/customSongs';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set');
}

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set');
}

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

      const metadata = paymentIntent.metadata;

      // Validate required metadata fields
      if (!metadata.orderId || !metadata.customerName || !metadata.customerEmail || !metadata.occasion || !metadata.package || !metadata.storyDetails) {
        console.error('Missing required metadata in payment intent:', {
          orderId: metadata.orderId,
          customerName: metadata.customerName,
          customerEmail: metadata.customerEmail,
          occasion: metadata.occasion,
          package: metadata.package,
          storyDetails: metadata.storyDetails,
        });
        // Still return success to Stripe to avoid retries
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Log the payment success
      console.log('✅ Payment succeeded - Processing order:', {
        orderId: metadata.orderId,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        package: metadata.package,
        occasion: metadata.occasion,
        paymentIntentId: paymentIntent.id,
        amount: `${(paymentIntent.amount / 100).toFixed(2)} AUD`,
      });

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

      // Send confirmation emails (non-blocking - don't await)
      sendOrderConfirmationEmail(emailDetails).catch(err =>
        console.error('Failed to send order confirmation:', err)
      );
      sendInternalNotificationEmail(emailDetails).catch(err =>
        console.error('Failed to send internal notification:', err)
      );

      console.log('✅ Email notifications triggered for order:', metadata.orderId);
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


