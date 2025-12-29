/**
 * Perplexity Rate Limiter
 * 
 * Implements rate limiting and queuing for Perplexity API requests to respect
 * the 300 searches/day limit. Provides queue management and fair distribution.
 * 
 * Critical: Perplexity PRO has a hard limit of 300 searches/day across ALL clients.
 */

import {
  getTodayUsageStats,
  incrementUsage,
  canMakeRequest,
  type PerplexityUsageStats,
} from "./perplexity-usage-tracker";

export interface QueuedRequest {
  id: string;
  timestamp: number;
  priority: "high" | "medium" | "low";
  operation: string; // e.g., "consciousness-journey", "proposal-generation"
  clientId?: string;
  retryCount: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  estimatedWaitTime?: number; // seconds
  queuePosition?: number;
  stats?: PerplexityUsageStats;
}

// In-memory queue (in production, use Redis or database)
const requestQueue: QueuedRequest[] = [];
let processingQueue = false;

// Rate limiting: max searches per hour to distribute throughout the day
const MAX_SEARCHES_PER_HOUR = 15; // 300 / 20 hours (assuming 20 active hours/day)
const MAX_SEARCHES_PER_MINUTE = 1; // Conservative limit

// Track hourly usage
const hourlyUsage: Map<string, number> = new Map(); // key: "YYYY-MM-DD-HH", value: count

/**
 * Get current hour key for tracking
 */
function getCurrentHourKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Get current minute key for tracking
 */
function getCurrentMinuteKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}-${minute}`;
}

/**
 * Check if we can make a request right now (rate limiting)
 */
function canMakeRequestNow(): boolean {
  const hourKey = getCurrentHourKey();
  const minuteKey = getCurrentMinuteKey();

  const hourCount = hourlyUsage.get(hourKey) ?? 0;
  const minuteCount = hourlyUsage.get(minuteKey) ?? 0;

  // Check hourly limit
  if (hourCount >= MAX_SEARCHES_PER_HOUR) {
    return false;
  }

  // Check minute limit
  if (minuteCount >= MAX_SEARCHES_PER_MINUTE) {
    return false;
  }

  return true;
}

/**
 * Record a search in the hourly/minute tracking
 */
function recordSearch(): void {
  const hourKey = getCurrentHourKey();
  const minuteKey = getCurrentMinuteKey();

  const hourCount = hourlyUsage.get(hourKey) ?? 0;
  const minuteCount = hourlyUsage.get(minuteKey) ?? 0;

  hourlyUsage.set(hourKey, hourCount + 1);
  hourlyUsage.set(minuteKey, minuteCount + 1);

  // Clean up old entries (keep last 24 hours)
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);
  const cutoffKey = `${cutoff.getUTCFullYear()}-${String(cutoff.getUTCMonth() + 1).padStart(2, "0")}-${String(cutoff.getUTCDate()).padStart(2, "0")}-${String(cutoff.getUTCHours()).padStart(2, "0")}`;

  for (const [key] of hourlyUsage) {
    if (key < cutoffKey) {
      hourlyUsage.delete(key);
    }
  }
}

/**
 * Check if a Perplexity request should be allowed
 * Returns result with queue information if needed
 */
export async function checkRateLimit(
  _priority: QueuedRequest["priority"] = "medium",
  _operation: string = "unknown"
): Promise<RateLimitResult> {
  // First check daily limit
  const canMake = await canMakeRequest();
  if (!canMake) {
    const stats = await getTodayUsageStats();
    return {
      allowed: false,
      reason: "Daily limit exceeded (300 searches/day)",
      stats,
    };
  }

  // Check rate limiting (hourly/minute limits)
  if (!canMakeRequestNow()) {
    const stats = await getTodayUsageStats();
    const estimatedWait = 60; // Wait 1 minute
    return {
      allowed: false,
      reason: "Rate limit: too many requests in current hour/minute",
      estimatedWaitTime: estimatedWait,
      stats,
    };
  }

  // All checks passed
  const stats = await getTodayUsageStats();
  return {
    allowed: true,
    stats,
  };
}

/**
 * Execute a Perplexity request with rate limiting
 * Automatically increments usage counter
 */
export async function executeWithRateLimit<T>(
  requestFn: () => Promise<T>,
  priority: QueuedRequest["priority"] = "medium",
  operation: string = "unknown"
): Promise<{
  success: boolean;
  result?: T;
  error?: string;
  stats?: PerplexityUsageStats;
}> {
  // Check rate limit
  const rateLimitCheck = await checkRateLimit(priority, operation);

  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: rateLimitCheck.reason,
      stats: rateLimitCheck.stats,
    };
  }

  // Increment usage counter before making request
  const usageResult = await incrementUsage();

  if (!usageResult.success || usageResult.exceeded) {
    return {
      success: false,
      error: "Failed to increment usage counter or limit exceeded",
      stats: await getTodayUsageStats(),
    };
  }

  // Record in hourly/minute tracking
  recordSearch();

  try {
    // Execute the actual request
    const result = await requestFn();

    return {
      success: true,
      result,
      stats: await getTodayUsageStats(),
    };
  } catch (error) {
    // If request fails, we should ideally decrement the counter
    // But for simplicity, we'll leave it as is (failed requests still count)
    // In production, you might want to implement a retry mechanism
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stats: await getTodayUsageStats(),
    };
  }
}

/**
 * Add request to queue (for future implementation)
 */
export async function queueRequest(
  priority: QueuedRequest["priority"],
  operation: string,
  clientId?: string
): Promise<{ queueId: string; position: number }> {
  const queueId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const request: QueuedRequest = {
    id: queueId,
    timestamp: Date.now(),
    priority,
    operation,
    clientId,
    retryCount: 0,
  };

  // Insert based on priority (high first, then medium, then low)
  const priorityOrder: Record<QueuedRequest["priority"], number> = { high: 0, medium: 1, low: 2 };
  const insertIndex = requestQueue.findIndex(
    (r) => (priorityOrder[r.priority] ?? 2) > (priorityOrder[priority] ?? 2)
  );

  if (insertIndex === -1) {
    requestQueue.push(request);
  } else {
    requestQueue.splice(insertIndex, 0, request);
  }

  return {
    queueId,
    position: requestQueue.findIndex((r) => r.id === queueId) + 1,
  };
}

/**
 * Process queued requests (for future implementation)
 * This would be called by a background job or cron
 */
export async function processQueue(): Promise<void> {
  if (processingQueue) {
    return; // Already processing
  }

  processingQueue = true;

  try {
    while (requestQueue.length > 0) {
      const rateLimitCheck = await checkRateLimit();
      if (!rateLimitCheck.allowed) {
        // Can't process more requests right now
        break;
      }

      const request = requestQueue.shift();
      if (!request) {
        break;
      }

      // Process request (this would call the actual Perplexity API)
      // For now, we just remove it from the queue
      // In production, you'd execute the actual request here
    }
  } finally {
    processingQueue = false;
  }
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  queueLength: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
} {
  return {
    queueLength: requestQueue.length,
    highPriority: requestQueue.filter((r) => r.priority === "high").length,
    mediumPriority: requestQueue.filter((r) => r.priority === "medium").length,
    lowPriority: requestQueue.filter((r) => r.priority === "low").length,
  };
}

