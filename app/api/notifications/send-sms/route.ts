import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  console.log("=== SMS API Called ===");

  try {
    // Parse request body
    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    // Extract fields
    const { to, customerName, date, time, service } = body;

    // Log each field
    console.log("Extracted fields:");
    console.log("  to:", to);
    console.log("  customerName:", customerName);
    console.log("  date:", date);
    console.log("  time:", time);
    console.log("  service:", service);

    // Validate required fields
    const missing: string[] = [];
    if (!to) missing.push("to");
    if (!customerName) missing.push("customerName");
    if (!date) missing.push("date");
    if (!time) missing.push("time");
    if (!service) missing.push("service");

    if (missing.length > 0) {
      const error = `Missing required fields: ${missing.join(", ")}`;
      console.error("Validation failed:", error);
      return NextResponse.json(
        {
          success: false,
          error,
          received: { to, customerName, date, time, service },
        },
        { status: 400 }
      );
    }

    // Build SMS message
    const message = `Hi ${customerName}! Your Rocky Web Studio booking is confirmed for ${date} at ${time}. Service: ${service}. Questions? Reply to this SMS. Thanks!`;

    console.log("Sending SMS:", {
      to,
      messageLength: message.length,
      message: message.substring(0, 50) + "...",
    });

    // Send SMS
    const result = await sendSMS(to, message, `booking_${Date.now()}`);

    console.log("SMS API Success:", result);
    console.log("===================");

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      data: result,
    });
  } catch (error: unknown) {
    console.error("=== SMS API ERROR ===");
    console.error("Error type:", (error as Error)?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    console.error("====================");

    const errorMessage = error instanceof Error ? error.message : "Failed to send SMS";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}