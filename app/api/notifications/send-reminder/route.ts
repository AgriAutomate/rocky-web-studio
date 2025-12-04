import { NextRequest, NextResponse } from "next/server";
import type { Booking } from "@/lib/bookings/storage";
import { kvBookingStorage } from "@/lib/kv/bookings";
import { sendSMS } from "@/lib/sms";
import {
  generate24HourReminder,
  generate2HourReminder,
  validateMessageLength,
} from "@/lib/sms/messages";

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
      const message = generate24HourReminder(booking);
      const validation = validateMessageLength(message);
      if (!validation.valid && validation.warning) {
        console.warn("[SMS] 24h reminder length warning:", validation.warning);
      }
      return message;
    },
  },
  {
    hoursBefore: 2,
    flag: "reminderSent2h",
    template: (booking) => {
      const message = generate2HourReminder(booking);
      const validation = validateMessageLength(message);
      if (!validation.valid && validation.warning) {
        console.warn("[SMS] 2h reminder length warning:", validation.warning);
      }
      return message;
    },
  },
];

const sendReminder = async (
  booking: Booking,
  config: ReminderConfig
): Promise<ReminderResult> => {
  try {
    const message = config.template(booking);
    const result = await sendSMS(booking.phone, message, `${booking.bookingId}-${config.flag}`);
    if (result.success) {
      await kvBookingStorage.markReminderSent(booking.id, config.flag === "reminderSent24h" ? "24h" : "2h");
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

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const dueReminders: Array<{ booking: Booking; config: ReminderConfig }> = [];

    for (const config of reminderConfigs) {
      const eligibleBookings = await kvBookingStorage.getDueBookings(
        config.hoursBefore
      );
      eligibleBookings
        .filter((booking) => !booking[config.flag])
        .forEach((booking) => dueReminders.push({ booking, config }));
    }

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