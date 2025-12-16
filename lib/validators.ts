import { z } from "zod";
import {
  BudgetRange,
  DigitalMaturity,
  PainPoint,
  PrimaryGoal,
  QuestionnaireFormData,
  Sector,
  Timeline,
} from "@/lib/types/questionnaire";

const sectorEnum = z.enum([
  "healthcare",
  "manufacturing",
  "mining",
  "agriculture",
  "retail",
  "hospitality",
  "professional-services",
  "construction",
  "other",
]) satisfies z.ZodType<Sector>;

const painPointEnum = z.enum([
  "high-operating-costs",
  "cash-flow-strain",
  "regulatory-compliance",
  "digital-transformation",
  "cybersecurity",
  "labour-shortages",
  "reduced-demand",
  "market-access",
  "connectivity",
  "lack-of-leadership",
]) satisfies z.ZodType<PainPoint>;

const digitalMaturityEnum = z.enum(["minimal", "basic", "moderate", "advanced"]) satisfies z.ZodType<DigitalMaturity>;

const primaryGoalEnum = z.enum(["growth", "efficiency", "compliance", "innovation", "multiple"]) satisfies z.ZodType<PrimaryGoal>;

const budgetEnum = z.enum(["under-5k", "5k-15k", "15k-30k", "30k-50k", "over-50k"]) satisfies z.ZodType<BudgetRange>;

const timelineEnum = z.enum(["urgent", "within-3-months", "within-6-months", "flexible"]) satisfies z.ZodType<Timeline>;

export const questionnaireSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  businessName: z.string().trim().min(1),
  businessEmail: z.string().trim().email(),
  businessPhone: z.string().trim().min(5),
  sector: sectorEnum,
  annualRevenue: z.string().trim().min(1),
  employeeCount: z.string().trim().min(1),
  yearsInBusiness: z.string().trim().min(1),
  selectedPainPoints: z.array(painPointEnum).min(1),
  currentDigitalMaturity: digitalMaturityEnum,
  primaryGoal: primaryGoalEnum,
  budget: budgetEnum,
  timelineToImplement: timelineEnum,
  isDecisionMaker: z.boolean(),
  otherStakeholders: z.string().optional(),
  additionalContext: z.string().optional(),
  agreeToContact: z.boolean().refine((v) => v, "Consent is required"),
  subscribeToNewsletter: z.boolean(),
}) satisfies z.ZodType<QuestionnaireFormData>;

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
