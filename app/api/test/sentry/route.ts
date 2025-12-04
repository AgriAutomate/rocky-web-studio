import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Test endpoint to verify Sentry integration
 * 
 * GET /api/test/sentry?type=error|message|exception
 * 
 * - type=error: Captures a test error
 * - type=message: Sends a test message
 * - type=exception: Throws an exception
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "error";

  try {
    switch (type) {
      case "error":
        // Capture a test error
        Sentry.captureException(new Error("Test error from Sentry integration"), {
          tags: {
            test: true,
            type: "error",
          },
          extra: {
            endpoint: "/api/test/sentry",
            timestamp: new Date().toISOString(),
          },
        });
        return NextResponse.json({
          success: true,
          message: "Test error captured and sent to Sentry",
          type: "error",
        });

      case "message":
        // Send a test message
        Sentry.captureMessage("Test message from Sentry integration", {
          level: "info",
          tags: {
            test: true,
            type: "message",
          },
        });
        return NextResponse.json({
          success: true,
          message: "Test message sent to Sentry",
          type: "message",
        });

      case "exception":
        // Throw an exception (will be caught by error boundary)
        throw new Error("Test exception for Sentry");

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid type parameter. Use: error, message, or exception",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Capture the exception
    Sentry.captureException(error, {
      tags: {
        test: true,
        type: "exception",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        type: "exception",
      },
      { status: 500 }
    );
  }
}

