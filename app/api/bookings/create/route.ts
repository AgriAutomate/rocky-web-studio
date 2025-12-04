import { format, parse, isValid } from "date-fns";
import { NextRequest } from "next/server";
import type { Booking } from "@/lib/bookings/storage";
import { kvBookingStorage } from "@/lib/kv/bookings";
import { sendSMS } from "@/lib/sms";
import { logSMSAttempt } from "@/lib/sms/storage";
import { getLogger } from "@/lib/logging";
import { withApiHandler } from "@/lib/api/handlers";
import { ValidationError, ExternalServiceError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import {
  generateServiceSpecificMessage,
  validateMessageLength,
  getServiceSpecificInfo,
} from "@/lib/sms/messages";
import { getFromAddress, getReplyToAddress } from "@/lib/email/config";

const resendApiKey = process.env.RESEND_API_KEY;
const bookingLogger = getLogger("bookings.create");

interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string;
  smsOptIn?: boolean;
}

interface BookingEmailDetails {
  bookingId: string;
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
}

async function sendBookingConfirmationEmail(details: BookingEmailDetails) {
  if (!resendApiKey) {
    bookingLogger.warn("Skipping confirmation email — RESEND_API_KEY is not configured.", {
      bookingId: details.bookingId,
    });
    return;
  }

  const formattedDate = format(details.appointmentDate, "EEEE, MMMM d, yyyy");
  const subject = "Booking Confirmation - Rocky Web Studio";
  const textBody = `
Hi ${details.customerName},

Your booking with Rocky Web Studio has been confirmed.

Booking details
• Date: ${formattedDate}
• Time: ${details.appointmentTime}
• Service: ${details.serviceType}
• Booking ID: ${details.bookingId}

Location & contact
Rocky Web Studio HQ
bookings@rockywebstudio.com.au

Thanks,
The Rocky Web Studio Team
  `.trim();

  const htmlBody = `
    <p>Hi ${details.customerName},</p>
    <p>Thank you for booking with Rocky Web Studio. Here are the confirmed details:</p>
    <ul>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${details.appointmentTime}</li>
      <li><strong>Service:</strong> ${details.serviceType}</li>
      <li><strong>Booking ID:</strong> ${details.bookingId}</li>
    </ul>
    <p>Location & contact:<br/>Rocky Web Studio HQ<br/>bookings@rockywebstudio.com.au</p>
    <p>Looking forward to talking soon.<br/>– The Rocky Web Studio Team</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress("bookings"),
        replyTo: getReplyToAddress("bookings"),
        to: details.email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Resend email failed",
        response.status,
        response.statusText,
        errorText
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    bookingLogger.error("Resend email error", { bookingId: details.bookingId, errorMessage: message }, error);
  }
}

async function handlePost(request: NextRequest, requestId: string) {
  // Check rate limit: 10 requests per minute per IP
  const rateLimitResponse = await checkRateLimit(request, {
    limit: RATE_LIMITS.BOOKING_CREATE.limit,
    windowSeconds: RATE_LIMITS.BOOKING_CREATE.windowSeconds,
    keyPrefix: RATE_LIMITS.BOOKING_CREATE.keyPrefix,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = (await request.json()) as BookingRequest;

    // Validate required fields
    const requiredFields: Array<keyof BookingRequest> = [
      "date",
      "time",
      "name",
      "email",
      "phone",
      "serviceType",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      throw new ValidationError("Missing required fields", { missingFields });
    }

    const {
      date,
      time,
      name,
      email,
      phone,
      serviceType,
      message: _message,
      smsOptIn = false,
    } = body as BookingRequest;

    const appointmentDate = parse(date, "yyyy-MM-dd", new Date());
    if (!isValid(appointmentDate)) {
      throw new ValidationError("Invalid date format. Use YYYY-MM-DD");
    }

    // Validate time format (HH:00)
    const timeRegex = /^([0-1][0-9]|2[0-3]):00$/;
    if (!timeRegex.test(time)) {
      throw new ValidationError(
        "Invalid time format. Use HH:00 (e.g., 09:00, 14:00)"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    // Generate bookingId and persist to KV-backed storage
    const bookingId = `BK${Date.now()}`;

            try {
              const now = new Date();
              await kvBookingStorage.save({
                id: bookingId,
                bookingId,
                customerName: name,
                email,
                phone,
                service: serviceType,
                date,
                time,
                status: "confirmed",
                history: [
                  {
                    timestamp: now,
                    action: "created",
                    changedBy: "user",
                    details: {},
                  },
                ],
                createdAt: now,
                updatedAt: now,
                reminderSent24h: false,
                reminderSent2h: false,
                smsOptIn,
              } satisfies Booking);
    } catch {
      throw new ExternalServiceError(
        "Failed to save booking. Please try again.",
        { requestId }
      );
    }

    await sendBookingConfirmationEmail({
      bookingId,
      customerName: name,
      email,
      serviceType,
      appointmentDate,
      appointmentTime: time,
    });

    // Send SMS confirmation if customer opted in
    let smsStatus: "sent" | "failed" | "pending" | null = null;
    let smsError: string | undefined = undefined;
    let smsMessageId: string | undefined = undefined;

    if (smsOptIn && phone) {
      try {
        // Get service-specific info
        const serviceInfo = getServiceSpecificInfo(serviceType);
        
        // Generate optimized SMS message
        const smsMessage = generateServiceSpecificMessage({
          name,
          serviceType,
          date,
          time,
          bookingId,
          isVideoCall: serviceInfo.isVideoCall,
          location: serviceInfo.location,
        });

        // Validate message length
        const validation = validateMessageLength(smsMessage);
        if (!validation.valid && validation.warning) {
          bookingLogger.warn("SMS message length warning", {
            bookingId,
            warning: validation.warning,
          });
        }

        // Log SMS attempt before sending
        await logSMSAttempt({
          bookingId,
          phoneNumber: phone,
          message: smsMessage,
          messageType: "confirmation",
          status: "pending", // Will update after API call
        });

              const smsResult = await sendSMS(phone, smsMessage, bookingId);

              if (smsResult.success) {
                // Extract messageId from Mobile Message API response
                smsMessageId = smsResult.data?.messages?.[0]?.message_id || "";
                smsStatus = "sent";

                // Log successful SMS send with messageId for delivery tracking
                await logSMSAttempt({
                  bookingId,
                  phoneNumber: phone,
                  message: smsMessage,
                  messageType: "confirmation",
                  status: "sent",
                  messageId: smsMessageId, // Store for delivery status tracking
                });

          bookingLogger.info("SMS sent successfully", {
            bookingId,
            messageId: smsMessageId,
            phonePreview:
              phone.substring(0, 4) + "***" + phone.substring(phone.length - 3),
          });
        } else {
          smsStatus = "failed";
          smsError = smsResult.error || `HTTP ${smsResult.status}`;
          
          // Log failed SMS attempt
          await logSMSAttempt({
            bookingId,
            phoneNumber: phone,
            message: smsMessage,
            messageType: "confirmation",
            status: "failed",
            error: smsError,
          });

          bookingLogger.error(
            "SMS failed to send",
            {
              bookingId,
              status: smsResult.status,
              error: smsError,
              phonePreview:
                phone.substring(0, 4) + "***" + phone.substring(phone.length - 3),
            }
          );
        }
      } catch (smsException: unknown) {
        // Log exception as failed SMS attempt
        const errorMessage = smsException instanceof Error ? smsException.message : String(smsException);
        smsStatus = "failed";
        smsError = errorMessage;
        
        await logSMSAttempt({
          bookingId,
          phoneNumber: phone,
          message: `Hi ${name}! Your Rocky Web Studio booking is confirmed...`, // Partial message for logging
          messageType: "confirmation",
          status: "failed",
          error: errorMessage,
        });

        bookingLogger.error("SMS exception while sending", {
          bookingId,
          error: errorMessage,
          phonePreview:
            phone.substring(0, 4) + "***" + phone.substring(phone.length - 3),
        });
      }
    }

    bookingLogger.info("Booking created successfully", {
      bookingId,
      serviceType,
      smsStatus,
      requestId,
    });

    return {
      bookingId,
      message: "Booking created successfully",
      sms:
        smsOptIn && phone
          ? {
              status: smsStatus,
              messageId: smsMessageId,
              error: smsError,
            }
          : undefined,
    };
}

export const POST = withApiHandler(handlePost);
