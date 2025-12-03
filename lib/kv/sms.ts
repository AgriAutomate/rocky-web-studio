import { kv } from "@vercel/kv";
import type { SMSRecord, SMSStorage } from "@/lib/sms/storage";

/**
 * KV-backed SMS storage adapter.
 *
 * Key design:
 * - Individual SMS record: sms:{id}
 * - All SMS IDs: sms:all (SET)
 * - Booking index: sms:booking:{bookingId} (SET of sms IDs)
 * - Phone index: sms:phone:{phoneNumber} (SET of sms IDs)
 */

const SMS_KEY = (id: string) => `sms:${id}`;
const SMS_ALL_KEY = "sms:all";
const SMS_BOOKING_KEY = (bookingId: string) => `sms:booking:${bookingId}`;
const SMS_PHONE_KEY = (phoneNumber: string) => `sms:phone:${phoneNumber}`;

class KVSMSStorage implements SMSStorage {
  async save(record: SMSRecord): Promise<void> {
    await kv.set(SMS_KEY(record.id), record);

    // Global index of all SMS records
    await kv.sadd(SMS_ALL_KEY, record.id);

    // Booking index
    if (record.bookingId) {
      await kv.sadd(SMS_BOOKING_KEY(record.bookingId), record.id);
    }

    // Phone index
    if (record.phoneNumber) {
      await kv.sadd(SMS_PHONE_KEY(record.phoneNumber), record.id);
    }
  }

  private async getManyByIds(ids: string[]): Promise<SMSRecord[]> {
    if (!ids.length) return [];
    const keys = ids.map(SMS_KEY);
    const results = (await kv.mget(keys)) as (SMSRecord | null)[];
    return results.filter((r): r is SMSRecord => r !== null);
  }

  async findByBookingId(bookingId: string): Promise<SMSRecord[]> {
    const ids = (await kv.smembers(SMS_BOOKING_KEY(bookingId))) as string[];
    const records = await this.getManyByIds(ids);
    // Most recent first
    return records.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findByPhoneNumber(phoneNumber: string): Promise<SMSRecord[]> {
    const ids = (await kv.smembers(SMS_PHONE_KEY(phoneNumber))) as string[];
    const records = await this.getManyByIds(ids);
    return records.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findAll(filters?: {
    bookingId?: string;
    phoneNumber?: string;
    status?: SMSRecord["status"];
    messageType?: SMSRecord["messageType"];
    startDate?: Date;
    endDate?: Date;
  }): Promise<SMSRecord[]> {
    let candidateIds: string[];

    if (filters?.bookingId) {
      candidateIds = (await kv.smembers(
        SMS_BOOKING_KEY(filters.bookingId)
      )) as string[];
    } else if (filters?.phoneNumber) {
      candidateIds = (await kv.smembers(
        SMS_PHONE_KEY(filters.phoneNumber)
      )) as string[];
    } else {
      candidateIds = (await kv.smembers(SMS_ALL_KEY)) as string[];
    }

    const records = await this.getManyByIds(candidateIds);

    let filtered = [...records];

    if (filters?.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters?.messageType) {
      filtered = filtered.filter((r) => r.messageType === filters.messageType);
    }

    if (filters?.startDate) {
      filtered = filtered.filter((r) => r.createdAt >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter((r) => r.createdAt <= filters.endDate!);
    }

    // Sort by most recent first
    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getStats(
    month?: number,
    year?: number
  ): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
    sent: number;
    totalCost: number;
    byType: Record<string, number>;
  }> {
    const ids = (await kv.smembers(SMS_ALL_KEY)) as string[];
    const records = await this.getManyByIds(ids);

    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1; // 1-12
    const targetYear = year ?? now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const monthRecords = records.filter(
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

    monthRecords.forEach((r) => {
      stats.byType[r.messageType] = (stats.byType[r.messageType] || 0) + 1;
    });

    return stats;
  }
}

export const kvSMSStorage: SMSStorage = new KVSMSStorage();


