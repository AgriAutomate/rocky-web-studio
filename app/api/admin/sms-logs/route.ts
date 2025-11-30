import { NextRequest, NextResponse } from "next/server";
import { getSMSStorage, SMSRecord } from "@/lib/sms/storage";
import { getAllBookings } from "@/lib/bookings/storage";

interface SMSLogWithCustomer {
  id: string;
  messageId: string;
  bookingId: string;
  customerName: string;
  phoneNumber: string;
  messagePreview: string;
  messageType: SMSRecord["messageType"];
  status: SMSRecord["status"];
  cost: number;
  sentAt: string;
  error?: string;
  createdAt: string;
}

interface SMSLogsResponse {
  success: true;
  logs: SMSLogWithCustomer[];
  total: number;
}

interface SMSLogsErrorResponse {
  success: false;
  error: string;
  logs: SMSLogWithCustomer[];
  total: number;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<SMSLogsResponse | SMSLogsErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as SMSRecord["status"] | null;
    const bookingId = searchParams.get("bookingId") || undefined;
    const phoneNumber = searchParams.get("phoneNumber") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Get all SMS logs
    const storage = getSMSStorage();
    const smsLogs = await storage.findAll({
      bookingId,
      phoneNumber,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Get all bookings to match customer names
    const bookings = getAllBookings();
    const bookingsMap = new Map(bookings.map((b) => [b.bookingId, b]));

    // Combine SMS logs with customer information
    const logsWithCustomer: SMSLogWithCustomer[] = smsLogs.map((log) => {
      const booking = bookingsMap.get(log.bookingId);
      return {
        id: log.id,
        messageId: log.messageId,
        bookingId: log.bookingId,
        customerName: booking?.customerName || "Unknown",
        phoneNumber: log.phoneNumber,
        messagePreview: log.messagePreview,
        messageType: log.messageType,
        status: log.status,
        cost: log.cost,
        sentAt: log.sentAt.toISOString(),
        error: log.error,
        createdAt: log.createdAt.toISOString(),
      };
    });

    // Sort by most recent first
    logsWithCustomer.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      logs: logsWithCustomer,
      total: logsWithCustomer.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch SMS logs";
    console.error("Error fetching SMS logs:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        logs: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}




