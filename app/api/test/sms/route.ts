import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";
import { sendPaymentSuccessSMS } from "@/lib/mobile-message/send-payment-sms";
import { getLogger } from "@/lib/logging";
import { validateMessageLength } from "@/lib/sms/messages";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";

const testSmsLogger = getLogger("test.sms");

/**
 * Test endpoint to send real SMS for verification
 * 
 * POST /api/test/sms
 * 
 * For general SMS testing:
 * Body: { to: string, message?: string, template?: "confirmation" | "reminder" | "admin" }
 * 
 * For payment success SMS testing:
 * Body: { mobile_number: string, customer_name: string, test_amount?: number }
 * 
 * ⚠️ WARNING: This sends real SMS messages. Use only with test phone numbers.
 * Payment SMS test only works in development/test environments (returns 404 in production).
 */
export async function POST(request: NextRequest) {
  // Check rate limit: 5 per minute per IP
  const rateLimitResponse = await checkRateLimit(request, {
    limit: 5,
    windowSeconds: 60, // 1 minute
    keyPrefix: "rate-limit:test-sms",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    // Check if this is a payment SMS test request
    if (body.mobile_number && body.customer_name) {
      return handlePaymentSMSTest(request, body);
    }
    
    // Otherwise, handle as general SMS test
    return handleGeneralSMSTest(request, body);
  } catch (error) {
    testSmsLogger.error("Error in test SMS endpoint", undefined, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payment success SMS test
 */
async function handlePaymentSMSTest(
  request: NextRequest,
  body: { mobile_number: string; customer_name: string; test_amount?: number }
): Promise<NextResponse> {
  // Only allow in development/test environments
  const nodeEnv = process.env.NODE_ENV || "development";
  if (nodeEnv === "production") {
    testSmsLogger.warn("Payment SMS test endpoint accessed in production", {
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

  testSmsLogger.info("Sending test payment success SMS", {
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
    testSmsLogger.error("Test payment SMS failed", {
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
  const messageId = result.data?.messages?.[0]?.message_id || "unknown";

  testSmsLogger.info("Test payment SMS sent successfully", {
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
}

/**
 * Handle general SMS test (existing functionality)
 */
async function handleGeneralSMSTest(
  _request: NextRequest,
  body: { to?: string; message?: string; template?: "confirmation" | "reminder" | "admin" }
): Promise<NextResponse> {
  try {
    const { to, message, template } = body;

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number (to) is required",
        },
        { status: 400 }
      );
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ""))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format. Use E.164 format (e.g., +61400000000)",
        },
        { status: 400 }
      );
    }

    let finalMessage: string;

    if (message) {
      // Use custom message
      finalMessage = message;
    } else if (template) {
      // Use template
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = `${now.getHours().toString().padStart(2, "0")}:00`;
      const bookingId = `TEST-${Date.now()}`;

      switch (template) {
        case "confirmation":
          finalMessage = `Hi Test! Your booking confirmed: ${date} ${time}. ID: ${bookingId}. Reply CANCEL to cancel. - Rocky Web Studio`;
          break;
        case "reminder":
          finalMessage = `Reminder: Your booking is tomorrow at ${time}. See you then! - Rocky Web Studio`;
          break;
        case "admin":
          finalMessage = `Test Customer booked Website Consultation on ${date}. Reply to respond. - Rocky Web Studio`;
          break;
        default:
          return NextResponse.json(
            {
              success: false,
              error: "Invalid template. Use: confirmation, reminder, or admin",
            },
            { status: 400 }
          );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either message or template is required",
        },
        { status: 400 }
      );
    }

    // Validate message length
    const validation = validateMessageLength(finalMessage);
    
    testSmsLogger.info("Sending test SMS", {
      to: to.substring(0, 4) + "***",
      template: template || "custom",
      length: validation.length,
      parts: validation.parts,
      warning: validation.warning,
    });

    // Send SMS
    const result = await sendSMS(to, finalMessage, `test-${Date.now()}`);

    if (!result.success) {
      testSmsLogger.error("Test SMS failed", {
        to: to.substring(0, 4) + "***",
        error: result.error,
        status: result.status,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send SMS",
          status: result.status,
        },
        { status: 500 }
      );
    }

    // Extract message ID from response
    const messageId =
      result.data?.messages?.[0]?.message_id || "unknown";

    testSmsLogger.info("Test SMS sent successfully", {
      to: to.substring(0, 4) + "***",
      messageId,
      length: validation.length,
      parts: validation.parts,
    });

    return NextResponse.json({
      success: true,
      message: "Test SMS sent successfully",
      messageId,
      length: validation.length,
      parts: validation.parts,
      warning: validation.warning,
      status: result.status,
    });
  } catch (error) {
    testSmsLogger.error("Error sending test SMS", undefined, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

