import { Resend } from "resend";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "martincarroll@rockywebstudio.com.au";

const resendApiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || "";

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export interface CustomerEmailPayload {
  to: string;
  businessName: string;
  sector: string;
  painPoint: string;
  solution: string;
  estimatedBudget: string;
  timeframe: string;
}

export interface InternalEmailPayload {
  businessName: string;
  sector: string;
  priority: string;
  answers: Record<string, any>;
  painPoints: string[];
  solution: string;
  budget: string;
  nextAction: string;
}

export async function sendCustomerEmail(payload: CustomerEmailPayload) {
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY/SENDGRID_API_KEY not set, skipping customer email");
    return;
  }

  const { to, businessName, sector, painPoint, solution, estimatedBudget, timeframe } = payload;

  const subject = `Your Rocky Web Studio Digital Assessment - ${businessName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <p>Hi ${businessName || "there"},</p>
      <p>Thanks for completing the discovery questionnaire.</p>
      <p><strong>Sector match:</strong> ${sector}</p>
      <p><strong>Pain point:</strong> ${painPoint}</p>
      <p><strong>Recommended solution:</strong> ${solution}</p>
      <p><strong>Estimated investment:</strong> ${estimatedBudget}</p>
      <p>Next steps: Martin will contact you within ${timeframe}.</p>
      <p>Thanks,<br/>Rocky Web Studio</p>
    </div>
  `;

  await resendClient.emails.send({
    from: "Rocky Web Studio <noreply@rockywebstudio.com.au>",
    to,
    subject,
    html,
  });
}

export async function sendInternalEmail(payload: InternalEmailPayload) {
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY/SENDGRID_API_KEY not set, skipping internal email");
    return;
  }

  const { businessName, sector, priority, answers, painPoints, solution, budget, nextAction } = payload;

  const subject = `[PRIORITY ${priority}] Lead: ${businessName} - ${sector}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h3>Lead details</h3>
      <p><strong>Business:</strong> ${businessName}</p>
      <p><strong>Sector:</strong> ${sector}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Solution:</strong> ${solution}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Next action:</strong> ${nextAction}</p>
      <p><strong>Top pain points:</strong></p>
      <ul>
        ${painPoints.slice(0, 3).map((p) => `<li>${p}</li>`).join("")}
      </ul>
      <h4>All answers</h4>
      <pre style="white-space: pre-wrap;">${JSON.stringify(answers, null, 2)}</pre>
    </div>
  `;

  await resendClient.emails.send({
    from: "Rocky Web Studio <noreply@rockywebstudio.com.au>",
    to: OWNER_EMAIL,
    subject,
    html,
  });
}
