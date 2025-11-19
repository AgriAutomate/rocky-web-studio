import { NextRequest, NextResponse } from "next/server";
import { getSMSStorage } from "@/lib/sms/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const phoneNumber = searchParams.get("phoneNumber");
    const status = searchParams.get("status") as
      | "pending"
      | "delivered"
      | "failed"
      | null;
    const messageType = searchParams.get("messageType") as
      | "confirmation"
      | "24hr_reminder"
      | "1hr_reminder"
      | null;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!)
      : undefined;
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;

    const storage = getSMSStorage();

    // Get all messages with filters
    const messages = await storage.findAll({
      bookingId: bookingId || undefined,
      phoneNumber: phoneNumber || undefined,
      status: status || undefined,
      messageType: messageType || undefined,
    });

    // Get statistics for current month (or specified month/year)
    const stats = await storage.getStats(month, year);

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        messageId: msg.messageId,
        bookingId: msg.bookingId,
        phoneNumber: msg.phoneNumber,
        messageType: msg.messageType,
        status: msg.status,
        cost: msg.cost,
        sentAt: msg.sentAt.toISOString(),
        scheduledFor: msg.scheduledFor?.toISOString(),
        error: msg.error,
        createdAt: msg.createdAt.toISOString(),
      })),
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching SMS stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch SMS statistics",
        messages: [],
        stats: {
          total: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
          totalCost: 0,
          byType: {},
        },
      },
      { status: 500 }
    );
  }
}

