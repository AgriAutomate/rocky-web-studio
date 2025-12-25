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
    answer: 'Yes! We are AVOB certified and specialize in WCAG 2.1 AA compliant solutions for government contracts. We have experience with Queensland government tenders.',
    category: 'Government'
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

GUIDELINES:
- Respond concisely and professionally
- Always suggest a consultation for custom projects or complex inquiries
- Redirect off-topic questions back to our services
- Be helpful but set clear boundaries
- If asked about pricing, provide ranges but emphasize that each project is custom
- For complex projects (healthcare, large e-commerce), always recommend a consultation
- Mention our AVOB certification and WCAG 2.1 AA expertise when relevant
- Keep responses under 200 words when possible

IMPORTANT:
- Never make promises about specific features or timelines without a consultation
- Always end with an invitation to book a consultation or submit a project inquiry
- Be friendly but professional
- Use Australian English spelling and terminology`;
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

