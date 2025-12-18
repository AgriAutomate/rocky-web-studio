import { NextResponse } from "next/server";

import { calculatePriority, extractTopPainPoint, getSectorRecommendation } from "@/app/lib/scoring";
import { QUESTION_SETS, branchMap } from "@/app/lib/questionnaireConfig";
import { isBudget, isBusinessName, isEmail, isPhoneAU, isTimeline } from "@/app/utils/validation";
import { getServiceSupabase } from "@/lib/database";
import { sendCustomerEmail, sendInternalEmail } from "@/lib/email";
import { FormData, QuestionnaireResponse } from "@/lib/types";

type FieldErrors = Record<string, string>;

const ALLOWED_SECTORS = ["hospitality", "trades", "retail", "professional", "other"];
const budgetOptions = ["<20k", "20-50k", "50-100k", "100k+"];
const timelineOptions = ["rush", "60-90", "90-120", "flex"];

function nextFollowUpDate(priority: "A" | "B" | "C" | "D"): string | null {
  const now = Date.now();
  if (priority === "A") return new Date(now + 24 * 60 * 60 * 1000).toISOString();
  if (priority === "B") return new Date(now + 48 * 60 * 60 * 1000).toISOString();
  if (priority === "C") return new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
  return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
}

function priorityTimeframe(priority: "A" | "B" | "C" | "D") {
  switch (priority) {
    case "A":
      return "24 hours";
    case "B":
      return "48 hours";
    case "C":
      return "3 days";
    default:
      return "one week";
  }
}

function suggestedAction(priority: "A" | "B" | "C" | "D") {
  switch (priority) {
    case "A":
      return "Call in 24 hours";
    case "B":
      return "Call in 48 hours";
    case "C":
      return "Send proposal in 3 days";
    default:
      return "Nurture email and schedule next check-in in one week";
  }
}

function validate(body: any): { data: (FormData & { phone?: string }) | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  if (!body || typeof body !== "object") {
    errors.payload = "Invalid payload";
    return { data: null, errors };
  }

  const data: FormData & { phone?: string } = {
    name: String(body.businessName ?? body.name ?? "").trim(),
    email: String(body.email ?? "").trim(),
    company: String(body.company ?? "").trim(),
    sector: String(body.sector ?? "").trim(),
    projectType: String(body.projectType ?? "").trim(),
    budgetRange: String(body.budget ?? body.budgetRange ?? "").trim(),
    timeline: String(body.timeline ?? "").trim(),
    goals: String(body.goals ?? "").trim(),
    challenges: String(body.challenges ?? "").trim(),
    teamSize: String(body.teamSize ?? "").trim(),
    websiteStatus: String(body.websiteStatus ?? "").trim(),
    contactPreference: String(body.contactPreference ?? "email").trim(),
    subscribe: Boolean(body.subscribe),
    sectorAnswers: body.sectorAnswers ?? {},
    phone: body.phone ? String(body.phone).trim() : "",
  };

  if (!isBusinessName(data.name)) errors.businessName = "Business name must be 2-100 chars";
  if (!isEmail(data.email)) errors.email = "Invalid email";
  if (!ALLOWED_SECTORS.includes(data.sector)) errors.sector = "Invalid sector";
  if (!isBudget(data.budgetRange) || !budgetOptions.includes(data.budgetRange))
    errors.budget = "Invalid budget";
  if (!isTimeline(data.timeline) || !timelineOptions.includes(data.timeline))
    errors.timeline = "Invalid timeline";
  if (!data.projectType) errors.projectType = "Project type is required";
  if (!data.goals) errors.goals = "Goals are required";
  if (data.phone && !isPhoneAU(data.phone)) errors.phone = "Invalid AU phone";

  // Sector-specific required (from config)
  const branchIds =
    (branchMap as Record<string, string[]>)[data.sector] ??
    QUESTION_SETS.find((s) => s.sector === data.sector)?.questions.map((q) => q.id) ??
    [];
  for (const qid of branchIds) {
    const val = data.sectorAnswers?.[qid];
    if (val === undefined || val === null || String(val).trim().length === 0) {
      errors[qid] = "Required";
    }
  }

  return { data: Object.keys(errors).length ? null : data, errors };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const json = await request.json().catch(() => ({}));
    const { data, errors } = validate(json);

    if (!data) {
      console.error("[questionnaire] validation failed", errors);
      return NextResponse.json(
        { success: false, message: "Validation failed", statusCode: 400, fieldErrors: errors },
        { status: 400 }
      );
    }

    const recommendation = getSectorRecommendation(data.sector, data);
    const priority = calculatePriority(data.sector, data.budgetRange, data.timeline);
    const painPoint = extractTopPainPoint(data.sector, data);
    const followUpDate = nextFollowUpDate(priority);

    const supabase = getServiceSupabase();
    const insertPayload = {
      sector: data.sector,
      business_name: data.name,
      email: data.email,
      phone: data.phone || null,
      all_answers: data as unknown as Record<string, any>,
      priority,
      recommended_solution: recommendation.solution,
      follow_up_date: followUpDate,
    };

    const { error: dbError } = await (supabase as any)
      .from("questionnaire_responses")
      .insert(insertPayload);
    if (dbError) {
      console.error("[questionnaire] db error", dbError);
      return NextResponse.json(
        { success: false, message: "Database error", statusCode: 500 },
        { status: 500 }
      );
    }

    const timeframe = priorityTimeframe(priority);
    await Promise.allSettled([
      sendCustomerEmail({
        to: data.email,
        businessName: data.name,
        sector: data.sector,
        painPoint,
        solution: recommendation.solution,
        estimatedBudget: recommendation.estimatedBudget,
        timeframe,
      }),
      sendInternalEmail({
        businessName: data.name,
        sector: data.sector,
        priority,
        answers: data as unknown as Record<string, any>,
        painPoints: [painPoint],
        solution: recommendation.solution,
        budget: recommendation.estimatedBudget,
        nextAction: suggestedAction(priority),
      }),
    ]);

    const response: QuestionnaireResponse = {
      success: true,
      message: "Received",
      triage: {
        grade: priority,
        score: 0,
        reasoning: [painPoint, recommendation.solution],
        priority: priority === "A" ? "high" : priority === "B" ? "medium" : "low",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("[questionnaire] server error", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Server error", statusCode: 500 },
      { status: 500 }
    );
  }
}
