import type { SMSProvider, SendSMSParams, SMSResponse } from "./types";
import { MobileMessageProvider } from "./providers/mobileMessage";

/**
 * Get the SMS provider based on environment configuration
 * 
 * Defaults to Mobile Message (mobilemessage.com.au)
 * ACMA-Approved Sender ID: "Rocky Web"
 */
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER || "mobile-message";

  switch (provider.toLowerCase()) {
    case "mobile-message":
    case "mobilemessage":
      return new MobileMessageProvider({
        apiUrl: process.env.MOBILE_MESSAGE_API_URL,
        apiKey: process.env.MOBILE_MESSAGE_API_KEY,
        username: process.env.MOBILE_MESSAGE_API_USERNAME,
        password: process.env.MOBILE_MESSAGE_API_PASSWORD,
        senderId: process.env.MOBILE_MESSAGE_SENDER_ID || "Rocky Web",
      });

    default:
      // Fallback to Mobile Message if unknown provider specified
      return new MobileMessageProvider({
        apiUrl: process.env.MOBILE_MESSAGE_API_URL,
        apiKey: process.env.MOBILE_MESSAGE_API_KEY,
        username: process.env.MOBILE_MESSAGE_API_USERNAME,
        password: process.env.MOBILE_MESSAGE_API_PASSWORD,
        senderId: process.env.MOBILE_MESSAGE_SENDER_ID || "Rocky Web",
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
export { MobileMessageProvider } from "./providers/mobileMessage";

