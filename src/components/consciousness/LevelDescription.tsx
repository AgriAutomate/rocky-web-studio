"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConsciousnessLevel } from "@/types/consciousness";

export type LevelDescriptionProps = {
  /** Level number (2–18) or a full ConsciousnessLevel object. */
  level: number | ConsciousnessLevel;
  /** Compact, single-line rendering. */
  compact?: boolean;
  /** Show the small color indicator square. */
  showColor?: boolean;
};

type LevelMeta = {
  level: number;
  name: string;
  description: string;
  characteristics: string[];
  energy_level: number; // 1-10
  color_hex: string;
};

// Built-in Hawkins 9-level mapping + required colors (fallback when only a number is provided).
const DEFAULT_LEVELS: LevelMeta[] = [
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

function snapToNearest(level: number) {
  const v = clampInt(Math.round(level), 2, 18);
  let best = DEFAULT_LEVELS[0]!.level;
  let bestDist = Math.abs(best - v);
  for (const l of DEFAULT_LEVELS) {
    const dist = Math.abs(l.level - v);
    if (dist < bestDist) {
      bestDist = dist;
      best = l.level;
    }
  }
  return best;
}

function toMeta(input: number | ConsciousnessLevel): LevelMeta | null {
  if (typeof input === "number") {
    const snapped = snapToNearest(input);
    return DEFAULT_LEVELS.find((l) => l.level === snapped) ?? null;
  }

  // ConsciousnessLevel (app-facing) is already non-nullable for these fields.
  return {
    level: input.level,
    name: input.name,
    description: input.description,
    characteristics: input.characteristics ?? [],
    energy_level: input.energy_level,
    color_hex: input.color_hex,
  };
}

function brief(desc: string) {
  const s = (desc ?? "").trim();
  if (!s) return "—";
  const firstSentence = s.split(".")[0]?.trim();
  const base = firstSentence && firstSentence.length > 6 ? `${firstSentence}.` : s;
  return base.length > 90 ? `${base.slice(0, 87)}…` : base;
}

function hexToRgba(hex: string, alpha: number) {
  const h = (hex ?? "").trim().replace("#", "");
  if (h.length !== 6) return `rgba(15,118,110,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (![r, g, b].every((x) => Number.isFinite(x))) return `rgba(15,118,110,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function EnergyBar({ value, color }: { value: number; color: string }) {
  const n = clampInt(value, 0, 10);
  return (
    <div className="grid grid-cols-10 gap-1" aria-label={`Energy ${n} out of 10`}>
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

export function LevelDescription({
  level,
  compact = false,
  showColor = true,
}: LevelDescriptionProps) {
  const meta = React.useMemo(() => toMeta(level), [level]);

  if (!meta) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        Level info unavailable.
      </div>
    );
  }

  const energy = clampInt(meta.energy_level, 1, 10);
  const color = (meta.color_hex ?? "#0f766e").toUpperCase();
  const colorIsWhite = color === "#FFFFFF";

  const bg = hexToRgba(meta.color_hex ?? "#0f766e", compact ? 0.08 : 0.10);

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
        style={{ backgroundColor: bg }}
      >
        {showColor ? (
          <span
            className="h-3 w-3 shrink-0 rounded-sm border border-border"
            style={{
              backgroundColor: meta.color_hex,
              borderColor: colorIsWhite ? "rgba(0,0,0,0.25)" : undefined,
            }}
            aria-hidden="true"
          />
        ) : null}
        <div className="min-w-0 truncate text-sm text-foreground">
          <span className="font-medium">{meta.name}</span>
          <span className="text-muted-foreground"> — {brief(meta.description)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{ backgroundColor: bg }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {showColor ? (
            <span
              className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
              style={{
                backgroundColor: meta.color_hex,
                borderColor: colorIsWhite ? "rgba(0,0,0,0.25)" : undefined,
              }}
              aria-hidden="true"
            />
          ) : null}
          <div>
            <div className="text-lg font-semibold text-foreground">
              {meta.name} <span className="text-muted-foreground">(Level {meta.level})</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{meta.description || "—"}</div>
          </div>
        </div>

        <Badge
          className="w-fit border-transparent"
          style={{
            backgroundColor: meta.color_hex,
            color: colorIsWhite ? "#111827" : undefined,
          }}
          title="Level color"
        >
          Energy {energy}/10
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Energy</span>
            <span className="tabular-nums">{energy}/10</span>
          </div>
          <EnergyBar value={energy} color={meta.color_hex} />
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-foreground">Characteristics</div>
          {(meta.characteristics ?? []).length ? (
            <div className="flex flex-wrap gap-2">
              {meta.characteristics.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">—</div>
          )}
        </div>
      </div>
    </div>
  );
}

