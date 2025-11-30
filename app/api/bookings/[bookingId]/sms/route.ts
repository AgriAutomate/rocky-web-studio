import { NextRequest, NextResponse } from "next/server";
import { getSMSStorage } from "@/lib/sms/storage";

/**
 * GET /api/bookings/[bookingId]/sms
 * Fetch SMS logs for a specific booking
 * Used for tracking, debugging, and customer service
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
): Promise<NextResponse> {
  try {
    const { bookingId } = params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const storage = getSMSStorage();
    const smsLogs = await storage.findByBookingId(bookingId);

    // Format response
    const formattedLogs = smsLogs.map((log) => ({
      id: log.id,
      messageId: log.messageId,
      bookingId: log.bookingId,
      phoneNumber: log.phoneNumber,
      messagePreview: log.messagePreview,
      messageType: log.messageType,
      status: log.status,
      cost: log.cost,
      sentAt: log.sentAt.toISOString(),
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      bookingId,
      logs: formattedLogs,
      count: formattedLogs.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch SMS logs";
    console.error("Error fetching SMS logs:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}




