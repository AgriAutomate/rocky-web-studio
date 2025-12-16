export interface FormData {
  name: string;
  email: string;
  company: string;
  sector: string;
  projectType: string;
  budgetRange: string;
  timeline: string;
  goals: string;
  challenges: string;
  teamSize: string;
  websiteStatus: string;
  contactPreference: string;
  subscribe: boolean;
  sectorAnswers: Record<string, string>;
}

export interface TriageScore {
  grade: "A" | "B" | "C" | "D";
  score: number;
  reasoning: string[];
  priority: "high" | "medium" | "low";
}

export interface QuestionnaireResponse {
  success: boolean;
  message: string;
  triage: TriageScore;
}

export interface SectorConfig {
  id: string;
  label: string;
  questions: Array<{
    id: string;
    label: string;
    placeholder?: string;
  }>;
}
