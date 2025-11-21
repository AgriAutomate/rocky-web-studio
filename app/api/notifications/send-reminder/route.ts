import { NextRequest, NextResponse } from "next/server";
import { Booking, getAllBookings, markReminderSent } from "@/lib/bookings/storage";
import { sendSMS } from "@/lib/sms";

type ReminderFlag = "reminderSent24h" | "reminderSent2h";

interface ReminderConfig {
  hoursBefore: number;
  flag: ReminderFlag;
  template: (booking: Booking) => string;
}

interface ReminderResult {
  bookingId: string;
  flag: ReminderFlag;
  success: boolean;
  error?: string;
}

const reminderConfigs: ReminderConfig[] = [
  {
    hoursBefore: 24,
    flag: "reminderSent24h",
    template: (booking) => {
      const [hour, minute] = booking.time.split(":");
      return `👋 Reminder: Your ${booking.service} is tomorrow at ${hour}:${minute}. 📱 Reply RESCHEDULE if needed.`;
    },
  },
  {
    hoursBefore: 2,
    flag: "reminderSent2h",
    template: (booking) => {
      const [hour, minute] = booking.time.split(":");
      return `⏰ Your ${booking.service} appointment starts in 2 hours at ${hour}:${minute}. Running late? Reply RESCHEDULE.`;
    },
  },
];

const calculateAppointmentDate = (booking: Booking): Date => {
  const [year, month, day] = booking.date.split("-").map(Number);
  const [hour, minute] = booking.time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

const sendReminder = async (
  booking: Booking,
  config: ReminderConfig
): Promise<ReminderResult> => {
  try {
    const message = config.template(booking);
    const result = await sendSMS(booking.phone, message, `${booking.bookingId}-${config.flag}`);
    if (result.success) {
      markReminderSent(booking.id, config.flag === "reminderSent24h" ? "24h" : "2h");
    }
    return {
      bookingId: booking.bookingId,
      flag: config.flag,
      success: result.success,
      error: result.error,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SMS reminder error";
    return {
      bookingId: booking.bookingId,
      flag: config.flag,
      success: false,
      error: message,
    };
  }
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const now = new Date();
    const dueReminders: Array<{ booking: Booking; config: ReminderConfig }> = [];

    reminderConfigs.forEach((config) => {
      const eligibleBookings = getAllBookings().filter((booking) => {
        if (!booking.smsOptIn) return false;
        if (booking[config.flag]) return false;
        const appointment = calculateAppointmentDate(booking);
        const diffHours = (appointment.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours <= config.hoursBefore && diffHours > config.hoursBefore - 1;
      });
      eligibleBookings.forEach((booking) => dueReminders.push({ booking, config }));
    });

    const outcomes: ReminderResult[] = [];
    for (const entry of dueReminders) {
      const outcome = await sendReminder(entry.booking, entry.config);
      outcomes.push(outcome);
    }

    return NextResponse.json({
      success: true,
      total: outcomes.length,
      outcomes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected reminder error";
    console.error("Reminder job failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}