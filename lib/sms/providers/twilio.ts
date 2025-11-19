import type {
  SMSProvider,
  SendSMSParams,
  ScheduleSMSParams,
  SMSResponse,
} from "../types";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  defaultFrom?: string;
}

export class TwilioProvider implements SMSProvider {
  private config: TwilioConfig;
  private baseUrl: string;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`;
  }

  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      const credentials = `${this.config.accountSid}:${this.config.authToken}`;
      const encodedCredentials = Buffer.from(credentials).toString("base64");

      const formData = new URLSearchParams();
      formData.append("To", params.to);
      formData.append("Body", params.body);
      formData.append(
        "From",
        params.from || this.config.defaultFrom || ""
      );

      const response = await fetch(
        `${this.baseUrl}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          messageId: "",
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.sid || `twilio-${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        messageId: "",
        error: error?.message || "Failed to send SMS via Twilio",
      };
    }
  }

  async scheduleSMS(params: ScheduleSMSParams): Promise<SMSResponse> {
    try {
      const credentials = `${this.config.accountSid}:${this.config.authToken}`;
      const encodedCredentials = Buffer.from(credentials).toString("base64");

      const scheduleTime =
        params.scheduleTime instanceof Date
          ? params.scheduleTime.toISOString()
          : params.scheduleTime;

      const formData = new URLSearchParams();
      formData.append("To", params.to);
      formData.append("Body", params.body);
      formData.append(
        "From",
        params.from || this.config.defaultFrom || ""
      );
      formData.append("ScheduleTime", scheduleTime);

      const response = await fetch(
        `${this.baseUrl}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          messageId: "",
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.sid || `twilio-scheduled-${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        messageId: "",
        error: error?.message || "Failed to schedule SMS via Twilio",
      };
    }
  }
}

