export type QuestionType = "radio" | "checkbox" | "text" | "textarea" | "number";

export type Sector =
  | "hospitality"
  | "trades"
  | "retail"
  | "professional"
  | "events-entertainment"
  | "healthcare"
  | "real-estate"
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
  introText?: string;
  outroText?: string;
  placeholder?: string;
  maxLength?: number;
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
      {
        id: "sector",
        type: "radio",
        label: "Which sector best fits your business?",
        required: true,
        introText:
          "Rocky Web Studio can service a diverse range of sectors across Central Queensland, with a strong focus on small to medium-sized businesses and organizations. Based on current strategy and capabilities, the studio serves the following sectors:",
        options: [
          { value: "professional-services", label: "Professional Services (lawyers, accountants, consultants)" },
          { value: "healthcare-allied", label: "Healthcare & Allied Health (medical clinics, physiotherapy, dentists)" },
          { value: "hospitality", label: "Hospitality (cafes, restaurants, hotels, pubs)" },
          { value: "retail", label: "Retail (local shops, boutiques, gift stores)" },
          { value: "automotive-mechanical", label: "Automotive & Mechanical (mechanics, car dealerships, auto repairs)" },
          { value: "trades-construction", label: "Trades & Construction (builders, electricians, plumbers, landscapers)" },
          { value: "education-training", label: "Education & Training (schools, tutoring, private training providers)" },
          { value: "non-profit-community", label: "Non-Profit & Community Groups (charities, clubs, local associations)" },
          { value: "agriculture-rural", label: "Agriculture & Rural Services (farms, agribusinesses, rural suppliers)" },
          { value: "veterans-defence", label: "Veterans & Defence Organizations (support groups, veteran-owned businesses)" },
          { value: "arts-music-creative", label: "Arts, Music & Creative Industries (artists, musicians, photographers, designers)" },
          { value: "government-council", label: "Government & Local Council Contractors (procurement-ready for public sector contracts)" },
          { value: "fitness-wellness", label: "Fitness & Wellness (gyms, personal trainers, yoga studios)" },
          { value: "real-estate-property", label: "Real Estate & Property (agents, property managers, rental services)" },
          { value: "transport-logistics", label: "Transport & Logistics (couriers, trucking, delivery services)" },
          { value: "events-entertainment", label: "Event Management & Entertainment (event planners, venues, festivals)" },
        ],
        outroText:
          "All sectors benefit from the studio’s AI-first, rapid deployment model and local expertise in Rockhampton and the wider Central Queensland region.",
      },
      { id: "q1", type: "text", label: "What should we call you", validation: min2Max100, required: false },
      { id: "q2", type: "text", label: "Website or social link", required: false },
      {
        id: "q3",
        type: "checkbox",
        label: "What are your goals?",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText:
          "Here are the top ten common goals among Central Queensland SMEs that Rocky Web Studio can address, based on recent regional trends and business challenges:",
        options: [
          { value: "reduce-operating-costs", label: "1. Reduce Operating Costs — Many SMEs seek ways to cut expenses—especially in energy, marketing, and labor. Web solutions that improve efficiency and automate tasks help lower costs." },
          { value: "increase-online-visibility", label: "2. Increase Online Visibility & Lead Generation — A major goal is getting more customers through digital channels. SEO, website optimization, and lead capture tools are key solutions." },
          { value: "improve-digital-maturity", label: "3. Improve Digital Maturity — Businesses want better online systems for operations, sales, and customer engagement. Websites, booking systems, and digital payments are in high demand." },
          { value: "enhance-customer-experience", label: "4. Enhance Customer Experience — Offering seamless, mobile-friendly experiences is a top priority. SMEs are investing in better websites, online forms, and chatbots." },
          { value: "streamline-operations", label: "5. Streamline Operations with Automation — Automation tools for bookings, quotes, and workflows save time and reduce errors for busy businesses." },
          { value: "grow-revenue-ecommerce", label: "6. Grow Revenue Through E-commerce — Expanding online sales—especially for retail and hospitality—is a major goal. Shopify and Stripe integrations are highly valued." },
          { value: "better-security", label: "7. Better Security & Cyber Protection — SMEs are increasingly concerned about cyber threats. Secure website hosting and payment systems are critical." },
          { value: "simplify-marketing", label: "8. Simplify Marketing & Social Media Management — Many SMEs want easier ways to promote themselves online, including integrated social media tools and marketing automation." },
          { value: "build-trust-professionalism", label: "9. Build Trust & Professionalism Online — Having a professional website with testimonials, bios, and case studies helps SMEs compete and win more clients." },
          { value: "access-grants-support", label: "10. Access Grants & Support for Digital Upgrades — Many SMEs are interested in government grants and programs for digital transformation. Providing guidance and access to these opportunities adds value." },
        ],
        outroText:
          "How Rocky Web Studio Addresses These Goals\n\n• Website & CMS: Builds professional, SEO-optimized sites for every industry.\n• E-commerce: Integrates Stripe or Shopify for secure online sales.\n• Automation: Implements chatbots, booking, and lead capture tools.\n• Support & Training: Guides SMEs on grant applications and best practices.\n• Security: Ensures safe, modern hosting and payment systems.\n\nThese goals reflect the most urgent priorities for CQ SMEs, and Rocky Web Studio's services are well-suited to address each one.",
      },
      {
        id: "q4",
        type: "checkbox",
        label: "Biggest challenges right now?",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText:
          "The 10 biggest challenges for businesses in Central Queensland—and the types we can assist with—are:",
        options: [
          { value: "operating-costs", label: "High Operating Costs & Inflation — Rising energy, supply, and wage costs are severely impacting profitability and margins for local SMEs." },
          { value: "cash-flow", label: "Cash Flow Strain & Declining Profitability — Delayed payments, customer concentration risk, and reduced access to capital are causing cash flow crises and threatening survival." },
          { value: "compliance", label: "Complex Regulatory & Compliance Burdens — Small businesses spend excessive time and resources on compliance, diverting attention from growth and customer service." },
          { value: "digital-transformation", label: "Digital Transformation Difficulties — Many businesses struggle to adopt new technologies due to lack of time, expertise, or funding." },
          { value: "cybersecurity", label: "Cybersecurity Threats — SMEs are frequent targets of cyberattacks and often lack the resources or knowledge to protect themselves adequately." },
          { value: "labour-shortages", label: "Labour Shortages & Rising Wage Costs — Recruiting and retaining skilled staff is difficult and expensive, especially in regional areas." },
          { value: "reduced-demand", label: "Reduced Consumer Spending & Demand — Falling discretionary spending and cautious consumer behaviour are reducing revenue for many sectors." },
          { value: "logistics", label: "Market Access & Logistics Barriers — Distance from major commercial hubs makes distribution and market reach more difficult and costly." },
          { value: "connectivity", label: "Digital Connectivity Limitations — Some areas still experience poor internet and mobile coverage, hindering operations and growth." },
          { value: "leadership-strategy", label: "Lack of Leadership & Strategic Planning — Efficient management structures and clear strategies are often missing, impacting resilience and innovation." },
        ],
        outroText:
          "Rocky Web Studio provides targeted solutions for these challenges through rapid web deployment, AI-driven automation, cybersecurity advice, and expert digital marketing and business strategy support, tailored for the regional Queensland market.",
      },
      {
        id: "q5",
        type: "checkbox",
        label: "Primary offer",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText:
          "Here are the ten primary offers (business services) of Central Queensland businesses that Rocky Web Studio can assist with, based on regional directories and industry trends:\n\n10 Primary Business Offers in Central Queensland",
        options: [
          { value: "hospitality-food", label: "Hospitality & Food Services — Cafes, restaurants, bakeries, bars, and catering businesses looking for better online menus, booking systems, and digital ordering." },
          { value: "retail-trade", label: "Retail Trade — Boutiques, clothing stores, grocery shops, and specialty retailers needing e-commerce solutions, online catalogs, and mobile-friendly websites." },
          { value: "trades-services", label: "Trades & Services — Builders, plumbers, electricians, mechanics, and contractors wanting streamlined online quoting, booking, and lead management tools." },
          { value: "health-wellness", label: "Health & Wellness — Clinics, physiotherapists, dentists, and allied health professionals seeking patient booking, digital forms, and professional online presence." },
          { value: "property-real-estate", label: "Property & Real Estate — Real estate agents, property managers, and valuers needing listings, client portals, and lead capture forms." },
          { value: "professional-services", label: "Professional Services — Accountants, lawyers, financial advisors, and consultants requiring client onboarding, appointment scheduling, and secure communication." },
          { value: "manufacturing-industrial", label: "Manufacturing & Industrial — Local manufacturers and industrial suppliers wanting online product catalogs, B2B e-commerce, and supply chain visibility." },
          { value: "agriculture-primary", label: "Agriculture & Primary Production — Farms, nurseries, and agribusinesses looking for online sales, farm management dashboards, and digital market access." },
          { value: "transport-logistics", label: "Transport & Logistics — Trucking, courier, and freight companies needing booking, tracking, and customer management portals." },
          { value: "creative-media", label: "Creative & Media — Designers, photographers, marketing agencies, and artists seeking portfolio sites, online booking, and digital storefronts." },
        ],
        outroText:
          "How Rocky Web Studio Can Help\n\n• Website Design & CMS: Build professional, mobile-friendly sites for every sector.\n• E-commerce: Enable online sales and digital payments for retail and hospitality.\n• Booking & Scheduling: Implement online booking and scheduling tools for health, trades, and creative services.\n• Lead Management: Set up digital forms and CRM integrations for trades, property, and professional services.\n• Automation: Use chatbots and automation for repetitive tasks across all sectors.\n\nThese are the most common offers among CQ businesses, and Rocky Web Studio's services can enhance each one's digital presence and efficiency.",
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
      { 
        id: "h8", 
        type: "textarea", 
        label: "Service flow / table turns?", 
        required: true, 
        validation: required,
        outroText: "Describe how customers flow through your venue/service (e.g., walk-in, reservation, table duration, etc.)",
      },
      { 
        id: "h9", 
        type: "textarea", 
        label: "Current POS / PMS / booking systems?", 
        required: true, 
        validation: required,
        outroText: "List any point-of-sale, property management, or booking systems you currently use (e.g., Square, OpenTable, Xero, etc.)",
      },
      { 
        id: "h10", 
        type: "textarea", 
        label: "Menu or inventory complexity?", 
        required: true, 
        validation: required,
        outroText: "Describe your menu items, pricing structure, inventory management needs, or product variations",
      },
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
      { 
        id: "t8", 
        type: "textarea", 
        label: "Dispatch / routing tools in use?", 
        required: true, 
        validation: required,
        outroText: "What tools do you currently use for scheduling, dispatch, or route optimization?",
      },
      { 
        id: "t9", 
        type: "textarea", 
        label: "Job tracking or compliance needs?", 
        required: true, 
        validation: required,
        outroText: "What job tracking, reporting, or compliance requirements do you have? (e.g., certifications, safety records, progress photos)",
      },
      { 
        id: "t10", 
        type: "textarea", 
        label: "Billing and payments process?", 
        required: true, 
        validation: required,
        outroText: "How do you currently handle invoicing, payments, deposits, or payment plans?",
      },
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
      { 
        id: "r8", 
        type: "textarea", 
        label: "Inventory complexity (SKUs, variants, sizes, colors)?", 
        required: true, 
        validation: required,
        outroText: "Describe your product catalog complexity: number of SKUs, product variants (sizes, colors, styles), categories, etc.",
      },
      { 
        id: "r9", 
        type: "textarea", 
        label: "Fulfillment operations (3PL, in-house, dropshipping)?", 
        required: true, 
        validation: required,
        outroText: "How do you handle order fulfillment? In-house shipping, third-party logistics (3PL), dropshipping, local delivery, etc.",
      },
      { 
        id: "r10", 
        type: "textarea", 
        label: "Loyalty programs or CRM needs?", 
        required: true, 
        validation: required,
        outroText: "Do you have or need customer loyalty programs, email marketing, customer relationship management (CRM), or customer retention tools?",
      },
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
      { 
        id: "p8", 
        type: "textarea", 
        label: "Proposal / SOW process?", 
        required: true, 
        validation: required,
        outroText: "How do you currently create proposals, statements of work (SOW), or project scopes?",
      },
      { 
        id: "p9", 
        type: "textarea", 
        label: "Delivery tooling (PM/QA)?", 
        required: true, 
        validation: required,
        outroText: "What project management, quality assurance, or delivery tools do you use?",
      },
      { 
        id: "p10", 
        type: "textarea", 
        label: "Reporting / client portals?", 
        required: true, 
        validation: required,
        outroText: "Do you need client portals, automated reporting, or client collaboration tools?",
      },
    ],
  },
  {
    id: "events-entertainment",
    sector: "events-entertainment",
    questions: [
      {
        id: "e6",
        type: "checkbox",
        label: "Primary business model",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText: "Select all that apply to your business:",
        options: [
          { value: "equipment-hire", label: "Equipment hire (wet/dry hire)" },
          { value: "services-only", label: "Services only (DJ, MC, event management)" },
          { value: "packages", label: "Service + equipment packages" },
          { value: "venue-hire", label: "Venue hire" },
          { value: "event-planning", label: "Event planning and coordination" },
        ],
      },
      {
        id: "e7",
        type: "textarea",
        label: "Equipment catalog summary",
        required: true,
        validation: required,
        maxLength: 2000,
        placeholder: "Example: PA System x2: $400/day (wet), $200/day (dry)...",
        introText: "Please provide an overview of your equipment inventory. Include main categories, quantities, and key items. Use the recommended format below:",
        outroText: `RECOMMENDED FORMAT:

## Audio Equipment
- PA System x2: $400/day (wet), $200/day (dry)
- Wireless Microphones x4: $50/day each (wet), $25/day (dry)
- Mixer Console x1: $150/day (wet), $75/day (dry)

## Lighting
- LED Panels x10: $300/day (wet), $150/day (dry)
- Moving Head Lights x4: $200/day (wet), $100/day (dry)
- Laser Lights x2: $100/day (wet), $50/day (dry)

## DJ Equipment
- Full DJ Setup x2: $500/day (wet), $250/day (dry)
- Turntables x2: $100/day (wet), $50/day (dry)

TIPS:
• List each category separately
• Include quantity available (e.g., x2, x4)
• Specify wet hire (with operator) and dry hire (equipment only) pricing
• Add any special notes about equipment (power requirements, compatibility, etc.)`,
      },
      {
        id: "e8",
        type: "textarea",
        label: "Pricing structure",
        required: true,
        validation: required,
        maxLength: 2000,
        placeholder: "Example: Wet hire: $500-800/day, Dry hire: $200-400/day. Payment: 50% deposit, balance 7 days before event...",
        introText: "Describe your pricing model. Include wet hire (with operator) vs dry hire (equipment only) rates, package pricing, typical pricing ranges, rental duration options (hourly, daily, weekly, event-based), and payment terms:",
        outroText: "Example: Wet hire (with operator): $500-800/day or $150/hour minimum 4 hours. Dry hire (equipment only): $200-400/day or $75/hour. DJ services: $800-1500/event. Full packages (equipment + DJ): $1200-2000/event. Payment terms: 50% deposit required to secure booking, balance due 7 days before event. Refund policy: Full refund if cancelled 14+ days before, 50% refund 7-13 days before. Damage deposit: $200-500 depending on equipment value. Accepted payment methods: Credit card, bank transfer, cash on delivery.",
      },
      {
        id: "e8b",
        type: "checkbox",
        label: "Rental duration options",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText: "What rental duration options do you offer? Select all that apply:",
        options: [
          { value: "hourly", label: "Hourly rentals" },
          { value: "daily", label: "Daily rentals (24-hour periods)" },
          { value: "weekly", label: "Weekly rentals (7-day periods)" },
          { value: "multi-day", label: "Multi-day rentals (2-6 days)" },
          { value: "event-based", label: "Event-based (full event duration, pickup/delivery included)" },
          { value: "minimum-hours", label: "Minimum rental period (e.g., 4 hours minimum)" },
          { value: "peak-pricing", label: "Peak/off-peak pricing (weekends, holidays, seasons)" },
        ],
        outroText: "These options help determine how customers can book equipment and what pricing structure to implement.",
      },
      {
        id: "e9",
        type: "checkbox",
        label: "Required booking features",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        introText: "Select the features you need for your booking system:",
        options: [
          { value: "online-booking", label: "Online booking calendar" },
          { value: "availability-check", label: "Real-time availability checking per equipment item" },
          { value: "payment-processing", label: "Online payment processing (deposits, full payment)" },
          { value: "deposits", label: "Deposit/booking fee system with configurable amounts" },
          { value: "invoices", label: "Automated invoice generation" },
          { value: "contracts", label: "Digital contracts/terms acceptance" },
          { value: "inventory-management", label: "Equipment inventory tracking with quantity management" },
          { value: "quantity-tracking", label: "Quantity tracking per item (e.g., 3 of 5 available)" },
          { value: "reservations", label: "Hold/reservation system (temporary holds before booking)" },
          { value: "condition-tracking", label: "Equipment condition/maintenance tracking" },
          { value: "quote-system", label: "Quote/estimate system with custom pricing" },
        ],
      },
      {
        id: "e10",
        type: "textarea",
        label: "Special requirements or workflows",
        required: false,
        maxLength: 1000,
        placeholder: "Example: Delivery within 50km radius, $50 delivery fee, setup included...",
        introText: "Any specific requirements for your booking process, equipment delivery, setup, insurance, or other workflows:",
        outroText: "Example: Equipment delivery and setup services (delivery radius, delivery fees, setup time requirements), insurance requirements, damage deposits, custom packages, seasonal pricing variations, pickup/delivery scheduling, equipment compatibility information...",
      },
      {
        id: "e11",
        type: "textarea",
        label: "Service area and delivery coverage",
        required: false,
        maxLength: 500,
        placeholder: "Example: Rockhampton, Yeppoon, Gladstone. Delivery within 100km radius. Additional fees apply beyond 50km...",
        introText: "Where do you provide equipment hire services? Include your service area, delivery coverage radius, and any delivery fees or restrictions:",
        outroText: "Example: Service areas: Rockhampton, Yeppoon, Gladstone, Emerald. Free delivery within 50km of Rockhampton CBD. Delivery fees: $50 (50-75km), $100 (75-100km). No delivery beyond 100km. Pickup available from our warehouse...",
      },
      {
        id: "e12",
        type: "checkbox",
        label: "Insurance and liability requirements",
        required: false,
        introText: "Select any insurance or liability requirements for your equipment hire:",
        options: [
          { value: "customer-insurance", label: "Require customers to have public liability insurance" },
          { value: "damage-waiver", label: "Offer damage waiver/insurance (optional or mandatory)" },
          { value: "liability-coverage", label: "Provide liability coverage as part of service" },
          { value: "security-deposit", label: "Security deposit required (specify amount in special requirements)" },
          { value: "bond-required", label: "Bond/damage deposit required" },
          { value: "none", label: "No specific insurance requirements" },
        ],
        outroText: "Insurance requirements affect your booking system setup and customer terms. Include specific amounts or details in the special requirements section above.",
      },
    ],
  },
  {
    id: "healthcare",
    sector: "healthcare",
    questions: [
      {
        id: "hc6",
        type: "radio",
        label: "Service type",
        required: true,
        validation: required,
        options: [
          { value: "clinic", label: "Medical clinic/GP practice" },
          { value: "allied-health", label: "Allied health (physio, chiro, etc.)" },
          { value: "dental", label: "Dental practice" },
          { value: "specialist", label: "Specialist practice" },
          { value: "other", label: "Other healthcare service" },
        ],
      },
      {
        id: "hc7",
        type: "checkbox",
        label: "Booking requirements",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "appointment-booking", label: "Patient appointment booking" },
          { value: "online-forms", label: "Patient intake forms" },
          { value: "reminders", label: "SMS/Email reminders" },
          { value: "waitlist", label: "Waitlist management" },
          { value: "recurring", label: "Recurring appointments" },
          { value: "telehealth", label: "Telehealth/online consultations" },
        ],
      },
      {
        id: "hc8",
        type: "textarea",
        label: "Current booking system or processes?",
        required: true,
        validation: required,
      },
      {
        id: "hc9",
        type: "checkbox",
        label: "Compliance and privacy requirements",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "hipaa", label: "HIPAA compliance (or Australian Privacy Act)" },
          { value: "secure-forms", label: "Secure patient data forms" },
          { value: "consent-forms", label: "Digital consent forms" },
          { value: "records-access", label: "Patient portal/records access" },
        ],
      },
      {
        id: "hc10",
        type: "textarea",
        label: "Integration needs (practice management, payments, etc.)?",
        required: false,
      },
    ],
  },
  {
    id: "real-estate",
    sector: "real-estate",
    questions: [
      {
        id: "re6",
        type: "checkbox",
        label: "Service type",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "sales", label: "Property sales" },
          { value: "rentals", label: "Rental management" },
          { value: "commercial", label: "Commercial properties" },
          { value: "appraisals", label: "Property appraisals" },
        ],
      },
      {
        id: "re7",
        type: "checkbox",
        label: "Required features",
        required: true,
        validation: (v) => Array.isArray(v) && v.length > 0,
        options: [
          { value: "listings", label: "Property listings/search" },
          { value: "lead-capture", label: "Lead capture forms" },
          { value: "inspection-booking", label: "Inspection booking system" },
          { value: "applications", label: "Rental application forms" },
          { value: "client-portal", label: "Client portal (tenants/owners)" },
          { value: "maintenance", label: "Maintenance request system" },
        ],
      },
      {
        id: "re8",
        type: "textarea",
        label: "Current property management or CRM system?",
        required: false,
      },
      {
        id: "re9",
        type: "textarea",
        label: "Listing volume and update frequency?",
        required: true,
        validation: required,
      },
      {
        id: "re10",
        type: "textarea",
        label: "Payment processing needs (rent collection, deposits, etc.)?",
        required: false,
      },
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
  "events-entertainment": ["e6", "e7", "e8", "e8b", "e9", "e10", "e11", "e12"],
  healthcare: ["hc6", "hc7", "hc8", "hc9", "hc10"],
  "real-estate": ["re6", "re7", "re8", "re9", "re10"],
};

const trunkIds = ["q1", "q2", "q3", "q4", "q5"];
const leavesIds = ["q21", "q22", "q23", "q24"];

export const totalQuestionsPerSector: Record<Exclude<Sector, "universal">, number> = {
  hospitality: trunkIds.length + branchMap.hospitality.length + leavesIds.length,
  trades: trunkIds.length + branchMap.trades.length + leavesIds.length,
  retail: trunkIds.length + branchMap.retail.length + leavesIds.length,
  professional: trunkIds.length + branchMap.professional.length + leavesIds.length,
  "events-entertainment": trunkIds.length + branchMap["events-entertainment"].length + leavesIds.length,
  healthcare: trunkIds.length + branchMap.healthcare.length + leavesIds.length,
  "real-estate": trunkIds.length + branchMap["real-estate"].length + leavesIds.length,
};

export const questionOrderForSector = (sector: Exclude<Sector, "universal">) => [
  ...trunkIds,
  ...branchMap[sector],
  ...leavesIds,
];
