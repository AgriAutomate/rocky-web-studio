import { xeroClient } from "./client";
import { getTokenSet, storeTokenSet } from "./token-store";
import { kv } from "@vercel/kv";

/**
 * Xero API Helper Functions
 * 
 * Utilities for common Xero operations like token management and tenant retrieval
 */

const TENANT_KEY = (userId: string) => `xero:tenant:${userId}`;
export const DEFAULT_USER_ID = "default";

/**
 * Get tenant ID for a user
 */
export async function getTenantId(userId: string = DEFAULT_USER_ID): Promise<string | null> {
  const tenantData = await kv.get<{ tenantId: string }>(TENANT_KEY(userId));
  return tenantData?.tenantId || null;
}

/**
 * Ensure Xero client is authenticated with valid tokens
 * Automatically refreshes tokens if expired
 */
export async function ensureAuthenticated(
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  // Get stored token set
  const storedTokenSet = await getTokenSet(userId);

  if (!storedTokenSet) {
    throw new Error("Xero not connected. Please connect Xero first.");
  }

  // Set token in client
  await xeroClient.setTokenSet({
    access_token: storedTokenSet.access_token,
    refresh_token: storedTokenSet.refresh_token,
    expires_in: storedTokenSet.expires_in,
    id_token: storedTokenSet.id_token,
    token_type: storedTokenSet.token_type,
    scope: storedTokenSet.scope,
  });

  // Read token set from client to check expiration
  const tokenSet = await xeroClient.readTokenSet();

  if (!tokenSet) {
    throw new Error("Failed to read token set from Xero client");
  }

  // Check if token is expired and refresh if needed
  if (tokenSet.expired()) {
    console.log("[Xero] Token expired, refreshing...");
    await xeroClient.refreshToken();

    // Read refreshed token set
    const refreshedTokenSet = await xeroClient.readTokenSet();
    if (!refreshedTokenSet) {
      throw new Error("Failed to refresh Xero token");
    }

    // Store refreshed token set
    let expiresIn = 0;
    if (refreshedTokenSet.expires_in) {
      if (typeof refreshedTokenSet.expires_in === 'function') {
        expiresIn = refreshedTokenSet.expires_in();
      } else if (typeof refreshedTokenSet.expires_in === 'number') {
        expiresIn = refreshedTokenSet.expires_in;
      }
    }

    await storeTokenSet(userId, {
      access_token: refreshedTokenSet.access_token || "",
      refresh_token: refreshedTokenSet.refresh_token || "",
      expires_in: expiresIn,
      id_token: refreshedTokenSet.id_token || undefined,
      token_type: refreshedTokenSet.token_type || "Bearer",
      scope: refreshedTokenSet.scope || "",
    });

    console.log("[Xero] Token refreshed successfully");
  }
}

/**
 * Get authenticated tenant ID
 * Ensures authentication before returning tenant ID
 */
export async function getAuthenticatedTenantId(
  userId: string = DEFAULT_USER_ID
): Promise<string> {
  await ensureAuthenticated(userId);
  const tenantId = await getTenantId(userId);

  if (!tenantId) {
    throw new Error("No Xero tenant found. Please reconnect Xero.");
  }

  return tenantId;
}

