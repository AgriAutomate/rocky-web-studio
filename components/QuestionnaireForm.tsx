"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  QUESTION_SETS,
  type QuestionConfig,
  type Sector,
} from "@/app/lib/questionnaireConfig";

type FormData = Record<string, any>;

export function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get trunk questions (universal first questions)
  const trunkSet = QUESTION_SETS.find((set) => set.id === "trunk");
  const trunkQuestions = trunkSet?.questions || [];

  // Get sector-specific questions
  const sectorSet = selectedSector
    ? QUESTION_SETS.find((set) => set.sector === selectedSector)
    : null;
  const sectorQuestions = sectorSet?.questions || [];

  // Get leaves questions (universal last questions)
  const leavesSet = QUESTION_SETS.find((set) => set.id === "leaves");
  const leavesQuestions = leavesSet?.questions || [];

  // Determine current question based on step
  const getCurrentQuestion = (): QuestionConfig | null => {
    // Show trunk questions first
    if (currentStep < trunkQuestions.length) {
      return trunkQuestions[currentStep] || null;
    }
    
    // Show sector-specific questions after sector is selected
    if (selectedSector) {
      const sectorStep = currentStep - trunkQuestions.length;
      if (sectorStep >= 0 && sectorStep < sectorQuestions.length) {
        return sectorQuestions[sectorStep] || null;
      }
    }
    
    // Show leaves questions last
    const stepsBeforeLeaves = trunkQuestions.length + (selectedSector ? sectorQuestions.length : 0);
    const leavesStep = currentStep - stepsBeforeLeaves;
    if (leavesStep >= 0 && leavesStep < leavesQuestions.length) {
      return leavesQuestions[leavesStep] || null;
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();
  // Calculate total steps: trunk + sector questions (if selected) + leaves
  const totalSteps = trunkQuestions.length + (selectedSector ? sectorQuestions.length : 0) + leavesQuestions.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Handle answers (including sector selection from first question)
  const handleAnswer = (questionId: string, value: any) => {
    const updatedData = { ...formData, [questionId]: value };

    // Handle sector selection from the first question
    if (questionId === "sector") {
      const sector = value as Sector;
      if (sector !== "universal") {
        // If sector is changing, clear answers from the previous sector's questions
        if (selectedSector && selectedSector !== sector) {
          const previousSectorSet = QUESTION_SETS.find((set) => set.sector === selectedSector);
          const previousSectorQuestionIds = previousSectorSet?.questions.map((q) => q.id) || [];
          previousSectorQuestionIds.forEach((qId) => {
            delete updatedData[qId];
          });
        }
        setSelectedSector(sector);
      } else {
        setSelectedSector(null);
      }
    }
    
    setFormData(updatedData);

    // Clear error for this question
    if (errors[questionId]) {
      setErrors({ ...errors, [questionId]: "" });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;

    const value = formData[currentQuestion.id];

    if (currentQuestion.required && (!value || (Array.isArray(value) && value.length === 0))) {
      setErrors({ ...errors, [currentQuestion.id]: "This field is required" });
      return false;
    }

    if (currentQuestion.validation && value) {
      const isValid = currentQuestion.validation(value);
      if (!isValid) {
        setErrors({ ...errors, [currentQuestion.id]: "Invalid value" });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    // Move to next step or submit if on last step
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    // Here you would typically send the data to an API
    console.log("Form submitted:", formData);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <h2 className="text-2xl font-semibold text-foreground">Form Submitted Successfully!</h2>
          <p className="text-muted-foreground">
            Thank you for completing the questionnaire. We'll review your responses and get back to you soon.
          </p>
          <div className="flex gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Back to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const renderQuestionInput = () => {
    const value = formData[currentQuestion.id] || (currentQuestion.type === "checkbox" ? [] : "");
    const error = errors[currentQuestion.id];

    switch (currentQuestion.type) {
      case "text":
      case "number":
        return (
          <div className="space-y-2">
            <Input
              type={currentQuestion.type}
              value={value}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              aria-invalid={!!error}
              placeholder={`Enter ${currentQuestion.label.toLowerCase()}`}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              aria-invalid={!!error}
              rows={4}
              placeholder={`Enter ${currentQuestion.label.toLowerCase()}`}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent cursor-pointer"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => handleAnswer(currentQuestion.id, option.value)}
                    className="size-4"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleAnswer(currentQuestion.id, newValues);
                    }}
                    className="size-4"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-sm">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <Label htmlFor={currentQuestion.id} className="text-lg font-semibold">
          {currentQuestion.label}
          {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {renderQuestionInput()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {isLastStep ? (
            <>
              <Button type="button" variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Homepage
                </Link>
              </Button>
              <Button type="button" onClick={handleSubmit}>
                Submit
              </Button>
            </>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
