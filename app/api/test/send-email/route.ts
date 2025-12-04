import { NextRequest, NextResponse } from "next/server";
import { getLogger } from "@/lib/logging";
import { getFromAddress } from "@/lib/email/config";

const testEmailLogger = getLogger("test.email");

/**
 * Test endpoint to send email via Resend
 * 
 * POST /api/test/send-email
 * Body: { to: string, template?: "booking" | "order", subject?: string, body?: string }
 * 
 * ⚠️ WARNING: This sends real emails. Use only for testing.
 */
export async function POST(request: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "RESEND_API_KEY is not configured",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { to, template, subject, body: emailBody } = body;

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address (to) is required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address format",
        },
        { status: 400 }
      );
    }

    let finalSubject: string;
    let finalBody: string;
    let fromAddress: string;

    if (template === "booking") {
      fromAddress = getFromAddress("bookings");
      finalSubject = subject || "Test Booking Confirmation - Rocky Web Studio";
      finalBody =
        emailBody ||
        `
Hi there,

This is a test email from Rocky Web Studio.

Booking Details:
- Booking ID: TEST-123456
- Service: Website Consultation
- Date: December 15, 2025
- Time: 14:00

If you received this email, the custom domain email setup is working correctly!

Best regards,
Rocky Web Studio Team
      `.trim();
    } else if (template === "order") {
      fromAddress = getFromAddress("music");
      finalSubject = subject || "Test Order Confirmation - Rocky Web Studio";
      finalBody =
        emailBody ||
        `
Hi there,

This is a test email from Rocky Web Studio.

Order Details:
- Order ID: ORD-TEST-123456
- Package: Express Personal
- Occasion: Test Order

If you received this email, the custom domain email setup is working correctly!

Best regards,
Rocky Web Studio Team
      `.trim();
    } else {
      fromAddress = getFromAddress("bookings");
      finalSubject = subject || "Test Email - Rocky Web Studio";
      finalBody =
        emailBody ||
        `
Hi there,

This is a test email from Rocky Web Studio.

If you received this email, the custom domain email setup is working correctly!

Best regards,
Rocky Web Studio Team
      `.trim();
    }

    testEmailLogger.info("Sending test email", {
      to,
      from: fromAddress,
      template: template || "custom",
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: finalSubject,
        text: finalBody,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #218081; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Rocky Web Studio</h1>
          </div>
          <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
            ${finalBody.split("\n").map((line) => `<p style="margin: 8px 0;">${line}</p>`).join("")}
          </div>
        </div>`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      testEmailLogger.error("Failed to send test email", {
        to,
        status: response.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Failed to send email: ${errorText}`,
          status: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    testEmailLogger.info("Test email sent successfully", {
      to,
      from: fromAddress,
      emailId: data.id,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: data.id,
      from: fromAddress,
      to,
      subject: finalSubject,
    });
  } catch (error) {
    testEmailLogger.error("Error sending test email", undefined, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

