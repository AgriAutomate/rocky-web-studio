export type QuestionType = "radio" | "checkbox" | "text" | "textarea" | "number";

export type Sector =
  | "hospitality"
  | "trades"
  | "retail"
  | "professional"
  | "universal";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionConfig {
  id: string;
  type: QuestionType;
  label: string;
  options?: QuestionOption[];
  validation?: (value: any) => boolean;
  sector?: Sector;
  followUp?: string;
  required?: boolean;
}

export interface QuestionSet {
  id: string;
  sector: Sector;
  questions: QuestionConfig[];
}

// Simple validators for reuse inside config
const required = (v: any) => v !== undefined && v !== null && String(v).trim().length > 0;
const min2Max100 = (v: any) => {
  const s = String(v ?? "").trim();
  return s.length >= 2 && s.length <= 100;
};
const validEmail = (v: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());
const validBudget = required;
const validTimeline = required;

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: "trunk",
    sector: "universal",
    questions: [
      { id: "q1", type: "text", label: "Business name", validation: min2Max100, required: true },
      { id: "q2", type: "text", label: "Website or social link", required: false },
      {
        id: "q3",
        type: "radio",
        label: "What are your top 3 goals?",
        required: true,
        validation: required,
        options: [
          { value: "reduce-costs", label: "Reduce costs and improve profitability" },
          { value: "win-customers", label: "Win more customers and grow revenue" },
          { value: "modernise", label: "Modernise and digitise operations" },
          { value: "other", label: "Something Else" },
        ],
      },
      {
        id: "q4",
        type: "radio",
        label: "Biggest challenges right now?",
        required: true,
        validation: required,
        options: [
          { value: "reduce-costs", label: "Reduce costs and improve profitability" },
          { value: "win-customers", label: "Win more customers and grow revenue" },
          { value: "modernise", label: "Modernise and digitise operations" },
          { value: "other", label: "Something Else" },
        ],
      },
      {
        id: "q5",
        type: "radio",
        label: "Primary offer",
        required: true,
        validation: required,
        options: [
          { value: "services", label: "Services" },
          { value: "products", label: "Products" },
          { value: "events", label: "Events" },
          { value: "other", label: "Something Else" },
        ],
      },
    ],
  },
  {
    id: "hospitality",
    sector: "hospitality",
    questions: [
      {
        id: "h6",
        type: "radio",
        label: "Booking model",
        required: true,
        validation: required,
        options: [
          { value: "table", label: "Table/venue bookings" },
          { value: "rooms", label: "Rooms/stays" },
          { value: "events", label: "Events/functions" },
        ],
      },
      {
        id: "h7",
        type: "checkbox",
        label: "Channels",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "walkins", label: "Walk-ins" },
          { value: "phone", label: "Phone" },
          { value: "online", label: "Online bookings" },
          { value: "ota", label: "OTA (Airbnb/Booking.com)" },
        ],
      },
      { id: "h8", type: "textarea", label: "Service flow / table turns?", required: true, validation: required },
      { id: "h9", type: "textarea", label: "POS / PMS stack today?", required: true, validation: required },
      { id: "h10", type: "textarea", label: "Menu or inventory complexity?", required: true, validation: required },
    ],
  },
  {
    id: "trades",
    sector: "trades",
    questions: [
      {
        id: "t6",
        type: "radio",
        label: "Job scheduling pattern",
        required: true,
        validation: required,
        options: [
          { value: "emergency", label: "Emergency / same-day" },
          { value: "planned", label: "Planned jobs" },
          { value: "projects", label: "Long-running projects" },
        ],
      },
      {
        id: "t7",
        type: "checkbox",
        label: "Quote/estimate workflow",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "onsite", label: "Onsite quoting" },
          { value: "remote", label: "Remote quoting" },
          { value: "template", label: "Template-based" },
        ],
      },
      { id: "t8", type: "textarea", label: "Dispatch / routing tools in use?", required: true, validation: required },
      { id: "t9", type: "textarea", label: "Job tracking or compliance needs?", required: true, validation: required },
      { id: "t10", type: "textarea", label: "Billing and payments process?", required: true, validation: required },
    ],
  },
  {
    id: "retail",
    sector: "retail",
    questions: [
      {
        id: "r6",
        type: "radio",
        label: "Sales mix",
        required: true,
        validation: required,
        options: [
          { value: "in-store", label: "In-store primary" },
          { value: "online", label: "Online primary" },
          { value: "hybrid", label: "Hybrid" },
        ],
      },
      {
        id: "r7",
        type: "checkbox",
        label: "Channels",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "shopify", label: "Shopify" },
          { value: "pos", label: "POS" },
          { value: "marketplaces", label: "Marketplaces" },
          { value: "social", label: "Social commerce" },
        ],
      },
      { id: "r8", type: "textarea", label: "Inventory complexity (SKUs, variants)?", required: true, validation: required },
      { id: "r9", type: "textarea", label: "Fulfillment ops (3PL, in-house)?", required: true, validation: required },
      { id: "r10", type: "textarea", label: "Loyalty / CRM setup?", required: true, validation: required },
    ],
  },
  {
    id: "professional",
    sector: "professional",
    questions: [
      {
        id: "p6",
        type: "radio",
        label: "Engagement model",
        required: true,
        validation: required,
        options: [
          { value: "retainer", label: "Retainer" },
          { value: "project", label: "Project-based" },
          { value: "mixed", label: "Mixed" },
        ],
      },
      {
        id: "p7",
        type: "checkbox",
        label: "Sales motions",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "inbound", label: "Inbound" },
          { value: "outbound", label: "Outbound" },
          { value: "referrals", label: "Referrals/partners" },
        ],
      },
      { id: "p8", type: "textarea", label: "Proposal / SOW process?", required: true, validation: required },
      { id: "p9", type: "textarea", label: "Delivery tooling (PM/QA)?", required: true, validation: required },
      { id: "p10", type: "textarea", label: "Reporting / client portals?", required: true, validation: required },
    ],
  },
  {
    id: "leaves",
    sector: "universal",
    questions: [
      {
        id: "q21",
        type: "radio",
        label: "Budget range",
        required: true,
        validation: validBudget,
        options: [
          { value: "800-5k", label: "$800 - $5,000" },
          { value: "5k-10k", label: "$5,000 - $10,000" },
          { value: "10k-15k", label: "$10,000 - $15,000" },
          { value: "15k-25k", label: "$15,000 - $25,000" },
        ],
      },
      {
        id: "q22",
        type: "radio",
        label: "Timeline",
        required: true,
        validation: validTimeline,
        options: [
          { value: "rush", label: "Rush (<30 days)" },
          { value: "60-90", label: "60-90 days" },
          { value: "90-120", label: "90-120 days" },
          { value: "flex", label: "Flexible" },
        ],
      },
      { id: "q23", type: "text", label: "Contact email", required: true, validation: validEmail },
      { id: "q24", type: "text", label: "Phone (optional, AU format)", required: false },
    ],
  },
];

export const branchMap: Record<Exclude<Sector, "universal">, string[]> = {
  hospitality: ["h6", "h7", "h8", "h9", "h10"],
  trades: ["t6", "t7", "t8", "t9", "t10"],
  retail: ["r6", "r7", "r8", "r9", "r10"],
  professional: ["p6", "p7", "p8", "p9", "p10"],
};

const trunkIds = ["q1", "q2", "q3", "q4", "q5"];
const leavesIds = ["q21", "q22", "q23", "q24"];

export const totalQuestionsPerSector: Record<Exclude<Sector, "universal">, number> = {
  hospitality: trunkIds.length + branchMap.hospitality.length + leavesIds.length,
  trades: trunkIds.length + branchMap.trades.length + leavesIds.length,
  retail: trunkIds.length + branchMap.retail.length + leavesIds.length,
  professional: trunkIds.length + branchMap.professional.length + leavesIds.length,
};

export const questionOrderForSector = (sector: Exclude<Sector, "universal">) => [
  ...trunkIds,
  ...branchMap[sector],
  ...leavesIds,
];
