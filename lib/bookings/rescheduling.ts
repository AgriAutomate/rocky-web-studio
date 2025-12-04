import { getLogger } from "@/lib/logging";
import { kvBookingStorage } from "@/lib/kv/bookings";
import type { Booking, BookingHistoryEntry } from "./storage";

const reschedulingLogger = getLogger("bookings.rescheduling");

/**
 * Check if a date/time slot is available for rescheduling
 */
export async function isTimeSlotAvailable(
  date: string,
  time: string,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  try {
    // Get all bookings for this date
    const allBookings = await kvBookingStorage.getAll();
    const bookingsForDate = allBookings.filter(
      (booking) =>
        booking.date === date &&
        booking.time === time &&
        booking.status !== "cancelled" &&
        booking.id !== excludeBookingId // Exclude the booking being rescheduled
    );

    if (bookingsForDate.length > 0) {
      return {
        available: false,
        reason: "Time slot is already booked",
      };
    }

    return { available: true };
  } catch (error) {
    reschedulingLogger.error("Error checking time slot availability", { date, time }, error);
    return {
      available: false,
      reason: "Error checking availability",
    };
  }
}

/**
 * Add history entry to booking
 */
export function addHistoryEntry(
  _booking: Booking,
  action: Booking["history"][0]["action"],
  changedBy: "user" | "admin",
  details: Booking["history"][0]["details"]
): BookingHistoryEntry {
  return {
    timestamp: new Date(),
    action,
    changedBy,
    details,
  };
}

