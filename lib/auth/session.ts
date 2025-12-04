import { kv } from "@vercel/kv";

const SESSION_BLACKLIST_KEY = (sessionId: string) =>
  `auth:session:blacklist:${sessionId}`;

/**
 * Check if a sessionId has been revoked (blacklisted).
 */
export async function isSessionRevoked(
  sessionId?: string | null
): Promise<boolean> {
  if (!sessionId) return false;
  const value = await kv.get(SESSION_BLACKLIST_KEY(sessionId));
  return Boolean(value);
}

/**
 * Revoke a session by adding its sessionId to a blacklist in KV.
 * TTL defaults to 8 hours to match session maxAge.
 */
export async function revokeSession(
  sessionId?: string | null,
  ttlSeconds: number = 8 * 60 * 60
): Promise<void> {
  if (!sessionId) return;
  await kv.set(SESSION_BLACKLIST_KEY(sessionId), true, { ex: ttlSeconds });
}


