import Stripe from "stripe";
import { getLogger } from "@/lib/logging";
import type { StripePaymentIntentMetadata } from "@/types/stripe";
import { formatToE164 } from "@/lib/phone";

const logger = getLogger("stripe.create-payment-with-sms");

/**
 * Parameters for creating a Payment Intent with SMS notification support
 */
export interface CreatePaymentIntentWithSMSParams {
  /**
   * Amount in cents (e.g., 9900 for $99.00)
   */
  amount: number;

  /**
   * Currency code (e.g., 'aud', 'usd')
   */
  currency: string;

  /**
   * Customer's mobile number in E.164 format (e.g., "+61456370719")
   */
  mobile_number: string;

  /**
   * Customer's name for personalized messages
   */
  customer_name: string;

  /**
   * Order reference ID (optional, will use payment intent ID if not provided)
   */
  order_id?: string;

  /**
   * Customer's email address (optional, for receipt emails)
   */
  customer_email?: string;

  /**
   * Additional metadata fields (optional)
   */
  additional_metadata?: Partial<StripePaymentIntentMetadata>;

  /**
   * Payment method configuration (optional)
   * Defaults to automatic_payment_methods: { enabled: true }
   */
  payment_method_options?: Stripe.PaymentIntentCreateParams.PaymentMethodOptions;

  /**
   * Description for the payment intent (optional)
   */
  description?: string;

  /**
   * Receipt email address (optional, defaults to customer_email)
   */
  receipt_email?: string;

  /**
   * Any other standard Stripe PaymentIntent parameters
   */
  [key: string]: unknown;
}

/**
 * Validates mobile number format (basic E.164 validation)
 * E.164 format: +[country code][number] (e.g., +61456370719)
 * 
 * @param mobileNumber - Mobile number to validate
 * @returns true if valid E.164 format, false otherwise
 */
function validateE164Format(mobileNumber: string): boolean {
  // Basic E.164 validation: must start with + and contain only digits after
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(mobileNumber);
}

/**
 * Creates a Stripe Payment Intent with SMS notification metadata
 * 
 * This helper function ensures all Payment Intents include the necessary
 * metadata fields for SMS notifications when payments succeed.
 * 
 * @param params - Payment intent parameters including SMS fields
 * @param stripe - Stripe instance (optional, will create if not provided)
 * @returns Created Stripe Payment Intent
 * 
 * @throws {Error} If mobile_number is invalid or Stripe API call fails
 * 
 * @example
 * ```ts
 * const paymentIntent = await createPaymentIntentWithSMS({
 *   amount: 9900,
 *   currency: 'aud',
 *   mobile_number: '+61456370719',
 *   customer_name: 'Alex Smith',
 *   order_id: 'ORD-123'
 * });
 * ```
 */
export async function createPaymentIntentWithSMS(
  params: CreatePaymentIntentWithSMSParams,
  stripeInstance?: Stripe
): Promise<Stripe.PaymentIntent> {
  // Validate required parameters
  if (!params.amount || params.amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  if (!params.currency) {
    throw new Error("Currency is required");
  }

  if (!params.mobile_number) {
    throw new Error("mobile_number is required for SMS notifications");
  }

  if (!params.customer_name) {
    throw new Error("customer_name is required");
  }

  // Validate and format mobile number
  let formattedMobileNumber: string;
  
  // First check if already in valid E.164 format
  if (validateE164Format(params.mobile_number)) {
    formattedMobileNumber = params.mobile_number;
  } else {
    // Try to format using AU-specific formatter (for Australian numbers)
    try {
      formattedMobileNumber = formatToE164(params.mobile_number);
      
      // Verify the formatted result is valid E.164
      if (!validateE164Format(formattedMobileNumber)) {
        throw new Error(`Invalid mobile number format: ${params.mobile_number}. Expected E.164 format (e.g., +61456370719)`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid mobile number format";
      logger.error("Failed to validate mobile number", {
        mobile_number: params.mobile_number,
        error: errorMessage,
      });
      throw new Error(`Invalid mobile number: ${errorMessage}. Expected E.164 format (e.g., +61456370719)`);
    }
  }

  // Get or create Stripe instance
  const stripe = stripeInstance || getStripeInstance();
  if (!stripe) {
    throw new Error("Stripe is not configured. STRIPE_SECRET_KEY environment variable is required.");
  }

  // Build metadata with SMS fields
  const metadata: StripePaymentIntentMetadata = {
    orderId: params.order_id,
    customerName: params.customer_name,
    customerEmail: params.customer_email,
    mobile_number: formattedMobileNumber,
    phone: formattedMobileNumber, // Also set phone for backward compatibility
    ...params.additional_metadata,
  };

  // Build Payment Intent parameters
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: metadata as Record<string, string>,
    automatic_payment_methods: { enabled: true },
    ...(params.description && { description: params.description }),
    ...(params.receipt_email && { receipt_email: params.receipt_email }),
    ...(params.customer_email && !params.receipt_email && { receipt_email: params.customer_email }),
    ...(params.payment_method_options && { payment_method_options: params.payment_method_options }),
  };

  // Remove undefined values and any custom params that shouldn't be passed to Stripe
  const {
    mobile_number: _mobileNumber,
    customer_name: _customerName,
    order_id: _orderId,
    customer_email: _customerEmail,
    additional_metadata: _additionalMetadata,
    ...stripeParams
  } = params;

  // Merge any additional Stripe parameters (excluding our custom ones)
  // Note: This allows passing additional Stripe PaymentIntent parameters dynamically
  const additionalParams = stripeParams as Record<string, unknown>;
  Object.keys(additionalParams).forEach((key) => {
    if (
      !["amount", "currency", "description", "receipt_email", "payment_method_options"].includes(key) &&
      additionalParams[key] !== undefined
    ) {
      // Type assertion needed for dynamic property assignment to Stripe params
      (paymentIntentParams as unknown as Record<string, unknown>)[key] = additionalParams[key];
    }
  });

  try {
    logger.info("Creating Payment Intent with SMS metadata", {
      amount: params.amount,
      currency: params.currency,
      order_id: params.order_id,
      customer_name: params.customer_name,
      mobile_number: formattedMobileNumber.substring(0, 4) + "***", // Log partial for privacy
    });

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    logger.info("Payment Intent created successfully", {
      payment_intent_id: paymentIntent.id,
      order_id: params.order_id,
      status: paymentIntent.status,
    });

    return paymentIntent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const stripeError = error as Stripe.errors.StripeError;

    logger.error("Failed to create Payment Intent", {
      amount: params.amount,
      currency: params.currency,
      order_id: params.order_id,
      error: errorMessage,
      stripe_error_type: stripeError?.type,
      stripe_error_code: stripeError?.code,
    });

    // Re-throw with more context
    throw new Error(`Failed to create Stripe Payment Intent: ${errorMessage}`);
  }
}

/**
 * Get or create Stripe instance
 * Uses environment variable STRIPE_SECRET_KEY
 */
function getStripeInstance(): Stripe | null {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    logger.error("STRIPE_SECRET_KEY is not set");
    return null;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
  });
}

