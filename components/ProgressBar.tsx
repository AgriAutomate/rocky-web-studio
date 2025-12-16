"use client";

import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {current} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-[6px] w-full rounded-full bg-muted">
        <div
          className={cn(
            "h-[6px] rounded-full bg-primary transition-all duration-500 ease-out shadow-sm",
            pct === 100 ? "shadow-primary/40" : ""
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
