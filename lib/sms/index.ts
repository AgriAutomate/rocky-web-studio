import type { SMSProvider, SendSMSParams, SMSResponse } from "./types";
import { TwilioProvider } from "./providers/twilio";

/**
 * Get the SMS provider based on environment configuration
 * NOTE: This provider abstraction is legacy/unused. The active SMS implementation
 * uses Mobile Message API directly via lib/sms.ts
 * 
 * Defaults to Twilio if SMS_PROVIDER is set to "twilio"
 */
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || "twilio";

  switch (provider.toLowerCase()) {
    case "twilio":
      return new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        defaultFrom: process.env.TWILIO_FROM_NUMBER,
      });

    default:
      // Fallback to Twilio if unknown provider specified
      return new TwilioProvider({
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        defaultFrom: process.env.TWILIO_FROM_NUMBER,
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
export { TwilioProvider } from "./providers/twilio";

