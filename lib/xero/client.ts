import { XeroClient } from "xero-node";

/**
 * Xero API Client Configuration
 * 
 * Environment variables required:
 * - XERO_CLIENT_ID: Your Xero app client ID
 * - XERO_CLIENT_SECRET: Your Xero app client secret
 * - XERO_REDIRECT_URI: OAuth callback URL (default: https://rockywebstudio.com.au/api/xero/callback)
 * - XERO_SCOPES: Space-separated list of scopes
 */
const getXeroConfig = () => {
  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri =
    process.env.XERO_REDIRECT_URI ||
    "https://rockywebstudio.com.au/api/xero/callback";
  const scopesString =
    process.env.XERO_SCOPES ||
    "openid profile email accounting.transactions accounting.settings offline_access";

  if (!clientId || !clientSecret) {
    throw new Error(
      "XERO_CLIENT_ID and XERO_CLIENT_SECRET environment variables are required"
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUris: [redirectUri],
    scopes: scopesString.split(" ").filter((s) => s.length > 0),
    httpTimeout: 3000, // 3 seconds
  };
};

/**
 * Lazy Xero client instance
 * Only initialized when actually used (not during build)
 * 
 * Usage:
 * ```typescript
 * import { getXeroClient } from '@/lib/xero/client';
 * 
 * const xeroClient = getXeroClient();
 * // Build consent URL for OAuth
 * const consentUrl = await xeroClient.buildConsentUrl();
 * 
 * // After callback, set token set
 * const tokenSet = await xeroClient.apiCallback(callbackUrl);
 * await xeroClient.setTokenSet(tokenSet);
 * ```
 */
let xeroClientInstance: XeroClient | null = null;

export function getXeroClient(): XeroClient {
  if (!xeroClientInstance) {
    xeroClientInstance = new XeroClient(getXeroConfig());
  }
  return xeroClientInstance;
}

// Export for backward compatibility (but prefer getXeroClient())
export const xeroClient = new Proxy({} as XeroClient, {
  get(_target, prop) {
    return getXeroClient()[prop as keyof XeroClient];
  },
});

/**
 * Type export for Xero token set
 */
export type XeroTokenSet = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token?: string;
  token_type: string;
  scope: string;
  /**
   * Epoch seconds when the token was obtained.
   * Used for proactive refresh (5 minutes before expiry).
   */
  obtained_at?: number;
};


