import { NextRequest, NextResponse } from "next/server";
import { parse, format } from "date-fns";
import { kvBookingStorage } from "@/lib/kv/bookings";
import { canCancelBooking, processRefund } from "@/lib/bookings/cancellation";
import { addHistoryEntry } from "@/lib/bookings/rescheduling";
import { sendSMS } from "@/lib/sms";
import { getLogger } from "@/lib/logging";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { getFromAddress, getReplyToAddress } from "@/lib/email/config";

const cancellationLogger = getLogger("bookings.cancel");
const resendApiKey = process.env.RESEND_API_KEY;

interface CancelRequest {
  email?: string;
  phone?: string;
  reason?: string;
  isAdmin?: boolean;
}

async function sendCancellationEmail(booking: {
  bookingId: string;
  customerName: string;
  email: string;
  service: string;
  date: string;
  time: string;
  refundId?: string;
}) {
  if (!resendApiKey) {
    cancellationLogger.warn("Skipping cancellation email — RESEND_API_KEY is not configured.", {
      bookingId: booking.bookingId,
    });
    return;
  }

  const appointmentDate = parse(booking.date, "yyyy-MM-dd", new Date());
  const formattedDate = format(appointmentDate, "EEEE, MMMM d, yyyy");

  const subject = "Booking Cancelled - Rocky Web Studio";
  const textBody = `
Hi ${booking.customerName},

Your booking with Rocky Web Studio has been cancelled.

Cancelled Booking Details:
• Date: ${formattedDate}
• Time: ${booking.time}
• Service: ${booking.service}
• Booking ID: ${booking.bookingId}
${booking.refundId ? `• Refund ID: ${booking.refundId}` : ""}

If you have any questions or would like to reschedule, please contact us at bookings@rockywebstudio.com.au

Thanks,
The Rocky Web Studio Team
  `.trim();

  const htmlBody = `
    <p>Hi ${booking.customerName},</p>
    <p>Your booking with Rocky Web Studio has been cancelled.</p>
    <p><strong>Cancelled Booking Details:</strong></p>
    <ul>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${booking.time}</li>
      <li><strong>Service:</strong> ${booking.service}</li>
      <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
      ${booking.refundId ? `<li><strong>Refund ID:</strong> ${booking.refundId}</li>` : ""}
    </ul>
    <p>If you have any questions or would like to reschedule, please contact us at <a href="mailto:bookings@rockywebstudio.com.au">bookings@rockywebstudio.com.au</a></p>
    <p>Thanks,<br/>The Rocky Web Studio Team</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress("bookings"),
        replyTo: getReplyToAddress("bookings"),
        to: booking.email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      cancellationLogger.error("Cancellation email failed", {
        bookingId: booking.bookingId,
        status: response.status,
        error: errorText,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    cancellationLogger.error("Cancellation email error", { bookingId: booking.bookingId, errorMessage: message }, error);
  }
}

async function sendCancellationSMS(booking: {
  bookingId: string;
  customerName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}) {
  const message = `Hi ${booking.customerName}! Your booking for ${booking.service} on ${booking.date} at ${booking.time} has been cancelled. Booking ID: ${booking.bookingId}. Questions? Reply to this SMS. - Rocky Web Studio`;

  try {
    const result = await sendSMS(booking.phone, message, `${booking.bookingId}-cancel`);
    if (!result.success) {
      cancellationLogger.error("Cancellation SMS failed", {
        bookingId: booking.bookingId,
        error: result.error,
      });
    }
  } catch (error) {
    cancellationLogger.error("Cancellation SMS error", { bookingId: booking.bookingId }, error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const bookingId = resolvedParams.bookingId;

  try {
    if (!bookingId) {
      throw new ValidationError("Booking ID is required");
    }

    const body = (await request.json()) as CancelRequest;
  const { email, phone, reason, isAdmin = false } = body;

  // Get booking
  const booking = await kvBookingStorage.get(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID ${bookingId} not found`);
  }

  // Verify ownership (unless admin)
  if (!isAdmin) {
    if (!email && !phone) {
      throw new ValidationError("Either email or phone is required to verify ownership");
    }

    const emailMatch = email && booking.email.toLowerCase() === email.toLowerCase();
    const phoneMatch = phone && booking.phone === phone;

    if (!emailMatch && !phoneMatch) {
      throw new ValidationError("Email or phone does not match booking");
    }
  }

  // Check if can cancel (unless admin)
  if (!isAdmin) {
    const cancellationCheck = canCancelBooking(booking);
    if (!cancellationCheck.canCancel) {
      cancellationLogger.warn("Cancellation attempt failed", {
        bookingId,
        reason: cancellationCheck.reason,
        hoursUntilAppointment: cancellationCheck.hoursUntilAppointment,
      });
      return NextResponse.json(
        {
          success: false,
          error: cancellationCheck.reason || "Cannot cancel booking",
          hoursUntilAppointment: cancellationCheck.hoursUntilAppointment,
        },
        { status: 409 }
      );
    }
  }

  // Process refund if payment exists
  let refundId: string | undefined;
  if (booking.paymentIntentId) {
    const refundResult = await processRefund(booking.paymentIntentId);
    if (refundResult.success && refundResult.refundId) {
      refundId = refundResult.refundId;
    } else if (!refundResult.success) {
      cancellationLogger.error("Refund failed but proceeding with cancellation", {
        bookingId,
        paymentIntentId: booking.paymentIntentId,
        error: refundResult.error,
      });
      // Continue with cancellation even if refund fails
    }
  }

  // Update booking status
  const now = new Date();
  const updatedBooking = {
    ...booking,
    status: "cancelled" as const,
    cancelReason: (reason as "user_request" | "admin_cancel") || "user_request",
    cancelledAt: now,
    cancelledBy: isAdmin ? ("admin" as const) : ("user" as const),
    updatedAt: now,
    history: [
      ...booking.history,
      addHistoryEntry(
        booking,
        "cancelled",
        isAdmin ? "admin" : "user",
        {
          reason: reason || (isAdmin ? "admin_cancel" : "user_request"),
          oldValue: booking.status,
          newValue: "cancelled",
        }
      ),
    ],
  };

  await kvBookingStorage.save(updatedBooking);

  // Note: Cancellation tracking should be done client-side when user cancels
  // Server-side tracking would require GA4 Measurement Protocol (already implemented in lib/analytics/server.ts)

  // Send notifications
  await Promise.all([
    sendCancellationEmail({
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      email: booking.email,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      refundId,
    }),
    booking.smsOptIn
      ? sendCancellationSMS({
          bookingId: booking.bookingId,
          customerName: booking.customerName,
          phone: booking.phone,
          service: booking.service,
          date: booking.date,
          time: booking.time,
        })
      : Promise.resolve(),
  ]);

    cancellationLogger.info("Booking cancelled successfully", {
      bookingId,
      cancelledBy: isAdmin ? "admin" : "user",
      refundId,
    });

    const result = {
      success: true,
      message: "Booking cancelled successfully",
      bookingId,
      refundId,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    cancellationLogger.error("Unexpected error cancelling booking", { bookingId: resolvedParams.bookingId }, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

