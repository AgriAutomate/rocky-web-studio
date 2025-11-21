const baseURL =
  process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
const username = process.env.MOBILE_MESSAGE_API_USERNAME;
const password = process.env.MOBILE_MESSAGE_API_PASSWORD;

const authHeader = () => {
  const creds = `${username || ""}:${password || ""}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
};

export interface CreditsResult {
  success: boolean;
  balance?: number;
  response?: unknown;
  error?: string;
}

export async function fetchMobileMessageCredits(): Promise<CreditsResult> {
  if (!username || !password) {
    return {
      success: false,
      error: "Mobile Message credentials not configured",
    };
  }

  try {
    const response = await fetch(`${baseURL}/credits`, {
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        error: `Credits fetch failed: ${text}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      balance: typeof data?.balance === "number" ? data.balance : undefined,
      response: data,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch credits";
    return {
      success: false,
      error: message,
    };
  }
}


