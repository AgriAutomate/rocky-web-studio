import { getLogger } from "@/lib/logging";

const smsLogger = getLogger("sms");

const username = process.env.MOBILE_MESSAGE_API_USERNAME;
const password = process.env.MOBILE_MESSAGE_API_PASSWORD;
const senderId = process.env.MOBILE_MESSAGE_SENDER_ID;

if (!username || !password || !senderId) {
  smsLogger.warn(
    "Mobile Message SMS config missing",
    {
      hasUsername: !!username,
      hasPassword: !!password,
      hasSenderId: !!senderId,
    }
  );
}

const authHeader = () => {
  // Validate environment variables at runtime
  const runtimeUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
  const runtimePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;
  const runtimeBaseURL =
    process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";

  smsLogger.debug("Environment variable validation", {
    baseUrl: runtimeBaseURL,
    usernamePreview: runtimeUsername ? `${runtimeUsername.substring(0, 3)}...` : "UNDEFINED",
    hasPassword: !!runtimePassword,
  });

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

  // Build the credentials string (never logged in full)
  const creds = `${runtimeUsername}:${runtimePassword}`;

  // Encode to Base64
  const encoded = Buffer.from(creds).toString("base64");

  // Minimal validation without exposing secrets
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const isValid = decoded === creds;
    smsLogger.debug("SMS auth header validation", {
      encodingLength: encoded.length,
      decodedMatchesOriginal: isValid,
    });
  } catch (decodeError) {
    smsLogger.error("Failed to decode SMS auth header", undefined, decodeError);
  }

  // Build auth header with exactly one space after 'Basic'
  const auth = `Basic ${encoded}`;
  
  // Validate auth header format
  const hasBasicPrefix = auth.startsWith("Basic ");
  const hasOneSpace = auth.substring(6).startsWith(encoded);
  smsLogger.debug("SMS auth header format validation", {
    hasBasicPrefix,
    hasOneSpace,
  });

  if (!hasBasicPrefix || !hasOneSpace) {
    throw new Error("Invalid auth header format");
  }

  return auth;
};

const logCredentialDiagnostics = (auth: string, runtimeUsername?: string, runtimePassword?: string) => {
  const user = runtimeUsername || username;
  const pass = runtimePassword || password;
  
  if (!user || !pass) {
    smsLogger.warn("Missing username or password for Mobile Message API");
    return;
  }

  const usernamePreview = user.slice(0, 3);
  const passwordSpecialChars = /[^A-Za-z0-9]/.test(pass);
  const passwordLength = pass.length || 0;

  smsLogger.debug("SMS credential diagnostics", {
    usernamePreview,
    passwordLength,
    passwordSpecialChars,
    authPreview: auth.substring(0, 10),
  });
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
    throw new Error(
      "MOBILE_MESSAGE_SENDER_ID environment variable is required. " +
      "Please set it to a registered Sender ID in your Mobile Message account."
    );
  }

  return {
    enable_unicode: true,
    messages: messages.map((message) => ({
      to: message.to,
      message: message.message,
      sender: runtimeSenderId,  // No fallback
      custom_ref: message.customRef,
    })),
  };
};

async function post(payload: MobileMessagePayload): Promise<MobileMessageResponse> {
  try {
    // Use runtime environment variables consistently
    const runtimeBaseURL =
      process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
    const runtimeUsername = process.env.MOBILE_MESSAGE_API_USERNAME;
    const runtimePassword = process.env.MOBILE_MESSAGE_API_PASSWORD;
    
    // Construct API URL: remove trailing slashes and ensure proper path
    const baseURL = runtimeBaseURL.trim().replace(/\/+$/, "");
    const apiUrl = `${baseURL}/messages`;

    smsLogger.debug("Prepared Mobile Message API request", {
      baseURL,
      apiUrl,
      hasUsername: !!runtimeUsername,
      hasPassword: !!runtimePassword,
      messagesCount: payload.messages.length,
    });
    
    const auth = authHeader();
    smsLogger.debug("Auth header prepared");

    const headers = {
      Authorization: auth,
      "Content-Type": "application/json",
    };
    logCredentialDiagnostics(auth, runtimeUsername, runtimePassword);
    smsLogger.debug("Final SMS request configuration", {
      apiUrl,
    });

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
    smsLogger.info("SMS sent via Mobile Message API", {
      status: response.status,
      messagesCount: data.messages?.length ?? 0,
    });
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
    smsLogger.error("SMS API call failed", undefined, error);
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
  const runtimeBaseURL =
    process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";

  smsLogger.debug("sendSMS environment check", {
    baseUrl: runtimeBaseURL,
    usernamePreview: runtimeUsername ? `${runtimeUsername.substring(0, 3)}...` : "UNDEFINED",
    hasPassword: !!runtimePassword,
  });

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