// Lazy import env to prevent module-load-time errors
// Don't import env at module scope - it will be accessed lazily

export type LogLevel = "info" | "error";

// Lazy getter for Slack webhook - only accessed when actually logging
// Uses dynamic import to prevent build-time errors when env vars are missing
async function getSlackWebhook(): Promise<string | undefined> {
  try {
    // Dynamic import to prevent build-time errors
    const { env } = await import("@/lib/env");
    return env.SLACK_WEBHOOK_URL;
  } catch {
    // If env import fails (e.g., missing vars), just skip Slack logging
    return undefined;
  }
}

/**
 * Low-level logging helper that writes to stdout and optionally posts to Slack.
 */
export async function logMessage(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const payload = {
    level,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };

  // Log to stdout for debugging / Cloud logging
  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : "log"]("[rws]", JSON.stringify(payload));

  // Get Slack webhook lazily (only when actually logging)
  const slackWebhook = await getSlackWebhook();
  if (!slackWebhook || typeof slackWebhook !== 'string') return;

  try {
    await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${message}\n\`\`\`${JSON.stringify(meta ?? {}, null, 2)}\`\`\`` }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[rws] Failed to send log to Slack", err);
  }
}

/**
 * Structured logger interface for use across the app.
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => logMessage("info", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logMessage("error", message, meta),
};
