/**
 * SMS Message Record Interface
 */
export interface SMSRecord {
  id: string;
  messageId: string; // Provider message ID (Mobile Message API message_id)
  bookingId: string;
  phoneNumber: string;
  messagePreview: string; // First 100 characters of message for tracking
  messageType: "confirmation" | "24hr_reminder" | "1hr_reminder";
  status: "sent" | "pending" | "delivered" | "failed"; // 'sent' = successfully sent to API, 'delivered' = confirmed delivery
  cost: number; // Cost in AUD
  sentAt: Date;
  scheduledFor?: Date; // For scheduled messages
  error?: string; // Error message if status is 'failed'
  createdAt: Date;
}

/**
 * SMS Storage Interface
 * This can be implemented with KV, database, or in-memory storage
 */
export interface SMSStorage {
  save(record: SMSRecord): Promise<void>;
  findByBookingId(bookingId: string): Promise<SMSRecord[]>;
  findByPhoneNumber(phoneNumber: string): Promise<SMSRecord[]>;
  findAll(filters?: {
    bookingId?: string;
    phoneNumber?: string;
    status?: SMSRecord["status"];
    messageType?: SMSRecord["messageType"];
    startDate?: Date;
    endDate?: Date;
  }): Promise<SMSRecord[]>;
  getStats(month?: number, year?: number): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    sent: number;
    totalCost: number;
    byType: Record<string, number>;
  }>;
}

/**
 * In-Memory SMS Storage (for development/testing)
 * Replace with KV or database implementation for production
 */
class InMemorySMSStorage implements SMSStorage {
  private records: SMSRecord[] = [];

  async save(record: SMSRecord): Promise<void> {
    this.records.push(record);
  }

  async findByBookingId(bookingId: string): Promise<SMSRecord[]> {
    return this.records.filter((r) => r.bookingId === bookingId);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<SMSRecord[]> {
    return this.records.filter((r) => r.phoneNumber === phoneNumber);
  }

  async findAll(filters?: {
    bookingId?: string;
    phoneNumber?: string;
    status?: SMSRecord["status"];
    messageType?: SMSRecord["messageType"];
    startDate?: Date;
    endDate?: Date;
  }): Promise<SMSRecord[]> {
    let filtered = [...this.records];

    if (filters?.bookingId) {
      filtered = filtered.filter((r) => r.bookingId === filters.bookingId);
    }

    if (filters?.phoneNumber) {
      filtered = filtered.filter((r) => r.phoneNumber === filters.phoneNumber);
    }

    if (filters?.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters?.messageType) {
      filtered = filtered.filter((r) => r.messageType === filters.messageType);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(
        (r) => r.createdAt >= filters.startDate!
      );
    }

    if (filters?.endDate) {
      filtered = filtered.filter((r) => r.createdAt <= filters.endDate!);
    }

    // Sort by most recent first
    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getStats(month?: number, year?: number): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    sent: number;
    totalCost: number;
    byType: Record<string, number>;
  }> {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1; // 1-12
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const monthRecords = this.records.filter(
      (r) => r.createdAt >= startDate && r.createdAt <= endDate
    );

    const stats = {
      total: monthRecords.length,
      delivered: monthRecords.filter((r) => r.status === "delivered").length,
      failed: monthRecords.filter((r) => r.status === "failed").length,
      pending: monthRecords.filter((r) => r.status === "pending").length,
      sent: monthRecords.filter((r) => r.status === "sent").length,
      totalCost: monthRecords.reduce((sum, r) => sum + r.cost, 0),
      byType: {} as Record<string, number>,
    };

    // Count by message type
    monthRecords.forEach((r) => {
      stats.byType[r.messageType] = (stats.byType[r.messageType] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
let storageInstance: SMSStorage | null = null;

/**
 * Get SMS storage instance
 * In production, this would return KV or database implementation
 */
export function getSMSStorage(): SMSStorage {
  if (!storageInstance) {
    storageInstance = new InMemorySMSStorage();
  }
  return storageInstance as SMSStorage;
}

/**
 * Calculate SMS cost based on message length
 * Australian SMS typically cost $0.05-0.10 per message
 * Longer messages may be split into multiple parts
 */
export function calculateSMSCost(message: string): number {
  // Standard SMS: 160 characters = 1 message
  // Long SMS: 160+ characters = multiple messages
  const costPerMessage = parseFloat(
    process.env.SMS_COST_PER_MESSAGE || "0.08"
  );
  const messages = Math.ceil(message.length / 160);
  return messages * costPerMessage;
}

/**
 * Log SMS attempt to storage
 * Creates a record for tracking and debugging
 */
export async function logSMSAttempt(params: {
  bookingId: string;
  phoneNumber: string;
  message: string;
  messageType: SMSRecord["messageType"];
  status: SMSRecord["status"];
  messageId?: string; // Mobile Message API message_id
  error?: string;
}): Promise<SMSRecord> {
  const storage = getSMSStorage();
  const record: SMSRecord = {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    messageId: params.messageId || "",
    bookingId: params.bookingId,
    phoneNumber: params.phoneNumber,
    messagePreview: params.message.substring(0, 100),
    messageType: params.messageType,
    status: params.status,
    cost: calculateSMSCost(params.message),
    sentAt: new Date(),
    error: params.error,
    createdAt: new Date(),
  };

  await storage.save(record);
  return record;
}

