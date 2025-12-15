"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ConsciousnessLevelMeta = {
  level: number; // 2-18
  name: string;
  description: string;
  characteristics: string[];
  energy_level: number; // 1-10
  color_hex: string;
};

export type ConsciousnessSliderProps = {
  /** Current slider value (2–18). */
  value: number;
  /** Called with the snapped integer value (2–18). */
  onChange: (value: number) => void;

  min?: number; // default 2
  max?: number; // default 18
  disabled?: boolean; // default false

  showLabel?: boolean; // default true
  showDescription?: boolean; // default true

  /**
   * Optional second value to render on the same track (e.g. current vs desired).
   * This is visual-only (non-interactive).
   */
  secondaryValue?: number;

  size?: "small" | "medium" | "large";

  /**
   * Optional level metadata.
   *
   * If not provided, the component uses a built-in Hawkins 9-level mapping
   * with the color rules specified in requirements.
   */
  levels?: ConsciousnessLevelMeta[];

  /** ARIA label for the interactive slider. */
  ariaLabel?: string;
};

const DEFAULT_LEVELS: ConsciousnessLevelMeta[] = [
  {
    level: 2,
    name: "Shame",
    description: "Despair, unworthiness, collapse.",
    characteristics: ["despair", "unworthiness", "collapse"],
    energy_level: 1,
    color_hex: "#8B0000",
  },
  {
    level: 4,
    name: "Guilt",
    description: "Regret, shame projection, vulnerability.",
    characteristics: ["regret", "vulnerability", "self-blame"],
    energy_level: 2,
    color_hex: "#FF4500",
  },
  {
    level: 6,
    name: "Apathy",
    description: "Indifference, numbness, pause, futility.",
    characteristics: ["numbness", "pause", "futility"],
    energy_level: 3,
    color_hex: "#FFD700",
  },
  {
    level: 8,
    name: "Fear",
    description: "Anxiety, worry, uncertainty, building.",
    characteristics: ["anxiety", "worry", "uncertainty"],
    energy_level: 7,
    color_hex: "#FFA500",
  },
  {
    level: 10,
    name: "Anger",
    description: "Power, assertion, truth-telling, strength.",
    characteristics: ["assertion", "truth-telling", "strength"],
    energy_level: 8,
    color_hex: "#FF6347",
  },
  {
    level: 12,
    name: "Desire",
    description: "Ambition, wanting, striving, growth.",
    characteristics: ["ambition", "striving", "growth"],
    energy_level: 7,
    color_hex: "#FFD700",
  },
  {
    level: 14,
    name: "Reason",
    description: "Understanding, clarity, logic, balance.",
    characteristics: ["clarity", "logic", "balance"],
    energy_level: 5,
    color_hex: "#4169E1",
  },
  {
    level: 16,
    name: "Loving",
    description: "Compassion, acceptance, forgiveness.",
    characteristics: ["compassion", "acceptance", "forgiveness"],
    energy_level: 4,
    color_hex: "#9370DB",
  },
  {
    level: 18,
    name: "Joy",
    description: "Happiness, fulfillment, creation, presence.",
    characteristics: ["presence", "creation", "fulfillment"],
    energy_level: 4,
    color_hex: "#FFFFFF",
  },
];

function clampInt(n: number, min: number, max: number) {
  const v = Math.floor(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function sortLevels(levels: ConsciousnessLevelMeta[]) {
  return [...levels].sort((a, b) => a.level - b.level);
}

function snapToAvailableLevels(value: number, levels: ConsciousnessLevelMeta[], min: number, max: number) {
  const v = clampInt(value, min, max);
  if (!levels.length) return v;
  let best = levels[0]!.level;
  let bestDist = Math.abs(best - v);
  for (const l of levels) {
    const dist = Math.abs(l.level - v);
    if (dist < bestDist) {
      bestDist = dist;
      best = l.level;
    }
  }
  return clampInt(best, min, max);
}

function pctForValue(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function buildGradient(levels: ConsciousnessLevelMeta[]) {
  const sorted = sortLevels(levels);
  if (sorted.length === 0) return "linear-gradient(90deg, #8B0000, #FFFFFF)";
  const n = sorted.length - 1;
  const stops = sorted.map((l, i) => {
    const pct = n === 0 ? 0 : (i / n) * 100;
    return `${l.color_hex} ${pct.toFixed(2)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function levelForValue(levels: ConsciousnessLevelMeta[], v: number) {
  return levels.find((l) => l.level === v) ?? null;
}

function sizeStyles(size: NonNullable<ConsciousnessSliderProps["size"]>) {
  switch (size) {
    case "small":
      return { track: "h-2", thumb: "h-4 w-4", label: "text-sm", sub: "text-xs" };
    case "large":
      return { track: "h-4", thumb: "h-6 w-6", label: "text-lg", sub: "text-sm" };
    case "medium":
    default:
      return { track: "h-3", thumb: "h-5 w-5", label: "text-base", sub: "text-sm" };
  }
}

function EnergyBar({ value, color }: { value: number; color: string }) {
  const n = clampInt(value, 0, 10);
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < n;
        return (
          <div
            key={i}
            className={cn(
              "h-2 rounded-sm border border-border/70 transition-colors",
              filled ? "" : "bg-muted"
            )}
            style={filled ? { backgroundColor: color } : undefined}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

function TickLabels({
  levels,
  min,
  max,
}: {
  levels: ConsciousnessLevelMeta[];
  min: number;
  max: number;
}) {
  const ticks = sortLevels(levels).filter((l) => l.level >= min && l.level <= max);
  return (
    <div className="mt-3 hidden grid-cols-9 gap-2 text-[11px] text-muted-foreground sm:grid">
      {ticks.map((t) => (
        <div key={t.level} className="text-center">
          {t.name}
        </div>
      ))}
    </div>
  );
}

export function ConsciousnessSlider({
  value,
  onChange,
  min = 2,
  max = 18,
  disabled = false,
  showLabel = true,
  showDescription = true,
  secondaryValue,
  size = "medium",
  levels: levelsProp,
  ariaLabel,
}: ConsciousnessSliderProps) {
  const levels = React.useMemo(
    () => sortLevels((levelsProp?.length ? levelsProp : DEFAULT_LEVELS).slice()),
    [levelsProp]
  );

  const snapped = snapToAvailableLevels(value, levels, min, max);
  const snappedSecondary =
    typeof secondaryValue === "number"
      ? snapToAvailableLevels(secondaryValue, levels, min, max)
      : null;

  // Keep external state snapped (helps when callers pass non-scale values)
  React.useEffect(() => {
    if (snapped !== value) onChange(snapped);
  }, [snapped, value, onChange]);

  const meta = levelForValue(levels, snapped);
  const meta2 = snappedSecondary != null ? levelForValue(levels, snappedSecondary) : null;

  const gradient = buildGradient(levels);

  const s = sizeStyles(size);

  const pct = pctForValue(snapped, min, max);
  const pct2 = snappedSecondary != null ? pctForValue(snappedSecondary, min, max) : null;
  const loPct = pct2 != null ? Math.min(pct, pct2) : pct;
  const hiPct = pct2 != null ? Math.max(pct, pct2) : pct;

  const primaryColor = meta?.color_hex ?? "#0f766e";
  const secondaryColor = meta2?.color_hex ?? "#64748b";

  const pathGradient =
    pct2 != null
      ? `linear-gradient(90deg, ${secondaryColor}, ${primaryColor})`
      : primaryColor;

  return (
    <div className="space-y-3">
      <div className="relative rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-ring">
        {/* Track */}
        <div
          className={cn(
            "relative w-full rounded-full border border-border bg-muted",
            s.track,
            disabled ? "opacity-60" : "opacity-100"
          )}
          style={{ backgroundImage: gradient }}
          aria-hidden="true"
        >
          {/* Optional “journey path” between two values */}
          {pct2 != null ? (
            <div
              className="absolute top-0 h-full rounded-full"
              style={{
                left: `${loPct}%`,
                width: `${hiPct - loPct}%`,
                backgroundImage: pathGradient,
                opacity: 0.55,
              }}
            />
          ) : null}

          {/* Secondary thumb (faded) */}
          {pct2 != null ? (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border border-border bg-background shadow-sm",
                s.thumb
              )}
              style={{
                left: `${pct2}%`,
                boxShadow: `0 0 0 3px ${secondaryColor}22`,
                opacity: 0.75,
              }}
              title={meta2 ? `${meta2.level} — ${meta2.name}` : undefined}
            >
              <div
                className="h-full w-full rounded-full"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          ) : null}

          {/* Primary thumb */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border border-border bg-background shadow-sm",
              s.thumb
            )}
            style={{
              left: `${pct}%`,
              boxShadow: `0 0 0 4px ${primaryColor}25`,
            }}
            title={meta ? `${meta.level} — ${meta.name}\n${meta.description}` : undefined}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                backgroundColor: primaryColor,
                // White thumb needs contrast
                border: primaryColor.toUpperCase() === "#FFFFFF" ? "1px solid rgba(0,0,0,0.35)" : undefined,
              }}
            />
          </div>
        </div>

        {/* Native input (interactive, invisible) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={snapped}
          disabled={disabled}
          aria-label={ariaLabel ?? "Consciousness level slider"}
          className={cn(
            "absolute left-0 top-0 w-full cursor-pointer opacity-0",
            // Ensure the input overlays the track height for easy touch targeting
            size === "large" ? "h-10" : size === "small" ? "h-8" : "h-9",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          onKeyDown={(e) => {
            // Ensure the slider stays snapped to available levels when using arrow keys.
            if (disabled) return;
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(snapToAvailableLevels(snapped - 1, levels, min, max));
            }
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(snapToAvailableLevels(snapped + 1, levels, min, max));
            }
          }}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const next = snapToAvailableLevels(raw, levels, min, max);
            onChange(next);
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{min}</span>
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>

      <TickLabels levels={levels} min={min} max={max} />

      {showLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className={cn("font-semibold text-foreground", s.label)}>
            {meta ? `Level ${meta.level}: ${meta.name}` : `Level ${snapped}`}
          </div>
          {meta2 ? (
            <Badge variant="outline" className="gap-2">
              <span className="text-muted-foreground">Secondary</span>
              <span className="font-medium text-foreground">
                {meta2.level}: {meta2.name}
              </span>
            </Badge>
          ) : null}
        </div>
      ) : null}

      {showDescription ? (
        <div className="rounded-2xl border border-border bg-background p-4">
          {meta ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className={cn("font-medium text-foreground", s.sub)}>Meaning</div>
                <Badge
                  className="border-transparent text-primary-foreground"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryColor.toUpperCase() === "#FFFFFF" ? "#111827" : undefined,
                  }}
                  title="Level color"
                >
                  {meta.name}
                </Badge>
              </div>

              <p className={cn("text-muted-foreground", s.sub)}>{meta.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn("text-muted-foreground", s.sub)}>Energy</span>
                  <span className={cn("text-muted-foreground", s.sub)}>
                    {clampInt(meta.energy_level, 1, 10)}/10
                  </span>
                </div>
                <EnergyBar value={meta.energy_level} color={primaryColor} />
              </div>

              {(meta.characteristics ?? []).length ? (
                <div className="flex flex-wrap gap-2">
                  {meta.characteristics.map((c) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className={cn("text-muted-foreground", s.sub)}>—</div>
              )}
            </div>
          ) : (
            <div className={cn("text-muted-foreground", s.sub)}>—</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

