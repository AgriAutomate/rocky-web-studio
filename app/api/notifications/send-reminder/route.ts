import { NextRequest, NextResponse } from "next/server";
import { parse, isValid, format } from "date-fns";
import { getAllBookings, markReminderSent } from "@/lib/bookings/storage";
import { sendSMS } from "@/lib/sms";

interface ReminderConfig {
  hoursBefore: number;
  template: (booking: ReturnType<typeof getAllBookings>[number]) => string;
  flag: "reminderSent24h" | "reminderSent2h";
}

const reminderConfigs: ReminderConfig[] = [
  {
    hoursBefore: 24,
    template: (booking) => {
      const [hour, minute] = booking.time.split(":");
      return `Reminder: Your Rocky Web Studio appointment is tomorrow at ${hour}:${minute}. Service: ${booking.serviceType}. See you soon!`;
    },
    flag: "reminderSent24h",
  },
  {
    hoursBefore: 2,
    template: (booking) => {
      const [hour, minute] = booking.time.split(":");
      return `Your appointment with Rocky Web Studio starts in 2 hours at ${hour}:${minute}. Location: Rocky Web Studio. Looking forward to it!`;
    },
    flag: "reminderSent2h",
  },
];

const sendReminder = async (booking: ReturnType<typeof getAllBookings>[number], config: ReminderConfig) => {
  const message = config.template(booking);
  const result = await sendSMS(booking.phone, message, `${booking.bookingId}-${config.flag}`);
  if (result.success) {
    markReminderSent(booking.bookingId, config.flag === "reminderSent24h" ? "24h" : "2h");
  }
  return { booking, config, result };
};

export async function GET(request: NextRequest) {
  const now = new Date();
  const due: any[] = [];

  reminderConfigs.forEach((config) => {
    const candidates = getAllBookings().filter((booking) => {
      if (!booking.smsOptIn) return false;
      if (booking[config.flag]) return false;
      const [hourStr, minuteStr] = booking.time.split(":");
      const [year, month, day] = booking.date.split("-").map(Number);
      const appointment = new Date(year, month - 1, day, Number(hourStr), Number(minuteStr));
      const diffHours = (appointment.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= config.hoursBefore && diffHours > config.hoursBefore - 1;
    });
    due.push(...candidates.map((booking) => ({ booking, config })));
  });

  const responses = [];
  for (const entry of due) {
    const res = await sendReminder(entry.booking, entry.config);
    responses.push(res);
  }

  return NextResponse.json({
    success: true,
    sent: responses.length,
    details: responses.map((r) => ({
      bookingId: r.booking.bookingId,
      config: r.config.flag,
      result: r.result,
    })),
  });
}

