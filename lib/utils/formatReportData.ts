import { formatSectorName } from "@/lib/utils/sector-mapping";
import type { ValidatedFormData } from "@/lib/types/questionnaire";
import type { ChallengeDetail } from "@/lib/utils/pain-point-mapping";
import { logger } from "@/lib/utils/logger";

/**
 * Input required to build a fully-formed report data object
 * from validated questionnaire form data and resolved challenge details.
 */
export interface ReportDataInput {
  /** Validated questionnaire submission data */
  formData: ValidatedFormData;
  /** Top challenge details already resolved from pain point IDs */
  topChallenges: ChallengeDetail[];
}

/**
 * Output shape used by the PDF generator for the deep-dive report.
 */
export interface ReportDataOutput {
  /** Primary client contact name */
  clientName: string;
  /** Name of the client business */
  businessName: string;
  /** Human-readable sector label */
  sector: string;
  /** Top 2–3 challenges with narrative and ROI details */
  topChallenges: Array<{
    number: number;
    title: string;
    sections: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  /** ISO date string (YYYY-MM-DD) of when the report was generated */
  generatedDate: string;
}

/**
 * Format structured report data for the PDF generator.
 *
 * @param input - Validated form data and resolved challenge details.
 * @returns ReportDataOutput ready for PDF generation.
 */
export function formatReportData(input: ReportDataInput): ReportDataOutput {
  const { formData, topChallenges } = input;

  if (!formData) {
    void logger.error("formatReportData called without formData", { input });
    throw new Error("Missing formData for report generation");
  }

  const clientName = (formData.firstName || "").trim();
  const businessName = (formData.businessName || "").trim();

  if (!clientName || !businessName) {
    void logger.error("formatReportData missing client or business name", {
      clientName,
      businessName,
    });
  }

  // Format the sector into a human-readable label (e.g. "professional-services" -> "Professional Services")
  const sectorLabel = formatSectorName(formData.sector as any);

  const mappedChallenges = (topChallenges || []).map((challenge, index) => {
    if (!challenge) {
      void logger.error("Encountered undefined challenge in formatReportData", { index });
      return {
        number: index + 1,
        title: "Untitled Challenge",
        sections: [],
        problems: [],
        solutions: ["Custom solution tailored to your business needs"],
        roiTimeline: "TBC",
        projectCostRange: "TBC",
      };
    }

    return {
      number: challenge.number ?? index + 1,
      title: challenge.title,
      sections: Array.isArray(challenge.sections) ? challenge.sections : [],
      problems: Array.isArray(challenge.problems) ? challenge.problems : (Array.isArray(challenge.sections) ? challenge.sections : []),
      solutions: Array.isArray(challenge.solutions) ? challenge.solutions : ["Custom solution tailored to your business needs"],
      roiTimeline: challenge.roiTimeline || "TBC",
      projectCostRange: challenge.projectCostRange || "TBC",
    };
  });

  const today = new Date();
  const generatedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

  return {
    clientName,
    businessName,
    sector: sectorLabel,
    topChallenges: mappedChallenges,
    generatedDate,
  };
}

/**
 * Generate a unique client ID for a questionnaire submission.
 *
 * @returns A unique identifier prefixed with `cq_`.
 */
export function generateClientId(): string {
  // Prefer crypto.randomUUID if available (Node 18+ / modern runtimes)
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `cq_${crypto.randomUUID()}`;
  }

  // Fallback to a simple random string if crypto.randomUUID is not available
  const random = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `cq_${timestamp}_${random}`;
}

/**
 * Generate a deterministic PDF filename for a given client ID and optional date.
 *
 * @param clientId - Unique client identifier (e.g. from generateClientId).
 * @param date - Optional Date object; defaults to current date.
 * @returns Filename in the format `${clientId}-report-YYYY-MM-DD.pdf`.
 */
export function generatePdfFilename(clientId: string, date: Date = new Date()): string {
  if (!clientId) {
    void logger.error("generatePdfFilename called without clientId");
  }

  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${clientId}-report-${iso}.pdf`;
}
