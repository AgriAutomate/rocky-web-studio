import type { MobileMessageResponse } from "@/lib/sms";
import { sendSMS } from "@/lib/sms";
import { getMobileMessageConfig, isMobileMessageConfigured } from "@/lib/env";
import { getLogger } from "@/lib/logging";

const clientLogger = getLogger("mobile-message.client");

/**
 * Mobile Message API Client
 * 
 * Wrapper functions for sending SMS via Mobile Message API
 */

export interface SendMobileMessageParams {
  to: string;
  message: string;
  sender?: string;
  customRef?: string;
}

/**
 * Send SMS via Mobile Message API
 * 
 * If sender is specified, makes a direct API call to allow custom sender.
 * Otherwise, uses the standard sendSMS function which uses MOBILE_MESSAGE_SENDER_ID.
 * 
 * @param params - SMS parameters
 * @returns API response
 */
export async function sendMobileMessage(
  params: SendMobileMessageParams
): Promise<MobileMessageResponse> {
  // If custom sender is specified, make direct API call
  if (params.sender) {
    return sendSMSWithCustomSender(params);
  }
  
  // Otherwise use standard sendSMS (uses MOBILE_MESSAGE_SENDER_ID from env)
  return sendSMS(params.to, params.message, params.customRef);
}

/**
 * Send SMS with custom sender ID via direct API call
 */
async function sendSMSWithCustomSender(
  params: SendMobileMessageParams
): Promise<MobileMessageResponse> {
  // Validate environment variables
  if (!isMobileMessageConfigured()) {
    clientLogger.error("Mobile Message API environment variables not configured", {
      hasUsername: !!process.env.MOBILE_MESSAGE_API_USERNAME,
      hasPassword: !!process.env.MOBILE_MESSAGE_API_PASSWORD,
      hasSenderId: !!process.env.MOBILE_MESSAGE_SENDER_ID,
      hasApiUrl: !!process.env.MOBILE_MESSAGE_API_URL,
    });
    
    return {
      success: false,
      status: 500,
      error: "Mobile Message API credentials not configured. Please set MOBILE_MESSAGE_API_USERNAME, MOBILE_MESSAGE_API_PASSWORD, and MOBILE_MESSAGE_SENDER_ID environment variables.",
    };
  }

  let config;
  try {
    config = getMobileMessageConfig();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    clientLogger.error("Failed to get Mobile Message API configuration", {
      error: errorMessage,
    });
    
    return {
      success: false,
      status: 500,
      error: `Mobile Message API configuration error: ${errorMessage}`,
    };
  }

  const { apiUrl: baseURL, username, password } = config;

  try {
    // Build auth header
    const credentials = `${username}:${password}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    // Build payload
    const payload = {
      enable_unicode: true,
      messages: [
        {
          to: params.to,
          message: params.message,
          sender: params.sender,
          custom_ref: params.customRef,
        },
      ],
    };

    // Make API call (baseURL is already trimmed and normalized by getMobileMessageConfig)
    const apiUrl = `${baseURL}/messages`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      status: response.status,
      data: data,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      status: 500,
      error: `Failed to send SMS: ${errorMessage}`,
    };
  }
}

