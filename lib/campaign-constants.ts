// Rocky Web Studio - Campaign Landing Page Constants

export const SITE_CONFIG = {
  name: "Rocky Web Studio",
  tagline: "Your Local CQ Web Partner",
  phone: "0456 370 719",
  email: "hello@rockywebstudio.com.au",
  address: "Rockhampton, Central Queensland",
  calendlyUrl: "https://calendly.com/rockywebstudio",
};

export const COPY = {
  hero: {
    headline: "Get Your Nights Back.",
    subheadline: "Let Your Website Start Pulling Its Weight.",
    description: "For Central Queensland businesses stuck on DIY websites or 'just Facebook', Rocky Web Studio builds and runs a proper lead-generating site without Brisbane-agency prices.",
    cta: "Book Your Free Website Upgrade Call",
  },
  problem: {
    headline: "Sound familiar?",
    painPoints: [
      {
        icon: "Clock",
        title: "Weekends Lost to Website Battles",
        description: "Spending nights and weekends fighting with Wix, Canva or Facebook pages instead of running your business.",
      },
      {
        icon: "TrendingDown",
        title: "Feast or Famine Enquiries",
        description: "Relying on word of mouth and socials, but enquiries are unpredictable and you're not sure what's actually working.",
      },
      {
        icon: "DollarSign",
        title: "Outgrown DIY, Can't Afford 'Big Agency'",
        description: "Knowing the business has outgrown DIY solutions, but full Brisbane-agency rebuilds look way too expensive.",
      },
    ],
  },
  solution: {
    headline: "The Rocky Web Studio Answer",
    intro: "We're your local, AI-first web partner. We build business-grade websites that actually generate leads—without the Brisbane price tag.",
    benefits: [
      {
        icon: "Layout",
        title: "A Real Business-Grade Website",
        description: "Not 'just a template'—a proper, modern site built to convert visitors into customers.",
      },
      {
        icon: "MapPin",
        title: "Clear Pages That Get Found",
        description: "Dedicated pages for your services, locations and FAQs that rank in local search.",
      },
      {
        icon: "BarChart3",
        title: "Built-In Lead Tracking",
        description: "Analytics, lead capture forms and basic automation so you know what's working.",
      },
      {
        icon: "Percent",
        title: "Regional Pricing, Local Partner",
        description: "AI-first efficiency means 15-25% under Brisbane agency prices. Plus, we're right here in CQ.",
      },
    ],
  },
  features: {
    headline: "What You Get with Rocky Web Studio",
    items: [
      {
        icon: "Monitor",
        title: "Modern Website Build",
        description: "Fast, mobile-first sites on modern tech that won't slow down or break.",
      },
      {
        icon: "Search",
        title: "Search & Local Visibility",
        description: "SEO fundamentals plus Google Business Profile optimisation to get found locally.",
      },
      {
        icon: "Megaphone",
        title: "Lead Funnels from Social",
        description: "Landing pages and forms that turn your Facebook and Instagram traffic into real leads.",
      },
      {
        icon: "Settings",
        title: "Ongoing Management Options",
        description: "Tiered support plans so you're never stuck—from DIY updates to full management.",
      },
      {
        icon: "Users",
        title: "Regional, AI-First Partner",
        description: "AVOB certified, based in CQ, using AI tools to deliver more for less.",
      },
      {
        icon: "CreditCard",
        title: "Flexible Investment Options",
        description: "Packages from $4K-$15K with payment plans available for growing businesses.",
      },
    ],
  },
  audience: {
    headline: "Is This For You?",
    personas: [
      {
        icon: "Laptop",
        title: "The DIY Builder Stuck",
        subtitle: "Wix • Squarespace • Shopify Templates",
        painPoints: [
          "Spent hours on the website but it still looks 'template-y'",
          "Can't figure out SEO or why Google isn't showing your site",
          "Ready to upgrade but can't justify $15K+ Brisbane quotes",
        ],
        need: "A clean handover to a pro who won't charge capital-city prices.",
      },
      {
        icon: "Facebook",
        title: "The Facebook-Only Operator",
        subtitle: "Running Everything from FB & Instagram",
        painPoints: [
          "Business page is your 'website'—works but feels unprofessional",
          "Relying on posts, DMs and word of mouth for all leads",
          "Know you need a proper site but don't know where to start",
        ],
        need: "A simple path to a real website that works with your socials.",
      },
    ],
  },
  cta: {
    headline: "Ready to Stop Wrestling with DIY?",
    description: "Book a free 20-minute Website Upgrade Call with Rocky Web Studio. Get a clear, affordable plan to move from DIY to a lead-ready site.",
    button: "Book Your Free Website Upgrade Call",
    subtext: "No sales pressure. No hidden fees. Local CQ partner.",
  },
  footer: {
    tagline: "Your local AI-first web partner in Central Queensland.",
    copyright: `© ${new Date().getFullYear()} Rocky Web Studio. All rights reserved.`,
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
};

export const FORM_FIELDS = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Smith" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com.au" },
  { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "0456 370 719" },
  { 
    name: "businessType", 
    label: "Business Type", 
    type: "select", 
    required: true,
    options: ["Services", "Retail", "Health & Wellness", "Manufacturing", "Agriculture", "Hospitality", "Other"],
  },
  { 
    name: "currentPlatform", 
    label: "Current Website Platform", 
    type: "select", 
    required: true,
    options: ["Wix", "Squarespace", "Shopify", "WordPress", "Facebook Only", "No Website", "Other"],
  },
  { 
    name: "bestTime", 
    label: "Best Time to Call", 
    type: "select", 
    required: false,
    options: ["Morning (9am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-7pm)", "Flexible"],
  },
  { name: "message", label: "Tell us briefly what you need help with", type: "textarea", required: false, placeholder: "E.g., I need help getting more local customers to find my plumbing business..." },
];

export const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Features", href: "#features" },
  { label: "Is This For You?", href: "#audience" },
];
