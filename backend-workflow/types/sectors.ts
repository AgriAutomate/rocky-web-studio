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
  
  /** Growth rate or market trend */
  growthRate?: string;
  
  /** Key characteristics of this sector */
  characteristics?: string[];
  
  /** Central Queensland market insight - data-backed fact about Rockhampton/CQ market */
  cqInsiderInsight?: string;
  
  /** Common mistake local competitors make */
  localCompetitorFailure?: string;
  
  /** RWS technical solution framed as non-negotiable */
  rwsSurvivalKit?: string;
  
  /** Central Queensland context */
  cqContext?: string;
  
  /** Recommended services for this sector */
  recommendedServices?: string[];
}

/**
 * SECTORS object - contains all 16 sector definitions
 * 
 * Maps sector slugs to their definitions for use in
 * backend workflow services and PDF generation.
 */
export const SECTORS: Record<string, SectorDefinition> = {
  "healthcare-allied-health": {
    name: "Healthcare & Allied Health",
    description: "Medical practices, physiotherapy, psychology, dental, allied health services",
    marketSize: "$1.2B - $1.5B",
    growthRate: "29.6% growth (CQ-specific)",
    cqInsiderInsight: "Rockhampton has a 6-week average wait time for specialists, causing massive overflow into allied health. However, 40% of patient inquiries in CQ happen after 5 PM when your reception is closed.",
    localCompetitorFailure: "Most local clinics rely on voicemail or phone tag. Patients simply hang up and call the next clinic on Google Maps until someone answers or they can book online.",
    rwsSurvivalKit: "A 24/7 Self-Service Patient Portal. If patients can't book instantly on their phone at 8 PM, you lose them to a competitor who can. This isn't a website feature—it's your after-hours receptionist.",
    characteristics: ["Compliance-focused", "Patient data security", "Booking systems critical"],
  },
  "trades-construction": {
    name: "Trades & Construction",
    description: "Plumbing, electrical, carpentry, construction, civil works, heavy equipment",
    marketSize: "$2.1B - $2.8B",
    growthRate: "Ring Road + Shoalwater Defence expansion",
    cqInsiderInsight: "With the Ring Road project and Defence upgrades at Shoalwater Bay, commercial procurement is shifting to digital-first vetting. Tier 1 contractors are rejecting subbies who look 'high risk' online.",
    localCompetitorFailure: "Relying on 'word of mouth' and a Facebook page. To a procurement officer in Brisbane or a Defence contractor, a Facebook page looks like a hobbyist, not a compliant partner.",
    rwsSurvivalKit: "A 'Procurement-Ready' Digital Profile. You need a dedicated Capability Statement page, automated safety document downloads, and a professional domain. This signals you are low-risk and ready for big contracts.",
    characteristics: ["Quote management", "Project tracking", "Lead generation"],
  },
  "hospitality-retail": {
    name: "Hospitality, Cafe & Retail",
    description: "Cafes, restaurants, bars, retail shops, tourism operators",
    marketSize: "$850M - $1.2B",
    growthRate: "Bruce Highway transient traffic is constant",
    cqInsiderInsight: "Traffic through Rockhampton is transient. 65% of dining decisions in Rocky are made by people who have never been here before, browsing 'Near Me' on Google Maps while doing 60km/h on the Bruce Highway.",
    localCompetitorFailure: "Static menus (PDFs) that can't be read on phones and generic 'Open' hours that aren't updated for public holidays. Tourists assume you are closed or too hard to figure out.",
    rwsSurvivalKit: "Mobile-First Menu & Local SEO Dominance. We don't just build a site; we structure your data so Google Maps pushes you to the top of the 'Near Me' list. If you aren't on that map, you don't exist to highway traffic.",
    characteristics: ["Online booking essential", "Menu management", "Customer reviews"],
  },
  "agriculture-rural": {
    name: "Agriculture & Rural Services",
    description: "Farms, livestock, studs, equipment, agricultural services",
    marketSize: "$3.2B - $4.1B",
    growthRate: "Succession planning challenge in CQ",
    cqInsiderInsight: "The biggest threat to CQ agriculture isn't drought; it's succession planning and labour. The next generation of buyers and workers are digital-natives who judge your operation's viability by its digital footprint.",
    localCompetitorFailure: "Invisible operations. Potential investors, buyers, or skilled laborers can't find information on your stud genetics, auction history, or operation scale without making a phone call (which they won't make).",
    rwsSurvivalKit: "Asset & Operations Showcase. A digital catalog of your herd/stud genetics or machinery capabilities. It saves you hours of call time and attracts premium buyers and staff who do their research online first.",
    characteristics: ["Seasonal operations", "Supply chain", "Market access"],
  },
  "professional-services": {
    name: "Professional Services",
    description: "Accounting, law, consulting, recruitment, real estate, insurance brokers",
    marketSize: "$1.8B - $2.3B",
    growthRate: "Trust-based services growing with population",
    cqInsiderInsight: "In regional Queensland, 'Trust' is the currency. But the vetting process has changed. Locals ask a friend for a recommendation, then immediately validate that recommendation on Google. If the digital image doesn't match the friend's praise, trust is broken.",
    localCompetitorFailure: "Generic, template websites that look like they could be in Sydney or New York. They lack local faces, local case studies, and specific Rocky context—so the friend's recommendation doesn't feel validated.",
    rwsSurvivalKit: "Hyper-Local Authority Platform. We build 'Trust Assets'—automated testimonials from local businesses, case studies of Rocky clients, and content that specifically addresses CQ regulations. It proves you are HERE and you are EXPERT.",
    characteristics: ["High-value services", "Client relationship focused", "Document-heavy"],
  },
  "fitness-wellness": {
    name: "Fitness & Wellness",
    description: "Gyms, yoga studios, personal trainers, wellness coaches, massage therapy",
    marketSize: "$320M - $480M",
    growthRate: "Post-COVID membership models shifting online",
    cqInsiderInsight: "Rockhampton's fitness market is split: committed locals want 24/7 access and tracking, while casual visitors want quick class schedules visible before committing. Your competitors are only catering to one.",
    localCompetitorFailure: "Most studios hide class schedules behind Facebook or require phone calls. New members don't know if a class fits their schedule, so they join a competitor gym with visible timetables.",
    rwsSurvivalKit: "24/7 Class Booking Portal with Trainer Profiles. Make it dead simple for someone to see your schedule on their phone at 6 AM and book before work. This removes friction and increases membership stickiness.",
    characteristics: ["Class booking", "Membership management", "Payment processing"],
  },
  "real-estate-property": {
    name: "Real Estate & Property",
    description: "Real estate agents, property management, valuers, developers",
    marketSize: "$1.1B - $1.6B",
    growthRate: "Regional migration + investment property interest growing",
    cqInsiderInsight: "Interstate buyers researching Rockhampton property do 90% of their vetting online. If your property listings don't have drone photos, floor plans, and 3D tours, they disappear into competitors' sites.",
    localCompetitorFailure: "Static listings with 3-4 photos, no drone shots, and no walkthrough. Interstate buyers assume the property is a risk if the agent didn't invest in quality presentation.",
    rwsSurvivalKit: "Virtual Property Showcase Platform. Drone photography, 3D floor plans, neighborhood walkthroughs, and market comparables all embedded. This makes your listings the 'premium choice' to out-of-state buyers.",
    characteristics: ["Listings management", "Client portals", "Lead capture"],
  },
  "education-training": {
    name: "Education & Training",
    description: "Training centers, tutoring, online courses, skill development, workshops",
    marketSize: "$450M - $620M",
    growthRate: "Online learning + upskilling post-COVID demand",
    cqInsiderInsight: "Parents and students in CQ research training providers online BEFORE attending an open day. If you don't have detailed course descriptions, instructor bios, and alumni outcomes visible online, you don't get the inquiry.",
    localCompetitorFailure: "Outdated course catalogs and no 'student success stories.' Parents can't tell if your program actually gets results or just sounds good in a brochure.",
    rwsSurvivalKit: "Student Outcomes Dashboard & Course Pages. Show real results: job placement rates, salary improvements, testimonials. When a parent sees 'X% of graduates are employed in their field,' they enroll.",
    characteristics: ["Student management", "Course booking", "Content delivery"],
  },
  "government-council": {
    name: "Government & Council Contractors",
    description: "Suppliers to local/state government and councils, procurement vendors",
    marketSize: "$2.3B - $3.1B",
    growthRate: "Procurement digitalization increasing",
    cqInsiderInsight: "Government procurement is moving entirely online. A government buyer (state or local) will NEVER call you. If you're not in their digital vendor management system with automated compliance docs, you don't exist.",
    localCompetitorFailure: "Treating government contracts like regular sales. They send emails, voice messages, wait for callbacks. Meanwhile, vendors with automated compliance systems and online credentials are getting contracts.",
    rwsSurvivalKit: "Automated Compliance & Vendor Portal. We integrate your certifications, insurance, safety documentation, and compliance history into a portal that government systems pull from automatically. You stop chasing paperwork; the paperwork comes to you.",
    characteristics: ["Compliance-heavy", "Documentation", "Tender processes"],
  },
  "automotive-mechanical": {
    name: "Automotive & Mechanical Services",
    description: "Car repairs, servicing, panel beating, mechanical shops, dealerships",
    marketSize: "$680M - $920M",
    growthRate: "Fleet maintenance for Ring Road construction spike",
    cqInsiderInsight: "When a truck or fleet breaks down on the Bruce Highway, the driver is searching 'Auto repair near me' RIGHT NOW. If your shop isn't found in that 2-minute window, the job goes to a competitor.",
    localCompetitorFailure: "Outdated websites with generic service pages. No online booking, no transparent pricing, no 'while you wait' messaging. Fleet managers assume you'll keep them waiting.",
    rwsSurvivalKit: "Emergency Booking Portal + Transparent Pricing. 'Book now, we have space,' 'Next available: 30 min,' 'Service cost estimate online.' This signals competence and urgency—exactly what a stranded driver needs.",
    characteristics: ["Service booking", "Parts inventory", "Customer communication"],
  },
  "arts-creative": {
    name: "Arts, Music & Creative Industries",
    description: "Artists, musicians, studios, galleries, event producers, creative agencies",
    marketSize: "$210M - $310M",
    growthRate: "Content creation + online portfolio demand growing",
    cqInsiderInsight: "Creative professionals in Rocky are competing with artists from Brisbane, Sydney, and Melbourne for gigs. If your online portfolio doesn't look as professional as a city-based artist, you lose the job.",
    localCompetitorFailure: "Portfolio sites that look like high school projects. Potential clients (event organizers, corporate buyers) assume lack of digital presence = lack of professionalism.",
    rwsSurvivalKit: "Professional Portfolio & Booking Platform. High-quality image galleries, client testimonials, integrated booking/invoice system, and social proof. This signals you are a legitimate, professional artist—not a hobbyist.",
    characteristics: ["Portfolio showcase", "Booking systems", "Digital storefronts"],
  },
  "veterans-defence": {
    name: "Veterans & Defence Organizations",
    description: "Veterans support services, Defence contractors, military-adjacent businesses",
    marketSize: "$580M - $780M",
    growthRate: "Shoalwater Bay expansion + veteran population growth",
    cqInsiderInsight: "Rockhampton has one of Australia's largest Defence populations. Defence contractors and veteran service providers are competing nationally for Defence dollars. Your digital presence either signals 'mission-ready' or 'not serious.'",
    localCompetitorFailure: "Treating Defence work like commercial sales. Government procurement is formal, documented, and entirely online. A Facebook page or outdated website doesn't meet Defence vetting requirements.",
    rwsSurvivalKit: "Defence-Certified Digital Presence. We build your site to meet government security, compliance, and credibility standards. Automated documentation, professional presentation, and verifiable credentials make you 'procurement-ready.'",
    characteristics: ["Community-focused", "Certification requirements", "Networking"],
  },
  "non-profit-community": {
    name: "Non-Profit & Community Groups",
    description: "Charities, community centers, volunteer organizations, social enterprises",
    marketSize: "$340M - $510M",
    growthRate: "Community engagement + volunteer recruitment increasing",
    cqInsiderInsight: "Non-profits in Rocky compete for donations and volunteers. Donors and volunteers ALWAYS check the website first to vet legitimacy. If your site looks unprofessional or outdated, they assume the organization is struggling.",
    localCompetitorFailure: "Using free, template-based sites that have no donation integration, no volunteer sign-up system, and no storytelling. Donors don't give to organizations that look like they don't have their act together.",
    rwsSurvivalKit: "Impact-Driven Donor Platform. We build your site to tell your story, showcase impact (with numbers), integrate donation buttons, and enable volunteer sign-ups. This tells donors: 'We are organized, transparent, and serious.'",
    characteristics: ["Volunteer management", "Donation processing", "Event coordination"],
  },
  "transport-logistics": {
    name: "Transport & Logistics",
    description: "Trucking companies, courier services, freight forwarding, warehouse management",
    marketSize: "$1.9B - $2.6B",
    growthRate: "Ring Road + port expansion + interstate freight growth",
    cqInsiderInsight: "Modern freight buyers want real-time tracking, automated quotes, and digital proof of delivery. Companies without this automation are seen as 'old school' and lose bids to tech-forward competitors.",
    localCompetitorFailure: "Phone-based quoting and manual tracking. Customers have to call for a price and wait days to hear back. Modern buyers expect instant online quotes and real-time GPS tracking.",
    rwsSurvivalKit: "Automated Logistics Platform. Real-time tracking, instant online quotes, digital proof of delivery, and customer self-service. This makes you the 'modern, reliable choice' vs. your phone-dependent competitors.",
    characteristics: ["Tracking systems", "Route optimization", "Customer notifications"],
  },
  "events-entertainment": {
    name: "Event Management & Entertainment",
    description: "Event planners, venues, entertainment bookers, conference organizers",
    marketSize: "$240M - $360M",
    growthRate: "Post-COVID events recovery + tourism-driven events",
    cqInsiderInsight: "Event organizers and clients research venues, entertainment, and services entirely online. They need to see venue photos, availability, pricing, and reviews—all instantly.",
    localCompetitorFailure: "Static brochures and 'call for details.' Organizers assume you don't have availability or you're slow to respond, so they book competitors who show everything online.",
    rwsSurvivalKit: "Digital Event Showcase & Booking System. Real-time availability calendar, photo galleries, customer reviews, instant quotes, and online deposits. This makes booking with you the easiest choice.",
    characteristics: ["Event booking", "Ticket sales", "Vendor coordination"],
  },
  // Legacy mappings for backward compatibility
  "healthcare-allied": {
    name: "Healthcare & Allied Health",
    description: "Medical practices, physiotherapy, psychology, dental, allied health services",
    marketSize: "$1.2B - $1.5B",
    growthRate: "29.6% growth (CQ-specific)",
    cqInsiderInsight: "Rockhampton has a 6-week average wait time for specialists, causing massive overflow into allied health. However, 40% of patient inquiries in CQ happen after 5 PM when your reception is closed.",
    localCompetitorFailure: "Most local clinics rely on voicemail or phone tag. Patients simply hang up and call the next clinic on Google Maps until someone answers or they can book online.",
    rwsSurvivalKit: "A 24/7 Self-Service Patient Portal. If patients can't book instantly on their phone at 8 PM, you lose them to a competitor who can. This isn't a website feature—it's your after-hours receptionist.",
    characteristics: ["Compliance-focused", "Patient data security", "Booking systems critical"],
  },
  "hospitality": {
    name: "Hospitality, Cafe & Retail",
    description: "Cafes, restaurants, bars, retail shops, tourism operators",
    marketSize: "$850M - $1.2B",
    growthRate: "Bruce Highway transient traffic is constant",
    cqInsiderInsight: "Traffic through Rockhampton is transient. 65% of dining decisions in Rocky are made by people who have never been here before, browsing 'Near Me' on Google Maps while doing 60km/h on the Bruce Highway.",
    localCompetitorFailure: "Static menus (PDFs) that can't be read on phones and generic 'Open' hours that aren't updated for public holidays. Tourists assume you are closed or too hard to figure out.",
    rwsSurvivalKit: "Mobile-First Menu & Local SEO Dominance. We don't just build a site; we structure your data so Google Maps pushes you to the top of the 'Near Me' list. If you aren't on that map, you don't exist to highway traffic.",
    characteristics: ["Online booking essential", "Menu management", "Customer reviews"],
  },
  "retail": {
    name: "Hospitality, Cafe & Retail",
    description: "Cafes, restaurants, bars, retail shops, tourism operators",
    marketSize: "$850M - $1.2B",
    growthRate: "Bruce Highway transient traffic is constant",
    cqInsiderInsight: "Traffic through Rockhampton is transient. 65% of dining decisions in Rocky are made by people who have never been here before, browsing 'Near Me' on Google Maps while doing 60km/h on the Bruce Highway.",
    localCompetitorFailure: "Static menus (PDFs) that can't be read on phones and generic 'Open' hours that aren't updated for public holidays. Tourists assume you are closed or too hard to figure out.",
    rwsSurvivalKit: "Mobile-First Menu & Local SEO Dominance. We don't just build a site; we structure your data so Google Maps pushes you to the top of the 'Near Me' list. If you aren't on that map, you don't exist to highway traffic.",
    characteristics: ["E-commerce potential", "Inventory management", "Customer loyalty"],
  },
  "arts-music-creative": {
    name: "Arts, Music & Creative Industries",
    description: "Artists, musicians, studios, galleries, event producers, creative agencies",
    marketSize: "$210M - $310M",
    growthRate: "Content creation + online portfolio demand growing",
    cqInsiderInsight: "Creative professionals in Rocky are competing with artists from Brisbane, Sydney, and Melbourne for gigs. If your online portfolio doesn't look as professional as a city-based artist, you lose the job.",
    localCompetitorFailure: "Portfolio sites that look like high school projects. Potential clients (event organizers, corporate buyers) assume lack of digital presence = lack of professionalism.",
    rwsSurvivalKit: "Professional Portfolio & Booking Platform. High-quality image galleries, client testimonials, integrated booking/invoice system, and social proof. This signals you are a legitimate, professional artist—not a hobbyist.",
    characteristics: ["Portfolio showcase", "Booking systems", "Digital storefronts"],
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
