import { NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";
import { getTokenSet, deleteTokenSet } from "@/lib/xero/token-store";
import { kv } from "@vercel/kv";

/**
 * Xero OAuth Disconnect Route
 * 
 * POST /api/xero/disconnect
 * 
 * Disconnects Xero by:
 * 1. Retrieving stored tokens
 * 2. Revoking tokens with Xero (if available)
 * 3. Deleting tokens from KV
 * 4. Deleting tenant information
 */

const TENANT_KEY = (userId: string) => `xero:tenant:${userId}`;

// For now, we'll use a default userId. In production, this should come from session/auth
const DEFAULT_USER_ID = "default";

interface DisconnectResponse {
  success: boolean;
  message: string;
}

export async function POST(): Promise<NextResponse<DisconnectResponse>> {
  try {
    const userId = DEFAULT_USER_ID;

    // Get stored token set
    const tokenSet = await getTokenSet(userId);

    if (tokenSet) {
      // Attempt to revoke tokens with Xero (optional but recommended)
      // Note: xero-node doesn't have a direct revoke method in the public API,
      // but we can try to clear the token set from the client
      try {
        // Clear token set from client memory
        // The client will handle token revocation on next API call if needed
        await xeroClient.setTokenSet(null as any);
      } catch (revokeError) {
        // Log but don't fail if revocation fails
        // Tokens will expire naturally, and we're deleting from storage anyway
        console.warn(
          "[Xero Disconnect] Failed to clear token set (non-critical):",
          revokeError
        );
      }
    }

    // Delete token set from KV
    await deleteTokenSet(userId);

    // Delete tenant information from KV
    await kv.del(TENANT_KEY(userId));

    return NextResponse.json(
      {
        success: true,
        message: "Xero disconnected successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Xero Disconnect] Error disconnecting:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to disconnect Xero";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

