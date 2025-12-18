import { kv } from "@vercel/kv";
import type { Booking } from "@/lib/bookings/storage";

/**
 * KV-backed booking storage adapter.
 *
 * Key design:
 * - Individual booking: booking:{id}
 * - All booking IDs: bookings:all (SET)
 * - Date index: bookings:date:{yyyy-MM-dd} (SET of booking IDs)
 */

const BOOKING_KEY = (id: string) => `booking:${id}`;
const BOOKINGS_ALL_KEY = "bookings:all";
const BOOKINGS_DATE_KEY = (date: string) => `bookings:date:${date}`; // date = yyyy-MM-dd

async function save(record: Booking): Promise<Booking> {
  // Persist booking document
  await kv.set(BOOKING_KEY(record.id), record);

  // Global index of all bookings
  await kv.sadd(BOOKINGS_ALL_KEY, record.id);

  // Date-based index for reminder queries
  if (record.date) {
    await kv.sadd(BOOKINGS_DATE_KEY(record.date), record.id);
  }

  return record;
}

async function get(id: string): Promise<Booking | null> {
  const booking = await kv.get<Booking | null>(BOOKING_KEY(id));
  return booking ?? null;
}

async function getAll(): Promise<Booking[]> {
  const ids = (await kv.smembers(BOOKINGS_ALL_KEY)) as string[];
  if (!ids.length) return [];

  const keys = ids.map(BOOKING_KEY);
  const results = (await kv.mget(keys)) as (Booking | null)[];

  return results.filter((b): b is Booking => b !== null);
}

/**
 * Compute bookings that are due for reminders `hoursBefore` the appointment.
 *
 * For now, this loads all bookings from KV (suitable for current scale) and
 * reuses the existing time-delta logic. Date-based indexes are maintained for
 * future optimization if the dataset grows.
 */
async function getDueBookings(hoursBefore: number): Promise<Booking[]> {
  const all = await getAll();
  const now = new Date();

  return all.filter((booking) => {
    if (!booking.smsOptIn) return false;
    const [year, month, day] = booking.date.split("-").map(Number);
    const [hour, minute] = booking.time.split(":").map(Number);
    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return false;
    }
    const reminderDate = new Date(year, month - 1, day, hour, minute);
    const diffHours =
      (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return Math.abs(diffHours - hoursBefore) < 0.5;
  });
}

async function markReminderSent(
  id: string,
  type: "24h" | "2h"
): Promise<boolean> {
  const booking = await get(id);
  if (!booking) return false;

  if (type === "24h") {
    booking.reminderSent24h = true;
  } else {
    booking.reminderSent2h = true;
  }

  await save(booking);
  return true;
}

/**
 * Get all bookings for a specific date (more efficient than getAll + filter)
 */
async function getByDate(date: string): Promise<Booking[]> {
  const bookingIds = (await kv.smembers(BOOKINGS_DATE_KEY(date))) as string[];
  if (!bookingIds.length) return [];

  const keys = bookingIds.map(BOOKING_KEY);
  const results = (await kv.mget(keys)) as (Booking | null)[];

  return results.filter((b): b is Booking => b !== null && b.status !== "cancelled" && b.status !== "rescheduled");
}

/**
 * Check if a specific time slot is available for a given date
 */
async function isTimeSlotAvailable(date: string, time: string): Promise<boolean> {
  const bookingsForDate = await getByDate(date);
  const conflictingBooking = bookingsForDate.find(
    (booking) => booking.time === time && booking.status !== "cancelled" && booking.status !== "rescheduled"
  );
  return !conflictingBooking;
}

export const kvBookingStorage = {
  save,
  get,
  getAll,
  getByDate,
  getDueBookings,
  markReminderSent,
  isTimeSlotAvailable,
};


