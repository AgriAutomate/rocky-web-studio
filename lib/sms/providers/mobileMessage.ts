/**
 * Rocky Web Studio / Mobile Message SMS Provider
 * File: lib/sms/providers/mobileMessage.ts
 *
 * Purpose: SMS provider implementation for Mobile Message API (mobilemessage.com.au)
 * ACMA-Approved Sender ID: "Rocky Web"
 *
 * API Documentation: https://mobilemessage.com.au/api
 */

import type {
  SMSProvider,
  SendSMSParams,
  ScheduleSMSParams,
  SMSResponse,
} from "../types";
import { getLogger } from "@/lib/logging";

const logger = getLogger("sms.mobile-message");

interface MobileMessageConfig {
  apiUrl?: string;
  apiKey?: string; // API key authentication (preferred)
  username?: string; // Basic auth username (fallback)
  password?: string; // Basic auth password (fallback)
  senderId: string; // ACMA-approved Sender ID: "Rocky Web"
}

interface MobileMessagePayload {
  enable_unicode: boolean;
  messages: Array<{
    to: string;
    message: string;
    sender: string;
    custom_ref?: string;
    schedule_time?: string; // ISO 8601 format for scheduled messages
  }>;
}

interface MobileMessageAPIResponse {
  messages?: Array<{
    message_id?: string;
    recipient?: string;
    status?: string;
    errors?: string[];
  }>;
  success?: boolean;
}

export class MobileMessageProvider implements SMSProvider {
  private config: MobileMessageConfig;
  private baseUrl: string;

  constructor(config: MobileMessageConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl || "https://api.mobilemessage.com.au/v1";
    
    // Validate required configuration
    if (!config.apiKey && (!config.username || !config.password)) {
      throw new Error("Mobile Message API key or username/password are required");
    }
    if (!config.senderId) {
      throw new Error("Mobile Message Sender ID is required (ACMA-approved: 'Rocky Web')");
    }
  }

  /**
   * Build Authorization header for Mobile Message API
   * Supports both API key (Bearer) and Basic Auth (username/password)
   */
  private getAuthHeader(): string {
    if (this.config.apiKey) {
      return `Bearer ${this.config.apiKey}`;
    }
    if (this.config.username && this.config.password) {
      const credentials = `${this.config.username}:${this.config.password}`;
      const encoded = Buffer.from(credentials).toString("base64");
      return `Basic ${encoded}`;
    }
    throw new Error("Mobile Message authentication not configured");
  }

  /**
   * Send SMS via Mobile Message API
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      const payload: MobileMessagePayload = {
        enable_unicode: true,
        messages: [
          {
            to: params.to,
            message: params.body,
            sender: params.from || this.config.senderId,
            custom_ref: `sms-${Date.now()}`,
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as MobileMessageAPIResponse;

      if (!response.ok) {
        const errorMessage =
          data.messages?.[0]?.errors?.[0] ||
          `HTTP error! status: ${response.status}`;

        logger.error("Mobile Message API error", {
          status: response.status,
          error: errorMessage,
          to: params.to.substring(0, 4) + "***",
        });

        return {
          success: false,
          messageId: "",
          error: errorMessage,
        };
      }

      const messageId =
        data.messages?.[0]?.message_id || `mobile-message-${Date.now()}`;

      logger.info("SMS sent via Mobile Message API", {
        messageId,
        to: params.to.substring(0, 4) + "***",
        senderId: params.from || this.config.senderId,
      });

      return {
        success: true,
        messageId,
        senderId: params.from || this.config.senderId,
        data,
      };
    } catch (error: any) {
      logger.error("Failed to send SMS via Mobile Message", undefined, error);
      return {
        success: false,
        messageId: "",
        error: error?.message || "Failed to send SMS via Mobile Message",
      };
    }
  }

  /**
   * Schedule SMS via Mobile Message API
   * Note: Mobile Message API supports scheduled messages via schedule_time field
   */
  async scheduleSMS(params: ScheduleSMSParams): Promise<SMSResponse> {
    try {
      const scheduleTime =
        params.scheduleTime instanceof Date
          ? params.scheduleTime.toISOString()
          : params.scheduleTime;

      const payload: MobileMessagePayload = {
        enable_unicode: true,
        messages: [
          {
            to: params.to,
            message: params.body,
            sender: params.from || this.config.senderId,
            custom_ref: `scheduled-${Date.now()}`,
            schedule_time: scheduleTime,
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as MobileMessageAPIResponse;

      if (!response.ok) {
        const errorMessage =
          data.messages?.[0]?.errors?.[0] ||
          `HTTP error! status: ${response.status}`;

        logger.error("Mobile Message API scheduling error", {
          status: response.status,
          error: errorMessage,
          to: params.to.substring(0, 4) + "***",
          scheduleTime,
        });

        return {
          success: false,
          messageId: "",
          error: errorMessage,
        };
      }

      const messageId =
        data.messages?.[0]?.message_id ||
        `mobile-message-scheduled-${Date.now()}`;

      logger.info("SMS scheduled via Mobile Message API", {
        messageId,
        to: params.to.substring(0, 4) + "***",
        scheduleTime,
      });

      return {
        success: true,
        messageId,
        senderId: params.from || this.config.senderId,
        data,
      };
    } catch (error: any) {
      logger.error(
        "Failed to schedule SMS via Mobile Message",
        undefined,
        error
      );
      return {
        success: false,
        messageId: "",
        error:
          error?.message || "Failed to schedule SMS via Mobile Message",
      };
    }
  }
}
