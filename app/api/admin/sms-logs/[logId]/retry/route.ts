import { NextRequest, NextResponse } from "next/server";
import { getSMSStorage } from "@/lib/sms/storage";
import { getAllBookings } from "@/lib/bookings/storage";
import { sendSMS } from "@/lib/sms";
import { logSMSAttempt } from "@/lib/sms/storage";

interface RetryResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { logId: string } }
): Promise<NextResponse<RetryResponse>> {
  try {
    const { logId } = params;

    if (!logId) {
      return NextResponse.json(
        { success: false, error: "Log ID is required" },
        { status: 400 }
      );
    }

    // Get the SMS log entry
    const storage = getSMSStorage();
    const allLogs = await storage.findAll({});
    const smsLog = allLogs.find((log) => log.id === logId);

    if (!smsLog) {
      return NextResponse.json(
        { success: false, error: "SMS log not found" },
        { status: 404 }
      );
    }

    // Only retry failed SMS
    if (smsLog.status !== "failed") {
      return NextResponse.json(
        { success: false, error: "Can only retry failed SMS" },
        { status: 400 }
      );
    }

    // Get booking details to reconstruct message
    const bookings = getAllBookings();
    const booking = bookings.find((b) => b.bookingId === smsLog.bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Reconstruct SMS message
    const formattedDate = new Date(booking.date).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const smsMessage = `Hi ${booking.customerName}! Your Rocky Web Studio booking is confirmed for ${formattedDate} at ${booking.time}. Service: ${booking.service}. Booking ID: ${booking.bookingId}. Questions? Just reply! - Rocky Web Studio`;

    // Send SMS
    const smsResult = await sendSMS(smsLog.phoneNumber, smsMessage, smsLog.bookingId);

    if (smsResult.success) {
      const mobileMessageId = smsResult.data?.messages?.[0]?.message_id || "";

      // Log successful retry
      await logSMSAttempt({
        bookingId: smsLog.bookingId,
        phoneNumber: smsLog.phoneNumber,
        message: smsMessage,
        messageType: smsLog.messageType,
        status: "sent",
        messageId: mobileMessageId,
      });

      return NextResponse.json({
        success: true,
        messageId: mobileMessageId,
      });
    } else {
      // Log failed retry
      await logSMSAttempt({
        bookingId: smsLog.bookingId,
        phoneNumber: smsLog.phoneNumber,
        message: smsMessage,
        messageType: smsLog.messageType,
        status: "failed",
        error: smsResult.error || `HTTP ${smsResult.status}`,
      });

      return NextResponse.json(
        {
          success: false,
          error: smsResult.error || `HTTP ${smsResult.status}`,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retry SMS";
    console.error("Error retrying SMS:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}




