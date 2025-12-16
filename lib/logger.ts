import { env } from "@/lib/env";

export type LogLevel = "info" | "error";

const slackWebhook = env.SLACK_WEBHOOK_URL;

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

  if (!slackWebhook) return;

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
