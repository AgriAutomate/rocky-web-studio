import { parse, isValid } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string;
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

    const { date, time, name, email, phone, serviceType, message } = body as BookingRequest;

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

    // Generate mock bookingId
    const bookingId = `BK${Date.now()}`;

    // Create booking object for logging
    const booking = {
      bookingId,
      date,
      time,
      name,
      email,
      phone,
      serviceType,
      message: message || "",
      createdAt: new Date().toISOString(),
    };

    // Log booking to console
    console.log("=== BOOKING CREATED (MOCK) ===");
    console.log("Booking ID:", bookingId);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Service Type:", serviceType);
    console.log("Message:", message || "(none)");
    console.log("Created At:", booking.createdAt);
    console.log("==============================");

    // Send SMS notification (fire and forget - don't await)
    // Booking succeeds regardless of SMS delivery status
    (async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: phone,
            bookingId,
            date,
            time,
            serviceType,
            name,
          }),
        });
        console.log("✅ SMS notification sent");
      } catch (error) {
        console.error("⚠️ SMS failed (booking still created):", error);
      }
    })();

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
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "An unexpected error occurred while creating the booking",
      },
      { status: 500 }
    );
  }
}
