/**
 * Sectors Type Definition
 * 
 * Defines the 16 sectors that Rocky Web Studio serves,
 * extracted from the questionnaire configuration.
 */

export interface SectorDefinition {
  /** Human-readable sector name */
  name: string;
  
  /** Brief description of the sector */
  description?: string;
  
  /** Estimated market size or potential */
  marketSize?: string;
  
  /** Key characteristics of this sector */
  characteristics?: string[];
}

/**
 * SECTORS object - contains all 16 sector definitions
 * 
 * Maps sector slugs to their definitions for use in
 * backend workflow services and PDF generation.
 */
export const SECTORS: Record<string, SectorDefinition> = {
  "professional-services": {
    name: "Professional Services",
    description: "Lawyers, accountants, consultants, and other professional service providers",
    characteristics: ["High-value services", "Client relationship focused", "Document-heavy"],
  },
  "healthcare-allied": {
    name: "Healthcare & Allied Health",
    description: "Medical clinics, physiotherapy, dentists, and allied health professionals",
    characteristics: ["Compliance-focused", "Patient data security", "Booking systems critical"],
  },
  "hospitality": {
    name: "Hospitality",
    description: "Cafes, restaurants, hotels, pubs, and hospitality venues",
    characteristics: ["Online booking essential", "Menu management", "Customer reviews"],
  },
  "retail": {
    name: "Retail",
    description: "Local shops, boutiques, gift stores, and retail businesses",
    characteristics: ["E-commerce potential", "Inventory management", "Customer loyalty"],
  },
  "automotive-mechanical": {
    name: "Automotive & Mechanical",
    description: "Mechanics, car dealerships, auto repairs, and automotive services",
    characteristics: ["Service booking", "Parts inventory", "Customer communication"],
  },
  "trades-construction": {
    name: "Trades & Construction",
    description: "Builders, electricians, plumbers, landscapers, and trade professionals",
    characteristics: ["Quote management", "Project tracking", "Lead generation"],
  },
  "education-training": {
    name: "Education & Training",
    description: "Schools, tutoring, private training providers, and educational services",
    characteristics: ["Student management", "Course booking", "Content delivery"],
  },
  "non-profit-community": {
    name: "Non-Profit & Community Groups",
    description: "Charities, clubs, local associations, and community organizations",
    characteristics: ["Volunteer management", "Donation processing", "Event coordination"],
  },
  "agriculture-rural": {
    name: "Agriculture & Rural Services",
    description: "Farms, agribusinesses, rural suppliers, and agricultural services",
    characteristics: ["Seasonal operations", "Supply chain", "Market access"],
  },
  "veterans-defence": {
    name: "Veterans & Defence Organizations",
    description: "Support groups, veteran-owned businesses, and defence-related services",
    characteristics: ["Community-focused", "Certification requirements", "Networking"],
  },
  "arts-music-creative": {
    name: "Arts, Music & Creative Industries",
    description: "Artists, musicians, photographers, designers, and creative professionals",
    characteristics: ["Portfolio showcase", "Booking systems", "Digital storefronts"],
  },
  "government-council": {
    name: "Government & Local Council Contractors",
    description: "Procurement-ready businesses for public sector contracts",
    characteristics: ["Compliance-heavy", "Documentation", "Tender processes"],
  },
  "fitness-wellness": {
    name: "Fitness & Wellness",
    description: "Gyms, personal trainers, yoga studios, and wellness businesses",
    characteristics: ["Class booking", "Membership management", "Payment processing"],
  },
  "real-estate-property": {
    name: "Real Estate & Property",
    description: "Real estate agents, property managers, rental services",
    characteristics: ["Listings management", "Client portals", "Lead capture"],
  },
  "transport-logistics": {
    name: "Transport & Logistics",
    description: "Couriers, trucking, delivery services, and logistics companies",
    characteristics: ["Tracking systems", "Route optimization", "Customer notifications"],
  },
  "events-entertainment": {
    name: "Event Management & Entertainment",
    description: "Event planners, venues, festivals, and entertainment businesses",
    characteristics: ["Event booking", "Ticket sales", "Vendor coordination"],
  },
};

/**
 * Get sector definition by slug
 */
export function getSector(slug: string): SectorDefinition | undefined {
  return SECTORS[slug];
}

/**
 * Get all sector slugs
 */
export function getAllSectorSlugs(): string[] {
  return Object.keys(SECTORS);
}

/**
 * Check if a sector slug exists
 */
export function sectorExists(slug: string): boolean {
  return slug in SECTORS;
}
