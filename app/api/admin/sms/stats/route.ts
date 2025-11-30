import { NextRequest, NextResponse } from "next/server";
import { getSMSStorage, SMSRecord } from "@/lib/sms/storage";

type SMSStatus = SMSRecord["status"];
type SMSMessageType = SMSRecord["messageType"];

interface StatsSummary {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  sent: number;
  totalCost: number;
  byType: Record<string, number>;
}

interface StatsMessage {
  id: string;
  messageId: string;
  bookingId: string;
  phoneNumber: string;
  messageType: SMSMessageType;
  status: SMSStatus;
  cost: number;
  sentAt: string;
  scheduledFor?: string;
  error?: string;
  createdAt: string;
}

interface StatsSuccessResponse {
  success: true;
  messages: StatsMessage[];
  stats: StatsSummary;
}

interface StatsErrorResponse {
  success: false;
  error: string;
  messages: StatsMessage[];
  stats: StatsSummary;
}

const defaultStats: StatsSummary = {
  total: 0,
  delivered: 0,
  failed: 0,
  pending: 0,
  sent: 0,
  totalCost: 0,
  byType: {},
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<StatsSuccessResponse | StatsErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId") || undefined;
    const phoneNumber = searchParams.get("phoneNumber") || undefined;
    const status = (searchParams.get("status") as SMSStatus) || undefined;
    const messageType = (searchParams.get("messageType") as SMSMessageType) || undefined;
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month")!, 10)
      : undefined;
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!, 10)
      : undefined;

    const storage = getSMSStorage();
    const messages = await storage.findAll({
      bookingId,
      phoneNumber,
      status,
      messageType,
    });
    const stats = await storage.getStats(month, year);

    const payload: StatsMessage[] = messages.map((msg) => ({
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
    }));

    return NextResponse.json({
      success: true,
      messages: payload,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch SMS statistics";
    console.error("Error fetching SMS stats:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        messages: [],
        stats: defaultStats,
      },
      { status: 500 }
    );
  }
}