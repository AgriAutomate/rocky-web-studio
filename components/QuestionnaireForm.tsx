"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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

// GA4 Event Tracking - SSR-safe wrapper
const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

export function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState<Record<string, boolean>>({});
  const startTimeRef = useRef<number>(Date.now());

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

  // Check if equipment questions should be shown (conditional logic)
  const shouldShowEquipmentQuestions = useMemo(() => {
    const businessModel = formData.e6;
    
    // If e6 hasn't been answered yet, default to showing equipment questions
    // (user hasn't made a choice, so show all questions)
    if (!businessModel || !Array.isArray(businessModel) || businessModel.length === 0) {
      return true;
    }
    
    // If only "services-only" or "event-planning" selected, skip equipment questions
    if (businessModel.length === 1) {
      if (businessModel[0] === 'services-only' || businessModel[0] === 'event-planning') {
        return false;
      }
    }
    
    // If any selection includes equipment-related options, show equipment questions
    // This handles cases where user selects multiple options including equipment-hire
    return true;
  }, [formData.e6]);

  // Get filtered sector questions (skip equipment questions if needed)
  const filteredSectorQuestions = useMemo(() => {
    if (!selectedSector || selectedSector !== 'events-entertainment') {
      return sectorQuestions;
    }
    
    if (!shouldShowEquipmentQuestions) {
      // Skip equipment-related questions (e7, e8, e8b, e11, e12)
      return sectorQuestions.filter(q => !['e7', 'e8', 'e8b', 'e11', 'e12'].includes(q.id));
    }
    
    return sectorQuestions;
  }, [selectedSector, sectorQuestions, shouldShowEquipmentQuestions]);

  // Determine current question based on step
  const getCurrentQuestion = (): QuestionConfig | null => {
    // Show trunk questions first
    if (currentStep < trunkQuestions.length) {
      const question = trunkQuestions[currentStep] || null;
      // Debug logging for trunk questions to track display
      if (question && (question.id === 'q1' || question.id === 'q2' || question.id === 'q3' || question.id === 'q4' || question.id === 'sector')) {
        console.log('[QuestionnaireForm] Displaying trunk question:', {
          questionId: question.id,
          questionLabel: question.label,
          currentStep,
          totalTrunkQuestions: trunkQuestions.length,
          trunkQuestionIds: trunkQuestions.map(q => q.id),
        });
      }
      return question;
    }
    
    // Show sector-specific questions after sector is selected (using filtered list)
    if (selectedSector) {
      const sectorStep = currentStep - trunkQuestions.length;
      if (sectorStep >= 0 && sectorStep < filteredSectorQuestions.length) {
        const question = filteredSectorQuestions[sectorStep] || null;
        // Debug logging for sector questions
        if (question && (question.id.startsWith('h') || question.id.startsWith('t') || 
            question.id.startsWith('r') || question.id.startsWith('p') || 
            question.id.startsWith('e'))) {
          console.log('[QuestionnaireForm] Displaying sector question:', {
            questionId: question.id,
            questionLabel: question.label,
            currentStep,
            sectorStep,
            selectedSector,
            filteredSectorQuestionsCount: filteredSectorQuestions.length,
            filteredSectorQuestionIds: filteredSectorQuestions.map(q => q.id),
          });
        }
        return question;
      }
    }
    
    // Show leaves questions last
    const stepsBeforeLeaves = trunkQuestions.length + (selectedSector ? filteredSectorQuestions.length : 0);
    const leavesStep = currentStep - stepsBeforeLeaves;
    if (leavesStep >= 0 && leavesStep < leavesQuestions.length) {
      return leavesQuestions[leavesStep] || null;
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();
  // Calculate total steps: trunk + filtered sector questions (if selected) + leaves
  const totalSteps = trunkQuestions.length + (selectedSector ? filteredSectorQuestions.length : 0) + leavesQuestions.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Get current section name
  const getCurrentSection = (): string => {
    if (currentStep < trunkQuestions.length) return "General";
    if (selectedSector) {
      const sectorStep = currentStep - trunkQuestions.length;
      if (sectorStep >= 0 && sectorStep < filteredSectorQuestions.length) {
        if (selectedSector === "events-entertainment") return "Equipment Hire";
        return "Sector Specific";
      }
    }
    return "Final Details";
  };

  // Initialize start time when component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();

    // Track initial form view
    const initialTotalSteps = trunkQuestions.length + leavesQuestions.length;
    trackEvent('form_step_viewed', {
      step_number: 1,
      total_steps: initialTotalSteps,
      sector: 'none',
    });
  }, []);

  // Debug: Log formData changes for sector-specific questions (always enabled for debugging)
  useEffect(() => {
    const sectorKeys = Object.keys(formData).filter(key => 
      key.startsWith('h') || key.startsWith('t') || key.startsWith('r') || 
      key.startsWith('p') || key.startsWith('e')
    );
    if (sectorKeys.length > 0) {
      console.log('[QuestionnaireForm] formData state updated with sector questions:', {
        sectorKeys,
        sectorValues: sectorKeys.reduce((acc, key) => {
          acc[key] = formData[key];
          return acc;
        }, {} as Record<string, any>),
        allFormDataKeys: Object.keys(formData),
        selectedSector,
        timestamp: new Date().toISOString(),
      });
    }
  }, [formData, selectedSector]);

  // Clear submit error when step changes (ensures it's cleared on navigation)
  useEffect(() => {
    setSubmitError(null);
  }, [currentStep]);

  // Track step progression and abandonment
  useEffect(() => {
    // Reset start time when step changes
    startTimeRef.current = Date.now();
    
    // Track step view when step changes (but not on initial mount)
    if (currentStep > 0 || Object.keys(formData).length > 0) {
      trackEvent('form_step_viewed', {
        step_number: currentStep + 1,
        total_steps: totalSteps,
        sector: selectedSector || 'none',
      });
    }
    
    return () => {
      // Track abandonment when component unmounts or user navigates away
      if (!isSubmitted && currentStep > 0) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackEvent('form_abandoned', {
          step_abandoned: currentStep + 1,
          time_spent: timeSpent,
          sector: selectedSector || 'none',
        });
      }
    };
  }, [currentStep, isSubmitted, selectedSector, totalSteps, formData]);

  // Adjust current step if equipment questions are skipped and user is on a skipped question
  useEffect(() => {
    if (!selectedSector || selectedSector !== 'events-entertainment') return;
    if (!shouldShowEquipmentQuestions && currentQuestion) {
      // If user is on a skipped equipment question, move to next valid question
      if (['e7', 'e8', 'e8b', 'e11', 'e12'].includes(currentQuestion.id)) {
        // Find next valid question index
        const sectorStep = currentStep - trunkQuestions.length;
        const nextValidIndex = filteredSectorQuestions.findIndex(q => !['e7', 'e8', 'e8b', 'e11', 'e12'].includes(q.id));
        if (nextValidIndex >= 0 && nextValidIndex !== sectorStep) {
          setCurrentStep(trunkQuestions.length + nextValidIndex);
        }
      }
    }
  }, [shouldShowEquipmentQuestions, selectedSector, currentQuestion, currentStep, trunkQuestions.length, filteredSectorQuestions]);

  // Map form sector values to branch Sector types
  const mapFormSectorToBranchSector = (formSector: string): Sector | null => {
    const sectorMap: Record<string, Sector> = {
      "hospitality": "hospitality",
      "trades-construction": "trades",
      "retail": "retail",
      "professional-services": "professional",
      "events-entertainment": "events-entertainment",
      "healthcare-allied": "healthcare",
      "real-estate-property": "real-estate",
    };
    return sectorMap[formSector] || null;
  };

  // Handle answers (including sector selection from first question)
  const handleAnswer = (questionId: string, value: any) => {
    // Clear submit error when user makes changes
    setSubmitError(null);
    
    // Debug logging for ALL questions (always enabled for debugging)
    // Log sector-specific questions with more detail, but log all questions
    if (questionId.startsWith('h') || questionId.startsWith('t') || 
        questionId.startsWith('r') || questionId.startsWith('p') || 
        questionId.startsWith('e')) {
      console.log('[QuestionnaireForm] handleAnswer called for sector question:', {
        questionId,
        value,
        currentFormDataKeys: Object.keys(formData),
        timestamp: new Date().toISOString(),
      });
    } else if (questionId === 'q1' || questionId === 'q2' || questionId === 'q3' || questionId === 'q4' || questionId === 'sector') {
      // Log trunk questions (q1-q4, sector) to debug missing data issue
      console.log('[QuestionnaireForm] handleAnswer called for trunk question:', {
        questionId,
        value,
        currentFormDataKeys: Object.keys(formData),
        timestamp: new Date().toISOString(),
      });
    }
    
    const updatedData = { ...formData, [questionId]: value };

    // Handle sector selection from the first question
    if (questionId === "sector") {
      const branchSector = mapFormSectorToBranchSector(value);
      if (branchSector && branchSector !== "universal") {
        // If sector is changing, clear answers from the previous sector's questions
        if (selectedSector && selectedSector !== branchSector) {
          const previousSectorSet = QUESTION_SETS.find((set) => set.sector === selectedSector);
          const previousSectorQuestionIds = previousSectorSet?.questions.map((q) => q.id) || [];
          previousSectorQuestionIds.forEach((qId) => {
            delete updatedData[qId];
          });
        }
        setSelectedSector(branchSector);
        // Reset current step ONLY if sector is CHANGING (not when first selecting)
        // This prevents skipping q1, q2, q3 when user first selects a sector
        if (selectedSector && selectedSector !== branchSector) {
          setCurrentStep(trunkQuestions.length); // Start at first sector question
        }
        // If this is the first sector selection, continue with normal flow (don't skip questions)
      } else {
        setSelectedSector(null);
      }
    }

    // Handle e6 (business model) change - clear equipment questions if switching to services-only
    if (questionId === "e6") {
      const businessModel = Array.isArray(value) ? value : [value];
      const isServicesOnly = businessModel.length === 1 && 
                            (businessModel[0] === 'services-only' || businessModel[0] === 'event-planning');
      
      if (isServicesOnly) {
        // Clear equipment-related questions
        ['e7', 'e8', 'e8b', 'e11', 'e12'].forEach((qId) => {
          delete updatedData[qId];
        });
      }
    }
    
    // Debug logging after state update for ALL questions (always enabled for debugging)
    // Log sector-specific questions and trunk questions to debug missing data issue
    if (questionId.startsWith('h') || questionId.startsWith('t') || 
        questionId.startsWith('r') || questionId.startsWith('p') || 
        questionId.startsWith('e')) {
      console.log('[QuestionnaireForm] Updated formData with sector question:', {
        questionId,
        value,
        updatedDataKeys: Object.keys(updatedData),
        hasQuestionId: questionId in updatedData,
        questionValue: updatedData[questionId],
        timestamp: new Date().toISOString(),
      });
    } else if (questionId === 'q1' || questionId === 'q2' || questionId === 'q3' || questionId === 'q4' || questionId === 'sector') {
      console.log('[QuestionnaireForm] Updated formData with trunk question:', {
        questionId,
        value,
        updatedDataKeys: Object.keys(updatedData),
        hasQuestionId: questionId in updatedData,
        questionValue: updatedData[questionId],
        timestamp: new Date().toISOString(),
      });
    }
    
    setFormData(updatedData);

    // Clear error for this question
    if (errors[questionId]) {
      setErrors({ ...errors, [questionId]: "" });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;

    // Skip validation if question should be hidden due to conditional logic
    // Since getCurrentQuestion() uses filteredSectorQuestions, if a question is returned,
    // it should be validated. However, we double-check for equipment questions to be safe.
    if (selectedSector === 'events-entertainment') {
      const isEquipmentQuestion = ['e7', 'e8', 'e8b', 'e11', 'e12'].includes(currentQuestion.id);
      
      // Check if this equipment question should actually be shown
      if (isEquipmentQuestion) {
        const isInFilteredList = filteredSectorQuestions.some(q => q.id === currentQuestion.id);
        
        // If equipment question is NOT in filtered list, it shouldn't be shown/validated
        if (!isInFilteredList) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Validation] Skipping validation for hidden equipment question: ${currentQuestion.id}`);
          }
          return true; // Skip validation for hidden equipment questions
        }
      }
    }

    const value = formData[currentQuestion.id];

    // For optional fields, skip validation if empty
    if (!currentQuestion.required) {
      // If value is undefined, null, empty string, or empty array, it's valid (optional field)
      if (!value || 
          (typeof value === 'string' && value.trim().length === 0) || 
          (Array.isArray(value) && value.length === 0)) {
        // Clear any existing error for this optional field
        if (errors[currentQuestion.id]) {
          setErrors({ ...errors, [currentQuestion.id]: "" });
        }
        return true;
      }
      
      // If optional field has a value, run validation if provided
      if (currentQuestion.validation && value) {
        try {
          const isValid = currentQuestion.validation(value);
          if (!isValid) {
            let errorMessage = `Please enter a valid ${currentQuestion.label.toLowerCase()}`;
            if (currentQuestion.id === "q24") {
              errorMessage = "Please enter a valid phone number (optional field)";
            }
            setErrors({ ...errors, [currentQuestion.id]: errorMessage });
            if (process.env.NODE_ENV === 'development') {
              console.error(`[Validation] Optional field validation failed: ${currentQuestion.id} (${currentQuestion.label})`, { value });
            }
            return false;
          }
        } catch (error) {
          console.error(`[Validation] Validation error for optional question ${currentQuestion.id}:`, error);
          setErrors({ ...errors, [currentQuestion.id]: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` });
          return false;
        }
      }
      return true; // Optional field with value passed validation
    }

    // For required fields, check if value exists
    if (currentQuestion.required) {
      // Check if value is missing or empty
      const isEmpty = !value || 
                     (typeof value === 'string' && value.trim().length === 0) || 
                     (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        const errorMessage = `${currentQuestion.label} is required`;
        setErrors({ ...errors, [currentQuestion.id]: errorMessage });
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Validation] Required field missing: ${currentQuestion.id} (${currentQuestion.label})`, { value, type: typeof value });
        }
        return false;
      }

      // Run custom validation if provided and value exists
      if (currentQuestion.validation) {
        try {
          const isValid = currentQuestion.validation(value);
          if (!isValid) {
            // Provide field-specific error messages based on question type
            let errorMessage = `Please enter a valid ${currentQuestion.label.toLowerCase()}`;
            if (currentQuestion.id === "q23") {
              errorMessage = "Please enter a valid email address";
            } else if (currentQuestion.type === "checkbox" && Array.isArray(value) && value.length === 0) {
              errorMessage = "Please select at least one option";
            }
            setErrors({ ...errors, [currentQuestion.id]: errorMessage });
            if (process.env.NODE_ENV === 'development') {
              console.error(`[Validation] Required field validation failed: ${currentQuestion.id} (${currentQuestion.label})`, { value, type: typeof value });
            }
            return false;
          }
        } catch (error) {
          console.error(`[Validation] Validation error for question ${currentQuestion.id}:`, error);
          setErrors({ ...errors, [currentQuestion.id]: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` });
          return false;
        }
      }
    }

    // Clear any existing error if validation passes
    if (errors[currentQuestion.id]) {
      setErrors({ ...errors, [currentQuestion.id]: "" });
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    // Clear submit error when navigating to next step
    setSubmitError(null);

    // Move to next step or submit if on last step
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    // Clear submit error when navigating to previous step
    setSubmitError(null);
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    // Clear previous errors at start of submission
    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Map form data to API format
      const apiPayload = {
        // Personal info - use q1 (what should we call you) or fallback to "Client"
        firstName: formData.q1 || formData.businessName || "Client",
        lastName: formData.lastName || "User",
        
        // Business info - use q1 (what should we call you) or fallback to "Client" (q1 is optional)
        businessName: formData.q1 || "Client",
        businessEmail: formData.q23 || "",
        businessPhone: formData.q24 || "0000000000", // Default phone if not provided
        
        // Sector mapping - map form values to API enum values
        sector: mapSectorToApiFormat(formData.sector),
        
        // Business profile (not collected, using defaults that pass validation)
        annualRevenue: formData.annualRevenue || "0-100k",
        employeeCount: formData.employeeCount || "1-5",
        yearsInBusiness: formData.yearsInBusiness || "0-2",
        
        // Pain points - map q4 challenge values to API enum
        selectedPainPoints: mapChallengesToPainPoints(formData.q4),
        
        // Digital maturity (not collected, using default)
        currentDigitalMaturity: formData.currentDigitalMaturity || "basic",
        
        // Goals - map q3 to primaryGoal enum
        primaryGoal: mapGoalToApiFormat(formData.q3),
        
        // Budget - map q21 values to API enum
        budget: mapBudgetToApiFormat(formData.q21),
        
        // Timeline - map q22 values to API enum
        timelineToImplement: mapTimelineToApiFormat(formData.q22),
        
        // Decision info (not collected, using defaults)
        isDecisionMaker: formData.isDecisionMaker ?? true,
        otherStakeholders: formData.otherStakeholders || undefined,
        
        // Additional context (not collected)
        additionalContext: formData.additionalContext || undefined,
        
        // Consent (not collected, defaulting to true for now)
        agreeToContact: formData.agreeToContact ?? true,
        subscribeToNewsletter: formData.subscribeToNewsletter ?? false,
        
        // Include raw form data with question IDs for PDF generation
        formResponses: formData, // This contains all q1, q2, q3, q23, q24, q21, q22, sector, h6-h10, t6-t10, r6-r10, p6-p10, e6-e12, etc.
      };

      // Debug logging to verify all form data is being sent (always enabled for debugging)
      console.log('[QuestionnaireForm] Submitting form data:', {
        totalKeys: Object.keys(formData).length,
        keys: Object.keys(formData),
        hasSectorSpecific: Object.keys(formData).some(key => 
          key.startsWith('h') || key.startsWith('t') || key.startsWith('r') || 
          key.startsWith('p') || key.startsWith('e')
        ),
        sectorSpecificKeys: Object.keys(formData).filter(key => 
          key.startsWith('h') || key.startsWith('t') || key.startsWith('r') || 
          key.startsWith('p') || key.startsWith('e')
        ),
        selectedSector,
        formDataSnapshot: { ...formData },
        timestamp: new Date().toISOString(),
      });

      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        throw new Error(
          `Server returned ${response.status} ${response.statusText}. Expected JSON but got ${contentType || "unknown"}.`
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Include validation details in error message if available
        const errorMsg = result.error || "Failed to submit questionnaire";
        const details = result.details || "";
        
        // If we have detailed validation errors, show them prominently
        if (details && details.length > 0) {
          // Format validation details for display (replace field paths with readable names)
          const formattedDetails = details
            .split('; ')
            .map((detail: string) => {
              // Convert field paths to readable labels
              let readable = detail
                .replace(/businessEmail/g, 'Email')
                .replace(/businessPhone/g, 'Phone')
                .replace(/businessName/g, 'Business Name')
                .replace(/firstName/g, 'First Name')
                .replace(/lastName/g, 'Last Name')
                .replace(/selectedPainPoints/g, 'Pain Points')
                .replace(/primaryGoal/g, 'Primary Goal')
                .replace(/budget/g, 'Budget')
                .replace(/timelineToImplement/g, 'Timeline')
                .replace(/sector/g, 'Sector');
              return readable;
            })
            .join('. ');
          
          throw new Error(`${errorMsg}: ${formattedDetails}`);
        }
        
        throw new Error(errorMsg);
      }

      // Track form completion
      trackEvent('form_completed', {
        sector: formData.sector,
        pain_points_count: formData.q4 ? (Array.isArray(formData.q4) ? formData.q4.length : 1) : 0,
        goals_count: formData.q3 ? (Array.isArray(formData.q3) ? formData.q3.length : 1) : 0,
        digital_maturity: formData.currentDigitalMaturity || 'basic',
        budget: formData.q21 || '5k-15k',
        timeline: formData.q22 || 'flexible',
      });

      // Track conversion goal (update with your actual GA4 conversion ID)
      trackEvent('conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with your GA4 conversion ID
        value: 1.0,
        currency: 'AUD',
      });

      // Redirect to confirmation page with response ID
      if (result.responseId) {
        window.location.href = `/confirmation?id=${result.responseId}`;
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      
      // Extract more detailed error information if available
      let errorMessage = "Failed to submit questionnaire. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to extract validation details from error message
        if (error.message.includes("Validation failed") || error.message.includes("details")) {
          errorMessage = "Validation failed. Please check all required fields are completed correctly.";
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions to map form values to API enum values
  const mapSectorToApiFormat = (sector: any): string => {
    // Map form sector values to API enum values
    const sectorMap: Record<string, string> = {
      "professional-services": "professional-services",
      "healthcare-allied": "healthcare",
      "hospitality": "hospitality",
      "retail": "retail",
      "automotive-mechanical": "other",
      "trades-construction": "construction",
      "education-training": "other",
      "non-profit-community": "other",
      "agriculture-rural": "agriculture",
      "veterans-defence": "other",
      "arts-music-creative": "other",
      "government-council": "other",
      "fitness-wellness": "other",
      "real-estate-property": "other",
      "transport-logistics": "other",
      "events-entertainment": "other", // Maps to "other" for API, but uses events-entertainment branch questions
    };
    return sectorMap[sector] || "other";
  };

  const mapChallengesToPainPoints = (challenges: any): string[] => {
    // Map q4 challenge values to API pain point enum
    // q4 is now a checkbox array, so handle both array and single string (for backwards compatibility)
    const challengeMap: Record<string, string> = {
      "operating-costs": "high-operating-costs",
      "cash-flow": "cash-flow-strain",
      "compliance": "regulatory-compliance",
      "digital-transformation": "digital-transformation",
      "cybersecurity": "cybersecurity",
      "labour-shortages": "labour-shortages",
      "reduced-demand": "reduced-demand",
      "logistics": "market-access",
      "connectivity": "connectivity",
      "leadership-strategy": "lack-of-leadership",
    };
    
    // Handle array (checkbox selection)
    if (Array.isArray(challenges)) {
      const mapped = challenges
        .map((challenge) => challengeMap[challenge])
        .filter((mapped) => mapped !== undefined);
      return mapped.length > 0 ? mapped : ["digital-transformation"]; // default fallback
    }
    
    // Handle single string (backwards compatibility)
    if (typeof challenges === "string") {
      const mapped = challengeMap[challenges];
      return mapped ? [mapped] : ["digital-transformation"]; // default fallback
    }
    
    return ["digital-transformation"]; // default fallback
  };

  const mapGoalToApiFormat = (goals: any): string => {
    // Map new goal values to API enum values
    // q3 is now a checkbox array, so handle both array and single string (for backwards compatibility)
    const goalMap: Record<string, string> = {
      "reduce-operating-costs": "efficiency",
      "increase-online-visibility": "growth",
      "improve-digital-maturity": "innovation",
      "enhance-customer-experience": "growth",
      "streamline-operations": "efficiency",
      "grow-revenue-ecommerce": "growth",
      "better-security": "compliance",
      "simplify-marketing": "growth",
      "build-trust-professionalism": "growth",
      "access-grants-support": "innovation",
      // Legacy mappings for backwards compatibility
      "reduce-costs": "efficiency",
      "win-customers": "growth",
      "modernise": "innovation",
      "other": "multiple",
    };
    
    // Handle array (checkbox selection)
    if (Array.isArray(goals) && goals.length > 0) {
      // Map all selected goals and pick the first one (or use priority logic)
      // Priority: growth > innovation > efficiency > compliance > multiple
      const priority = ["growth", "innovation", "efficiency", "compliance", "multiple"];
      const mapped = goals
        .map((goal) => goalMap[goal])
        .filter((mapped) => mapped !== undefined);
      
      if (mapped.length > 0) {
        // Return the highest priority goal
        for (const p of priority) {
          if (mapped.includes(p)) {
            return p;
          }
        }
        return mapped[0] ?? "growth"; // Fallback to first mapped
      }
    }
    
    // Handle single string (backwards compatibility)
    if (typeof goals === "string") {
      return goalMap[goals] || "growth";
    }
    
    return "growth"; // default fallback
  };

  const mapBudgetToApiFormat = (budget: any): string => {
    const budgetMap: Record<string, string> = {
      "800-5k": "under-5k",
      "5k-10k": "5k-15k",
      "10k-15k": "5k-15k",
      "15k-25k": "15k-30k",
    };
    return budgetMap[budget] || "5k-15k";
  };

  const mapTimelineToApiFormat = (timeline: any): string => {
    const timelineMap: Record<string, string> = {
      "rush": "urgent",
      "60-90": "within-3-months",
      "90-120": "within-6-months",
      "flex": "flexible",
    };
    return timelineMap[timeline] || "flexible";
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <h2 className="text-2xl font-semibold text-foreground">Form Submitted Successfully!</h2>
          <p className="text-muted-foreground">
            Thank you for completing the questionnaire. Your custom deep-dive report has been generated and sent to your email. We'll review your responses and get back to you soon.
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
              id={currentQuestion.id}
              type={currentQuestion.type}
              value={value}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              aria-invalid={!!error}
              placeholder={currentQuestion.placeholder || `Enter ${currentQuestion.label.toLowerCase()}`}
              maxLength={currentQuestion.maxLength}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        const maxLength = currentQuestion.maxLength || 5000;
        const charCount = typeof value === 'string' ? value.length : 0;
        return (
          <div className="space-y-2">
            <Textarea
              id={currentQuestion.id}
              value={value}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              aria-invalid={!!error}
              rows={4}
              placeholder={currentQuestion.placeholder || `Enter ${currentQuestion.label.toLowerCase()}`}
              maxLength={maxLength}
            />
            <div className="flex justify-between items-center">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground ml-auto">
                {charCount} / {maxLength} characters
              </p>
            </div>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <div className="space-y-3" role="radiogroup" aria-labelledby={`${currentQuestion.id}-label`}>
              {currentQuestion.options?.map((option) => {
                const optionId = `${currentQuestion.id}-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={optionId}
                    className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent cursor-pointer"
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={currentQuestion.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => handleAnswer(currentQuestion.id, option.value)}
                      className="size-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="space-y-3" role="group" aria-labelledby={`${currentQuestion.id}-label`}>
              {currentQuestion.options?.map((option) => {
                const optionId = `${currentQuestion.id}-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={optionId}
                    className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent cursor-pointer"
                  >
                    <input
                      id={optionId}
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
                );
              })}
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
      {/* Enhanced Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            {getCurrentSection()} • Question {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <Label 
          id={`${currentQuestion.id}-label`}
          htmlFor={currentQuestion.type === "radio" || currentQuestion.type === "checkbox" ? undefined : currentQuestion.id} 
          className="text-lg font-semibold"
        >
          {currentStep + 1}. {currentQuestion.label}
          {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {"introText" in currentQuestion && currentQuestion.introText ? (
          <p className="text-sm text-muted-foreground">{currentQuestion.introText}</p>
        ) : null}
        {renderQuestionInput()}
        {"outroText" in currentQuestion && currentQuestion.outroText ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowExamples(prev => ({
                ...prev,
                [currentQuestion.id]: !prev[currentQuestion.id]
              }))}
              className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              aria-expanded={showExamples[currentQuestion.id] || false}
            >
              {showExamples[currentQuestion.id] ? (
                <>
                  Hide example <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show example <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            {showExamples[currentQuestion.id] && (
              <div className="mt-2 p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                {currentQuestion.outroText}
              </div>
            )}
          </div>
        ) : null}

        {/* Submit error display - moved above navigation buttons */}
        {submitError && (
          <div className="mt-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}
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
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
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
