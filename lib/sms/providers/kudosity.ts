import axios, { AxiosInstance } from "axios";
import type {
  SMSProvider,
  SendSMSParams,
  ScheduleSMSParams,
  SMSResponse,
} from "../types";

interface KudosityConfig {
  apiKey: string;
  apiSecret: string;
  defaultFrom?: string;
}

interface TransmitSMSResponse {
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
  message_id?: string;
  balance?: number;
}

export class KudosityProvider implements SMSProvider {
  private config: KudosityConfig;
  private baseUrl = "https://api.transmitsms.com";
  private axiosInstance: AxiosInstance;

  constructor(config: KudosityConfig) {
    this.config = config;

    // Create axios instance with Basic Auth
    const credentials = `${config.apiKey}:${config.apiSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Format phone number for Kudosity (remove + prefix, keep country code)
   * Example: +61412345678 -> 61412345678
   */
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/^\+/, "");
  }

  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(params.to);

      const response = await this.axiosInstance.post<TransmitSMSResponse>(
        "/send-sms.json",
        {
          to: formattedPhone,
          message: params.body,
          from: params.from || this.config.defaultFrom || "RockyWeb",
        }
      );

      const data = response.data;

      // Check for explicit error first
      if (data.error) {
        console.error("Kudosity API error (sendSMS)", {
          code: data.error.code,
          message: data.error.message,
        });
        return {
          success: false,
          messageId: "",
          error:
            data.error?.message ||
            data.error?.code ||
            "Failed to send SMS via Kudosity",
        };
      }

      // If no error and we have a message_id, consider it successful
      // (success field might not always be present in API response)
      if (data.message_id) {
        if (process.env.NODE_ENV !== "production") {
          console.info("Kudosity SMS sent", data.message_id);
        }
        return {
          success: true,
          messageId: data.message_id,
        };
      }

      // Fallback: if success is explicitly false, it's an error
      if (data.success === false) {
        console.error("Kudosity API returned success:false (sendSMS)");
        return {
          success: false,
          messageId: "",
          error: "Failed to send SMS via Kudosity",
        };
      }

      // If we get here, assume success if we have a message_id
      return {
        success: true,
        messageId: data.message_id || `kudosity-${Date.now()}`,
      };
    } catch (error: any) {
      console.error("Kudosity sendSMS exception", {
        message: error?.message,
        status: error?.response?.status,
      });
      return {
        success: false,
        messageId: "",
        error:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to send SMS via Kudosity",
      };
    }
  }

  async scheduleSMS(params: ScheduleSMSParams): Promise<SMSResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(params.to);

      // Convert scheduleTime to Unix timestamp
      const scheduleTime =
        params.scheduleTime instanceof Date
          ? Math.floor(params.scheduleTime.getTime() / 1000)
          : typeof params.scheduleTime === "string"
          ? Math.floor(new Date(params.scheduleTime).getTime() / 1000)
          : params.scheduleTime;

      const response = await this.axiosInstance.post<TransmitSMSResponse>(
        "/send-sms.json",
        {
          to: formattedPhone,
          message: params.body,
          from: params.from || this.config.defaultFrom || "RockyWeb",
          send_at: scheduleTime, // Unix timestamp
        }
      );

      const data = response.data;

      // Check for explicit error first
      if (data.error) {
        console.error("Kudosity API error (scheduleSMS)", {
          code: data.error.code,
          message: data.error.message,
        });
        return {
          success: false,
          messageId: "",
          error:
            data.error?.message ||
            data.error?.code ||
            "Failed to schedule SMS via Kudosity",
        };
      }

      // If no error and we have a message_id, consider it successful
      if (data.message_id) {
        if (process.env.NODE_ENV !== "production") {
          console.info("Kudosity SMS scheduled", data.message_id);
        }
        return {
          success: true,
          messageId: data.message_id,
        };
      }

      // Fallback: if success is explicitly false, it's an error
      if (data.success === false) {
        console.error("Kudosity API returned success:false (scheduleSMS)");
        return {
          success: false,
          messageId: "",
          error: "Failed to schedule SMS via Kudosity",
        };
      }

      return {
        success: true,
        messageId: data.message_id || `kudosity-scheduled-${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        messageId: "",
        error:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to schedule SMS via Kudosity",
      };
    }
  }

  /**
   * Get account balance (Kudosity-specific method)
   */
  async getBalance(): Promise<{ balance: number; error?: string }> {
    try {
      const response = await this.axiosInstance.get<TransmitSMSResponse>(
        "/get-balance.json"
      );

      const data = response.data;

      if (data.error) {
        return {
          balance: 0,
          error: data.error.message || data.error.code,
        };
      }

      return {
        balance: data.balance || 0,
      };
    } catch (error: any) {
      return {
        balance: 0,
        error:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to get balance from Kudosity",
      };
    }
  }
}
