export interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  createdAt: Date;
  reminderSent24h: boolean;
  reminderSent2h: boolean;
  smsOptIn: boolean;
}

const bookings = new Map<string, Booking>();

export function saveBooking(record: Booking): Booking {
  bookings.set(record.id, record);
  return record;
}

export function getAllBookings(): Booking[] {
  return Array.from(bookings.values());
}

export function getBooking(id: string): Booking | undefined {
  return bookings.get(id);
}

export function markReminderSent(id: string, type: "24h" | "2h"): boolean {
  const record = bookings.get(id);
  if (!record) return false;
  if (type === "24h") {
    record.reminderSent24h = true;
  } else {
    record.reminderSent2h = true;
  }
  bookings.set(id, record);
  return true;
}

export function getDueBookings(hoursBefore: number): Booking[] {
  const now = new Date();
  return Array.from(bookings.values()).filter((booking) => {
    if (!booking.smsOptIn) return false;
    const [year, month, day] = booking.date.split("-").map(Number);
    const [hour, minute] = booking.time.split(":").map(Number);
    const reminderDate = new Date(year, month - 1, day, hour, minute);
    const diffHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return Math.abs(diffHours - hoursBefore) < 0.5;
  });
}

