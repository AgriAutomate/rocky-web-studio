/**
 * SMS Message Templates
 * Optimized for engagement, staying under 160 characters, and service personalization
 */

import { Booking } from "@/lib/bookings/storage";

export interface SMSMessageOptions {
  name: string;
  serviceType: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  bookingId: string;
  isVideoCall?: boolean;
  location?: string;
  meetingLink?: string;
}

/**
 * Generate calendar link (Google Calendar)
 */
export function generateCalendarLink(options: SMSMessageOptions): string {
  const { date, time, serviceType, bookingId } = options;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day || hour === undefined || minute === undefined) {
    throw new Error("Invalid date or time format");
  }
  
  const startDate = new Date(year, month - 1, day, hour, minute);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
  
  const startISO = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endISO = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const title = encodeURIComponent(`${serviceType} - Rocky Web Studio`);
  const details = encodeURIComponent(`Booking ID: ${bookingId}`);
  const location = encodeURIComponent(options.location || "Rocky Web Studio HQ");
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;
}

/**
 * Shorten service name for SMS
 */
function shortenServiceName(serviceType: string): string {
  const shortNames: Record<string, string> = {
    "Website Consultation (1 hour)": "Website Consult",
    "Website Audit (30 min)": "Website Audit",
    "Follow-up Meeting (30 min)": "Follow-up",
  };
  return shortNames[serviceType] || serviceType.substring(0, 20);
}

/**
 * Format date for SMS (DD/MM)
 */
function formatDateShort(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  if (!day || !month) return date;
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`;
}

/**
 * Format time for SMS (HH:MM)
 */
function formatTimeShort(time: string): string {
  return time.substring(0, 5); // HH:mm
}

/**
 * Generate optimized confirmation message (under 160 chars)
 */
export function generateConfirmationMessage(options: SMSMessageOptions): string {
  const { name, serviceType, date, time, bookingId } = options;
  const shortService = shortenServiceName(serviceType);
  const shortDate = formatDateShort(date);
  const shortTime = formatTimeShort(time);
  
  // Base message: "Hi {name}! Confirmed: {service} on {date} at {time}. ID: {bookingId}. Reply with questions - Rocky Web Studio"
  let message = `Hi ${name}! Confirmed: ${shortService} on ${shortDate} at ${shortTime}. ID: ${bookingId}. Reply with questions - Rocky Web Studio`;
  
  // Check length
  if (message.length > 160) {
    // Shorter version without full signature
    message = `Hi ${name}! Confirmed: ${shortService} on ${shortDate} at ${shortTime}. ID: ${bookingId}. Questions? Reply! - Rocky`;
  }
  
  // Add opt-out if space allows (ACMA compliance)
  const withOptOut = `${message} Reply STOP to opt out`;
  if (withOptOut.length <= 160) {
    return withOptOut;
  }
  
  return message;
}

/**
 * Generate confirmation message with calendar link (may exceed 160 chars)
 */
export function generateConfirmationWithCalendar(options: SMSMessageOptions): string {
  const baseMessage = generateConfirmationMessage(options);
  const calendarLink = generateCalendarLink(options);
  
  // If base message + calendar link fits, include it
  const withCalendar = `${baseMessage}\n\nAdd to calendar: ${calendarLink}`;
  
  if (withCalendar.length <= 160) {
    return withCalendar;
  }
  
  // Otherwise, send calendar link in separate message or shorten
  return baseMessage;
}

/**
 * Generate service-specific confirmation message
 */
export function generateServiceSpecificMessage(options: SMSMessageOptions): string {
  const { name, serviceType, date, time, bookingId, isVideoCall, meetingLink, location } = options;
  const shortService = shortenServiceName(serviceType);
  const shortDate = formatDateShort(date);
  const shortTime = formatTimeShort(time);
  
  let message = "";
  
  // Website Consultation - Include prep checklist
  if (serviceType.includes("Website Consultation")) {
    message = `Hi ${name}! Confirmed: ${shortService} on ${shortDate} at ${shortTime}. ID: ${bookingId}. Prep: rockywebstudio.com.au/prep - Rocky`;
  }
  // Website Audit - Request current site URL
  else if (serviceType.includes("Website Audit")) {
    message = `Hi ${name}! Confirmed: ${shortService} on ${shortDate} at ${shortTime}. ID: ${bookingId}. Please share your current site URL - Rocky`;
  }
  // Follow-up Meeting - Reference previous meeting
  else if (serviceType.includes("Follow-up")) {
    message = `Hi ${name}! Follow-up confirmed: ${shortDate} at ${shortTime}. ID: ${bookingId}. We'll continue from last session - Rocky`;
  }
  // Default
  else {
    message = generateConfirmationMessage(options);
  }
  
  // Add location or meeting link
  if (isVideoCall && meetingLink) {
    const withLink = `${message}\n\nJoin: ${meetingLink}`;
    if (withLink.length <= 160) {
      // Try adding opt-out
      const withOptOut = `${withLink} Reply STOP to opt out`;
      if (withOptOut.length <= 160) {
        return withOptOut;
      }
      return withLink;
    }
  } else if (location) {
    const withLocation = `${message}\n\nLocation: ${location}`;
    if (withLocation.length <= 160) {
      // Try adding opt-out
      const withOptOut = `${withLocation} Reply STOP to opt out`;
      if (withOptOut.length <= 160) {
        return withOptOut;
      }
      return withLocation;
    }
  }
  
  // Add opt-out if space allows (ACMA compliance)
  const withOptOut = `${message} Reply STOP to opt out`;
  if (withOptOut.length <= 160) {
    return withOptOut;
  }
  
  return message;
}

/**
 * Generate 24-hour reminder message
 */
export function generate24HourReminder(booking: Booking): string {
  const { service, time } = booking;
  const shortService = shortenServiceName(service);
  const [hour, minute] = time.split(":");
  const timeFormatted = `${hour}:${minute}`;
  
  // Optimized reminder: "Reminder: Your Rocky Web Studio {service} is tomorrow at {time}. Reply CONFIRM or RESCHEDULE"
  let message = `Reminder: Your Rocky Web Studio ${shortService} is tomorrow at ${timeFormatted}. Reply CONFIRM or RESCHEDULE`;
  
  // Check length
  if (message.length > 160) {
    message = `Reminder: ${shortService} tomorrow at ${timeFormatted}. Reply CONFIRM or RESCHEDULE - Rocky`;
  }
  
  // Add opt-out if space allows (ACMA compliance)
  const withOptOut = `${message} Reply STOP to opt out`;
  if (withOptOut.length <= 160) {
    return withOptOut;
  }
  
  return message;
}

/**
 * Generate 2-hour reminder message
 */
export function generate2HourReminder(booking: Booking): string {
  const { service, time } = booking;
  const shortService = shortenServiceName(service);
  const [hour, minute] = time.split(":");
  const timeFormatted = `${hour}:${minute}`;
  
  // Optimized reminder
  let message = `Your ${shortService} starts in 2 hours at ${timeFormatted}. Running late? Reply RESCHEDULE - Rocky`;
  
  // Check length
  if (message.length > 160) {
    message = `${shortService} in 2 hours at ${timeFormatted}. Reply RESCHEDULE if needed - Rocky`;
  }
  
  // Add opt-out if space allows (ACMA compliance)
  const withOptOut = `${message} Reply STOP to opt out`;
  if (withOptOut.length <= 160) {
    return withOptOut;
  }
  
  return message;
}

/**
 * Validate message length and warn if over 160 characters
 */
export function validateMessageLength(message: string): {
  valid: boolean;
  length: number;
  parts: number;
  warning?: string;
} {
  const length = message.length;
  const parts = Math.ceil(length / 160);
  const valid = length <= 160;
  
  let warning: string | undefined;
  if (length > 160) {
    warning = `Message exceeds 160 characters (${length} chars). Will be split into ${parts} SMS parts, increasing cost.`;
  }
  
  return { valid, length, parts, warning };
}

/**
 * Get service-specific additional info
 */
export function getServiceSpecificInfo(serviceType: string): {
  prepChecklist?: string;
  requiresUrl?: boolean;
  isVideoCall?: boolean;
  location?: string;
} {
  if (serviceType.includes("Website Consultation")) {
    return {
      prepChecklist: "https://rockywebstudio.com.au/prep",
      isVideoCall: true, // Default to video call
    };
  }
  
  if (serviceType.includes("Website Audit")) {
    return {
      requiresUrl: true,
      isVideoCall: true,
    };
  }
  
  if (serviceType.includes("Follow-up")) {
    return {
      isVideoCall: true,
    };
  }
  
  return {
    location: "Rocky Web Studio HQ",
  };
}

