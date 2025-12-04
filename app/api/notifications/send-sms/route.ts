import { NextRequest } from "next/server";
import { sendSMS } from "@/lib/sms";
import { withApiHandler } from "@/lib/api/handlers";
import { ValidationError, ExternalServiceError, TimeoutError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

async function handlePost(request: NextRequest, requestId: string) {
  const body = await request.json();

  const { to, customerName, date, time, service } = body ?? {};

  // Check rate limit: 100 requests per day per phone number
  // Use phone number as identifier to prevent SMS bombing
  const rateLimitResponse = await checkRateLimit(request, {
    limit: RATE_LIMITS.SMS_SEND.limit,
    windowSeconds: RATE_LIMITS.SMS_SEND.windowSeconds,
    keyPrefix: RATE_LIMITS.SMS_SEND.keyPrefix,
    identifierExtractor: () => to || getClientIp(request), // Use phone number if available, fallback to IP
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const missing: string[] = [];
  if (!to) missing.push("to");
  if (!customerName) missing.push("customerName");
  if (!date) missing.push("date");
  if (!time) missing.push("time");
  if (!service) missing.push("service");

  if (missing.length > 0) {
    throw new ValidationError("Missing required fields", {
      missingFields: missing,
    });
  }

  const message = `Hi ${customerName}! Your Rocky Web Studio booking is confirmed for ${date} at ${time}. Service: ${service}. Questions? Reply to this SMS. Thanks!`;

  try {
    const result = await sendSMS(to, message, `booking_${Date.now()}`);

    if (!result.success) {
      throw new ExternalServiceError("Failed to send SMS", {
        status: result.status,
      });
    }

    return {
      message: "SMS sent successfully",
      providerStatus: result.status,
    };
  } catch (err: unknown) {
    if (err instanceof Error && /timeout/i.test(err.message)) {
      throw new TimeoutError("SMS provider timeout. Please retry.", {
        requestId,
      });
    }

    throw err;
  }
}

export const POST = withApiHandler(handlePost);