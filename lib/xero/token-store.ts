import { kv } from "@vercel/kv";
import type { XeroTokenSet } from "./client";

/**
 * Xero Token Storage using Vercel KV
 * 
 * Key design:
 * - Token set per user: xero:token:{userId}
 */

const TOKEN_KEY = (userId: string) => `xero:token:${userId}`;

/**
 * Store Xero token set for a user
 * 
 * @param userId - Unique identifier for the user/organization
 * @param tokenSet - Xero token set from OAuth callback
 */
export async function storeTokenSet(
  userId: string,
  tokenSet: XeroTokenSet
): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!tokenSet.access_token || !tokenSet.refresh_token) {
    throw new Error("tokenSet must include access_token and refresh_token");
  }

  // Store token set with expiration time
  // We'll store it with a TTL based on expires_in (in seconds)
  // Add 60 seconds buffer to ensure we refresh before expiration
  const ttl = tokenSet.expires_in ? tokenSet.expires_in - 60 : undefined;

  // Only set TTL if valid (greater than 0)
  if (ttl && ttl > 0) {
    await kv.set(TOKEN_KEY(userId), tokenSet, { ex: ttl });
  } else {
    await kv.set(TOKEN_KEY(userId), tokenSet);
  }
}

/**
 * Retrieve Xero token set for a user
 * 
 * @param userId - Unique identifier for the user/organization
 * @returns Token set if found, null otherwise
 */
export async function getTokenSet(
  userId: string
): Promise<XeroTokenSet | null> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const tokenSet = await kv.get<XeroTokenSet>(TOKEN_KEY(userId));
  return tokenSet;
}

/**
 * Delete Xero token set for a user
 * 
 * @param userId - Unique identifier for the user/organization
 */
export async function deleteTokenSet(userId: string): Promise<void> {
  if (!userId) {
    throw new Error("userId is required");
  }

  await kv.del(TOKEN_KEY(userId));
}

/**
 * Check if a token set exists for a user
 * 
 * @param userId - Unique identifier for the user/organization
 * @returns true if token set exists, false otherwise
 */
export async function hasTokenSet(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const tokenSet = await getTokenSet(userId);
  return tokenSet !== null;
}

