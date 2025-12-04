import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";
import { getLogger } from "@/lib/logging";
import { validateMessageLength } from "@/lib/sms/messages";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";

const testSmsLogger = getLogger("test.sms");

/**
 * Test endpoint to send real SMS for verification
 * 
 * POST /api/test/sms
 * Body: { to: string, message?: string, template?: "confirmation" | "reminder" | "admin" }
 * 
 * ⚠️ WARNING: This sends real SMS messages. Use only with test phone numbers.
 */
export async function POST(request: NextRequest) {
  // Check rate limit: 5 per hour per IP (stricter for test endpoint)
  const rateLimitResponse = await checkRateLimit(request, {
    limit: 5,
    windowSeconds: 60 * 60, // 1 hour
    keyPrefix: "rate-limit:test-sms",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
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

