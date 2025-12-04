import { xeroClient } from "./client";
import { getTokenSet, storeTokenSet } from "./token-store";
import { kv } from "@vercel/kv";
import { getLogger } from "@/lib/logging";
import { AuthenticationError, ExternalServiceError } from "@/lib/errors";

const xeroLogger = getLogger("xero.helpers");

/**
 * Xero API Helper Functions
 * 
 * Utilities for common Xero operations like token management and tenant retrieval
 */

const TENANT_KEY = (userId: string) => `xero:tenant:${userId}`;
const REFRESH_LOCK_KEY = (userId: string) =>
  `xero:token:refresh-lock:${userId}`;
export const DEFAULT_USER_ID = "default";

const FIVE_MINUTES = 5 * 60; // seconds

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    throw new AuthenticationError(
      "Xero not connected. Please connect Xero first."
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);

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
    throw new ExternalServiceError("Failed to read Xero token from client");
  }

  // Determine if we should refresh the token:
  // - Prefer proactive refresh based on obtained_at + expires_in - 5 minutes
  // - Fallback to tokenSet.expired() if we don't have timing metadata
  let shouldRefresh = false;

  if (storedTokenSet.obtained_at && storedTokenSet.expires_in) {
    const expiresAt = storedTokenSet.obtained_at + storedTokenSet.expires_in;
    shouldRefresh = nowSec >= expiresAt - FIVE_MINUTES;
  } else if (typeof tokenSet.expired === "function" && tokenSet.expired()) {
    shouldRefresh = true;
  }

  if (!shouldRefresh) {
    return;
  }

  const lockKey = REFRESH_LOCK_KEY(userId);
  const lockValue = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  // Concurrent guard: try to acquire a short-lived lock in KV
  const acquired = await (kv as any).set(lockKey, lockValue, {
    nx: true,
    ex: 30,
  });

  if (!acquired) {
    // Another request is already refreshing; wait for it to complete
    xeroLogger.info("Another refresh in progress, waiting", { userId });
    for (let i = 0; i < 5; i++) {
      await delay(300);
      const lockExists = await kv.get(lockKey);
      if (!lockExists) break;
    }

    // After waiting, re-read token from KV
    const latestTokenSet = await getTokenSet(userId);
    if (!latestTokenSet) {
      throw new AuthenticationError(
        "Xero connection expired. Please reconnect Xero from settings."
      );
    }

    await xeroClient.setTokenSet({
      access_token: latestTokenSet.access_token,
      refresh_token: latestTokenSet.refresh_token,
      expires_in: latestTokenSet.expires_in,
      id_token: latestTokenSet.id_token,
      token_type: latestTokenSet.token_type,
      scope: latestTokenSet.scope,
    });

    return;
  }

  // We acquired the lock; attempt refresh with backoff
  try {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        xeroLogger.info("Refreshing Xero token", { userId, attempt });
        await xeroClient.refreshToken();

        const refreshedTokenSet = await xeroClient.readTokenSet();
        if (!refreshedTokenSet) {
          throw new ExternalServiceError("Failed to refresh Xero token");
        }

        let expiresIn = 0;
        if (refreshedTokenSet.expires_in) {
          if (typeof refreshedTokenSet.expires_in === "function") {
            expiresIn = (refreshedTokenSet.expires_in as () => number)();
          } else if (typeof refreshedTokenSet.expires_in === "number") {
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

        xeroLogger.info("Xero token refreshed successfully", {
          userId,
          attempt,
        });

        return;
      } catch (err: unknown) {
        xeroLogger.warn("Xero token refresh attempt failed", {
          userId,
          attempt,
        });

        if (attempt < maxAttempts) {
          const backoffMs = 200 * 2 ** (attempt - 1);
          await delay(backoffMs);
        }
      }
    }

    // If we reach here, all attempts failed
    xeroLogger.warn("Xero token refresh failed after retries", { userId });
    throw new AuthenticationError(
      "Xero connection expired. Please reconnect Xero from settings."
    );
  } finally {
    // Always release lock
    await kv.del(lockKey);
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

