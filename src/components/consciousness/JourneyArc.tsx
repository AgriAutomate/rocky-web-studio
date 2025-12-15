"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type JourneyArcProps = {
  currentLevel: number; // 2-18
  desiredLevel: number; // 2-18
  showLabels?: boolean; // default true
  animated?: boolean; // default true
  height?: number; // default 200
  width?: number; // default 400
  /**
   * Optional duration estimate (seconds). If provided, it will be displayed.
   */
  estimatedDurationSeconds?: number;
  className?: string;
};

type LevelMeta = { level: number; name: string; color_hex: string };

// Built-in Hawkins 9-level mapping + required colors.
const LEVELS: LevelMeta[] = [
  { level: 2, name: "Shame", color_hex: "#8B0000" },
  { level: 4, name: "Guilt", color_hex: "#FF4500" },
  { level: 6, name: "Apathy", color_hex: "#FFD700" },
  { level: 8, name: "Fear", color_hex: "#FFA500" },
  { level: 10, name: "Anger", color_hex: "#FF6347" },
  { level: 12, name: "Desire", color_hex: "#FFD700" },
  { level: 14, name: "Reason", color_hex: "#4169E1" },
  { level: 16, name: "Loving", color_hex: "#9370DB" },
  { level: 18, name: "Joy", color_hex: "#FFFFFF" },
];

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function snapToNearestLevel(level: number) {
  const v = clamp(Math.round(level), 2, 18);
  let best = LEVELS[0]!.level;
  let bestDist = Math.abs(best - v);
  for (const l of LEVELS) {
    const dist = Math.abs(l.level - v);
    if (dist < bestDist) {
      bestDist = dist;
      best = l.level;
    }
  }
  return best;
}

function levelMeta(level: number): LevelMeta {
  const snapped = snapToNearestLevel(level);
  return LEVELS.find((l) => l.level === snapped) ?? LEVELS[0]!;
}

function xForLevel(level: number, width: number, pad: number) {
  const min = 2;
  const max = 18;
  const t = (clamp(level, min, max) - min) / (max - min);
  return pad + t * (width - pad * 2);
}

function deltaLabel(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return "0";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function formatEta(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

export function JourneyArc({
  currentLevel,
  desiredLevel,
  showLabels = true,
  animated = true,
  height = 200,
  width = 400,
  estimatedDurationSeconds,
  className,
}: JourneyArcProps) {
  const cur = React.useMemo(() => levelMeta(currentLevel), [currentLevel]);
  const des = React.useMemo(() => levelMeta(desiredLevel), [desiredLevel]);

  const w = Math.max(240, width);
  const h = Math.max(140, height);
  const pad = 18;
  const yBase = h - 28;

  const x1 = xForLevel(cur.level, w, pad);
  const x2 = xForLevel(des.level, w, pad);
  const xMid = (x1 + x2) / 2;

  const delta = des.level - cur.level;
  const distanceNorm = clamp(Math.abs(delta) / (18 - 2), 0, 1);
  // “Emotional intensity” = higher arc with larger distance, but always has a little lift.
  const arcLift = (0.25 + distanceNorm * 0.55) * (h - 70);
  const yCtrl = clamp(yBase - arcLift, 18, yBase - 10);

  const d = `M ${x1} ${yBase} Q ${xMid} ${yCtrl} ${x2} ${yBase}`;
  const fillD = `M ${x1} ${yBase} Q ${xMid} ${yCtrl} ${x2} ${yBase} L ${x2} ${yBase} L ${x1} ${yBase} Z`;

  const pathRef = React.useRef<SVGPathElement | null>(null);
  const [pathLen, setPathLen] = React.useState<number>(0);
  const [dashOffset, setDashOffset] = React.useState<number>(0);

  React.useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    try {
      const len = p.getTotalLength();
      setPathLen(len);

      if (!animated) {
        setDashOffset(0);
        return;
      }

      // Restart animation on change
      setDashOffset(len);
      const id = window.setTimeout(() => setDashOffset(0), 30);
      return () => window.clearTimeout(id);
    } catch {
      setPathLen(0);
      setDashOffset(0);
    }
  }, [d, animated]);

  const startText = `Current: ${cur.name}`;
  const endText = `Desired: ${des.name}`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Journey arc from ${cur.name} to ${des.name}`}
        className="block"
      >
        <defs>
          <linearGradient id="journeyStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cur.color_hex} />
            <stop offset="100%" stopColor={des.color_hex} />
          </linearGradient>

          <linearGradient id="journeyFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cur.color_hex} stopOpacity="0.28" />
            <stop offset="100%" stopColor={des.color_hex} stopOpacity="0.10" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line
          x1={pad}
          y1={yBase}
          x2={w - pad}
          y2={yBase}
          stroke="currentColor"
          className="text-border"
          strokeWidth="1"
        />

        {/* Fill under arc */}
        <path d={fillD} fill="url(#journeyFill)" />

        {/* Arc stroke (animated) */}
        <path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="url(#journeyStroke)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{
            strokeDasharray: pathLen ? `${pathLen} ${pathLen}` : undefined,
            strokeDashoffset: pathLen ? dashOffset : undefined,
            transition: animated
              ? "stroke-dashoffset 2.4s ease-in-out"
              : undefined,
          }}
        />

        {/* Start point */}
        <g className="cursor-default">
          <circle
            cx={x1}
            cy={yBase}
            r="7"
            fill={cur.color_hex}
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
          <circle
            cx={x1}
            cy={yBase}
            r="10"
            fill="transparent"
            className="opacity-0 transition-opacity duration-200 hover:opacity-100"
            stroke={cur.color_hex}
            strokeWidth="2"
          />
        </g>

        {/* End point */}
        <g className="cursor-default">
          <circle
            cx={x2}
            cy={yBase}
            r="7"
            fill={des.color_hex}
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
          <circle
            cx={x2}
            cy={yBase}
            r="10"
            fill="transparent"
            className="opacity-0 transition-opacity duration-200 hover:opacity-100"
            stroke={des.color_hex}
            strokeWidth="2"
          />
        </g>

        {/* Labels */}
        {showLabels ? (
          <>
            <text
              x={x1}
              y={yBase + 22}
              textAnchor="start"
              className="fill-foreground"
              style={{ fontSize: 12 }}
            >
              {startText}
            </text>
            <text
              x={x2}
              y={yBase + 22}
              textAnchor="end"
              className="fill-foreground"
              style={{ fontSize: 12 }}
            >
              {endText}
            </text>

            <text
              x={xMid}
              y={Math.max(20, yCtrl - 10)}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 12 }}
            >
              {deltaLabel(delta)} levels
              {typeof estimatedDurationSeconds === "number" ? (
                ` • ~${formatEta(estimatedDurationSeconds)}`
              ) : (
                ""
              )}
            </text>
          </>
        ) : null}
      </svg>
    </div>
  );
}

