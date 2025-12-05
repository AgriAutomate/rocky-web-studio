/**
 * Stripe Payment Intent Metadata
 * 
 * Type definition for metadata stored on Stripe PaymentIntent objects.
 * This metadata is used for order processing, email notifications, and SMS notifications.
 */
export interface StripePaymentIntentMetadata {
  /**
   * Order reference ID for tracking
   */
  orderId?: string;

  /**
   * Customer's name for personalized messages
   */
  customerName?: string;

  /**
   * Customer's email address for order confirmations
   */
  customerEmail?: string;

  /**
   * Customer's phone number (legacy field, may be in various formats)
   */
  phone?: string;

  /**
   * Customer's mobile number for SMS notifications
   * Format: E.164 (e.g., "+61456370719")
   */
  mobile_number?: string;

  /**
   * Package/plan type selected by customer
   */
  package?: string;

  /**
   * Occasion type (e.g., "Birthday", "Anniversary")
   */
  occasion?: string;

  /**
   * Event date (if applicable)
   */
  eventDate?: string;

  /**
   * Story details provided by customer
   */
  storyDetails?: string;

  /**
   * Mood preference for the song
   */
  mood?: string;

  /**
   * Genre preference for the song
   */
  genre?: string;

  /**
   * Additional information provided by customer
   */
  additionalInfo?: string;

  /**
   * Promo code used (or "none" if no code)
   */
  promoCode?: string;

  /**
   * Whether a discount was applied (as string: "true" or "false")
   */
  discountApplied?: string;

  /**
   * Original price before discount (in cents, as string)
   */
  originalPrice?: string;

  /**
   * Final price after discount (in cents, as string)
   */
  finalPrice?: string;
}

import type Stripe from "stripe";

/**
 * Extended Stripe PaymentIntent type with typed metadata
 */
export interface TypedStripePaymentIntent extends Omit<Stripe.PaymentIntent, 'metadata'> {
  metadata: StripePaymentIntentMetadata;
}

