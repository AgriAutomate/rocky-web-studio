import { NextRequest, NextResponse } from "next/server";
import { updateDeliveryStatus, updateBatchDeliveryStatus } from "@/lib/sms/delivery-status";
import { getLogger } from "@/lib/logging";

const statusLogger = getLogger("admin.sms.status");

/**
 * Check and update SMS delivery status
 * 
 * POST /api/admin/sms/check-status
 * Body: { messageId?: string, messageIds?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, messageIds } = body;

    if (messageId) {
      // Single message status check
      const status = await updateDeliveryStatus(messageId);
      
      return NextResponse.json({
        success: true,
        messageId,
        status: status || "not_found",
      });
    }

    if (messageIds && Array.isArray(messageIds)) {
      // Batch status check
      const results = await updateBatchDeliveryStatus(messageIds);
      
      const statusMap: Record<string, string> = {};
      results.forEach((status, id) => {
        statusMap[id] = status || "not_found";
      });

      return NextResponse.json({
        success: true,
        results: statusMap,
        total: messageIds.length,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Either messageId or messageIds array is required",
      },
      { status: 400 }
    );
  } catch (error) {
    statusLogger.error("Error checking SMS status", undefined, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

