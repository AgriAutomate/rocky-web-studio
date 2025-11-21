import { NextResponse } from "next/server";
import { getSMSStorage, SMSRecord } from "@/lib/sms/storage";

type SMSStatus = SMSRecord["status"];
type SMSMessageType = SMSRecord["messageType"];

interface AdminSMSLog {
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

interface LogsSuccessResponse {
  success: true;
  logs: AdminSMSLog[];
}

interface LogsErrorResponse {
  success: false;
  error: string;
  logs: AdminSMSLog[];
}

export async function GET(): Promise<NextResponse<LogsSuccessResponse | LogsErrorResponse>> {
  try {
    const storage = getSMSStorage();
    const logs = await storage.findAll();
    const payload: AdminSMSLog[] = logs.map((log) => ({
      id: log.id,
      messageId: log.messageId,
      bookingId: log.bookingId,
      phoneNumber: log.phoneNumber,
      messageType: log.messageType,
      status: log.status,
      cost: log.cost,
      sentAt: log.sentAt.toISOString(),
      scheduledFor: log.scheduledFor?.toISOString(),
      error: log.error,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      logs: payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch logs";
    console.error("SMS logs error:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        logs: [],
      },
      { status: 500 }
    );
  }
}

