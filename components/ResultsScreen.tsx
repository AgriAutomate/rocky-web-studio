"use client";

import { TriageScore } from "@/lib/types";

export interface ResultsScreenProps {
  triage: TriageScore | null;
  businessName: string;
  sector: string;
  painPoint: string;
  solution: string;
  estimatedBudget: string;
  timeframe: string;
  onReset: () => void;
}

export function ResultsScreen({
  triage,
  businessName,
  sector,
  painPoint,
  solution,
  estimatedBudget,
  timeframe,
  onReset,
}: ResultsScreenProps) {
  if (!triage) return null;

  const cards = [
    { label: "Business name", value: businessName || "—" },
    { label: "Sector match", value: sector || "—" },
    { label: "Top pain point", value: painPoint || "—" },
    { label: "Recommended solution", value: solution || "—" },
    { label: "Estimated budget", value: estimatedBudget || "—" },
    {
      label: "Follow-up priority",
      value: `${triage.grade} • ${timeframe}`,
    },
  ];

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Your assessment is ready</p>
          <p className="text-xl font-semibold text-foreground">Results & next steps</p>
          <p className="text-sm text-muted-foreground">Check your email for the detailed breakdown.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          Start over
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:shadow"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-4 text-sm text-foreground shadow-sm">
        Call-to-action: <span className="font-semibold">Check your email for next steps.</span>
      </div>
    </div>
  );
}
