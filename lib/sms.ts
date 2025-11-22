const username = process.env.MOBILE_MESSAGE_API_USERNAME;
const password = process.env.MOBILE_MESSAGE_API_PASSWORD;
const baseURL =
  process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
const senderId = process.env.MOBILE_MESSAGE_SENDER_ID;

if (!username || !password || !senderId) {
  console.warn(
    "Mobile Message SMS config missing. Set MOBILE_MESSAGE_API_USERNAME, PASSWORD, and SENDER_ID."
  );
}

const authHeader = () => {
  if (!username || !password) {
    throw new Error("Missing Mobile Message API credentials");
  }

  const creds = `${username}:${password}`;
  const auth = Buffer.from(creds).toString("base64");
  return `Basic ${auth}`;
};

const logCredentialDiagnostics = (auth: string) => {
  if (!username || !password) {
    console.warn("[SMS] Missing username or password for Mobile Message API");
    return;
  }

  const usernamePreview = username.slice(0, 3);
  const passwordSpecialChars = /[^A-Za-z0-9]/.test(password);
  const passwordLength = password.length || 0;

  console.log("[SMS] Credential diagnostics:");
  console.log("[SMS]   Username (first 3 chars):", usernamePreview);
  console.log("[SMS]   Password exists:", true, ", length:", passwordLength);
  console.log("[SMS]   Password contains special chars:", passwordSpecialChars);
  console.log("[SMS]   Auth header (first 20 chars):", auth.substring(0, 20));
};

interface MobileMessagePayload {
  enable_unicode: boolean;
  messages: Array<{
    to: string;
    message: string;
    sender: string;
    custom_ref?: string;
  }>;
}

export interface SMSMessage {
  to: string;
  message: string;
  customRef?: string;
}

export interface MobileMessageAPIResponse {
  messages?: Array<{
    message_id?: string;
    recipient?: string;
    status?: string;
    errors?: string[];
  }>;
  success?: boolean;
}

export interface SMSResponse {
  success: boolean;
  status: number;
  data?: MobileMessageAPIResponse;
  error?: string;
}

export type MobileMessageResponse = SMSResponse;

export interface SMSError {
  message: string;
  code?: string;
  details?: string;
}

const buildPayload = (messages: SMSMessage[]): MobileMessagePayload => ({
  enable_unicode: true,
  messages: messages.map((message) => ({
    to: message.to,
    message: message.message,
    sender: senderId || "RockyWeb",
    custom_ref: message.customRef,
  })),
});

async function post(payload: MobileMessagePayload): Promise<MobileMessageResponse> {
  try {
    const apiUrl = `${baseURL}/messages`;
    console.log("[SMS] API URL:", apiUrl);
    console.log("[SMS] Username exists:", !!username);
    console.log("[SMS] Password exists:", !!password);
    const auth = authHeader();
    console.log("[SMS] Auth header (first 10 chars):", auth.substring(0, 10));

    const headers = {
      Authorization: auth,
      "Content-Type": "application/json",
    };
    logCredentialDiagnostics(auth);
    console.log("[SMS] Full request headers:", headers);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = (await response.json()) as MobileMessageAPIResponse;
    return { success: true, status: response.status, data };
  } catch (error: unknown) {
    const normalized: SMSError = {
      message: error instanceof Error ? error.message : "Unknown error",
    };
    if (error instanceof Error) {
      const errorWithMeta = error as Error & { code?: string; data?: unknown };
      if (errorWithMeta.code && typeof errorWithMeta.code === "string") {
        normalized.code = errorWithMeta.code;
      }
      if (errorWithMeta.data) {
        normalized.details = JSON.stringify(errorWithMeta.data);
      }
    }
    return {
      success: false,
      status: 500,
      error: normalized.message,
    };
  }
}

export async function sendSMS(
  to: string,
  message: string,
  customRef?: string
): Promise<MobileMessageResponse> {
  const payload = buildPayload([{ to, message, customRef }]);
  return post(payload);
}

export async function sendBulkSMS(
  messages: SMSMessage[]
): Promise<MobileMessageResponse> {
  if (!messages.length) {
    return { success: false, status: 400, error: "No messages provided." };
  }
  const payload = buildPayload(messages);
  return post(payload);
}