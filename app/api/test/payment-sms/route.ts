import { NextRequest, NextResponse } from "next/server";
import { sendPaymentSuccessSMS } from "@/lib/mobile-message/send-payment-sms";
import { getLogger } from "@/lib/logging";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";

const testPaymentSmsLogger = getLogger("test.payment-sms");

/**
 * Test endpoint for payment success SMS notifications
 * 
 * POST /api/test/payment-sms
 * Body: { mobile_number: string, customer_name: string, test_amount?: number }
 * 
 * ⚠️ WARNING: This sends real SMS messages. Use only in development/test environments.
 * Returns 404 in production.
 * 
 * Example:
 * curl -X POST http://localhost:3000/api/test/payment-sms \
 *   -H "Content-Type: application/json" \
 *   -d '{"mobile_number":"+61456370719","customer_name":"Alex Smith"}'
 */
export async function POST(request: NextRequest) {
  // Only allow in development/test environments
  const nodeEnv = process.env.NODE_ENV || "development";
  if (nodeEnv === "production") {
    testPaymentSmsLogger.warn("Payment SMS test endpoint accessed in production", {
      path: request.nextUrl.pathname,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Not found",
      },
      { status: 404 }
    );
  }

  // Check rate limit: 5 requests per minute per IP
  const rateLimitResponse = await checkRateLimit(request, {
    limit: 5,
    windowSeconds: 60, // 1 minute
    keyPrefix: "rate-limit:test-payment-sms",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { mobile_number, customer_name, test_amount } = body;

    // Validate required fields
    if (!mobile_number) {
      return NextResponse.json(
        {
          success: false,
          error: "mobile_number is required",
        },
        { status: 400 }
      );
    }

    if (!customer_name) {
      return NextResponse.json(
        {
          success: false,
          error: "customer_name is required",
        },
        { status: 400 }
      );
    }

    // Validate phone number format (basic E.164 check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(mobile_number.replace(/\s/g, ""))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid mobile_number format. Use E.164 format (e.g., +61456370719)",
        },
        { status: 400 }
      );
    }

    // Use default test amount if not provided (9900 cents = $99.00)
    const amount = test_amount || 9900;
    const orderId = `TEST-ORD-${Date.now()}`;
    const paymentId = `pi_test_${Date.now()}`;

    testPaymentSmsLogger.info("Sending test payment success SMS", {
      mobile_number: mobile_number.substring(0, 4) + "***",
      customer_name,
      amount,
      order_id: orderId,
      payment_id: paymentId,
    });

    // Call sendPaymentSuccessSMS with test data
    const result = await sendPaymentSuccessSMS({
      mobile_number,
      customer_name,
      amount,
      currency: "aud",
      order_id: orderId,
      payment_id: paymentId,
    });

    if (!result.success) {
      testPaymentSmsLogger.error("Test payment SMS failed", {
        mobile_number: mobile_number.substring(0, 4) + "***",
        customer_name,
        error: result.error,
        status: result.status,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send payment success SMS",
          status: result.status,
          test_data: {
            mobile_number: mobile_number.substring(0, 4) + "***",
            customer_name,
            amount,
            currency: "aud",
            order_id: orderId,
            payment_id: paymentId,
          },
        },
        { status: result.status || 500 }
      );
    }

    // Extract message ID from response if available
    const messageId =
      result.data?.messages?.[0]?.message_id || "unknown";

    testPaymentSmsLogger.info("Test payment SMS sent successfully", {
      mobile_number: mobile_number.substring(0, 4) + "***",
      customer_name,
      messageId,
      order_id: orderId,
      payment_id: paymentId,
    });

    return NextResponse.json({
      success: true,
      message: "Payment success SMS sent successfully",
      messageId,
      status: result.status,
      test_data: {
        mobile_number: mobile_number.substring(0, 4) + "***",
        customer_name,
        amount,
        currency: "aud",
        order_id: orderId,
        payment_id: paymentId,
      },
      api_response: result.data,
    });
  } catch (error) {
    testPaymentSmsLogger.error("Error sending test payment SMS", undefined, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
