import { format, parse, addHours, subHours } from "date-fns";
import { sendSMS, scheduleSMS } from "./index";
import type { SMSResponse } from "./types";
import {
  getSMSStorage,
  calculateSMSCost,
  type SMSRecord,
} from "./storage";

interface BookingDetails {
  bookingId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  serviceType: string;
  name: string;
  phoneNumber: string;
  bookingUrl?: string;
}

/**
 * Extract duration from service type string
 * Example: "Website Consultation (1 hour)" -> "60"
 */
function extractDuration(serviceType: string): string {
  const match = serviceType.match(/(\d+)\s*(hour|min|minute)/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("hour")) {
      return `${value * 60}`;
    }
    return `${value}`;
  }
  return "60"; // Default to 60 minutes
}

/**
 * Format date and time for display
 */
function formatDateTime(date: string, time: string): string {
  try {
    const dateTime = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
    return format(dateTime, "EEE, MMM d 'at' h:mm a");
  } catch {
    return `${date} at ${time}`;
  }
}

/**
 * Send immediate booking confirmation SMS
 */
export async function sendBookingConfirmation(
  booking: BookingDetails
): Promise<SMSResponse> {
  const bookingUrl =
    booking.bookingUrl ||
    `${process.env.NEXT_PUBLIC_BOOKING_URL || "https://rockywebstudio.com.au/book"}/${booking.bookingId}`;

  const duration = extractDuration(booking.serviceType);
  const dateTime = formatDateTime(booking.date, booking.time);

  const message = `✅ Booking confirmed at Rocky Web Studio!

📅 ${dateTime}
📍 ${booking.serviceType} (${duration} min)
🔗 Manage: ${bookingUrl}

See you soon! - Alex`;

  const result = await sendSMS({
    to: booking.phoneNumber,
    body: message,
    from: "RockyWeb",
  });

  // Store SMS record
  const storage = getSMSStorage();
  const record: SMSRecord = {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    messageId: result.messageId || "",
    bookingId: booking.bookingId,
    phoneNumber: booking.phoneNumber,
    messageType: "confirmation",
    status: result.success ? "pending" : "failed",
    cost: calculateSMSCost(message),
    sentAt: new Date(),
    error: result.error,
    createdAt: new Date(),
  };
  await storage.save(record);

  return result;
}

/**
 * Schedule 24-hour reminder SMS
 */
export async function schedule24HourReminder(
  booking: BookingDetails
): Promise<SMSResponse> {
  try {
    const dateTime = parse(
      `${booking.date} ${booking.time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const reminderTime = subHours(dateTime, 24);

    // Don't schedule if reminder time is in the past
    if (reminderTime < new Date()) {
      return {
        success: false,
        messageId: "",
        error: "Reminder time is in the past",
      };
    }

    const bookingUrl =
      booking.bookingUrl ||
      `${process.env.NEXT_PUBLIC_BOOKING_URL || "https://rockywebstudio.com.au/book"}/${booking.bookingId}`;

    const timeFormatted = format(dateTime, "h:mm a");

    const message = `👋 Reminder: Your ${booking.serviceType} is tomorrow at ${timeFormatted}.

📱 Join: ${bookingUrl}

Running late? Reply RESCHEDULE`;

    const result = await scheduleSMS({
      to: booking.phoneNumber,
      body: message,
      from: "RockyWeb",
      scheduleTime: reminderTime,
    });

    // Store SMS record
    const storage = getSMSStorage();
    const record: SMSRecord = {
      id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      messageId: result.messageId || "",
      bookingId: booking.bookingId,
      phoneNumber: booking.phoneNumber,
      messageType: "24hr_reminder",
      status: result.success ? "pending" : "failed",
      cost: calculateSMSCost(message),
      sentAt: new Date(),
      scheduledFor: reminderTime,
      error: result.error,
      createdAt: new Date(),
    };
    await storage.save(record);

    return result;
  } catch (error: any) {
    return {
      success: false,
      messageId: "",
      error: error?.message || "Failed to schedule 24-hour reminder",
    };
  }
}

/**
 * Schedule 1-hour reminder SMS
 */
export async function schedule1HourReminder(
  booking: BookingDetails
): Promise<SMSResponse> {
  try {
    const dateTime = parse(
      `${booking.date} ${booking.time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const reminderTime = subHours(dateTime, 1);

    // Don't schedule if reminder time is in the past
    if (reminderTime < new Date()) {
      return {
        success: false,
        messageId: "",
        error: "Reminder time is in the past",
      };
    }

    const bookingUrl =
      booking.bookingUrl ||
      `${process.env.NEXT_PUBLIC_BOOKING_URL || "https://rockywebstudio.com.au/book"}/${booking.bookingId}`;

    const timeFormatted = format(dateTime, "h:mm a");

    const message = `⏰ Starting soon! Your call begins in 1 hour (${timeFormatted}).

Join now: ${bookingUrl}`;

    const result = await scheduleSMS({
      to: booking.phoneNumber,
      body: message,
      from: "RockyWeb",
      scheduleTime: reminderTime,
    });

    // Store SMS record
    const storage = getSMSStorage();
    const record: SMSRecord = {
      id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      messageId: result.messageId || "",
      bookingId: booking.bookingId,
      phoneNumber: booking.phoneNumber,
      messageType: "1hr_reminder",
      status: result.success ? "pending" : "failed",
      cost: calculateSMSCost(message),
      sentAt: new Date(),
      scheduledFor: reminderTime,
      error: result.error,
      createdAt: new Date(),
    };
    await storage.save(record);

    return result;
  } catch (error: any) {
    return {
      success: false,
      messageId: "",
      error: error?.message || "Failed to schedule 1-hour reminder",
    };
  }
}

