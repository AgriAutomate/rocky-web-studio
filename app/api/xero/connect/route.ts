import { NextRequest, NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";

/**
 * Xero OAuth Connect Route
 * 
 * GET /api/xero/connect
 * 
 * Initiates the Xero OAuth 2.0 flow by:
 * 1. Building the consent URL
 * 2. Redirecting the user to Xero's authorization page
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Build the consent URL for Xero OAuth
    const consentUrl = await xeroClient.buildConsentUrl();

    // Redirect user to Xero authorization page
    return NextResponse.redirect(consentUrl);
  } catch (error: unknown) {
    console.error("[Xero Connect] Error building consent URL:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to initiate Xero connection";

    // Redirect to settings page with error parameter
    const settingsUrl = new URL("/admin/settings", request.url);
    settingsUrl.searchParams.set("xero", "error");
    settingsUrl.searchParams.set("message", encodeURIComponent(errorMessage));

    return NextResponse.redirect(settingsUrl.toString());
  }
}

