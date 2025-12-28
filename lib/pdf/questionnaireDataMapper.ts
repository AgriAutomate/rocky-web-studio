/**
 * Helper functions to map questionnaire form data to readable display format
 */

import { QUESTION_SETS, type QuestionConfig } from "@/app/lib/questionnaireConfig";

// Create a map of question ID to question config for quick lookup
const questionConfigMap = new Map<string, QuestionConfig>();

// Build the map from QUESTION_SETS
QUESTION_SETS.forEach(set => {
  set.questions.forEach(question => {
    questionConfigMap.set(question.id, question);
  });
});

/**
 * Get question label by ID
 */
export function getQuestionLabel(questionId: string): string {
  const question = questionConfigMap.get(questionId);
  return question?.label || questionId;
}

/**
 * Get option label by question ID and option value
 */
export function getOptionLabel(questionId: string, optionValue: string): string {
  const question = questionConfigMap.get(questionId);
  if (!question?.options) return optionValue;
  
  const option = question.options.find(opt => opt.value === optionValue);
  return option?.label || optionValue;
}

/**
 * Format a form response value for display in PDF
 */
export function formatResponseValue(questionId: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  // Handle arrays (checkboxes, multiple selections)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'None selected';
    }
    return value.map(v => getOptionLabel(questionId, v)).join(', ');
  }

  // Handle radio/select options
  const question = questionConfigMap.get(questionId);
  if (question?.options) {
    return getOptionLabel(questionId, String(value));
  }

  // Handle text/textarea values
  return String(value);
}

/**
 * Get all questions in order (trunk, then sector-specific, then leaves)
 */
export function getAllQuestions(): QuestionConfig[] {
  const trunkSet = QUESTION_SETS.find(set => set.id === 'trunk');
  const leavesSet = QUESTION_SETS.find(set => set.id === 'leaves');
  
  const trunkQuestions = trunkSet?.questions || [];
  const leavesQuestions = leavesSet?.questions || [];
  
  // Note: Sector-specific questions are dynamic based on selected sector
  // They'll be included separately in the PDF
  return [...trunkQuestions, ...leavesQuestions];
}

/**
 * Get sector-specific questions for a given sector
 */
export function getSectorQuestions(sector: string): QuestionConfig[] {
  const sectorSet = QUESTION_SETS.find(set => set.sector === sector);
  return sectorSet?.questions || [];
}

