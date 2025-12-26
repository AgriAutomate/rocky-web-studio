/**
 * AI Assistant Widget Template Configuration
 * 
 * This file defines the template structure and customization points
 * for deploying AI Assistant widgets to clients.
 * 
 * Usage:
 * 1. Copy this file to client project
 * 2. Update CLIENT_CONFIG with client-specific data
 * 3. Use getClientConfig() to access configuration
 */

export interface ClientConfig {
  // Basic Info
  companyName: string;
  businessType: string;
  location: string;
  baseUrl: string;
  
  // Branding
  primaryColor: string;
  accentColor: string;
  logo?: string;
  widgetPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Knowledge Base
  services: Array<{
    name: string;
    description: string;
    pricing: string;
    timeline: string;
    technologies: string[];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  websiteLinks: {
    startProject: string;
    bookConsultation: string;
    services: Record<string, string>;
  };
  
  // System Prompt Customization
  systemPromptCustomizations?: {
    scope?: string[];
    boundaries?: string[];
    guidelines?: string[];
    ctaText?: string;
  };
  
  // Features
  features: {
    rateLimit: number; // requests per minute
    maxTokens: number;
    enableStreaming: boolean;
    enableHistory: boolean;
  };
}

/**
 * Template Default Configuration
 * 
 * This is the base template that all clients start with.
 * Customize per client by updating CLIENT_CONFIG below.
 */
export const TEMPLATE_DEFAULTS: Partial<ClientConfig> = {
  features: {
    rateLimit: 10,
    maxTokens: 1024,
    enableStreaming: true,
    enableHistory: true,
  },
  widgetPosition: 'bottom-right',
  primaryColor: '#208084', // Teal
  accentColor: '#134252', // Slate
};

/**
 * CLIENT CONFIGURATION
 * 
 * ⚠️ UPDATE THIS SECTION FOR EACH CLIENT DEPLOYMENT
 */
export const CLIENT_CONFIG: ClientConfig = {
  // Basic Info - UPDATE THESE
  companyName: 'Rocky Web Studio',
  businessType: 'web development agency',
  location: 'Rockhampton, Queensland, Australia',
  baseUrl: 'https://rockywebstudio.com.au',
  
  // Branding - UPDATE THESE
  primaryColor: '#208084', // Teal
  accentColor: '#134252', // Slate
  widgetPosition: 'bottom-right',
  
  // Services - UPDATE THESE
  services: [
    {
      name: 'Website Design & Development',
      description: 'Custom websites built with Next.js, React, and modern web technologies',
      pricing: '$4,000 - $35,000',
      timeline: '4-12 weeks',
      technologies: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'Supabase']
    },
    // Add more services...
  ],
  
  // FAQs - UPDATE THESE
  faqs: [
    {
      question: 'What is your typical project timeline?',
      answer: 'Project timelines vary by scope: Simple websites (4-6 weeks), E-commerce (8-16 weeks), Healthcare systems (12-20 weeks).',
      category: 'Process'
    },
    // Add more FAQs...
  ],
  
  // Website Links - UPDATE THESE
  websiteLinks: {
    startProject: '/questionnaire',
    bookConsultation: '/book',
    services: {
      websiteDesign: '/services/website-design-development',
      // Add more service links...
    }
  },
  
  // System Prompt Customizations - OPTIONAL
  systemPromptCustomizations: {
    scope: [
      'Services and pricing',
      'Project timelines',
      'Certifications',
      'Technology stack',
    ],
    boundaries: [
      'General knowledge questions',
      'Questions about competitors',
      'Personal advice',
    ],
    ctaText: 'Start your project',
  },
  
  // Features - Usually keep defaults
  features: {
    rateLimit: 10,
    maxTokens: 1024,
    enableStreaming: true,
    enableHistory: true,
  },
};

/**
 * Get client configuration
 * 
 * Use this function throughout the codebase to access client-specific config
 */
export function getClientConfig(): ClientConfig {
  return CLIENT_CONFIG;
}

/**
 * Generate system prompt from client configuration
 * 
 * This function builds the system prompt dynamically from CLIENT_CONFIG
 */
export function generateSystemPrompt(): string {
  const config = getClientConfig();
  
  const servicesList = config.services.map(service => 
    `- ${service.name}: ${service.description} (${service.pricing}, ${service.timeline})`
  ).join('\n');
  
  const faqList = config.faqs.map(faq => 
    `Q: ${faq.question}\nA: ${faq.answer}`
  ).join('\n\n');
  
  const scopeList = config.systemPromptCustomizations?.scope?.map(item => `- ${item}`).join('\n') || '';
  const boundariesList = config.systemPromptCustomizations?.boundaries?.map(item => `- ${item}`).join('\n') || '';
  
  return `You are an AI assistant for ${config.companyName}, a ${config.businessType} based in ${config.location}.

Your role is to help potential clients understand our services and qualify leads. Be professional, concise, and helpful.

SERVICES:
${servicesList}

FREQUENTLY ASKED QUESTIONS:
${faqList}

YOUR SCOPE - ONLY ANSWER QUESTIONS ABOUT:
${scopeList || 'Services, pricing, timelines, and processes'}

STRICT BOUNDARIES - DO NOT ANSWER:
${boundariesList || 'General knowledge, competitors, or unrelated topics'}

GUIDELINES:
- Respond concisely and professionally
- Always suggest a consultation for custom projects
- Stay strictly within your scope
- Provide pricing ranges but emphasize custom quotes
- Include relevant website links when discussing services

WEBSITE LINKS:
- Start a Project: ${config.baseUrl}${config.websiteLinks.startProject}
- Book Consultation: ${config.baseUrl}${config.websiteLinks.bookConsultation}
${Object.entries(config.websiteLinks.services).map(([key, path]) => 
  `- ${key}: ${config.baseUrl}${path}`
).join('\n')}

IMPORTANT:
- Always include the "Start a Project" link at the end of responses
- When discussing services, include relevant service page links
- Push users towards the questionnaire or booking
- Redirect off-topic questions politely but firmly
`;
}

/**
 * Get widget styling from client configuration
 */
export function getWidgetStyles() {
  const config = getClientConfig();
  
  return {
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    position: config.widgetPosition,
  };
}

