"use client";

import { useState, useEffect } from "react";
import type { QuestionConfig } from "@/app/lib/questionnaireConfig";
import { cn } from "@/lib/utils";

export interface QuestionRendererProps {
  question: QuestionConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  const { id, type, label, options } = question;
  const [otherText, setOtherText] = useState<string>("");

  // Initialize otherText if value is already "other" with text
  useEffect(() => {
    if (typeof value === "object" && value?.value === "other") {
      setOtherText(value.text || "");
    } else if (value === "other" && !otherText) {
      // If value is just "other" but no text stored yet, keep otherText empty
      setOtherText("");
    } else if (value !== "other" && value !== undefined) {
      setOtherText("");
    }
  }, [value]);

  const baseInput =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 min-h-[45px]";

  const handleRadioChange = (optValue: string) => {
    if (optValue === "other") {
      onChange({ value: "other", text: otherText });
    } else {
      onChange(optValue);
      setOtherText("");
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    onChange({ value: "other", text });
  };

  return (
    <div className={cn("space-y-2", error ? "animate-pulse" : "")}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {type === "radio" && options ? (
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = opt.value === "other" 
              ? (typeof value === "object" && value?.value === "other") || value === "other"
              : value === opt.value;
            
            return opt.value === "other" ? (
              <div key={opt.value} className="space-y-2">
                <label
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary cursor-pointer",
                    isSelected ? "border-primary bg-primary/5" : ""
                  )}
                >
                  <input
                    id={`${id}-${opt.value}`}
                    name={id}
                    type="radio"
                    className="h-4 w-4 text-primary focus:ring-primary"
                    checked={isSelected}
                    onChange={() => handleRadioChange(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
                {isSelected && (
                  <input
                    id={`${id}-other-text`}
                    type="text"
                    className={baseInput}
                    placeholder="Please specify..."
                    value={otherText}
                    onChange={(e) => handleOtherTextChange(e.target.value)}
                    aria-invalid={Boolean(error)}
                  />
                )}
              </div>
            ) : (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary cursor-pointer",
                  isSelected ? "border-primary bg-primary/5" : ""
                )}
              >
                <input
                  id={`${id}-${opt.value}`}
                  name={id}
                  type="radio"
                  className="h-4 w-4 text-primary focus:ring-primary"
                  checked={isSelected}
                  onChange={() => handleRadioChange(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : type === "checkbox" && options ? (
        <div className="space-y-2">
          {options.map((opt) => {
            const checked = Array.isArray(value) ? value.includes(opt.value) : false;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-primary cursor-pointer",
                  checked ? "border-primary bg-primary/5" : ""
                )}
              >
                <input
                  id={`${id}-${opt.value}`}
                  name={id}
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...(value ?? []), opt.value]);
                    } else {
                      onChange((value ?? []).filter((v: string) => v !== opt.value));
                    }
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          className={baseInput + " min-h-[120px]"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          id={id}
          type={type === "number" ? "number" : "text"}
          className={baseInput}
          value={value || ""}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          aria-invalid={Boolean(error)}
        />
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
