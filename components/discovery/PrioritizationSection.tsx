"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FeaturePriorities } from "@/lib/types/discovery";

interface PrioritizationSectionProps {
  priorities?: FeaturePriorities;
  onUpdate: (priorities: FeaturePriorities) => void;
}

const AVAILABLE_FEATURES = [
  "booking",
  "e-commerce",
  "crm",
  "portal",
  "automation",
  "seo",
  "speed",
  "design",
  "analytics",
  "payments",
  "inventory",
  "scheduling",
  "reporting",
  "integrations",
  "mobile-app",
];

export function PrioritizationSection({
  priorities = { mustHave: [], niceToHave: [], future: [] },
  onUpdate,
}: PrioritizationSectionProps) {
  const [futureFeature, setFutureFeature] = useState("");

  const handleMustHaveChange = (feature: string, checked: boolean) => {
    const current = priorities.mustHave || [];
    let updated: string[];

    if (checked) {
      // Enforce exactly 3 selections
      if (current.length >= 3) {
        return; // Don't allow more than 3
      }
      updated = [...current, feature];
    } else {
      updated = current.filter((f) => f !== feature);
    }

    onUpdate({
      ...priorities,
      mustHave: updated,
    });
  };

  const handleNiceToHaveChange = (feature: string, checked: boolean) => {
    const current = priorities.niceToHave || [];
    let updated: string[];

    if (checked) {
      // Allow up to 5 selections
      if (current.length >= 5) {
        return; // Don't allow more than 5
      }
      updated = [...current, feature];
    } else {
      updated = current.filter((f) => f !== feature);
    }

    onUpdate({
      ...priorities,
      niceToHave: updated,
    });
  };

  const handleAddFutureFeature = () => {
    if (futureFeature.trim()) {
      const current = priorities.future || [];
      onUpdate({
        ...priorities,
        future: [...current, futureFeature.trim()],
      });
      setFutureFeature("");
    }
  };

  const handleRemoveFutureFeature = (index: number) => {
    const current = priorities.future || [];
    onUpdate({
      ...priorities,
      future: current.filter((_, i) => i !== index),
    });
  };

  // Get features that are already selected in must-have or nice-to-have
  const selectedFeatures = [
    ...(priorities.mustHave || []),
    ...(priorities.niceToHave || []),
  ];

  // Available features for selection (exclude already selected ones)
  const availableForSelection = AVAILABLE_FEATURES.filter(
    (f) => !selectedFeatures.includes(f)
  );

  return (
    <Card className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Feature Prioritization</h2>
        <p className="text-muted-foreground text-sm">
          Help us understand what matters most to your project.
        </p>
      </div>

      {/* Must-Have Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Must-Have Features <span className="text-destructive">*</span>
          </Label>
          <span className="text-sm text-muted-foreground">
            {priorities.mustHave?.length || 0} / 3 selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Select exactly 3 features that are critical for your project success.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AVAILABLE_FEATURES.map((feature) => {
            const isSelected = priorities.mustHave?.includes(feature) || false;
            const isDisabled =
              !isSelected && (priorities.mustHave?.length || 0) >= 3;

            return (
              <label
                key={feature}
                className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) =>
                    handleMustHaveChange(feature, e.target.checked)
                  }
                  className="size-4"
                />
                <span className="text-sm capitalize">{feature}</span>
              </label>
            );
          })}
        </div>
        {(priorities.mustHave?.length || 0) < 3 && (
          <p className="text-sm text-muted-foreground">
            Please select {3 - (priorities.mustHave?.length || 0)} more
            must-have feature
            {3 - (priorities.mustHave?.length || 0) !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {/* Nice-to-Have Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Nice-to-Have Features</Label>
          <span className="text-sm text-muted-foreground">
            {priorities.niceToHave?.length || 0} / 5 selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Select up to 5 features that would be valuable but not essential.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {availableForSelection.map((feature) => {
            const isSelected =
              priorities.niceToHave?.includes(feature) || false;
            const isDisabled =
              !isSelected && (priorities.niceToHave?.length || 0) >= 5;

            return (
              <label
                key={feature}
                className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-blue-300"
                    : isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) =>
                    handleNiceToHaveChange(feature, e.target.checked)
                  }
                  className="size-4"
                />
                <span className="text-sm capitalize">{feature}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Future Considerations Section */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Future Considerations (Optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Features you might want to add in future phases.
        </p>
        <div className="flex gap-2">
          <Input
            value={futureFeature}
            onChange={(e) => setFutureFeature(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFutureFeature();
              }
            }}
            placeholder="Enter a future feature idea..."
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleAddFutureFeature}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Add
          </button>
        </div>
        {priorities.future && priorities.future.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {priorities.future.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFutureFeature(index)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
