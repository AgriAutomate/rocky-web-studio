/**
 * Goals Type Definition
 * 
 * Defines the 10 common goals among Central Queensland SMEs
 * that Rocky Web Studio can address, extracted from the questionnaire configuration.
 */

export interface GoalDefinition {
  /** Goal title/number */
  title: string;
  
  /** Full description of the goal */
  description: string;
  
  /** Key solutions that address this goal */
  solutions?: string[];
  
  /** Priority level (1-10, where 1 is highest priority) */
  priority?: number;
}

/**
 * GOALS object - contains all 10 goal definitions
 * 
 * Maps goal slugs to their definitions for use in
 * backend workflow services and PDF generation.
 */
export const GOALS: Record<string, GoalDefinition> = {
  "reduce-operating-costs": {
    title: "1. Reduce Operating Costs",
    description: "Many SMEs seek ways to cut expenses—especially in energy, marketing, and labor. Web solutions that improve efficiency and automate tasks help lower costs.",
    solutions: ["Automation tools", "Efficient workflows", "Cost-tracking systems"],
    priority: 1,
  },
  "increase-online-visibility": {
    title: "2. Increase Online Visibility & Lead Generation",
    description: "A major goal is getting more customers through digital channels. SEO, website optimization, and lead capture tools are key solutions.",
    solutions: ["SEO optimization", "Website optimization", "Lead capture tools"],
    priority: 2,
  },
  "improve-digital-maturity": {
    title: "3. Improve Digital Maturity",
    description: "Businesses want better online systems for operations, sales, and customer engagement. Websites, booking systems, and digital payments are in high demand.",
    solutions: ["Website & CMS", "Booking systems", "Digital payments"],
    priority: 3,
  },
  "enhance-customer-experience": {
    title: "4. Enhance Customer Experience",
    description: "Offering seamless, mobile-friendly experiences is a top priority. SMEs are investing in better websites, online forms, and chatbots.",
    solutions: ["Mobile-friendly websites", "Online forms", "Chatbots"],
    priority: 4,
  },
  "streamline-operations": {
    title: "5. Streamline Operations with Automation",
    description: "Automation tools for bookings, quotes, and workflows save time and reduce errors for busy businesses.",
    solutions: ["Booking automation", "Quote automation", "Workflow automation"],
    priority: 5,
  },
  "grow-revenue-ecommerce": {
    title: "6. Grow Revenue Through E-commerce",
    description: "Expanding online sales—especially for retail and hospitality—is a major goal. Shopify and Stripe integrations are highly valued.",
    solutions: ["E-commerce platforms", "Shopify integration", "Stripe integration"],
    priority: 6,
  },
  "better-security": {
    title: "7. Better Security & Cyber Protection",
    description: "SMEs are increasingly concerned about cyber threats. Secure website hosting and payment systems are critical.",
    solutions: ["Secure hosting", "Payment security", "Data protection"],
    priority: 7,
  },
  "simplify-marketing": {
    title: "8. Simplify Marketing & Social Media Management",
    description: "Many SMEs want easier ways to promote themselves online, including integrated social media tools and marketing automation.",
    solutions: ["Social media integration", "Marketing automation", "Content management"],
    priority: 8,
  },
  "build-trust-professionalism": {
    title: "9. Build Trust & Professionalism Online",
    description: "Having a professional website with testimonials, bios, and case studies helps SMEs compete and win more clients.",
    solutions: ["Professional websites", "Testimonials", "Case studies"],
    priority: 9,
  },
  "access-grants-support": {
    title: "10. Access Grants & Support for Digital Upgrades",
    description: "Many SMEs are interested in government grants and programs for digital transformation. Providing guidance and access to these opportunities adds value.",
    solutions: ["Grant guidance", "Program access", "Digital transformation support"],
    priority: 10,
  },
};

/**
 * Get goal definition by slug
 */
export function getGoal(slug: string): GoalDefinition | undefined {
  return GOALS[slug];
}

/**
 * Get all goal slugs
 */
export function getAllGoalSlugs(): string[] {
  return Object.keys(GOALS);
}

/**
 * Check if a goal slug exists
 */
export function goalExists(slug: string): boolean {
  return slug in GOALS;
}
