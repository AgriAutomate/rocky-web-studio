/**
 * Perplexity Usage Tracker
 * 
 * Tracks daily Perplexity API usage to ensure we stay under the 300 searches/day limit.
 * Uses Supabase or Redis to persist daily counters.
 * 
 * Critical: Perplexity PRO has a hard limit of 300 searches/day across ALL clients.
 */

import { createServerSupabaseClient } from "@/lib/supabase/client";

export interface PerplexityUsageStats {
  date: string; // YYYY-MM-DD format
  totalSearches: number;
  remainingSearches: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "critical" | "emergency" | "exceeded";
}

export interface PerplexityUsageRecord {
  id: string;
  date: string;
  searches: number;
  created_at: string;
  updated_at: string;
}

const DAILY_LIMIT = 300;
const WARNING_THRESHOLD = 200; // 67% utilization
const CRITICAL_THRESHOLD = 250; // 83% utilization
const EMERGENCY_THRESHOLD = 290; // 97% utilization

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Get current usage stats for today
 */
export async function getTodayUsageStats(): Promise<PerplexityUsageStats> {
  const today = getTodayDate();
  const supabase = createServerSupabaseClient(true);

  // Try to get today's record from database
  // Note: This assumes a 'perplexity_usage' table exists
  // If not using database, fall back to in-memory or Redis
  // Using type assertion since table may not be in types yet
  const { data, error: _error } = await (supabase as any)
    .from("perplexity_usage")
    .select("*")
    .eq("date", today)
    .single();

  const totalSearches = (data as { searches?: number } | null)?.searches ?? 0;
  const remainingSearches = Math.max(0, DAILY_LIMIT - totalSearches);
  const utilizationPercent = (totalSearches / DAILY_LIMIT) * 100;

  let status: PerplexityUsageStats["status"] = "safe";
  if (totalSearches >= DAILY_LIMIT) {
    status = "exceeded";
  } else if (totalSearches >= EMERGENCY_THRESHOLD) {
    status = "emergency";
  } else if (totalSearches >= CRITICAL_THRESHOLD) {
    status = "critical";
  } else if (totalSearches >= WARNING_THRESHOLD) {
    status = "warning";
  }

  return {
    date: today,
    totalSearches,
    remainingSearches,
    utilizationPercent,
    status,
  };
}

/**
 * Increment today's usage counter
 * Returns the new total and whether the limit was exceeded
 */
export async function incrementUsage(): Promise<{
  success: boolean;
  totalSearches: number;
  remainingSearches: number;
  exceeded: boolean;
}> {
  const today = getTodayDate();
  const supabase = createServerSupabaseClient(true);

  // Get current count
  const stats = await getTodayUsageStats();

  // Check if limit already exceeded
  if (stats.totalSearches >= DAILY_LIMIT) {
    return {
      success: false,
      totalSearches: stats.totalSearches,
      remainingSearches: 0,
      exceeded: true,
    };
  }

  const newTotal = stats.totalSearches + 1;
  const remainingSearches = Math.max(0, DAILY_LIMIT - newTotal);
  const exceeded = newTotal >= DAILY_LIMIT;

  // Upsert today's record
  // Using type assertion since table may not be in types yet
  const { error } = await (supabase as any)
    .from("perplexity_usage")
    .upsert(
      {
        date: today,
        searches: newTotal,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "date",
      }
    );

  if (error) {
    console.error("Failed to update Perplexity usage:", error);
    // Fall back to in-memory tracking if database fails
    // In production, consider using Redis or Vercel KV
    return {
      success: false,
      totalSearches: stats.totalSearches,
      remainingSearches: stats.remainingSearches,
      exceeded: false,
    };
  }

  return {
    success: true,
    totalSearches: newTotal,
    remainingSearches,
    exceeded,
  };
}

/**
 * Check if we can make a Perplexity request (not at limit)
 */
export async function canMakeRequest(): Promise<boolean> {
  const stats = await getTodayUsageStats();
  return stats.totalSearches < DAILY_LIMIT;
}

/**
 * Get usage stats for a specific date
 */
export async function getUsageStatsForDate(
  date: string
): Promise<PerplexityUsageStats | null> {
  const supabase = createServerSupabaseClient(true);

  // Using type assertion since table may not be in types yet
  const { data, error } = await (supabase as any)
    .from("perplexity_usage")
    .select("*")
    .eq("date", date)
    .single();

  if (error || !data) {
    return null;
  }

  const totalSearches = (data as { searches?: number }).searches ?? 0;
  const remainingSearches = Math.max(0, DAILY_LIMIT - totalSearches);
  const utilizationPercent = (totalSearches / DAILY_LIMIT) * 100;

  let status: PerplexityUsageStats["status"] = "safe";
  if (totalSearches >= DAILY_LIMIT) {
    status = "exceeded";
  } else if (totalSearches >= EMERGENCY_THRESHOLD) {
    status = "emergency";
  } else if (totalSearches >= CRITICAL_THRESHOLD) {
    status = "critical";
  } else if (totalSearches >= WARNING_THRESHOLD) {
    status = "warning";
  }

  return {
    date,
    totalSearches,
    remainingSearches,
    utilizationPercent,
    status,
  };
}

/**
 * Get usage stats for the last N days
 */
export async function getUsageHistory(
  days: number = 30
): Promise<PerplexityUsageStats[]> {
  const supabase = createServerSupabaseClient(true);
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  // Using type assertion since table may not be in types yet
  const { data, error } = await (supabase as any)
    .from("perplexity_usage")
    .select("*")
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as Array<{ date: string; searches?: number }>).map((record) => {
    const totalSearches = record.searches ?? 0;
    const remainingSearches = Math.max(0, DAILY_LIMIT - totalSearches);
    const utilizationPercent = (totalSearches / DAILY_LIMIT) * 100;

    let status: PerplexityUsageStats["status"] = "safe";
    if (totalSearches >= DAILY_LIMIT) {
      status = "exceeded";
    } else if (totalSearches >= EMERGENCY_THRESHOLD) {
      status = "emergency";
    } else if (totalSearches >= CRITICAL_THRESHOLD) {
      status = "critical";
    } else if (totalSearches >= WARNING_THRESHOLD) {
      status = "warning";
    }

    return {
      date: record.date as string,
      totalSearches,
      remainingSearches,
      utilizationPercent,
      status,
    };
  });
}

/**
 * Send alert if usage exceeds thresholds
 * This should be called after incrementing usage
 */
export async function checkAndSendAlerts(
  stats: PerplexityUsageStats
): Promise<void> {
  // TODO: Implement alerting system
  // Options:
  // - Email alerts via Resend
  // - SMS alerts via Mobile Message
  // - Slack/Discord webhooks
  // - Sentry alerts

  if (stats.status === "emergency" || stats.status === "exceeded") {
    console.error(
      `🚨 Perplexity usage ${stats.status}: ${stats.totalSearches}/${DAILY_LIMIT} searches used today`
    );
    // Send critical alert
  } else if (stats.status === "critical") {
    console.warn(
      `⚠️ Perplexity usage critical: ${stats.totalSearches}/${DAILY_LIMIT} searches used today`
    );
    // Send critical alert
  } else if (stats.status === "warning") {
    console.warn(
      `⚠️ Perplexity usage warning: ${stats.totalSearches}/${DAILY_LIMIT} searches used today`
    );
    // Send warning alert
  }
}

