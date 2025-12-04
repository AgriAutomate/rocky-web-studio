import { NextRequest, NextResponse } from "next/server";
import { xeroClient } from "@/lib/xero/client";
import { storeTokenSet } from "@/lib/xero/token-store";
import { kv } from "@vercel/kv";

/**
 * Xero OAuth Callback Route
 * 
 * GET /api/xero/callback?code=xxx&state=xxx
 * 
 * Handles the OAuth callback from Xero by:
 * 1. Extracting the authorization code from query params
 * 2. Exchanging code for tokens
 * 3. Storing tokens in KV
 * 4. Getting tenant connections
 * 5. Storing the first tenant ID
 * 6. Redirecting to settings page
 */

// Store tenant ID separately (key: xero:tenant:{userId})
const TENANT_KEY = (userId: string) => `xero:tenant:${userId}`;

// For now, we'll use a default userId. In production, this should come from session/auth
const DEFAULT_USER_ID = "default";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Handle OAuth errors from Xero
    if (error) {
      console.error("[Xero Callback] OAuth error:", {
        error,
        errorDescription,
      });

      const settingsUrl = new URL("/admin/settings", request.url);
      settingsUrl.searchParams.set("xero", "error");
      if (errorDescription) {
        settingsUrl.searchParams.set(
          "message",
          encodeURIComponent(errorDescription)
        );
      }

      return NextResponse.redirect(settingsUrl.toString());
    }

    // Validate authorization code
    if (!code) {
      console.error("[Xero Callback] Missing authorization code");
      const settingsUrl = new URL("/admin/settings", request.url);
      settingsUrl.searchParams.set("xero", "error");
      settingsUrl.searchParams.set(
        "message",
        encodeURIComponent("Authorization code not found")
      );

      return NextResponse.redirect(settingsUrl.toString());
    }

    // Exchange authorization code for tokens
    // apiCallback sets the token internally, then we read it
    await xeroClient.apiCallback(request.url);
    const tokenSet = await xeroClient.readTokenSet();

    if (!tokenSet) {
      throw new Error("Failed to obtain token set from Xero");
    }

    // Store token set in KV
    // Note: In production, userId should come from authenticated session
    const userId = DEFAULT_USER_ID;
    
    // Extract token data from TokenSet object
    // expires_in can be a method or number
    let expiresIn = 0;
    if (tokenSet.expires_in) {
      if (typeof tokenSet.expires_in === 'function') {
        expiresIn = (tokenSet.expires_in as () => number)();
      } else if (typeof tokenSet.expires_in === 'number') {
        expiresIn = tokenSet.expires_in;
      }
    }
    
    await storeTokenSet(userId, {
      access_token: tokenSet.access_token || "",
      refresh_token: tokenSet.refresh_token || "",
      expires_in: expiresIn,
      id_token: tokenSet.id_token || undefined,
      token_type: tokenSet.token_type || "Bearer",
      scope: tokenSet.scope || "",
    });

    // Get tenant connections
    await xeroClient.updateTenants();

    // Get the first tenant (most users have one organization)
    const tenants = xeroClient.tenants;
    if (tenants && tenants.length > 0) {
      const firstTenant = tenants[0];
      const tenantId = firstTenant.tenantId;

      if (tenantId) {
        // Store tenant ID in KV
        await kv.set(TENANT_KEY(userId), {
          tenantId,
          tenantName: firstTenant.tenantName,
          tenantType: firstTenant.tenantType,
          createdDateUtc: firstTenant.createdDateUtc,
        });
      }
    }

    // Redirect to settings page with success parameter
    const settingsUrl = new URL("/admin/settings", request.url);
    settingsUrl.searchParams.set("xero", "connected");

    return NextResponse.redirect(settingsUrl.toString());
  } catch (error: unknown) {
    console.error("[Xero Callback] Error processing callback:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to complete Xero connection";

    const settingsUrl = new URL("/admin/settings", request.url);
    settingsUrl.searchParams.set("xero", "error");
    settingsUrl.searchParams.set("message", encodeURIComponent(errorMessage));

    return NextResponse.redirect(settingsUrl.toString());
  }
}

