import { NextResponse } from "next/server";
import { getTokenSet } from "@/lib/xero/token-store";
import { kv } from "@vercel/kv";

/**
 * Xero Status Route
 * 
 * GET /api/xero/status
 * 
 * Returns the current Xero connection status
 */

const TENANT_KEY = (userId: string) => `xero:tenant:${userId}`;
const DEFAULT_USER_ID = "default";

interface XeroStatusResponse {
  connected: boolean;
  organizationName?: string;
  tenantId?: string;
  lastSync?: string;
}

export async function GET(): Promise<NextResponse<XeroStatusResponse>> {
  try {
    const userId = DEFAULT_USER_ID;

    // Check if tokens exist
    const tokenSet = await getTokenSet(userId);
    const isConnected = tokenSet !== null;

    if (!isConnected) {
      return NextResponse.json(
        {
          connected: false,
        },
        { status: 200 }
      );
    }

    // Get tenant information
    const tenantData = await kv.get<{
      tenantId: string;
      tenantName?: string;
      tenantType?: string;
      createdDateUtc?: string;
    }>(TENANT_KEY(userId));

    return NextResponse.json(
      {
        connected: true,
        organizationName: tenantData?.tenantName,
        tenantId: tenantData?.tenantId,
        lastSync: tenantData?.createdDateUtc, // This is when connection was made
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Xero Status] Error:", error);

    return NextResponse.json(
      {
        connected: false,
      },
      { status: 200 } // Return 200 even on error, just show disconnected
    );
  }
}

