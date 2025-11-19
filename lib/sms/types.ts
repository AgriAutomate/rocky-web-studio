export interface SMSProvider {
  sendSMS(params: SendSMSParams): Promise<SMSResponse>;
  scheduleSMS(params: ScheduleSMSParams): Promise<SMSResponse>;
}

export interface SendSMSParams {
  to: string;
  body: string;
  from?: string;
}

export interface ScheduleSMSParams extends SendSMSParams {
  scheduleTime: Date | string;
}

export interface SMSResponse {
  success: boolean;
  messageId: string;
  error?: string;
}

