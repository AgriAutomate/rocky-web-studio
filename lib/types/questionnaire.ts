export type Sector =
  | "healthcare"
  | "manufacturing"
  | "mining"
  | "agriculture"
  | "retail"
  | "hospitality"
  | "professional-services"
  | "construction"
  | "other";

export type PainPoint =
  | "high-operating-costs"
  | "cash-flow-strain"
  | "regulatory-compliance"
  | "digital-transformation"
  | "cybersecurity"
  | "labour-shortages"
  | "reduced-demand"
  | "market-access"
  | "connectivity"
  | "lack-of-leadership";

export type DigitalMaturity = "minimal" | "basic" | "moderate" | "advanced";

export type PrimaryGoal = "growth" | "efficiency" | "compliance" | "innovation" | "multiple";

export type BudgetRange = "under-5k" | "5k-15k" | "15k-30k" | "30k-50k" | "over-50k";

export type Timeline = "urgent" | "within-3-months" | "within-6-months" | "flexible";

export interface QuestionnaireFormData {
  firstName: string;
  lastName: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  sector: Sector;
  annualRevenue: string;
  employeeCount: string;
  yearsInBusiness: string;
  selectedPainPoints: PainPoint[];
  currentDigitalMaturity: DigitalMaturity;
  primaryGoal: PrimaryGoal;
  budget: BudgetRange;
  timelineToImplement: Timeline;
  isDecisionMaker: boolean;
  otherStakeholders?: string;
  additionalContext?: string;
  agreeToContact: boolean;
  subscribeToNewsletter: boolean;
}

/**
 * Alias for form data that has passed schema validation.
 */
export type ValidatedFormData = QuestionnaireFormData;
