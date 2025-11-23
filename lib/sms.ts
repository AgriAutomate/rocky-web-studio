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

const logCredentialDiagnostics = (auth: string, runtimeUsername?: string, runtimePassword?: string) => {
  const user = runtimeUsername || username;
  const pass = runtimePassword || password;
  
  if (!user || !pass) {
    console.warn("[SMS] Missing username or password for Mobile Message API");
    return;
  }

  const usernamePreview = user.slice(0, 3);
  const passwordSpecialChars = /[^A-Za-z0-9]/.test(pass);
  const passwordLength = pass.length || 0;

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

const buildPayload = (messages: SMSMessage[]): MobileMessagePayload => {
  const runtimeSenderId = process.env.MOBILE_MESSAGE_SENDER_ID;
  
  if (!runtimeSenderId) {
    throw new Error("MOBILE_MESSAGE_SENDER_ID is required. Set it in your environment variables.");
  }

  return {
    enable_unicode: true,
    messages: messages.map((message) => ({
      to: message.to,
      message: message.message,
      sender: runtimeSenderId,
      custom_ref: message.customRef,
    })),
  };
};

async function post(payload: MobileMessagePayload): Promise<MobileMessageResponse> {
  try {
    // Use runtime environment variables consistently
    const runtimeBaseURL = process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
    const runtimeUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
    const runtimePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;
    
    // Construct API URL: remove trailing slashes and ensure proper path
    const baseURL = runtimeBaseURL.trim().replace(/\/+$/, ""); // Remove trailing slashes
    const apiUrl = `${baseURL}/messages`; // Append /messages endpoint
    console.log("[SMS] Base URL:", baseURL);
    console.log("[SMS] API URL:", apiUrl);
    console.log("[SMS] Username exists:", !!runtimeUsername);
    console.log("[SMS] Password exists:", !!runtimePassword);
    
    // Log the exact payload structure being sent
    console.log("[SMS] Payload structure verification:");
    console.log("[SMS]   enable_unicode:", payload.enable_unicode, "(type:", typeof payload.enable_unicode, ")");
    console.log("[SMS]   messages array length:", payload.messages.length);
    payload.messages.forEach((msg, idx) => {
      console.log(`[SMS]   Message ${idx + 1}:`);
      console.log(`[SMS]     to: "${msg.to}" (type: ${typeof msg.to})`);
      console.log(`[SMS]     message: "${msg.message.substring(0, 50)}..." (length: ${msg.message.length})`);
      console.log(`[SMS]     sender: "${msg.sender}" (type: ${typeof msg.sender})`);
      console.log(`[SMS]     custom_ref: ${msg.custom_ref ? `"${msg.custom_ref}"` : "undefined"} (type: ${typeof msg.custom_ref})`);
    });
    console.log("[SMS] Full payload JSON:", JSON.stringify(payload, null, 2));
    
    const auth = authHeader();
    console.log("[SMS] Auth header (first 10 chars):", auth.substring(0, 10));

    const headers = {
      Authorization: auth,
      "Content-Type": "application/json",
    };
    logCredentialDiagnostics(auth, runtimeUsername, runtimePassword);
    console.log("[SMS] Full request headers:", headers);
    console.log("[SMS] Final API URL (before fetch):", apiUrl);
    console.log("[SMS] URL verification - Expected: https://api.mobilemessage.com.au/v1/messages");
    console.log("[SMS] URL verification - Actual:", apiUrl);
    console.log("[SMS] URL match:", apiUrl === "https://api.mobilemessage.com.au/v1/messages" ? "✅ CORRECT" : "❌ MISMATCH");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      
      // Specific handling for authentication errors
      if (response.status === 401) {
        return {
          success: false,
          status: 401,
          error: "Authentication failed. Please verify MOBILE_MESSAGE_API_USERNAME and MOBILE_MESSAGE_API_PASSWORD are correct.",
        };
      }
      
      // Specific handling for rate limit errors
      if (response.status === 429) {
        return {
          success: false,
          status: 429,
          error: "Rate limit exceeded. Mobile Message API allows max 5 concurrent requests. Please retry after a moment.",
        };
      }
      
      // Generic error handling for other status codes
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