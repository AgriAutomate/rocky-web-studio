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
  // Validate environment variables at runtime
  const runtimeUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
  const runtimePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;
  const runtimeBaseURL = process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";

  console.log("[SMS] Environment variable validation:");
  console.log("[SMS]   MOBILE_MESSAGE_API_URL:", runtimeBaseURL);
  console.log("[SMS]   MOBILE_MESSAGE_API_USERNAME:", runtimeUsername ? `${runtimeUsername.substring(0, 3)}...` : "UNDEFINED");
  console.log("[SMS]   MOBILE_MESSAGE_API_PASSWORD exists:", !!runtimePassword);

  if (!runtimeUsername || !runtimePassword) {
    const missing = [];
    if (!runtimeUsername) missing.push("MOBILE_MESSAGE_API_USERNAME");
    if (!runtimePassword) missing.push("MOBILE_MESSAGE_API_PASSWORD");
    throw new Error(`Missing Mobile Message API credentials: ${missing.join(", ")}`);
  }

  // Ensure they are strings
  if (typeof runtimeUsername !== "string" || typeof runtimePassword !== "string") {
    throw new Error("Mobile Message API credentials must be strings");
  }

  // Build the credentials string
  const creds = `${runtimeUsername}:${runtimePassword}`;
  
  // Log before encoding
  console.log("[SMS] Base64 encoding validation:");
  console.log("[SMS]   Encoding string length:", creds.length);
  console.log("[SMS]   Username length:", runtimeUsername.length);
  console.log("[SMS]   Password length:", runtimePassword.length);
  console.log("[SMS]   String starts with:", creds.substring(0, 10));
  console.log("[SMS]   Contains colon separator:", creds.includes(":"));

  // Encode to Base64
  const encoded = Buffer.from(creds).toString("base64");
  
  // Log after encoding
  console.log("[SMS]   Base64 result (first 20 chars):", encoded.substring(0, 20));
  console.log("[SMS]   Base64 full length:", encoded.length);

  // Validate by decoding back
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const isValid = decoded === creds;
    console.log("[SMS]   Decoded matches original:", isValid);
    if (!isValid) {
      console.error("[SMS]   WARNING: Base64 decode mismatch!");
      console.error("[SMS]   Original:", creds.substring(0, 20) + "...");
      console.error("[SMS]   Decoded:", decoded.substring(0, 20) + "...");
    }
  } catch (decodeError) {
    console.error("[SMS]   ERROR: Failed to decode Base64:", decodeError);
  }

  // Build auth header with exactly one space after 'Basic'
  const auth = `Basic ${encoded}`;
  
  // Validate auth header format
  const hasBasicPrefix = auth.startsWith("Basic ");
  const hasOneSpace = auth.substring(6).startsWith(encoded);
  console.log("[SMS]   Auth header format validation:");
  console.log("[SMS]     Starts with 'Basic ':", hasBasicPrefix);
  console.log("[SMS]     Has exactly one space:", hasOneSpace);
  console.log("[SMS]     Full auth header (first 30 chars):", auth.substring(0, 30));

  if (!hasBasicPrefix || !hasOneSpace) {
    throw new Error("Invalid auth header format");
  }

  return auth;
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
  // Validate environment variables at runtime in sendSMS
  const runtimeUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
  const runtimePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;
  const runtimeBaseURL = process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";

  console.log("[SMS] sendSMS - Environment variable check:");
  console.log("[SMS]   MOBILE_MESSAGE_API_URL:", runtimeBaseURL);
  console.log("[SMS]   MOBILE_MESSAGE_API_USERNAME:", runtimeUsername ? `${runtimeUsername.substring(0, 3)}...` : "UNDEFINED");
  console.log("[SMS]   MOBILE_MESSAGE_API_PASSWORD exists:", !!runtimePassword);
  console.log("[SMS]   Username type:", typeof runtimeUsername);
  console.log("[SMS]   Password type:", typeof runtimePassword);

  if (!runtimeUsername || !runtimePassword) {
    const missing = [];
    if (!runtimeUsername) missing.push("MOBILE_MESSAGE_API_USERNAME");
    if (!runtimePassword) missing.push("MOBILE_MESSAGE_API_PASSWORD");
    return {
      success: false,
      status: 500,
      error: `Missing Mobile Message API credentials: ${missing.join(", ")}`,
    };
  }

  if (typeof runtimeUsername !== "string" || typeof runtimePassword !== "string") {
    return {
      success: false,
      status: 500,
      error: "Mobile Message API credentials must be strings",
    };
  }

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