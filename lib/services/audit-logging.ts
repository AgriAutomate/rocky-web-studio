/**
 * Audit Service Logging Utilities
 * 
 * Specialized logging helpers for website audit operations.
 * Extends the base logger with audit-specific context.
 */

import { logger } from "@/lib/utils/logger";

/**
 * Log audit start
 */
export async function logAuditStart(
  questionnaireResponseId: string | number,
  websiteUrl: string
): Promise<void> {
  await logger.info("Website audit started", {
    questionnaireResponseId,
    websiteUrl,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log audit completion
 */
export async function logAuditComplete(
  questionnaireResponseId: string | number,
  websiteUrl: string,
  durationMs: number,
  auditResult?: {
    platform?: string;
    performanceScore?: number;
    seoScore?: number;
  }
): Promise<void> {
  await logger.info("Website audit completed", {
    questionnaireResponseId,
    websiteUrl,
    durationMs,
    ...auditResult,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log audit error
 */
export async function logAuditError(
  questionnaireResponseId: string | number,
  websiteUrl: string,
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  await logger.error("Website audit failed", {
    questionnaireResponseId,
    websiteUrl,
    error: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log audit timeout
 */
export async function logAuditTimeout(
  questionnaireResponseId: string | number,
  websiteUrl: string,
  timeoutMs: number
): Promise<void> {
  await logger.error("Website audit timeout", {
    questionnaireResponseId,
    websiteUrl,
    timeoutMs,
    timestamp: new Date().toISOString(),
  });
}
