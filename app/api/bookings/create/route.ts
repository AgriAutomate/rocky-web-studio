import { format, parse, isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { Booking, saveBooking } from "@/lib/bookings/storage";

const resendApiKey = process.env.RESEND_API_KEY;

interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string;
  smsOptIn?: boolean;
}

interface BookingEmailDetails {
  bookingId: string;
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
}

async function sendBookingConfirmationEmail(details: BookingEmailDetails) {
  if (!resendApiKey) {
    console.warn(
      "Skipping confirmation email — RESEND_API_KEY is not configured."
    );
    return;
  }

  const formattedDate = format(details.appointmentDate, "EEEE, MMMM d, yyyy");
  const subject = "Booking Confirmation - Rocky Web Studio";
  const textBody = `
Hi ${details.customerName},

Your booking with Rocky Web Studio has been confirmed.

Booking details
• Date: ${formattedDate}
• Time: ${details.appointmentTime}
• Service: ${details.serviceType}
• Booking ID: ${details.bookingId}

Location & contact
Rocky Web Studio HQ
bookings@rockywebstudio.com.au

Thanks,
The Rocky Web Studio Team
  `.trim();

  const htmlBody = `
    <p>Hi ${details.customerName},</p>
    <p>Thank you for booking with Rocky Web Studio. Here are the confirmed details:</p>
    <ul>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${details.appointmentTime}</li>
      <li><strong>Service:</strong> ${details.serviceType}</li>
      <li><strong>Booking ID:</strong> ${details.bookingId}</li>
    </ul>
    <p>Location & contact:<br/>Rocky Web Studio HQ<br/>bookings@rockywebstudio.com.au</p>
    <p>Looking forward to talking soon.<br/>– The Rocky Web Studio Team</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rocky Web Studio <bookings@rockywebstudio.com.au>",
        to: details.email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Resend email failed",
        response.status,
        response.statusText,
        errorText
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Resend email error", message, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingRequest;

    // Validate required fields
    const requiredFields: Array<keyof BookingRequest> = [
      "date",
      "time",
      "name",
      "email",
      "phone",
      "serviceType",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    const {
      date,
      time,
      name,
      email,
      phone,
      serviceType,
      message,
      smsOptIn = false,
    } = body as BookingRequest;

    const appointmentDate = parse(date, "yyyy-MM-dd", new Date());
    if (!isValid(appointmentDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate time format (HH:00)
    const timeRegex = /^([0-1][0-9]|2[0-3]):00$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:00 (e.g., 09:00, 14:00)" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO(production): replace mock ID + logging-only flow with persistent storage.
    // Generate mock bookingId
    const bookingId = `BK${Date.now()}`;

    saveBooking({
      id: bookingId,
      bookingId,
      customerName: name,
      email,
      phone,
      service: serviceType,
      date,
      time,
      smsOptIn,
      reminderSent24h: false,
      reminderSent2h: false,
      createdAt: new Date(),
    } satisfies Booking);

    await sendBookingConfirmationEmail({
      bookingId,
      customerName: name,
      email,
      serviceType,
      appointmentDate,
      appointmentTime: time,
    });

    // Return success response immediately (don't wait for SMS)
    return NextResponse.json(
      {
        success: true,
        bookingId,
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Booking creation error", {
      message,
      stack: process.env.NODE_ENV !== "production" && error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        message,
      },
      { status: 500 }
    );
  }
}
