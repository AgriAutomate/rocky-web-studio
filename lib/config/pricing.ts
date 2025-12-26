/**
 * Centralized Pricing Configuration
 * 
 * This is the single source of truth for all pricing information across the site.
 * Update pricing here and it will be reflected everywhere.
 * 
 * All prices are in AUD (Australian Dollars)
 */

export type ServiceId = 
  | 'website-design-development'
  | 'website-redesign-refresh'
  | 'ecommerce'
  | 'seo-performance'
  | 'ai-automation'
  | 'crm-integration'
  | 'support-maintenance'
  | 'accessibility-audits'
  | 'healthcare-systems'
  | 'custom-songs';

export interface PricingTier {
  name: string;
  price: string; // Display format, e.g., "$2,500" or "Custom"
  minPrice?: number; // Optional: minimum price in AUD for calculations
  maxPrice?: number; // Optional: maximum price in AUD for calculations
  description: string;
  features: string[];
  highlighted?: boolean;
  orderLink?: string; // Optional: custom order link
}

export interface ServicePricing {
  serviceId: ServiceId;
  serviceName: string;
  pricingRange: string; // Display format for ranges, e.g., "$4,000 - $35,000"
  timeline: string; // e.g., "4-12 weeks"
  tiers: PricingTier[];
  notes?: string; // Optional notes about pricing
}

/**
 * Service Pricing Configuration
 * 
 * This is the master pricing data. Update here to change prices site-wide.
 */
export const SERVICE_PRICING: Record<ServiceId, ServicePricing> = {
  'website-design-development': {
    serviceId: 'website-design-development',
    serviceName: 'Website Design & Development',
    pricingRange: '$4,000 - $35,000',
    timeline: '4-12 weeks',
    tiers: [
      {
        name: 'Starter Site',
        price: '$4,000',
        minPrice: 4000,
        description: 'Perfect for new businesses',
        features: [
          '5 custom pages',
          'Responsive design',
          'Contact forms',
          'Basic SEO setup',
          'CMS integration',
          '2 rounds of revisions',
        ],
      },
      {
        name: 'Professional',
        price: '$8,000',
        minPrice: 8000,
        description: 'Most popular choice',
        features: [
          '10 custom pages',
          'Advanced animations',
          'Blog/news system',
          'Advanced SEO',
          'Analytics setup',
          '3 rounds of revisions',
          '30 days post-launch support',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '$15,000+',
        minPrice: 15000,
        description: 'For complex projects',
        features: [
          '15+ custom pages',
          'Custom functionality',
          'Multi-language support',
          'Advanced integrations',
          'Performance optimization',
          'Unlimited revisions',
          '90 days post-launch support',
        ],
      },
    ],
  },
  'website-redesign-refresh': {
    serviceId: 'website-redesign-refresh',
    serviceName: 'Website Redesign',
    pricingRange: '$5,000 - $25,000',
    timeline: '6-10 weeks',
    tiers: [
      {
        name: 'Visual Refresh',
        price: '$5,000',
        minPrice: 5000,
        description: 'Modernize look and feel',
        features: [
          'Updated design system',
          'Improved UX/UI',
          'Mobile optimization',
          'Performance improvements',
          '2 rounds of revisions',
        ],
      },
      {
        name: 'Full Redesign',
        price: '$12,000',
        minPrice: 12000,
        description: 'Complete overhaul',
        features: [
          'Complete redesign',
          'Content restructure',
          'Advanced features',
          'WCAG 2.1 AA compliance',
          '3 rounds of revisions',
          '30 days support',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise Redesign',
        price: '$25,000+',
        minPrice: 25000,
        description: 'Complex migrations',
        features: [
          'Platform migration',
          'Custom integrations',
          'Multi-site redesign',
          'Advanced optimization',
          'Unlimited revisions',
          '90 days support',
        ],
      },
    ],
  },
  'ecommerce': {
    serviceId: 'ecommerce',
    serviceName: 'E-Commerce Development',
    pricingRange: '$8,000 - $40,000',
    timeline: '8-16 weeks',
    tiers: [
      {
        name: 'Basic Shop',
        price: '$8,000',
        minPrice: 8000,
        description: 'Perfect for small catalogs',
        features: [
          'Shopify theme customization',
          'Up to 50 products',
          'Payment + shipping setup',
          'Basic automation workflows',
          'Mobile-optimized',
        ],
      },
      {
        name: 'Professional',
        price: '$15,000',
        minPrice: 15000,
        description: 'Growing stores with custom needs',
        features: [
          'Advanced merchandising',
          'Custom sections & landing pages',
          'Subscriptions or bundles',
          'Analytics + reporting setup',
          'Inventory management',
        ],
        highlighted: true,
      },
      {
        name: 'Custom Commerce',
        price: '$30,000+',
        minPrice: 30000,
        description: 'Headless or bespoke builds',
        features: [
          'Next.js storefront',
          'ERP / fulfillment integrations',
          'Complex catalogs & filters',
          'Multi-channel support',
          'Ongoing optimization support',
        ],
      },
    ],
  },
  'seo-performance': {
    serviceId: 'seo-performance',
    serviceName: 'SEO Optimization',
    pricingRange: '$2,000 - $8,000',
    timeline: 'Ongoing',
    tiers: [
      {
        name: 'SEO Audit',
        price: '$2,000',
        minPrice: 2000,
        description: 'One-time comprehensive audit',
        features: [
          'Technical SEO audit',
          'Content analysis',
          'Competitor research',
          'Action plan delivered',
          '1 month follow-up',
        ],
      },
      {
        name: 'SEO Starter',
        price: '$4,000/year',
        minPrice: 4000,
        description: 'Ongoing optimization',
        features: [
          'Monthly SEO tasks',
          'Content optimization',
          'Link building',
          'Monthly reporting',
          '12-month commitment',
        ],
        highlighted: true,
      },
      {
        name: 'SEO Pro',
        price: '$8,000/year',
        minPrice: 8000,
        description: 'Advanced SEO strategy',
        features: [
          'Advanced optimization',
          'Content creation',
          'Technical improvements',
          'Weekly reporting',
          'Dedicated SEO specialist',
        ],
      },
    ],
  },
  'ai-automation': {
    serviceId: 'ai-automation',
    serviceName: 'AI & Automation',
    pricingRange: '$5,000 - $30,000',
    timeline: '4-10 weeks',
    tiers: [
      {
        name: 'Chatbot Setup',
        price: '$5,000',
        minPrice: 5000,
        description: 'Launch a helpful assistant fast',
        features: [
          'Tool selection + configuration',
          'Knowledge base mapping',
          'Brand styling + embed',
          'Team training session',
          '30 days support',
        ],
      },
      {
        name: 'Automation Suite',
        price: '$12,000',
        minPrice: 12000,
        description: 'Multiple workflows & hand-offs',
        features: [
          'Process mapping workshop',
          '3–5 automations implemented',
          'Documentation + runbooks',
          'Integration setup',
          '30 days of support',
        ],
        highlighted: true,
      },
      {
        name: 'Bespoke AI',
        price: 'Custom',
        minPrice: 30000,
        description: 'Advanced integrations or LLM projects',
        features: [
          'Stakeholder workshops',
          'Solution architecture',
          'Partner coordination',
          'Measurement + iteration plan',
          'Ongoing support',
        ],
      },
    ],
  },
  'crm-integration': {
    serviceId: 'crm-integration',
    serviceName: 'CRM Integration',
    pricingRange: '$5,000 - $25,000',
    timeline: '6-12 weeks',
    tiers: [
      {
        name: 'Basic Integration',
        price: '$5,000',
        minPrice: 5000,
        description: 'Connect existing tools',
        features: [
          'Single CRM integration',
          'Data synchronization',
          'Basic automation',
          'Documentation',
          '30 days support',
        ],
      },
      {
        name: 'Advanced CRM',
        price: '$12,000',
        minPrice: 12000,
        description: 'Custom CRM solution',
        features: [
          'Custom CRM build',
          'Multi-system integration',
          'Advanced workflows',
          'Reporting dashboard',
          '60 days support',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise CRM',
        price: '$25,000+',
        minPrice: 25000,
        description: 'Complex multi-tenant systems',
        features: [
          'Enterprise architecture',
          'Multiple integrations',
          'Custom development',
          'Advanced analytics',
          '90 days support',
        ],
      },
    ],
  },
  'support-maintenance': {
    serviceId: 'support-maintenance',
    serviceName: 'Support & Maintenance',
    pricingRange: '$500 - $2,500/month',
    timeline: 'Ongoing',
    tiers: [
      {
        name: 'Essential',
        price: '$500/month',
        minPrice: 500,
        description: 'Basic maintenance',
        features: [
          'Security updates',
          'Bug fixes',
          'Monthly backups',
          'Email support',
          '2 hours/month',
        ],
      },
      {
        name: 'Professional',
        price: '$1,200/month',
        minPrice: 1200,
        description: 'Regular updates & support',
        features: [
          'All Essential features',
          'Performance monitoring',
          'Content updates',
          'Priority support',
          '5 hours/month',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: '$2,500/month',
        minPrice: 2500,
        description: 'Dedicated support',
        features: [
          'All Professional features',
          'Dedicated developer',
          'Feature enhancements',
          '24/7 monitoring',
          '10 hours/month',
        ],
      },
    ],
  },
  'accessibility-audits': {
    serviceId: 'accessibility-audits',
    serviceName: 'Accessibility Audits',
    pricingRange: '$2,000 - $5,000',
    timeline: '2-4 weeks',
    tiers: [
      {
        name: 'Basic Audit',
        price: '$2,000',
        minPrice: 2000,
        description: 'Standard compliance check',
        features: [
          'WCAG 2.1 AA audit',
          'Automated testing',
          'Manual testing',
          'Priority report',
          'Remediation guide',
        ],
      },
      {
        name: 'Comprehensive Audit',
        price: '$3,500',
        minPrice: 3500,
        description: 'Full accessibility assessment',
        features: [
          'Complete WCAG audit',
          'User testing',
          'Remediation plan',
          'Implementation support',
          'Re-audit included',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise Audit',
        price: '$5,000',
        minPrice: 5000,
        description: 'Multi-site audit',
        features: [
          'Multi-site audit',
          'Team training',
          'Ongoing support',
          'Certification assistance',
          '6-month follow-up',
        ],
      },
    ],
  },
  'healthcare-systems': {
    serviceId: 'healthcare-systems',
    serviceName: 'Healthcare Systems',
    pricingRange: '$30,000 - $60,000',
    timeline: '12-20 weeks',
    tiers: [
      {
        name: 'Basic System',
        price: '$30,000',
        minPrice: 30000,
        description: 'HIPAA-compliant basics',
        features: [
          'Patient portal',
          'Appointment booking',
          'Basic security',
          'HIPAA compliance',
          'Training included',
        ],
      },
      {
        name: 'Advanced System',
        price: '$45,000',
        minPrice: 45000,
        description: 'Full-featured platform',
        features: [
          'All Basic features',
          'Electronic records',
          'Billing integration',
          'Advanced security',
          'Multi-location support',
        ],
        highlighted: true,
      },
      {
        name: 'Enterprise System',
        price: '$60,000+',
        minPrice: 60000,
        description: 'Complex healthcare solutions',
        features: [
          'All Advanced features',
          'Custom integrations',
          'API development',
          'Scalable architecture',
          'Ongoing support',
        ],
      },
    ],
  },
  'custom-songs': {
    serviceId: 'custom-songs',
    serviceName: 'Custom Songs',
    pricingRange: 'Starting at $299',
    timeline: '2-4 weeks',
    tiers: [
      {
        name: 'Standard',
        price: '$299',
        minPrice: 299,
        description: 'Perfect for personal use',
        features: [
          'Custom lyrics',
          'Professional recording',
          'Basic production',
          'Digital delivery',
        ],
        orderLink: '/services/custom-songs/order?package=standard',
      },
      {
        name: 'Express',
        price: '$499',
        minPrice: 499,
        description: 'Fast turnaround',
        features: [
          'All Standard features',
          '7-day delivery',
          'Premium production',
          'Multiple revisions',
        ],
        highlighted: true,
        orderLink: '/services/custom-songs/order?package=express',
      },
      {
        name: 'Wedding',
        price: '$799',
        minPrice: 799,
        description: 'Special occasion packages',
        features: [
          'All Express features',
          'Wedding-specific options',
          'High-quality mastering',
          'Physical delivery options',
        ],
        orderLink: '/services/custom-songs/order?package=wedding',
      },
    ],
  },
};

/**
 * Get pricing for a specific service
 */
export function getServicePricing(serviceId: ServiceId): ServicePricing | undefined {
  return SERVICE_PRICING[serviceId];
}

/**
 * Get pricing range string for a service (for display in knowledge base, etc.)
 */
export function getPricingRange(serviceId: ServiceId): string {
  const pricing = SERVICE_PRICING[serviceId];
  return pricing?.pricingRange || 'Contact for pricing';
}

/**
 * Get timeline string for a service
 */
export function getTimeline(serviceId: ServiceId): string {
  const pricing = SERVICE_PRICING[serviceId];
  return pricing?.timeline || 'Contact for timeline';
}

/**
 * Get pricing tiers for a service (for pricing table display)
 */
export function getPricingTiers(serviceId: ServiceId): PricingTier[] {
  const pricing = SERVICE_PRICING[serviceId];
  return pricing?.tiers || [];
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price range for display
 */
export function formatPriceRange(min: number, max?: number): string {
  if (max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
  return `Starting at ${formatPrice(min)}`;
}

