import { sendMobileMessage } from "./client";
import type { MobileMessageResponse } from "@/lib/sms";

/**
 * Payment Success SMS Notification
 * 
 * Sends SMS notification when a payment is successfully processed.
 */

export interface SendPaymentSuccessSMSParams {
  mobile_number: string;
  customer_name: string;
  amount: number; // Amount in cents
  currency: string;
  order_id: string;
  payment_id: string;
}

/**
 * Send payment success SMS notification
 * 
 * @param params - Payment details
 * @returns Mobile Message API response
 * 
 * @example
 * ```ts
 * await sendPaymentSuccessSMS({
 *   mobile_number: "+61456370719",
 *   customer_name: "Alex Smith",
 *   amount: 9900,
 *   currency: "aud",
 *   order_id: "ORD-123",
 *   payment_id: "pi_abc123"
 * });
 * ```
 */
export async function sendPaymentSuccessSMS(
  params: SendPaymentSuccessSMSParams
): Promise<MobileMessageResponse> {
  try {
    // Validate required parameters
    if (!params.mobile_number) {
      return {
        success: false,
        status: 400,
        error: "mobile_number is required",
      };
    }

    if (!params.customer_name) {
      return {
        success: false,
        status: 400,
        error: "customer_name is required",
      };
    }

    if (!params.amount || params.amount <= 0) {
      return {
        success: false,
        status: 400,
        error: "amount must be a positive number",
      };
    }

    if (!params.order_id) {
      return {
        success: false,
        status: 400,
        error: "order_id is required",
      };
    }

    if (!params.payment_id) {
      return {
        success: false,
        status: 400,
        error: "payment_id is required",
      };
    }

    // Format amount from cents to dollars (2 decimal places)
    const amountInDollars = (params.amount / 100).toFixed(2);
    
    // Format currency to uppercase
    const currencyUpper = params.currency.toUpperCase();

    // Build SMS message
    const message = `Hi ${params.customer_name}, your payment of $${amountInDollars} ${currencyUpper} was successful! Order Ref: ${params.order_id}. Payment ID: ${params.payment_id}`;

    // Send SMS via Mobile Message API
    const response = await sendMobileMessage({
      to: params.mobile_number,
      message: message,
      sender: "Rocky Web",
      customRef: params.payment_id,
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      status: 500,
      error: `Failed to send payment success SMS: ${errorMessage}`,
    };
  }
}

