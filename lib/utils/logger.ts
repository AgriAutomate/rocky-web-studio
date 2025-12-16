import { logger as coreLogger, logMessage } from "@/lib/logger";

/**
 * Convenience helper for error-level logging with optional structured metadata.
 *
 * Wraps the core logger so call sites can pass an Error or unknown safely.
 */
export async function logError(
  message: string,
  error: unknown,
  meta?: Record<string, unknown>
): Promise<void> {
  const payload: Record<string, unknown> = {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
  };

  await logMessage("error", message, payload);
}

/**
 * High-level logger interface for API routes and business logic.
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => coreLogger.info(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => coreLogger.error(message, meta),
};
