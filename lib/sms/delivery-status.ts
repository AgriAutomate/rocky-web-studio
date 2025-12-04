import { getSMSStorage } from "@/lib/sms/storage";
import { checkMessageStatus } from "@/lib/mobile-message/status";
import { getLogger } from "@/lib/logging";

const deliveryStatusLogger = getLogger("sms.delivery-status");

/**
 * Update SMS record delivery status by checking Mobile Message API
 * 
 * @param messageId - Mobile Message API message_id
 * @returns Updated status or null if not found
 */
export async function updateDeliveryStatus(
  messageId: string
): Promise<"sent" | "delivered" | "failed" | "pending" | null> {
  if (!messageId) {
    deliveryStatusLogger.warn("updateDeliveryStatus called with empty messageId");
    return null;
  }

  try {
    // Check status from Mobile Message API
    const statusResult = await checkMessageStatus(messageId);

    if (!statusResult.success || !statusResult.status) {
      deliveryStatusLogger.warn("Failed to get delivery status", {
        messageId,
        error: statusResult.error,
      });
      return null;
    }

    // Map Mobile Message API status to our status
    const mappedStatus: "sent" | "delivered" | "failed" | "pending" =
      statusResult.status === "delivered"
        ? "delivered"
        : statusResult.status === "failed"
        ? "failed"
        : statusResult.status === "sent"
        ? "sent"
        : "pending";

    // Find SMS record by messageId and update status
    const storage = getSMSStorage();
    const allRecords = await storage.findAll();

    // Find record with matching messageId
    const record = allRecords.find((r) => r.messageId === messageId);

    if (record && record.status !== mappedStatus) {
      // Update status
      const updatedRecord = {
        ...record,
        status: mappedStatus,
      };

      await storage.save(updatedRecord);

      deliveryStatusLogger.info("Updated SMS delivery status", {
        messageId,
        oldStatus: record.status,
        newStatus: mappedStatus,
      });
    }

    return mappedStatus;
  } catch (error) {
    deliveryStatusLogger.error("Error updating delivery status", { messageId }, error);
    return null;
  }
}

/**
 * Batch update delivery status for multiple messages
 * 
 * @param messageIds - Array of Mobile Message API message_ids
 * @returns Map of message_id to updated status
 */
export async function updateBatchDeliveryStatus(
  messageIds: string[]
): Promise<Map<string, "sent" | "delivered" | "failed" | "pending" | null>> {
  const results = new Map<string, "sent" | "delivered" | "failed" | "pending" | null>();

  for (const messageId of messageIds) {
    const status = await updateDeliveryStatus(messageId);
    results.set(messageId, status);
    
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}

