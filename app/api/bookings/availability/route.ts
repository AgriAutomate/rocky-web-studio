import { format, parse, isValid, startOfDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { kvBookingStorage } from "@/lib/kv/bookings";

// Generate time slots from 9 AM to 5 PM (9:00 to 17:00)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    // Validate date parameter
    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required (format: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Parse and validate date format
    let date: Date;
    try {
      date = parse(dateParam, "yyyy-MM-dd", new Date());
      if (!isValid(date)) {
        throw new Error("Invalid date");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Normalize to start of day to avoid timezone issues
    const normalizedDate = startOfDay(date);
    const dateKey = format(normalizedDate, "yyyy-MM-dd");

    // Generate all available slots
    const allSlots = generateTimeSlots();

    // Get existing bookings for this date (excluding cancelled)
    const allBookings = await kvBookingStorage.getAll();
    const bookingsForDate = allBookings.filter(
      (booking) =>
        booking.date === dateKey &&
        booking.status !== "cancelled" &&
        booking.status !== "rescheduled" // Exclude rescheduled bookings from old date
    );

    // Create set of booked times
    const bookedTimes = new Set(bookingsForDate.map((b) => b.time));

    // Map slots with availability
    const slots = allSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }));

    // Return response
    return NextResponse.json(
      {
        date: dateKey,
        slots,
        totalSlots: allSlots.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
