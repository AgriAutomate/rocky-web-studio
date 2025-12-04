import { getLogger } from "@/lib/logging";

const statusLogger = getLogger("mobile-message.status");

const baseURL =
  process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
const username = process.env.MOBILE_MESSAGE_API_USERNAME;
const password = process.env.MOBILE_MESSAGE_API_PASSWORD;

const authHeader = () => {
  if (!username || !password) {
    throw new Error("Mobile Message API credentials not configured");
  }
  const creds = `${username}:${password}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
};

export interface MessageStatusResponse {
  message_id: string;
  status: "sent" | "delivered" | "failed" | "pending";
  recipient?: string;
  sent_at?: string;
  delivered_at?: string;
  error?: string;
}

export interface CheckStatusResult {
  success: boolean;
  status?: MessageStatusResponse["status"];
  error?: string;
}

/**
 * Check delivery status of a message from Mobile Message API
 * 
 * @param messageId - Mobile Message API message_id
 * @returns Status check result with delivery status
 */
export async function checkMessageStatus(messageId: string): Promise<CheckStatusResult> {
  if (!messageId) {
    return {
      success: false,
      error: "Message ID is required",
    };
  }

  try {
    const apiUrl = `${baseURL}/messages/${messageId}`;
    
    statusLogger.debug("Checking message status", {
      messageId,
      apiUrl,
    });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      
      if (response.status === 404) {
        statusLogger.warn("Message not found", { messageId });
        return {
          success: false,
          error: "Message not found",
        };
      }

      statusLogger.error("Failed to check message status", {
        messageId,
        status: response.status,
        error: text,
      });

      return {
        success: false,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = (await response.json()) as MessageStatusResponse;
    
    statusLogger.info("Message status retrieved", {
      messageId,
      status: data.status,
      recipient: data.recipient,
    });

    return {
      success: true,
      status: data.status,
    };
  } catch (error) {
    statusLogger.error("Error checking message status", { messageId }, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch check delivery status for multiple messages
 * 
 * @param messageIds - Array of Mobile Message API message_ids
 * @returns Map of message_id to status
 */
export async function checkBatchStatus(
  messageIds: string[]
): Promise<Map<string, CheckStatusResult>> {
  const results = new Map<string, CheckStatusResult>();

  // Check each message status (Mobile Message API may not support batch status)
  // For now, check individually
  for (const messageId of messageIds) {
    const result = await checkMessageStatus(messageId);
    results.set(messageId, result);
    
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

