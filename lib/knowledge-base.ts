/**
 * Rocky Web Studio Knowledge Base
 * 
 * Provides context for AI Assistant about services, pricing, FAQ, and processes
 */

import type { KnowledgeBaseService, KnowledgeBaseFAQ } from '@/types/ai-assistant';

/**
 * RWS Services Information
 */
export const RWS_SERVICES: KnowledgeBaseService[] = [
  {
    name: 'Website Design & Development',
    description: 'Custom websites built with Next.js, React, and modern web technologies',
    pricing: '$4,000 - $35,000',
    timeline: '4-12 weeks',
    technologies: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'Supabase']
  },
  {
    name: 'Website Redesign',
    description: 'Modernize existing websites with improved UX, performance, and accessibility',
    pricing: '$5,000 - $25,000',
    timeline: '6-10 weeks',
    technologies: ['Next.js', 'React', 'WCAG 2.1 AA']
  },
  {
    name: 'E-Commerce Development',
    description: 'Online stores with payment processing, inventory management, and order tracking',
    pricing: '$8,000 - $40,000',
    timeline: '8-16 weeks',
    technologies: ['Next.js', 'Stripe', 'Supabase', 'Payment Processing']
  },
  {
    name: 'SEO Optimization',
    description: 'Search engine optimization to improve visibility and organic traffic',
    pricing: '$2,000 - $8,000',
    timeline: 'Ongoing',
    technologies: ['SEO', 'Content Strategy', 'Technical SEO']
  },
  {
    name: 'AI & Automation',
    description: 'AI-powered chatbots, automation workflows, and intelligent systems',
    pricing: '$5,000 - $30,000',
    timeline: '4-10 weeks',
    technologies: ['Claude API', 'OpenAI', 'Automation', 'AI Integration']
  },
  {
    name: 'Healthcare Systems',
    description: 'HIPAA-compliant patient portals, appointment systems, and healthcare platforms',
    pricing: '$30,000 - $60,000',
    timeline: '12-20 weeks',
    technologies: ['Healthcare', 'HIPAA Compliance', 'Patient Portals']
  },
  {
    name: 'Accessibility Audits',
    description: 'WCAG 2.1 AA compliance audits and remediation',
    pricing: '$2,000 - $5,000',
    timeline: '2-4 weeks',
    technologies: ['WCAG 2.1 AA', 'Accessibility', 'A11y Testing']
  },
  {
    name: 'CRM Integration',
    description: 'Custom CRM systems and integrations with existing tools',
    pricing: '$5,000 - $25,000',
    timeline: '6-12 weeks',
    technologies: ['CRM', 'API Integration', 'Data Management']
  }
];

/**
 * Frequently Asked Questions
 */
export const RWS_FAQ: KnowledgeBaseFAQ[] = [
  {
    question: 'What is your typical project timeline?',
    answer: 'Project timelines vary by scope: Simple websites (4-6 weeks), E-commerce (8-16 weeks), Healthcare systems (12-20 weeks). We provide detailed timelines during the discovery phase.',
    category: 'Process'
  },
  {
    question: 'Do you work with government clients?',
    answer: 'Yes! We are AVOB (Australian Veteran Owned Business) certified and specialize in WCAG 2.1 AA compliant solutions for government contracts. We have experience with Queensland government tenders. Learn more about AVOB certification at https://www.avob.org.au/',
    category: 'Government'
  },
  {
    question: 'What is AVOB certification?',
    answer: 'AVOB stands for Australian Veteran Owned Business. Rocky Web Studio is AVOB certified, meaning we are a verified veteran-owned business. This certification demonstrates our commitment to supporting the veteran community and qualifies us for government contracts and tenders that prioritize veteran-owned suppliers. You can verify our certification at https://www.avob.org.au/',
    category: 'Certification'
  },
  {
    question: 'What technologies do you use?',
    answer: 'We use modern, production-ready technologies: Next.js 16, React 19, TypeScript, Supabase, TailwindCSS, and AI APIs (Claude, OpenAI). All code is TypeScript strict mode.',
    category: 'Technology'
  },
  {
    question: 'Do you provide ongoing support?',
    answer: 'Yes, we offer ongoing support packages for maintenance, updates, and feature additions. Support is available on a monthly retainer or per-project basis.',
    category: 'Support'
  },
  {
    question: 'Can you integrate with existing systems?',
    answer: 'Absolutely! We specialize in API integrations with Xero, Stripe, SMS services, and custom systems. We can integrate with your existing infrastructure.',
    category: 'Integration'
  },
  {
    question: 'What is your development process?',
    answer: 'Our process: 1) Discovery & Planning, 2) Design & Prototyping, 3) Development, 4) Testing & QA, 5) Launch & Support. We use AI-assisted development for faster delivery.',
    category: 'Process'
  }
];

/**
 * Website page links for AI Assistant to reference
 */
export const WEBSITE_LINKS = {
  baseUrl: 'https://rockywebstudio.com.au',
  startProject: '/questionnaire',
  bookConsultation: '/book',
  services: {
    websiteDesign: '/services/website-design-development',
    websiteRedesign: '/services/website-redesign-refresh',
    ecommerce: '/services/ecommerce',
    aiAutomation: '/services/ai-automation',
    crmIntegration: '/services/crm-integration',
    seoPerformance: '/services/seo-performance',
    supportMaintenance: '/services/support-maintenance',
  }
};

/**
 * Format system prompt for Claude API
 */
export function formatSystemPrompt(): string {
  const servicesList = RWS_SERVICES.map(service => 
    `- ${service.name}: ${service.description} (${service.pricing}, ${service.timeline})`
  ).join('\n');

  const faqList = RWS_FAQ.map(faq => 
    `Q: ${faq.question}\nA: ${faq.answer}`
  ).join('\n\n');

  return `You are an AI assistant for Rocky Web Studio, a web development agency based in Rockhampton, Queensland, Australia.

Your role is to help potential clients understand our services and qualify leads. Be professional, concise, and helpful.

SERVICES:
${servicesList}

FREQUENTLY ASKED QUESTIONS:
${faqList}

YOUR SCOPE - ONLY ANSWER QUESTIONS ABOUT:
- Rocky Web Studio services (web development, design, e-commerce, AI automation, etc.)
- Our pricing, timelines, and processes
- Our certifications (AVOB, WCAG 2.1 AA)
- Our technology stack and expertise
- How to contact us or book a consultation
- Project inquiries and lead qualification

STRICT BOUNDARIES - DO NOT ANSWER:
- General knowledge questions (history, science, current events, etc.)
- Questions about other companies or competitors
- Personal advice or opinions unrelated to web development
- Technical tutorials or how-to guides (unless directly related to our services)
- Questions about topics completely unrelated to web development or our business
- Requests to write code, solve problems, or provide services outside our scope

OFF-TOPIC QUESTION HANDLING:
When asked an off-topic question, politely redirect:
1. Acknowledge briefly: "I'm here to help with questions about Rocky Web Studio's services."
2. Redirect: "I'd be happy to discuss how we can help with your web development needs."
3. Offer value: Mention a relevant service or suggest booking a consultation
4. Example response: "I'm focused on helping with Rocky Web Studio's web development services. Would you like to know about our website design, e-commerce solutions, or AI automation services? I can also help you book a consultation to discuss your specific needs."

GUIDELINES:
- Respond concisely and professionally
- Always suggest a consultation for custom projects or complex inquiries
- Stay strictly within your scope - only discuss Rocky Web Studio services
- If asked about pricing, provide ranges but emphasize that each project is custom
- For complex projects (healthcare, large e-commerce), always recommend a consultation
- When mentioning AVOB, always clarify: "AVOB stands for Australian Veteran Owned Business" and include the link: https://www.avob.org.au/
- Mention our AVOB certification and WCAG 2.1 AA expertise when relevant to government contracts or veteran-focused projects
- Keep responses under 200 words when possible

WEBSITE LINKS - ALWAYS PROVIDE RELEVANT LINKS:
- Start a Project / Discovery Questionnaire: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.startProject}
- Book a Consultation: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.bookConsultation}
- Website Design & Development: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.websiteDesign}
- Website Redesign: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.websiteRedesign}
- E-Commerce Development: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.ecommerce}
- AI & Automation: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.aiAutomation}
- CRM Integration: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.crmIntegration}
- SEO & Performance: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.seoPerformance}
- Support & Maintenance: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.services.supportMaintenance}

LINK USAGE GUIDELINES:
- ALWAYS include the "Start a Project" link (${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.startProject}) at the end of your responses
- When discussing a specific service, include the relevant service page link
- When suggesting a consultation, include the booking link (${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.bookConsultation})
- Format links clearly: "You can [start your project here](${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.startProject})"
- Make links actionable: "Ready to get started? [Start your project](${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.startProject})"
- When redirecting off-topic questions, always include the start project link

IMPORTANT:
- Never make promises about specific features or timelines without a consultation
- ALWAYS end with a call-to-action including the "Start a Project" link: ${WEBSITE_LINKS.baseUrl}${WEBSITE_LINKS.startProject}
- Push users towards the Discovery Questionnaire for project inquiries
- When discussing services, provide the relevant service page link
- Be friendly but professional
- Use Australian English spelling and terminology
- If a question is completely off-topic, redirect immediately and include the start project link

ABOUT AVOB CERTIFICATION:
- AVOB stands for Australian Veteran Owned Business
- Rocky Web Studio is a certified Australian Veteran Owned Business
- This certification demonstrates our commitment to supporting the veteran community
- This certification qualifies us for government contracts and tenders that prioritize veteran-owned suppliers
- You can verify our certification at: https://www.avob.org.au/
- When asked about AVOB, always provide the correct definition and include the verification link`;
}

/**
 * Search knowledge base for relevant information
 */
export function searchKnowledge(query: string): {
  services: KnowledgeBaseService[];
  faq: KnowledgeBaseFAQ[];
} {
  const lowerQuery = query.toLowerCase();
  
  const matchingServices = RWS_SERVICES.filter(service =>
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.technologies?.some(tech => tech.toLowerCase().includes(lowerQuery))
  );

  const matchingFAQ = RWS_FAQ.filter(faq =>
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery)
  );

  return {
    services: matchingServices.length > 0 ? matchingServices : RWS_SERVICES,
    faq: matchingFAQ.length > 0 ? matchingFAQ : RWS_FAQ
  };
}

/**
 * Get service information by name
 */
export function getServiceInfo(name: string): KnowledgeBaseService | undefined {
  return RWS_SERVICES.find(service => 
    service.name.toLowerCase() === name.toLowerCase()
  );
}

