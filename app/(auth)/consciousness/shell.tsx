"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient, hasPublicSupabaseEnv } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useConsciousnessStore } from "@/lib/consciousness/store";

type StepId =
  | "start"
  | "destination"
  | "journey"
  | "experience"
  | "history"
  | "progress";

type Step = {
  id: StepId;
  label: string;
  href: string;
};

const STEPS: Step[] = [
  { id: "start", label: "Start", href: "/consciousness/start" },
  { id: "destination", label: "Destination", href: "/consciousness/destination" },
  { id: "journey", label: "Journey", href: "/consciousness/journey" },
  { id: "experience", label: "Experience", href: "/consciousness/experience" },
  { id: "history", label: "History", href: "/consciousness/history" },
  { id: "progress", label: "Progress", href: "/consciousness/progress" },
];

function indexForPath(pathname: string | null): number {
  if (!pathname) return 0;
  const p = pathname.toLowerCase();

  // Treat /consciousness as start
  if (p === "/consciousness") return 0;

  const idx = STEPS.findIndex((s) => p.startsWith(s.href));
  return idx >= 0 ? idx : 0;
}

function canAccessStep(stepIndex: number, maxUnlockedStep: number) {
  return stepIndex <= maxUnlockedStep;
}

function getSunoGradientDot(index: number) {
  // A simple deterministic dot style to hint at the scale.
  // Uses semantic tokens so palette swaps remain centralized.
  const variants = [
    "bg-brand-from",
    "bg-primary",
    "bg-brand-to",
    "bg-primary/70",
    "bg-brand-from/70",
    "bg-brand-to/70",
  ] as const;
  return variants[index % variants.length];
}

function useWizardState() {
  const pathname = usePathname();
  const currentIndex = indexForPath(pathname);

  const maxUnlockedStep = useConsciousnessStore((s) => s.maxUnlockedStep);

  // If the user deep-links into a future step, allow rendering the current page,
  // but keep forward navigation disabled until they unlock steps normally.
  const effectiveUnlocked = Math.max(maxUnlockedStep, currentIndex);

  return { pathname, currentIndex, maxUnlockedStep, effectiveUnlocked };
}

export function Stepper() {
  const { currentIndex, effectiveUnlocked } = useWizardState();

  return (
    <div className="space-y-3">
      {/* Breadcrumbs */}
      <nav aria-label="Consciousness journey steps" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            const isPast = idx < currentIndex;
            const enabled = isPast || canAccessStep(idx, effectiveUnlocked);

            return (
              <li key={step.id} className="flex items-center gap-2">
                {idx !== 0 ? <span className="opacity-50">›</span> : null}
                {enabled && !isCurrent ? (
                  <Link
                    href={step.href}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      isPast ? "text-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isCurrent ? "font-semibold text-foreground" : "opacity-50"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {step.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Progress indicator */}
      <div className="grid grid-cols-6 gap-2">
        {STEPS.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          const isComplete = idx < currentIndex;
          const enabled = canAccessStep(idx, effectiveUnlocked) || isComplete;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-2 w-full rounded-full transition-colors duration-300",
                  enabled ? "bg-muted" : "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    isComplete ? "w-full" : isCurrent ? "w-2/3" : "w-0",
                    enabled ? getSunoGradientDot(idx) : "bg-muted-foreground/30"
                  )}
                />
              </div>
              <span
                className={cn(
                  "hidden text-[11px] leading-none sm:inline transition-colors",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FooterNav() {
  const router = useRouter();
  const { currentIndex, maxUnlockedStep } = useWizardState();

  const prev = currentIndex > 0 ? STEPS[currentIndex - 1] : null;
  const next = currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : null;

  const nextEnabled = next
    ? canAccessStep(currentIndex + 1, maxUnlockedStep)
    : false;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (prev) router.push(prev.href);
            else router.push("/consciousness/start");
          }}
        >
          Back
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/consciousness/start")}
          className="text-muted-foreground hover:text-foreground"
        >
          Restart
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {STEPS.length}
        </div>
        {next ? (
          <Button asChild disabled={!nextEnabled}>
            <Link href={next.href} aria-disabled={!nextEnabled}>
              Next
            </Link>
          </Button>
        ) : (
          <Button type="button" disabled>
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (!hasPublicSupabaseEnv()) {
      // Supabase isn't configured in this environment; don't crash the UI.
      setEmail(null);
      return () => {
        mounted = false;
      };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (!mounted) return;
          setEmail(data.user?.email ?? null);
        })
        .catch(() => {
          if (!mounted) return;
          setEmail(null);
        });
    } catch {
      // Defensive: env can still be missing if the dev server wasn't restarted.
      setEmail(null);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const supabaseEnabled = hasPublicSupabaseEnv();

  return (
    <div className="flex items-center gap-2">
      {email ? (
        <span className="hidden max-w-[220px] truncate text-xs text-muted-foreground sm:inline">
          {email}
        </span>
      ) : null}

      {supabaseEnabled ? (
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const supabase = getSupabaseBrowserClient();
              await supabase.auth.signOut();
            } catch {
              // ignore
            } finally {
              setBusy(false);
              router.push("/");
              router.refresh();
            }
          }}
        >
          Logout
        </Button>
      ) : null}
    </div>
  );
}

