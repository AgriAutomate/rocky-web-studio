import { parse, isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import {
  sendBookingConfirmation,
  schedule24HourReminder,
  schedule1HourReminder,
} from "@/lib/sms/booking-helpers";

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

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    // Validate required fields
    const requiredFields = ["date", "time", "name", "email", "phone", "serviceType"];
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

    // Validate date format
    try {
      const parsedDate = parse(date, "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }
    } catch (error) {
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

    // TODO(production): ensure SMS provider credentials are active before enabling in prod.
    // Send SMS notifications if user opted in (fire and forget)
    // Booking succeeds regardless of SMS delivery status
    if (smsOptIn) {
      (async () => {
        try {
          const bookingDetails = {
            bookingId,
            date,
            time,
            serviceType,
            name,
            phoneNumber: phone,
            bookingUrl: `${process.env.NEXT_PUBLIC_BOOKING_URL || "https://rockywebstudio.com.au/book"}/${bookingId}`,
          };

          const confirmationResult = await sendBookingConfirmation(bookingDetails);
          if (confirmationResult.success) {
            if (process.env.NODE_ENV !== "production") {
              console.info("SMS confirmation sent", {
                bookingId,
                messageId: confirmationResult.messageId,
              });
            }
          } else {
            console.warn("SMS confirmation failed", {
              bookingId,
              error: confirmationResult.error,
            });
          }

          const reminder24hResult = await schedule24HourReminder(bookingDetails);
          if (reminder24hResult.success) {
            if (process.env.NODE_ENV !== "production") {
              console.info("24h reminder scheduled", {
                bookingId,
                messageId: reminder24hResult.messageId,
              });
            }
          } else {
            console.warn("24h reminder failed", {
              bookingId,
              error: reminder24hResult.error,
            });
          }

          const reminder1hResult = await schedule1HourReminder(bookingDetails);
          if (reminder1hResult.success) {
            if (process.env.NODE_ENV !== "production") {
              console.info("1h reminder scheduled", {
                bookingId,
                messageId: reminder1hResult.messageId,
              });
            }
          } else {
            console.warn("1h reminder failed", {
              bookingId,
              error: reminder1hResult.error,
            });
          }
        } catch (error) {
          console.error("SMS notifications failed", { bookingId, error });
        }
      })();
    }

    // Return success response immediately (don't wait for SMS)
    return NextResponse.json(
      {
        success: true,
        bookingId,
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking creation error", {
      message: error?.message,
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "An unexpected error occurred while creating the booking",
      },
      { status: 500 }
    );
  }
}
