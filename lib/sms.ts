import type { FetchError } from "ofetch";

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
  const creds = `${username}:${password}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
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

export interface SMSRequest {
  to: string;
  message: string;
  customRef?: string;
}

interface SMSResponse {
  success: boolean;
  status?: number;
  response?: any;
  error?: string;
}

async function post(payload: MobileMessagePayload): Promise<SMSResponse> {
  try {
    const response = await fetch(`${baseURL}/messages`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
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

    const data = await response.json();
    return { success: true, status: response.status, response: data };
  } catch (error) {
    const err = error as FetchError | Error;
    return {
      success: false,
      error: err.message,
    };
  }
}

async function buildPayload(
  messages: SMSRequest[]
): Promise<MobileMessagePayload> {
  return {
    enable_unicode: true,
    messages: messages.map((message) => ({
      to: message.to,
      message: message.message,
      sender: senderId || "RockyWeb",
      custom_ref: message.customRef,
    })),
  };
}

export async function sendSMS(
  to: string,
  message: string,
  customRef?: string
): Promise<SMSResponse> {
  const payload = await buildPayload([{ to, message, customRef }]);
  return post(payload);
}

export async function sendBulkSMS(
  messages: SMSRequest[]
): Promise<SMSResponse> {
  if (!messages.length) {
    return { success: false, error: "No messages provided." };
  }
  const payload = await buildPayload(messages);
  return post(payload);
}

