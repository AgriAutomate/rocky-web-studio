import path from "node:path";
import { readFile } from "node:fs/promises";
import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { logError } from "@/lib/utils/logger";

/**
 * Single deep‑dive challenge section included in the report.
 */
export interface ReportChallenge {
  /** Display order / identifier for the challenge (e.g. 1, 2, 3) */
  number: number;
  /** Short, human‑readable title for the challenge */
  title: string;
  /** Bullet‑point style sections or talking points for this challenge */
  sections: string[];
  /** Expected ROI time horizon (e.g. "3–6 months") */
  roiTimeline: string;
  /** Human‑readable project budget range (e.g. "$15k–$30k") */
  projectCostRange: string;
}

/**
 * Structured data required to render a client report.
 */
export interface ReportData {
  /** Primary client contact name, used in greetings */
  clientName: string;
  /** Name of the client business */
  businessName: string;
  /** Primary sector this report is tailored to (e.g. "Healthcare") */
  sector: string;
  /** Top 2–3 recommended challenges / initiatives for this client */
  topChallenges: ReportChallenge[];
  /** Pre‑formatted date string to display on the report (e.g. "12 March 2025") */
  generatedDate: string;
}

/**
 * Escape user‑supplied text for safe HTML injection.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render the HTML for the list of challenge sections.
 *
 * @param challenges - Array of challenge descriptors to render.
 * @returns Concatenated HTML string of all challenge sections.
 */
export function renderChallengesSections(challenges: ReportData["topChallenges"]): string {
  if (!challenges || challenges.length === 0) {
    return "";
  }

  return challenges
    .map((challenge) => {
      const sectionsHtml = (challenge.sections ?? [])
        .map((section) => `<li>${escapeHtml(section)}</li>`)
        .join("");

      return `<div class="challenge-section">
  <h2 class="challenge-title">
    <span class="challenge-number">${escapeHtml(String(challenge.number))}.</span>
    <span class="challenge-heading">${escapeHtml(challenge.title)}</span>
  </h2>
  <p class="challenge-meta">
    <strong>Expected ROI timeline:</strong> ${escapeHtml(challenge.roiTimeline)}
    &nbsp;·&nbsp;
    <strong>Recommended investment range:</strong> ${escapeHtml(challenge.projectCostRange)}
  </p>
  <ul class="challenge-points">
    ${sectionsHtml}
  </ul>
</div>`;
    })
    .join("\n");
}

/**
 * Load the base HTML template and inject dynamic data from the report.
 *
 * The template at `lib/pdf/templates/reportTemplate.html` must contain the
 * following placeholders, which will be replaced:
 *
 * - {{CLIENT_NAME}}
 * - {{BUSINESS_NAME}}
 * - {{SECTOR}}
 * - {{GENERATED_DATE}}
 * - {{CHALLENGES_HTML}}
 *
 * @param data - Fully prepared report data.
 * @returns Resolved HTML string ready for PDF rendering.
 */
export async function generateHtmlTemplate(data: ReportData): Promise<string> {
  const templatePath = path.join(process.cwd(), "lib", "pdf", "templates", "reportTemplate.html");

  let template: string;
  try {
    template = await readFile(templatePath, "utf8");
  } catch (error) {
    await logError("Failed to read PDF report template", error, { templatePath });
    throw error;
  }

  // Get base URL for images (works in both local and production)
  // In production, this will be https://rockywebstudio.com.au
  // For Puppeteer, we need full URLs, not relative paths
  // In local dev, use localhost:3000 if NEXT_PUBLIC_URL is not set
  const baseUrl = process.env.NEXT_PUBLIC_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://rockywebstudio.com.au");

  const replacements: Record<string, string> = {
    CLIENT_NAME: escapeHtml(data.clientName),
    BUSINESS_NAME: escapeHtml(data.businessName),
    SECTOR: escapeHtml(data.sector),
    GENERATED_DATE: escapeHtml(data.generatedDate),
    CHALLENGES_HTML: renderChallengesSections(data.topChallenges),
    // Image URLs - use full URLs for Puppeteer compatibility
    RWS_LOGO_URL: `${baseUrl}/images/rws-logo.png`,
    AVOB_BADGE_URL: `${baseUrl}/images/avob/AVOB_DF.png`, // Existing badge
    AVOB_LOGO_URL: `${baseUrl}/images/avob/AVOB_DF.png`, // AVOB logo in footer (using existing badge)
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{${key}}}`, "g");
    html = html.replace(pattern, value);
  }

  return html;
}

/**
 * Generate an A4 PDF report for a given set of report data.
 *
 * - Launches a headless Puppeteer browser
 * - Renders the HTML from `generateHtmlTemplate`
 * - Exports a PDF with A4 format and 20px margins
 * - Ensures the browser is always closed, even on failures
 *
 * @param reportData - Structured report content to render into the template.
 * @returns A PDF byte array suitable for converting to a Node Buffer.
 */
export async function generatePdfReport(reportData: ReportData): Promise<Uint8Array> {
  let browser: Browser | null = null;

  try {
    const html = await generateHtmlTemplate(reportData);

    // Configure Puppeteer for Vercel/serverless environments using @sparticuz/chromium
    // This package provides a pre-built Chromium binary optimized for serverless
    const chromiumArgs = (chromium as any).args || [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ];
    
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      args: chromiumArgs,
      defaultViewport: (chromium as any).defaultViewport || { width: 1200, height: 1600 },
      executablePath: await chromium.executablePath(),
      headless: (chromium as any).headless !== false ? true : false,
      timeout: 30_000, // Increased timeout for cold starts
    };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Use a more lenient wait condition for serverless
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", // Changed from networkidle0 for faster loading
      timeout: 10_000,
    });

    const pdfBuffer = await Promise.race([
      page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout after 25 seconds")), 25_000)
      ),
    ]);

    // DEV-ONLY: Write PDF to disk for local testing
    if (process.env.NODE_ENV !== "production" && process.env.DEBUG_PDF === "true") {
      try {
        const { writeFileSync } = await import("node:fs");
        const testPdfPath = path.join(process.cwd(), "test-report.pdf");
        writeFileSync(testPdfPath, Buffer.from(pdfBuffer));
        console.log(`[DEV] PDF written to disk for inspection: ${testPdfPath}`);
      } catch (writeError) {
        // Ignore write errors in dev
        console.warn("[DEV] Failed to write test PDF:", writeError);
      }
    }

    return pdfBuffer;
  } catch (error) {
    let chromiumPath = "not available";
    try {
      chromiumPath = await chromium.executablePath();
    } catch {
      // Ignore error getting path
    }
    
    await logError("Failed to generate PDF report", error, {
      clientName: reportData.clientName,
      businessName: reportData.businessName,
      sector: reportData.sector,
      vercel: process.env.VERCEL,
      chromiumExecutablePath: chromiumPath,
    });
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        await logError("Failed to close Puppeteer browser after report generation", closeError);
      }
    }
  }
}

// Backwards‑compatible alias for existing imports.
export { generatePdfReport as generateClientReport };
