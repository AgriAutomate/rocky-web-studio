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
    cqInsiderInsight: "Central Queensland faces a GP shortage of 325 Full-Time Equivalent positions in 2024, while Rockhampton Hospital's median emergency wait time sits at 32 minutes with ambulance ramping at record highs. Category 1 cardiac patients are waiting over 6 months when clinical standards mandate 30 days. Yet only 22.5% of Queenslanders used telehealth services in 2024-25, and fewer than 60% of regional GP practices offer online booking. When 26.6% of your potential patients are delaying or avoiding care due to access barriers, every friction point in your booking process is costing you revenue and undermining patient outcomes.",
    localCompetitorFailure: "The majority of Central Queensland practices still rely on telephone-only booking systems, with 39% of patients forced to call during business hours. This creates a 15-20% efficiency loss in practice administration while turning away after-hours inquiries that could fill your schedule. Without integrated telehealth capabilities or digital patient portals, local practices are missing the $27 million Queensland Virtual Hospital expansion and losing patients to metropolitan providers who offer 24/7 digital access. Manual appointment management costs your practice thousands annually in administrative overhead that digitized competitors have eliminated.",
    rwsSurvivalKit: "To capture the underserved patient demand in Central Queensland, you need a 24/7 Online Booking & Telehealth-Ready Patient Portal—not just a website with your phone number. Rocky Web Studio builds integrated systems that let patients book, reschedule, and access telehealth consultations outside business hours, automatically syncing with your practice management software. This positions your practice to access Queensland Virtual Hospital integration funding while reducing no-shows by 12-18% through automated SMS reminders. In a market where access is the primary barrier, digital convenience becomes your competitive advantage.",
    characteristics: ["Compliance-focused", "Patient data security", "Booking systems critical"],
  },
  "trades-construction": {
    name: "Trades & Construction",
    description: "Plumbing, electrical, carpentry, construction, civil works, heavy equipment",
    marketSize: "$2.1B - $2.8B",
    growthRate: "Ring Road + Shoalwater Defence expansion",
    cqInsiderInsight: "Queensland's construction sector faces an 18,200 FTE worker shortage intensifying to 50,000 by 2026-27, while the state's construction working days average just 184 annually—42 days fewer than Victoria. The new Queensland Procurement Policy 2026 now requires all government contractors to demonstrate digital compliance capabilities, yet only 23% of Queensland construction businesses have a defined technology strategy. With Brisbane 2032 Olympic venues and Cross River Rail creating a $53-77 billion project pipeline that mandates BIM implementation, contractors without digital project management systems are locked out of the most lucrative opportunities while experiencing 30% higher material waste and 25% longer completion times.",
    localCompetitorFailure: "Regional construction businesses are losing government contracts because they can't meet Ethical Supplier Mandate documentation requirements or demonstrate BIM capability for projects over $50 million. Manual compliance processes cost SME contractors $45,000 annually in administrative overhead—five times what digitized competitors pay. With only 12 builders pre-qualified for major government projects, 89% of regional contractors lack the digital documentation systems required for procurement panels. This isn't about having a nice website; it's about having the digital infrastructure that tier-1 clients now require before they'll even consider your tender.",
    rwsSurvivalKit: "You need a Procurement-Ready Digital Profile with integrated BIM Documentation Hub and Ethical Supplier compliance tracking—built specifically for Queensland Government requirements. Rocky Web Studio creates contractor portals that automatically generate the 15-category compliance reports, host your BIM models, and provide client-facing project dashboards that tier-1 contractors expect. This system positions you for the $50 million Procurement Assurance Model funding while cutting your admin costs by 70%. In a market where digital compliance is now the entry ticket, this platform transforms you from a regional contractor into a procurement-panel contender.",
    characteristics: ["Quote management", "Project tracking", "Lead generation"],
  },
  "hospitality-retail": {
    name: "Hospitality, Cafe & Retail",
    description: "Cafes, restaurants, bars, retail shops, tourism operators",
    marketSize: "$850M - $1.2B",
    growthRate: "Bruce Highway transient traffic is constant",
    cqInsiderInsight: "Queensland's hospitality sector is in chronic shortage: chefs are on the national skills shortage list, and regional operators report 'mounting' staffing issues as demand grows in 2024. As of 2025, 1 in 23 Australian jobs is in the visitor economy, yet operators in accommodation and food services still struggle to fill roles and often reduce trading hours, directly limiting revenue.",
    localCompetitorFailure: "'Near me' searches grew 136% in 2023, with Queensland showing the strongest interest nationally; 'open now near me' searches are up 400% and 24.4% of clicks go to the top local result. Around 46% of all Google searches are local, yet many CQ venues still rely on Facebook alone and lack mobile‑optimised, SEO‑ready websites, meaning they miss the high‑intent traffic from tourists and locals searching on the Bruce Highway corridor.",
    rwsSurvivalKit: "The 17.4 km Rockhampton Ring Road, now fully funded at around $1.2 billion, will divert heavy traffic away from 19 sets of traffic lights through Rockhampton, changing how visitors enter and move around the city. With continuing Bruce Highway upgrades and Central Queensland tourism workers accounting for thousands of local jobs, there is a concrete opportunity for CQ venues that invest in local SEO, 'open now near me' optimisation, and simple online booking to capture transient highway and drive‑market spend.",
    characteristics: ["Online booking essential", "Menu management", "Customer reviews"],
  },
  "agriculture-rural": {
    name: "Agriculture & Rural Services",
    description: "Farms, livestock, studs, equipment, agricultural services",
    marketSize: "$3.2B - $4.1B",
    growthRate: "Succession planning challenge in CQ",
    cqInsiderInsight: "Queensland agriculture employs 73,000 people but faces 11.3% employment growth it cannot fill due to critical labour shortages. The average Queensland farmer is over 55 years old, with 72% rating succession planning as critical but only 43% having formal plans in place. This creates an $87 million annual production loss from unharvested crops while AgTech adoption rates in Central Queensland remain below 35%. The Queensland AgTech Roadmap has committed $160 million annually to Smart Farms at Emerald, Gatton, and Redlands, yet connectivity issues and lack of digital literacy prevent most regional producers from accessing precision agriculture tools that could reduce costs by 20-30%.",
    localCompetitorFailure: "Regional agricultural service providers are losing market share because they operate with manual booking systems, paper-based client records, and no digital succession planning tools. While only 6% of Queensland farms use irrigation technology and less than 1% own modern equipment, the businesses servicing these farms haven't digitized their own operations. There's no online portal for producers to book machinery, track service history, or access agronomic data. This forces clients to phone during business hours, creates scheduling inefficiencies, and provides zero visibility for succession planning—the number one concern for aging farm owners looking to transition operations.",
    rwsSurvivalKit: "Your farm or agribusiness needs a Digital Operations & Succession Portal that centralizes client management, equipment booking, and knowledge transfer in one platform. Rocky Web Studio builds producer-facing systems that integrate with Smart Farms initiatives and FarmTechConnect programs, making you eligible for Farm Business Resilience Program subsidies and Greater Whitsunday AgTech accelerator funding. This portal tracks service history, documents operational procedures for succession planning, and provides 24/7 booking access—positioning you as the digitally-enabled partner that producers trust with their multi-generational operations. In a sector losing $87 million annually to inefficiency, this is infrastructure, not marketing.",
    characteristics: ["Seasonal operations", "Supply chain", "Market access"],
  },
  "professional-services": {
    name: "Professional Services",
    description: "Accounting, law, consulting, recruitment, real estate, insurance brokers",
    marketSize: "$1.8B - $2.3B",
    growthRate: "Trust-based services growing with population",
    cqInsiderInsight: "In regional Queensland, word-of-mouth still drives first contact, but digital now determines whether that referral converts. Across Australia, 55% of people seek information from friends and family for key life events, yet 42% then go straight to Google to validate what they've been told. In regional areas, trust in public services is lower (56%) than in metro areas (65%), which means professional advisers have a higher trust barrier to clear before a new client will commit. At the same time, Queensland is targeting an additional 10,000 digital professionals by 2024 under an $8 million workforce plan, intensifying competition from Brisbane and remote firms that can appear 'more polished' online.",
    localCompetitorFailure: "Most CQ accountants, consultants and specialist advisers still rely on informal referrals and a basic website that reads like a digital business card. There is no structured way to prove compliance with Queensland-specific regulations, showcase case studies, or display verified reviews that match what locals hear over the phone. With only 34% of Australians using government or official websites as their first port of call, clients are defaulting to Google and social proof instead. Firms that lack strong search visibility, up-to-date credentials, and evidence of local experience are losing work to metro practices that look more authoritative online, even when their regional knowledge is weaker.",
    rwsSurvivalKit: "For professional services in CQ, the must-have is a Digital Trust & Compliance Profile—not just a nicer homepage. Rocky Web Studio can build a verification-focused platform that pairs traditional referrals with visible proof: verified Google reviews, local case studies, clear explanations of Queensland-specific rules, and easy-to-find registrations and accreditation. By structuring content around the questions locals actually Google—and aligning with Queensland's Digital Economy Strategy—you position your practice as the safe, local choice in a market increasingly contested by remote providers. In a region where trust is earned twice (word-of-mouth then online), this becomes core infrastructure, not marketing.",
    characteristics: ["High-value services", "Client relationship focused", "Document-heavy"],
  },
  "fitness-wellness": {
    name: "Fitness & Wellness",
    description: "Gyms, yoga studios, personal trainers, wellness coaches, massage therapy",
    marketSize: "$320M - $480M",
    growthRate: "Post-COVID membership models shifting online",
    cqInsiderInsight: "Australian fitness industry data shows very high churn: around 50% of new members stop attending within 6 months, and first‑year membership churn hovers near 48%, eroding recurring revenue. Cost‑of‑living pressures and post‑COVID behaviour have shifted many people to casual or low‑commitment models, making it harder for regional gyms to keep stable cashflow unless they actively manage retention and engagement.",
    localCompetitorFailure: "Research across fitness centres indicates that only about 40–45% of members regularly use digital tools (apps or online systems) to book classes, with a significant proportion still relying on phone or walk‑in booking. New retention studies show that group exercise attendees are about 20% more loyal and stay up to 50% longer, but fewer than 35% of clubs are using data‑driven digital systems to track attendance patterns and proactively intervene with at‑risk members.",
    rwsSurvivalKit: "24/7 access models can reduce staffing costs by 40–60% while lifting revenue capacity by 20–35%, which is particularly attractive in regional areas with shift workers in mining, construction and healthcare. Queensland's broader infrastructure and construction pipeline (peaking at an estimated 405,000 workers nationally in 2024, with ongoing shortages) means a large pool of time‑poor workers in CQ who will pay for convenient, app‑managed access and class booking if offered.",
    characteristics: ["Class booking", "Membership management", "Payment processing"],
  },
  "real-estate-property": {
    name: "Real Estate & Property",
    description: "Real estate agents, property management, valuers, developers",
    marketSize: "$1.1B - $1.6B",
    growthRate: "Regional migration + investment property interest growing",
    cqInsiderInsight: "Queensland recorded 198,019 property settlements in 2024, the highest of any state, with strong demand pushed by net interstate migration of about 29,910 people in 2023‑24. Regional Queensland rents have surged, with some regions' median weekly rents matching Brisbane and vacancy rates near or below 1%, creating intense competition for both rentals and sales listings.",
    localCompetitorFailure: "Despite this demand, only around 16% of Australian real estate agents are using full virtual tours, even though listings with 3D tours can attract up to 87% more views and sell around 31% faster in multiple market analyses. Consumer behaviour research shows that more than 80% of buyers start their property search online and over half are reluctant to inspect homes without strong visual media; CQ agencies that still rely on static photos and basic listings risk losing interstate and time‑poor buyers.",
    rwsSurvivalKit: "Interstate buyers and lifestyle migrants are driving significant price growth in select Queensland regions, and Central Queensland (including Rockhampton and Gladstone) is identified in several reports as a beneficiary of affordability and yield compared with SEQ capitals. With specialist Matterport/virtual‑tour providers in Queensland and clear evidence that enhanced digital marketing improves clearance rates, there is a direct opportunity for CQ agencies and project marketers to differentiate by offering consistent drone, 3D tour and suburb‑profile content targeted at interstate investors.",
    characteristics: ["Listings management", "Client portals", "Lead capture"],
  },
  "education-training": {
    name: "Education & Training",
    description: "Training centers, tutoring, online courses, skill development, workshops",
    marketSize: "$450M - $620M",
    growthRate: "Online learning + upskilling post-COVID demand",
    cqInsiderInsight: "Skills shortages in Queensland are acute across construction, automotive and care sectors, with forecasts of significant labour gaps through at least 2027; yet qualification attainment among young adults has stalled, and many regional employers cannot find workers with the right training. Nationally, international education and domestic training were heavily disrupted by COVID, and mobility‑based sectors like tourism and VET have struggled to rebuild stable enrolments at the pace required to match workforce needs.",
    localCompetitorFailure: "While online and blended learning adoption has accelerated, regional participation still lags metropolitan usage by an estimated 20–30% in many programs, due to both infrastructure and digital literacy constraints. Parents and students increasingly vet providers online, but many smaller RTOs and community providers in regional areas have minimal web presence and provide limited data on completion rates, job outcomes or industry links, making them less attractive than large metropolitan TAFEs and universities.",
    rwsSurvivalKit: "The Queensland and Australian Governments are jointly funding up to 480,000 fee‑free TAFE and VET places nationally, with strong emphasis on skills in construction, care and technology that are directly relevant to Central Queensland employers. Coupled with Queensland's $200 million Digital Economy Strategy and regional infrastructure pipeline, there is a clear opening for CQ‑based education and training providers to use stronger digital funnels—clear course pages, outcome data, and online enquiry/enrolment tools—to capture local school‑leavers, upskill existing workers, and meet documented regional skill shortages.",
    characteristics: ["Student management", "Course booking", "Content delivery"],
  },
  "government-council": {
    name: "Government & Council Contractors",
    description: "Suppliers to local/state government and councils, procurement vendors",
    marketSize: "$2.3B - $3.1B",
    growthRate: "Procurement digitalization increasing",
    cqInsiderInsight: "The expanded Ethical Supplier Mandate requires all Queensland Government contractors to demonstrate compliance across 15 categories, with penalties including contract termination and 12-month tender bans. Only 12 builders are currently pre-qualified for projects over $100 million, creating a $2.3 billion bottleneck in delayed regional infrastructure. The new Queensland Procurement Policy 2026 introduces a Procurement Assurance Model with stricter digital documentation requirements, yet 76% of regional suppliers lack digital record-keeping systems for safety documentation, Chain of Responsibility compliance, and audit trails. Manual compliance processes cost regional SMEs $45,000 annually versus $8,000 for digitized competitors—a five-fold disadvantage that's eliminating contractors from consideration.",
    localCompetitorFailure: "Regional contractors are being disqualified from government tenders before technical capability is even assessed, purely due to inadequate digital compliance systems. They're submitting paper-based safety plans, manually tracking employee certifications, and using spreadsheets for Chain of Responsibility documentation that auditors reject as insufficient. Only 12% of regional Queensland contractors have integrated digital safety management systems meeting Best Practice Principles, while 68% manually document CoR compliance—exposing them to fines up to $300,000. Without automated audit trails and real-time compliance dashboards, these businesses can't respond to tender requests within required timeframes or demonstrate ongoing compliance.",
    rwsSurvivalKit: "You need a Digital Compliance & Documentation Platform specifically aligned to Queensland Procurement Policy 2026 and Ethical Supplier Mandate requirements—this is non-negotiable for government contract access. Rocky Web Studio builds contractor portals that automate the 15-category compliance reporting, integrate Chain of Responsibility tracking, and generate audit-ready documentation in real-time. This system makes you eligible for the $25,000 Ethical Supplier Threshold compliance grants and positions you for the $50 million Procurement Assurance Model funding. In a market where 89% of contractors are locked out due to digital deficiencies, this platform is your pathway onto procurement panels and multi-million dollar project shortlists.",
    characteristics: ["Compliance-heavy", "Documentation", "Tender processes"],
  },
  "automotive-mechanical": {
    name: "Automotive & Mechanical Services",
    description: "Car repairs, servicing, panel beating, mechanical shops, dealerships",
    marketSize: "$680M - $920M",
    growthRate: "Fleet maintenance for Ring Road construction spike",
    cqInsiderInsight: "Australia's automotive sector faces an estimated 27,700 qualified technician shortfall plus around 13,500 apprentice vacancies, totalling nearly 40,000 missing workers and driving service wait times of 2–6 months in many regions. Industry surveys report that around 85% of workshops struggle to recruit technicians, which leads to turning away work, extended downtime for vehicles, and significant lost revenue per bay each year.",
    localCompetitorFailure: "Heavy vehicle and fleet work in Queensland is covered by Chain of Responsibility laws, yet a large share of regional operators still manage maintenance bookings, driver logs and CoR records manually, creating compliance risk and response delays. With only about 30% of operators using proper route‑optimisation or telematics tools, non‑digitised fleets can burn up to 15% more fuel and have slower breakdown response than competitors using integrated digital maintenance and dispatch systems.",
    rwsSurvivalKit: "The Rockhampton Ring Road project (17.4 km, multi‑billion‑dollar scope) and broader Bruce Highway program will increase heavy vehicle throughput and create ongoing demand for local fleet and civil‑equipment maintenance in Central Queensland. Queensland's infrastructure productivity roadmap anticipates construction and related workforce pressures out to at least 2027, giving well‑organised CQ mechanical businesses a multi‑year window to win and retain fleet contracts if they can show faster, digitally‑managed scheduling, compliance reporting and breakdown response.",
    characteristics: ["Service booking", "Parts inventory", "Customer communication"],
  },
  "arts-creative": {
    name: "Arts, Music & Creative Industries",
    description: "Artists, musicians, studios, galleries, event producers, creative agencies",
    marketSize: "$210M - $310M",
    growthRate: "Content creation + online portfolio demand growing",
    cqInsiderInsight: "Regional artists are competing in the same attention pool as Brisbane, Sydney and Melbourne creatives, but with fewer physical galleries and venues. The federal Regional Arts Fund now distributes around $6 million per year to regional and remote communities, while Queensland's Regional Arts Development Fund (RADF) provides local councils with allocations such as $41,475 in 2023–24 for Central Highlands and similar amounts across the state. Yet this money is increasingly awarded to projects that can demonstrate audience reach and community impact—metrics that depend heavily on digital visibility. In August 2023, 62% of Queensland attendees spent $50 or more on tickets to live events and cultural activities, showing there is paying demand when audiences can find and trust the work.",
    localCompetitorFailure: "Many CQ artists and small creative studios still treat Instagram as their only 'portfolio', with no structured website to house high-quality work, pricing, or commission processes. Few have a proper online booking or enquiry system, meaning opportunities from outside the region often go to metro-based artists whose portfolios meet national standards for grants and corporate commissions. Councils administering RADF and national programs look for well-documented proposals, previous work, and audience development plans; creatives without a professional digital footprint struggle to compete, even when their work is strong. This leaves regional practitioners under-represented in a funding landscape increasingly driven by online applications and digital storytelling.",
    rwsSurvivalKit: "The essential asset for CQ creatives is a Commission-Ready Digital Portfolio, designed to win grants and gigs—not just followers. Rocky Web Studio can deliver a polished portfolio site with project galleries, artist statements, media kits, and simple booking/enquiry flows aligned with RADF and Regional Arts Fund criteria. By integrating basic analytics and mailing lists, you can demonstrate 'audience growth' and 'market development' on grant applications, and show councils and corporate buyers that you can deliver beyond a single show or mural. In a funding environment where documentation and reach decide who gets the $8,000–$50,000 regional arts grants, this upgrade directly impacts income.",
    characteristics: ["Portfolio showcase", "Booking systems", "Digital storefronts"],
  },
  "veterans-defence": {
    name: "Veterans & Defence Organizations",
    description: "Veterans support services, Defence contractors, military-adjacent businesses",
    marketSize: "$580M - $780M",
    growthRate: "Shoalwater Bay expansion + veteran population growth",
    cqInsiderInsight: "Queensland has the largest veteran population in Australia, with 163,133 veterans and serving members; 46.6% are DVA clients, indicating high engagement with formal support systems. Rockhampton is recognised in Queensland defence strategy as a key hub due to Rockhampton Airport and proximity to Shoalwater Bay Training Area, with defence activity flagged as a major regional growth driver. Yet veteran communities commonly report fragmented access to services and support, with multiple providers (DVA, ESOs, local peer groups) operating on separate platforms. This fragmentation makes it harder for veterans and families to navigate mental health services, transition programs and community events, particularly in regional areas where distance and stigma are real barriers.",
    localCompetitorFailure: "Most ex-service organisations and local veteran groups rely on Facebook pages and word-of-mouth rather than a structured digital presence. There is often no single, up-to-date hub that lists local events, support groups, counselling options and DVA-related services in a way that veterans can trust and navigate easily. Defence contractors seeking local partners for Shoalwater Bay-related work often cannot see, at a glance, which veteran-owned suppliers are AVOB certified or defence-ready, so contracts default to larger metro firms. Without clear digital proof of capability, compliance and community reach, regional veteran organisations and businesses miss out on both funding and procurement pathways specifically designed for them.",
    rwsSurvivalKit: "The critical asset here is a Veteran Services & Defence-Ready Portal bringing together trust signals, compliance, and navigation in one place. Rocky Web Studio can build a platform that: clearly displays AVOB certification, aggregates local veteran support options, and provides an easy 'front door' for both veterans and defence primes operating around Shoalwater Bay. With structured service directories, eligibility information and simple referral tools, organisations can show DVA and Defence that they are coordinated, measurable and ready for larger funding and partnership opportunities. In a region where defence spending and veteran numbers are both high, this kind of portal becomes essential infrastructure for serious ESOs and veteran-owned enterprises.",
    characteristics: ["Community-focused", "Certification requirements", "Networking"],
  },
  "non-profit-community": {
    name: "Non-Profit & Community Groups",
    description: "Charities, community centers, volunteer organizations, social enterprises",
    marketSize: "$340M - $510M",
    growthRate: "Community engagement + volunteer recruitment increasing",
    cqInsiderInsight: "Australia's charity sector now generates over $222 billion in revenue, but donations have effectively flatlined—rising less than 0.4% outside a single $4.9 billion mega-gift—despite rising demand for services. Volunteer participation in Queensland fell from 75.7% in 2020 to 64.3% in 2023, a drop of more than 10 percentage points and now below the national average. At the same time, volunteering still returns an estimated $4.70 in value for every $1 invested, with 2.8 million Queenslanders volunteering 21.6 million hours in 2023. The problem is not willingness to help; it is the friction in finding, trusting, and engaging with local organisations—especially in regional communities where capacity is thin and demand is rising.",
    localCompetitorFailure: "Many CQ charities and community groups lack a modern website entirely, or operate with a static page that doesn't clearly explain what they do, how funds are used, or how to get involved. ACNC data shows 2.1 million searches of the national Charity Register in a year—a clear sign that donors and volunteers are actively vetting organisations before engaging. Yet smaller charities, which make up over 30% of the sector, generate just 0.1% of total revenue, in part because they cannot present a professional and trustworthy digital face to the public. Groups without clear online donation options, impact reports, or easy volunteer sign-up flows are overshadowed by large national brands whose digital journeys feel safer and more credible.",
    rwsSurvivalKit: "Non-profits in CQ need a Donor & Volunteer Confidence Platform—an integrated site that makes it effortless to verify, give, and get involved. Rocky Web Studio can build ACNC-aligned profiles with clear financial snapshots, stories of impact, and embedded donation and volunteer forms that reduce friction and increase conversion. By structuring content around what cautious donors and time-poor volunteers look for—governance, outcomes, transparency—local organisations can compete with national brands while still feeling authentically community-based. In a context where volunteering participation has fallen and donations are stagnant, an upgraded digital presence is the most direct lever to stabilise and grow support.",
    characteristics: ["Volunteer management", "Donation processing", "Event coordination"],
  },
  "transport-logistics": {
    name: "Transport & Logistics",
    description: "Trucking companies, courier services, freight forwarding, warehouse management",
    marketSize: "$1.9B - $2.6B",
    growthRate: "Ring Road + port expansion + interstate freight growth",
    cqInsiderInsight: "Australia faces a 28,000-driver shortage in 2024, with 47% of drivers over age 55 and 21% expected to retire by 2029. Queensland road freight volume is projected to increase 15% while workforce participation drops 5.3% in remote areas, creating a 13% capacity deficit that's increasing delivery costs by 18-23%. Chain of Responsibility legislation exposes operators to fines up to $300,000 for compliance failures, yet 68% of regional operators manually document safety requirements. With fuel costs representing 35-40% of operating expenses and only 30% of Queensland transport operators using route optimization software, undigitized operators are burning 15% more fuel than necessary while running at just 87% capacity utilization.",
    localCompetitorFailure: "Regional transport operators are losing contracts to metropolitan competitors who offer real-time tracking and digital proof-of-delivery systems. Local operators still rely on phone calls for dispatch, paper logbooks for driver hours, and manual fuel reconciliation—creating zero visibility for customers and massive compliance risk. Without fleet management software, they can't demonstrate Chain of Responsibility compliance during NHVR audits or provide the digital documentation that major shippers now require. Digital fleet management adoption is 22% lower in Central Queensland than Brisbane, resulting in higher fuel costs, inefficient routing, and administrative overhead that erodes already-thin margins in a capacity-constrained market.",
    rwsSurvivalKit: "You need a Route-Optimized Fleet Portal with live GPS tracking, automated Chain of Responsibility reporting, and customer-facing delivery visibility—built for NHVR Queensland transition standards. Rocky Web Studio creates operator platforms that integrate telematics data, automate driver fatigue monitoring, and generate real-time compliance dashboards that pass NHVR audits. This system qualifies you for subsidized telematics funding under the Queensland Transport and Logistics Workforce Plan and free CoR compliance tools for the 18,600 registered operators. In a market where capacity is critical and compliance is non-negotiable, this platform transforms you from a regional hauler into a digitally-enabled logistics partner that major shippers trust with time-sensitive freight.",
    characteristics: ["Tracking systems", "Route optimization", "Customer notifications"],
  },
  "events-entertainment": {
    name: "Event Management & Entertainment",
    description: "Event planners, venues, entertainment bookers, conference organizers",
    marketSize: "$240M - $360M",
    growthRate: "Post-COVID events recovery + tourism-driven events",
    cqInsiderInsight: "The Australian live performance industry has moved beyond post-pandemic recovery to record revenue and attendance, with Queensland tourism-related events contributing $1.256 billion in direct and incremental visitor spending and 4.7 million visitor nights in 2023–24. Tourism and Events Queensland supported 70 major, 108 destination, and 32 business events in that year alone, illustrating strong institutional backing for events as a driver of regional economies. However, booking behaviour has changed: in Tropical North Queensland, average booking lead time dropped from 75 days to 58 days, with some periods averaging just 45 days—indicating shorter planning windows and more last-minute decisions. Operators who can't react quickly and promote in real time lose out when conditions shift or when visitors decide late.",
    localCompetitorFailure: "Even as events recover, many regional organisers and entertainment providers still rely on static flyers, Facebook posts, and manual email lists. Their websites are often outdated, lack clear 'What's On' calendars, and don't integrate online ticketing, making it hard for visitors who plan trips via mobile search to find and commit to regional events. At the same time, Queensland has seen event organiser numbers swing dramatically—up more than 226% on pre-COVID levels at one point—meaning competition for audience attention and sponsor funds is intense. Providers without real-time digital promotion, easy online booking, and strong SEO around regional 'What's on near me' searches are invisible to exactly the audiences TEQ and local councils are paying to attract.",
    rwsSurvivalKit: "The essential tool is a Live Events & Booking Hub that connects discovery, decision, and ticketing in one mobile-first experience. Rocky Web Studio can create event portals that surface in local search, sync with third-party ticketing, and present always-current line-ups, running times, and venue information aligned with Tourism and Events Queensland branding guidelines. For organisers and venues, integrated dashboards can support sponsor reporting, visitor analytics, and grant acquittals—now critical for ongoing TEQ and council support. In a market where lead times are shrinking and visitors expect to discover and book from their phones, this kind of digital infrastructure separates events that sell out from those that quietly disappear.",
    characteristics: ["Event booking", "Ticket sales", "Vendor coordination"],
  },
  // Legacy mappings for backward compatibility
  "healthcare-allied": {
    name: "Healthcare & Allied Health",
    description: "Medical practices, physiotherapy, psychology, dental, allied health services",
    marketSize: "$1.2B - $1.5B",
    growthRate: "29.6% growth (CQ-specific)",
    cqInsiderInsight: "Central Queensland faces a GP shortage of 325 Full-Time Equivalent positions in 2024, while Rockhampton Hospital's median emergency wait time sits at 32 minutes with ambulance ramping at record highs. Category 1 cardiac patients are waiting over 6 months when clinical standards mandate 30 days. Yet only 22.5% of Queenslanders used telehealth services in 2024-25, and fewer than 60% of regional GP practices offer online booking. When 26.6% of your potential patients are delaying or avoiding care due to access barriers, every friction point in your booking process is costing you revenue and undermining patient outcomes.",
    localCompetitorFailure: "The majority of Central Queensland practices still rely on telephone-only booking systems, with 39% of patients forced to call during business hours. This creates a 15-20% efficiency loss in practice administration while turning away after-hours inquiries that could fill your schedule. Without integrated telehealth capabilities or digital patient portals, local practices are missing the $27 million Queensland Virtual Hospital expansion and losing patients to metropolitan providers who offer 24/7 digital access. Manual appointment management costs your practice thousands annually in administrative overhead that digitized competitors have eliminated.",
    rwsSurvivalKit: "To capture the underserved patient demand in Central Queensland, you need a 24/7 Online Booking & Telehealth-Ready Patient Portal—not just a website with your phone number. Rocky Web Studio builds integrated systems that let patients book, reschedule, and access telehealth consultations outside business hours, automatically syncing with your practice management software. This positions your practice to access Queensland Virtual Hospital integration funding while reducing no-shows by 12-18% through automated SMS reminders. In a market where access is the primary barrier, digital convenience becomes your competitive advantage.",
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
