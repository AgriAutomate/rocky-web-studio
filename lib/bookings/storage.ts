export interface BookingRecord {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  smsOptIn: boolean;
  reminderSent24h: boolean;
  reminderSent2h: boolean;
  createdAt: string;
}

const bookings: BookingRecord[] = [];

export function saveBooking(record: BookingRecord) {
  bookings.push(record);
}

export function getAllBookings() {
  return bookings;
}

export function getDueBookings(hoursBefore: number) {
  const now = new Date();
  return bookings.filter((booking) => {
    if (!booking.smsOptIn) return false;
    const [hourStr, minuteStr] = booking.time.split(":");
    const [year, month, day] = booking.date.split("-").map(Number);
    const reminderDate = new Date(year, month - 1, day, Number(hourStr), Number(minuteStr));
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.abs(diffHours - hoursBefore) < 0.5; // within 30 mins
  });
}

export function markReminderSent(bookingId: string, type: "24h" | "2h") {
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (booking) {
    if (type === "24h") {
      booking.reminderSent24h = true;
    } else {
      booking.reminderSent2h = true;
    }
  }
}

export function getBooking(bookingId: string) {
  return bookings.find((b) => b.bookingId === bookingId);
}

