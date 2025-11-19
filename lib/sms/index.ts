import type { SMSProvider, SendSMSParams, SMSResponse } from "./types";
import { KudosityProvider } from "./providers/kudosity";
import { TwilioProvider } from "./providers/twilio";

/**
 * Get the SMS provider based on environment configuration
 * Defaults to Kudosity for Rocky Web Studio
 */
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || "kudosity";

  switch (provider.toLowerCase()) {
    case "twilio":
      return new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        defaultFrom: process.env.TWILIO_FROM_NUMBER,
      });

    case "kudosity":
    default:
      return new KudosityProvider({
        apiKey: process.env.KUDOSITY_API_KEY || "",
        apiSecret: process.env.KUDOSITY_API_SECRET || "",
        defaultFrom: process.env.KUDOSITY_FROM_NAME || "RockyWeb",
      });
  }
}

/**
 * Convenience function to send SMS using the configured provider
 */
export async function sendSMS(
  params: SendSMSParams
): Promise<SMSResponse> {
  const provider = getSMSProvider();
  return provider.sendSMS(params);
}

/**
 * Convenience function to schedule SMS using the configured provider
 */
export async function scheduleSMS(
  params: Parameters<SMSProvider["scheduleSMS"]>[0]
): Promise<SMSResponse> {
  const provider = getSMSProvider();
  return provider.scheduleSMS(params);
}

// Export types for use in other modules
export type { SMSProvider, SendSMSParams, SMSResponse } from "./types";
export { KudosityProvider } from "./providers/kudosity";
export { TwilioProvider } from "./providers/twilio";

