import { parse, isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { Booking, saveBooking } from "@/lib/bookings/storage";

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
