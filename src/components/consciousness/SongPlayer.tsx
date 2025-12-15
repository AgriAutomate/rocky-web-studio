"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SongPlayerProps = {
  songUrl: string;
  title?: string;
  /** Optional duration in seconds (fallbacks to audio metadata). */
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  showDownload?: boolean; // default false
  downloadUrl?: string;
};

type PlayerStatus = "idle" | "loading" | "ready" | "error";

const SPEEDS = ["0.75", "1", "1.25", "1.5"] as const;

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function supportsFullscreen() {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as any;
  return Boolean(el?.requestFullscreen || el?.webkitRequestFullscreen || el?.msRequestFullscreen);
}

async function requestFullscreen(el: HTMLElement) {
  const anyEl = el as any;
  if (anyEl.requestFullscreen) return anyEl.requestFullscreen();
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
  if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
}

async function exitFullscreen() {
  const anyDoc = document as any;
  if (document.exitFullscreen) return document.exitFullscreen();
  if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
  if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
}

export function SongPlayer({
  songUrl,
  title,
  duration: durationProp,
  onPlay,
  onPause,
  showDownload = false,
  downloadUrl,
}: SongPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [status, setStatus] = React.useState<PlayerStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState<number>(durationProp ?? 0);
  const [volume, setVolume] = React.useState(90); // 0-100
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>("1");

  const [isDragging, setIsDragging] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Visualization: analyser setup (best-effort; can fail due to CORS/autoplay policies)
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const freqRef = React.useRef<Uint8Array | null>(null);

  const totalDuration = Number.isFinite(durationProp ?? NaN) ? (durationProp as number) : duration;
  const pct = totalDuration > 0 ? clamp01(currentTime / totalDuration) : 0;

  // Sync audio attributes
  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = clamp01(volume / 100);
  }, [volume]);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = Number(speed);
  }, [speed]);

  React.useEffect(() => {
    setStatus(songUrl ? "loading" : "idle");
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    if (durationProp != null) setDuration(durationProp);
  }, [songUrl, durationProp]);

  // Fullscreen tracking
  React.useEffect(() => {
    function onFsChange() {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(Boolean(fsEl && containerRef.current && fsEl === containerRef.current));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const startVisualizer = React.useCallback(async () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    // If already started, do nothing.
    if (audioCtxRef.current && analyserRef.current) return;

    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;

      const ctx = new Ctx() as AudioContext;
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const freq = new Uint8Array(analyser.frequencyBinCount);
      freqRef.current = freq;

      const dpr = window.devicePixelRatio || 1;
      const draw = () => {
        const c = canvasRef.current;
        const a = analyserRef.current;
        const f = freqRef.current;
        if (!c || !a || !f) return;

        const rect = c.getBoundingClientRect();
        c.width = Math.max(1, Math.floor(rect.width * dpr));
        c.height = Math.max(1, Math.floor(rect.height * dpr));

        const g = c.getContext("2d");
        if (!g) return;
        g.clearRect(0, 0, c.width, c.height);

        // TS lib.dom can type this as Uint8Array<ArrayBuffer>, while the constructor
        // yields Uint8Array<ArrayBufferLike>. Cast to satisfy the signature.
        a.getByteFrequencyData(f as unknown as Uint8Array<ArrayBuffer>);

        const bars = 32;
        const step = Math.max(1, Math.floor(f.length / bars));
        const barW = c.width / bars;
        const maxH = c.height;

        const grad = g.createLinearGradient(0, 0, c.width, 0);
        // Consciousness-inspired accent (red -> violet -> white)
        grad.addColorStop(0, "rgba(139, 0, 0, 0.9)");
        grad.addColorStop(0.65, "rgba(147, 112, 219, 0.9)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.9)");

        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += f[i * step + j] ?? 0;
          const v = sum / step / 255; // 0..1
          const h = Math.max(2, v * maxH);

          const x = i * barW + barW * 0.15;
          const y = c.height - h;
          const w = barW * 0.7;

          g.fillStyle = grad;
          g.globalAlpha = 0.35 + v * 0.65;
          g.fillRect(x, y, w, h);
        }

        rafRef.current = window.requestAnimationFrame(draw);
      };

      rafRef.current = window.requestAnimationFrame(draw);
    } catch {
      // Visualization is optional; silently degrade.
    }
  }, []);

  const stopVisualizer = React.useCallback(async () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      const ctx = audioCtxRef.current;
      if (ctx) await ctx.close();
    } catch {
      // ignore
    } finally {
      audioCtxRef.current = null;
      analyserRef.current = null;
      freqRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      stopVisualizer();
    };
  }, [stopVisualizer]);

  function seekToClientX(clientX: number) {
    const el = audioRef.current;
    const bar = document.getElementById("songplayer-progress");
    if (!el || !bar || totalDuration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const pct = clamp01((clientX - rect.left) / rect.width);
    el.currentTime = pct * totalDuration;
    setCurrentTime(el.currentTime);
  }

  async function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        setStatus("loading");
        await el.play();
      } else {
        el.pause();
      }
    } catch {
      setStatus("error");
      setError("Unable to play audio. The file may be unavailable or blocked by your browser.");
    }
  }

  const canDownload = Boolean(showDownload && (downloadUrl || songUrl));
  const dl = downloadUrl || songUrl;

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-3xl border border-border/60 bg-foreground text-background shadow-sm",
        "p-4 sm:p-6",
        isFullscreen ? "h-screen w-screen rounded-none" : ""
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm text-background/70">Now playing</div>
          <div className="mt-1 truncate text-lg font-semibold text-background">
            {title?.trim() ? title.trim() : "Music Therapy Song"}
          </div>
          <div className="mt-1 text-xs text-background/60">
            Speed {speed}× • Volume {volume}%
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {supportsFullscreen() ? (
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-white/5 text-background hover:bg-white/10"
              onClick={async () => {
                const host = containerRef.current;
                if (!host) return;
                try {
                  if (!isFullscreen) await requestFullscreen(host);
                  else await exitFullscreen();
                } catch {
                  // ignore
                }
              }}
              aria-label={isFullscreen ? "Exit fullscreen player" : "Enter fullscreen player"}
            >
              {isFullscreen ? "Exit full" : "Full"}
            </Button>
          ) : null}

          {canDownload ? (
            <Button
              asChild
              type="button"
              variant="outline"
              className="border-white/15 bg-white/5 text-background hover:bg-white/10"
            >
              <a href={dl} download target="_blank" rel="noreferrer">
                Download
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Visualization / “album art” */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
        <div
          className="relative h-28 w-full"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(139,0,0,0.35), rgba(147,112,219,0.35), rgba(255,255,255,0.08))",
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={songUrl}
        preload="metadata"
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (!el) return;
          const d = Number.isFinite(el.duration) ? el.duration : 0;
          if (d && !durationProp) setDuration(d);
          setStatus("ready");
        }}
        onCanPlay={() => setStatus("ready")}
        onWaiting={() => setStatus("loading")}
        onStalled={() => setStatus("loading")}
        onError={() => {
          setStatus("error");
          setError("Audio failed to load. Please try again or regenerate the song.");
        }}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (!el || isDragging) return;
          setCurrentTime(el.currentTime || 0);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setStatus("ready");
          onPlay?.();
          startVisualizer();
        }}
        onPause={() => {
          setIsPlaying(false);
          onPause?.();
        }}
        onEnded={() => {
          setIsPlaying(false);
        }}
      />

      {/* Controls */}
      <div className="mt-4 space-y-3">
        {status === "error" && error ? (
          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-background/90">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            onClick={togglePlay}
            disabled={!songUrl || status === "error"}
            className={cn(
              "h-12 px-6 text-base font-semibold",
              "bg-white text-black hover:bg-white/90"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="text-xs text-background/70 tabular-nums">
              {formatTime(currentTime)} / {formatTime(totalDuration || 0)}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-background/70">Vol</span>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <Select value={speed} onValueChange={(v) => setSpeed(v as any)}>
              <SelectTrigger className="w-[120px] border-white/15 bg-white/5 text-background">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                {SPEEDS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Seek bar */}
        <div className="space-y-2">
          <div
            id="songplayer-progress"
            className={cn(
              "relative h-3 w-full cursor-pointer rounded-full border border-white/10 bg-white/10",
              "touch-none"
            )}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, Math.floor(totalDuration || 0))}
            aria-valuenow={Math.floor(currentTime)}
            tabIndex={0}
            onKeyDown={(e) => {
              const el = audioRef.current;
              if (!el || totalDuration <= 0) return;
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                el.currentTime = Math.max(0, el.currentTime - 5);
                setCurrentTime(el.currentTime);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                el.currentTime = Math.min(totalDuration, el.currentTime + 5);
                setCurrentTime(el.currentTime);
              }
            }}
            onClick={(e) => {
              if (isDragging) return;
              seekToClientX(e.clientX);
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              setIsDragging(true);
              seekToClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (!isDragging) return;
              seekToClientX(e.clientX);
            }}
            onPointerUp={(e) => {
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {
                // ignore
              }
              setIsDragging(false);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/80 transition-[width] duration-150"
              style={{ width: `${Math.round(pct * 100)}%` }}
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm"
              style={{ left: `calc(${Math.round(pct * 100)}% - 10px)` }}
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-background/60">
            <span>{status === "loading" ? "Loading…" : isPlaying ? "Playing" : "Paused"}</span>
            <span>Tip: space = play/pause, ←/→ seek</span>
          </div>
        </div>
      </div>
    </div>
  );
}

