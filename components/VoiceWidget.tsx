"use client";

import { Mic } from "lucide-react";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

const STATUS_LABEL: Record<string, string> = {
  idle: "Talk to assistant",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

export function VoiceWidget() {
  const { status, interimTranscript, start, stop } = useVoiceConversation();
  const isActive = status !== "idle";

  return (
    <div className="fixed bottom-6 right-24 z-50">
      {status === "error" ? (
        <div className="w-52 rounded-2xl border border-border bg-background p-4 shadow-xl">
          <p className="mb-3 text-sm font-medium text-destructive">{STATUS_LABEL.error}</p>
          <button
            type="button"
            onClick={start}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Try again
          </button>
        </div>
      ) : !isActive ? (
        <button
          type="button"
          onClick={start}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Start voice conversation"
          title={STATUS_LABEL.idle}
        >
          <Mic className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">{STATUS_LABEL.idle}</span>
        </button>
      ) : (
        <div className="w-52 rounded-2xl border border-border bg-background p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            {status === "listening" && (
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-red-500"
                aria-hidden="true"
              />
            )}
            {status === "speaking" && (
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
            {status === "thinking" && (
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"
                aria-hidden="true"
              />
            )}
            <p className="text-sm font-medium text-foreground" aria-live="polite">
              {STATUS_LABEL[status]}
            </p>
          </div>
          {interimTranscript && status === "listening" && (
            <p className="mb-3 line-clamp-3 text-xs text-muted-foreground">
              {interimTranscript}
            </p>
          )}
          <button
            type="button"
            onClick={stop}
            className="w-full rounded-lg bg-destructive py-2 text-sm font-medium text-destructive-foreground transition-all hover:opacity-90"
          >
            End conversation
          </button>
        </div>
      )}
    </div>
  );
}
