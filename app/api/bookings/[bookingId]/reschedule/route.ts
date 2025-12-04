import { NextRequest, NextResponse } from "next/server";
import { parse, isValid, format } from "date-fns";
import { kvBookingStorage } from "@/lib/kv/bookings";
import { isTimeSlotAvailable, addHistoryEntry } from "@/lib/bookings/rescheduling";
import { sendSMS } from "@/lib/sms";
import { getLogger } from "@/lib/logging";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { getFromAddress, getReplyToAddress } from "@/lib/email/config";

const reschedulingLogger = getLogger("bookings.reschedule");
const resendApiKey = process.env.RESEND_API_KEY;

interface RescheduleRequest {
  email?: string;
  phone?: string;
  newDate: string; // yyyy-MM-dd
  newTime: string; // HH:mm
  isAdmin?: boolean;
}

async function sendReschedulingEmail(booking: {
  bookingId: string;
  customerName: string;
  email: string;
  service: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}) {
  if (!resendApiKey) {
    reschedulingLogger.warn("Skipping rescheduling email — RESEND_API_KEY is not configured.", {
      bookingId: booking.bookingId,
    });
    return;
  }

  const oldAppointmentDate = parse(booking.oldDate, "yyyy-MM-dd", new Date());
  const newAppointmentDate = parse(booking.newDate, "yyyy-MM-dd", new Date());
  const formattedOldDate = format(oldAppointmentDate, "EEEE, MMMM d, yyyy");
  const formattedNewDate = format(newAppointmentDate, "EEEE, MMMM d, yyyy");

  const subject = "Booking Rescheduled - Rocky Web Studio";
  const textBody = `
Hi ${booking.customerName},

Your booking with Rocky Web Studio has been rescheduled.

Original Booking:
• Date: ${formattedOldDate}
• Time: ${booking.oldTime}

New Booking:
• Date: ${formattedNewDate}
• Time: ${booking.newTime}
• Service: ${booking.service}
• Booking ID: ${booking.bookingId}

If you have any questions, please contact us at bookings@rockywebstudio.com.au

Thanks,
The Rocky Web Studio Team
  `.trim();

  const htmlBody = `
    <p>Hi ${booking.customerName},</p>
    <p>Your booking with Rocky Web Studio has been rescheduled.</p>
    <p><strong>Original Booking:</strong></p>
    <ul>
      <li><strong>Date:</strong> ${formattedOldDate}</li>
      <li><strong>Time:</strong> ${booking.oldTime}</li>
    </ul>
    <p><strong>New Booking:</strong></p>
    <ul>
      <li><strong>Date:</strong> ${formattedNewDate}</li>
      <li><strong>Time:</strong> ${booking.newTime}</li>
      <li><strong>Service:</strong> ${booking.service}</li>
      <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
    </ul>
    <p>If you have any questions, please contact us at <a href="mailto:bookings@rockywebstudio.com.au">bookings@rockywebstudio.com.au</a></p>
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
      reschedulingLogger.error("Rescheduling email failed", {
        bookingId: booking.bookingId,
        status: response.status,
        error: errorText,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    reschedulingLogger.error("Rescheduling email error", { bookingId: booking.bookingId, errorMessage: message }, error);
  }
}

async function sendReschedulingSMS(booking: {
  bookingId: string;
  customerName: string;
  phone: string;
  service: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}) {
  const message = `Hi ${booking.customerName}! Your booking has been rescheduled. New date: ${booking.newDate} at ${booking.newTime}. Booking ID: ${booking.bookingId}. - Rocky Web Studio`;

  try {
    const result = await sendSMS(booking.phone, message, `${booking.bookingId}-reschedule`);
    if (!result.success) {
      reschedulingLogger.error("Rescheduling SMS failed", {
        bookingId: booking.bookingId,
        error: result.error,
      });
    }
  } catch (error) {
    reschedulingLogger.error("Rescheduling SMS error", { bookingId: booking.bookingId }, error);
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

    const body = (await request.json()) as RescheduleRequest;
  const { email, phone, newDate, newTime, isAdmin = false } = body;

  // Validate required fields
  if (!newDate || !newTime) {
    throw new ValidationError("newDate and newTime are required");
  }

  // Validate date format
  const appointmentDate = parse(newDate, "yyyy-MM-dd", new Date());
  if (!isValid(appointmentDate)) {
    throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
  }

  // Validate time format (HH:00)
  const timeRegex = /^([0-1][0-9]|2[0-3]):00$/;
  if (!timeRegex.test(newTime)) {
    throw new ValidationError("Invalid time format. Use HH:00 (e.g., 09:00, 14:00)");
  }

  // Get booking
  const booking = await kvBookingStorage.get(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with ID ${bookingId} not found`);
  }

  // Check if already cancelled
  if (booking.status === "cancelled") {
    throw new ValidationError("Cannot reschedule a cancelled booking");
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

  // Check if new time slot is available
  const availabilityCheck = await isTimeSlotAvailable(newDate, newTime, bookingId);
  if (!availabilityCheck.available) {
    reschedulingLogger.warn("Rescheduling attempt failed - slot not available", {
      bookingId,
      newDate,
      newTime,
      reason: availabilityCheck.reason,
    });
    return NextResponse.json(
      {
        success: false,
        error: availabilityCheck.reason || "Time slot is not available",
      },
      { status: 409 }
    );
  }

  // Update booking
  const now = new Date();
  const oldDate = booking.date;
  const oldTime = booking.time;

  const updatedBooking = {
    ...booking,
    date: newDate,
    time: newTime,
    status: "rescheduled" as const,
    updatedAt: now,
    history: [
      ...booking.history,
      addHistoryEntry(
        booking,
        "rescheduled",
        isAdmin ? "admin" : "user",
        {
          oldValue: { date: oldDate, time: oldTime },
          newValue: { date: newDate, time: newTime },
        }
      ),
    ],
  };

  await kvBookingStorage.save(updatedBooking);

  // Send notifications
  await Promise.all([
    sendReschedulingEmail({
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      email: booking.email,
      service: booking.service,
      oldDate,
      oldTime,
      newDate,
      newTime,
    }),
    booking.smsOptIn
      ? sendReschedulingSMS({
          bookingId: booking.bookingId,
          customerName: booking.customerName,
          phone: booking.phone,
          service: booking.service,
          oldDate,
          oldTime,
          newDate,
          newTime,
        })
      : Promise.resolve(),
  ]);

    reschedulingLogger.info("Booking rescheduled successfully", {
      bookingId,
      oldDate,
      oldTime,
      newDate,
      newTime,
      rescheduledBy: isAdmin ? "admin" : "user",
    });

    const result = {
      success: true,
      message: "Booking rescheduled successfully",
      bookingId,
      oldDate,
      oldTime,
      newDate,
      newTime,
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
    reschedulingLogger.error("Unexpected error rescheduling booking", { bookingId: resolvedParams.bookingId }, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

