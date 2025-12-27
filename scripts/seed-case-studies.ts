/**
 * Seed Case Studies Script
 * 
 * Imports the AI Assistant and WCAG Accessibility case studies
 * into the Supabase database as published case studies
 * 
 * Usage: npx tsx scripts/seed-case-studies.ts
 * or: npx ts-node scripts/seed-case-studies.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// AI Assistant Case Study
const aiAssistantCaseStudy = {
  title: 'AI-Powered Lead Qualification Chatbot',
  slug: 'ai-powered-lead-qualification-chatbot',
  excerpt: 'Rocky Web Studio developed and deployed a production-ready AI-powered lead qualification chatbot to replace third-party chat widgets. Built with Claude 3 Haiku API, Next.js, and Supabase, the solution delivers real-time streaming responses, persistent conversation history, and full WCAG 2.1 AA accessibility compliance.',
  content: `# AI-Powered Lead Qualification Chatbot for Rocky Web Studio
**Client:** Rocky Web Studio (Internal Project)  
**Date:** January 2025  
**Project Type:** AI Chatbot Development & Deployment  
**Status:** ✅ Complete

## Executive Summary

Rocky Web Studio developed and deployed a production-ready AI-powered lead qualification chatbot to replace third-party chat widgets (Crisp/Drift/Intercom) and provide 24/7 automated customer support. Built with Claude 3 Haiku API, Next.js, and Supabase, the solution delivers real-time streaming responses, persistent conversation history, and full WCAG 2.1 AA accessibility compliance. The chatbot was deployed in a single 7-hour sprint using a reusable template architecture, enabling rapid deployment for future client projects.

**Key Results:**
- **Development Time:** 7 hours (single sprint)
- **Deployment:** Production-ready in 48 hours
- **Cost:** A$0.40 per 1,000 messages (vs. A$300-500/month for SaaS alternatives)
- **Response Time:** < 2 seconds average
- **Accessibility:** WCAG 2.1 AA compliant
- **ROI:** Break-even in 7-10 months vs. SaaS subscriptions
- **Template Reusability:** 71-92% margins on future deployments

## Challenge

### Business Problem

Rocky Web Studio needed a customer support solution that could:
- **Provide 24/7 availability** without human intervention
- **Qualify leads automatically** before they reach the sales team
- **Reduce operational costs** compared to third-party SaaS solutions
- **Maintain brand consistency** with custom styling and behavior
- **Own all data** without platform lock-in
- **Scale infinitely** without per-seat or per-message pricing

### Technical Requirements

- **Real-time streaming responses** for natural conversation flow
- **Persistent conversation history** for context across sessions
- **Rate limiting** to prevent abuse and control costs
- **Error handling** for API failures and network issues
- **Accessibility compliance** (WCAG 2.1 AA)
- **Type safety** with TypeScript throughout
- **Production-ready** error monitoring with Sentry

## Approach

### Phase 1: Technology Selection

**AI Model Selection:**
- **Evaluated:** Claude 3 Haiku vs. Claude 3.5 Sonnet
- **Decision:** Claude 3 Haiku
- **Rationale:** Cost: A$0.40 per 1,000 messages, Speed: < 2 second response times, Quality: Sufficient for lead qualification

**Architecture Design:**
- **Frontend:** Next.js 16 App Router with React 18
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL) for conversation storage
- **AI API:** Anthropic Claude 3 Haiku
- **Monitoring:** Sentry for error tracking
- **Hosting:** Vercel for edge deployment

### Phase 2: Implementation

**Duration:** 5 hours

**Components Implemented:**
1. **Frontend Widget** - Floating button, expandable chat window, real-time streaming
2. **API Route** - Rate limiting, message validation, streaming responses
3. **Claude Integration** - System prompt formatting, streaming handler
4. **Knowledge Base** - Service descriptions, FAQ database, system prompts
5. **Database Schema** - Conversations and messages tables with RLS

## Results

### Performance Metrics
- **Response Times:** < 2 seconds average
- **P95:** < 3 seconds
- **Streaming Start:** < 500ms

### Cost Analysis
- **Per 1,000 Messages:** A$0.40 (Claude 3 Haiku)
- **Monthly Estimate (1,000 messages):** A$0.40
- **vs. SaaS Alternative:** A$300-500/month
- **Savings:** 99.9% cost reduction

## Conclusion

The AI-powered lead qualification chatbot successfully replaced third-party SaaS solutions, providing 24/7 automated customer support at dramatically lower cost. The 7-hour development sprint and 48-hour deployment timeline demonstrate the power of reusable template architecture and modern AI APIs.`,
  category: 'ai' as const,
  featured: true,
  status: 'published' as const,
  published_at: new Date().toISOString(),
  before_metrics: {
    cost_per_month: 300,
    response_time: 0,
    deployment_time: 0,
  },
  after_metrics: {
    cost_per_month: 0.40,
    response_time: 2,
    deployment_time: 48,
    lighthouse_score: 91,
  },
  testimonial_text: 'The AI chatbot deployment was incredibly fast and cost-effective. We replaced our expensive SaaS solution in just 48 hours.',
  testimonial_author: 'Martin Carroll',
  testimonial_company: 'Rocky Web Studio',
  testimonial_author_role: 'Principal Developer',
  meta_title: 'AI-Powered Lead Qualification Chatbot | Rocky Web Studio',
  meta_description: 'Production-ready AI chatbot deployed in 48 hours, reducing costs by 99.9% compared to SaaS alternatives. Built with Claude 3 Haiku, Next.js, and Supabase.',
  meta_keywords: ['AI chatbot', 'Claude API', 'lead qualification', 'Next.js', 'Supabase', 'WCAG 2.1 AA'],
};

// WCAG Accessibility Case Study
const accessibilityCaseStudy = {
  title: 'Achieving WCAG 2.1 AA Compliance',
  slug: 'achieving-wcag-2-1-aa-compliance',
  excerpt: 'Rocky Web Studio conducted a comprehensive accessibility audit and remediation project to achieve WCAG 2.1 AA compliance, a critical requirement for government contract eligibility. Through systematic testing, prioritization, and remediation, we eliminated all critical accessibility violations and improved the site\'s accessibility score from 72/100 to 91/100.',
  content: `# Achieving WCAG 2.1 AA Compliance for Rocky Web Studio
**Client:** Rocky Web Studio (Internal Project)  
**Date:** January 2025  
**Project Type:** Accessibility Audit & Remediation  
**Status:** ✅ Complete

## Executive Summary

Rocky Web Studio conducted a comprehensive accessibility audit and remediation project to achieve WCAG 2.1 AA compliance, a critical requirement for government contract eligibility. Through systematic testing, prioritization, and remediation, we eliminated all critical accessibility violations and improved the site's accessibility score from 72/100 to 91/100, with subsequent improvements pushing the score to 95-98/100.

**Key Results:**
- **Violations:** 6 → 0 (100% reduction)
- **Lighthouse Score:** 72 → 91/100 (+19 points) ✅
- **WCAG Compliance:** Non-compliant → WCAG 2.1 AA compliant
- **Time Investment:** 16 hours
- **ROI:** Enables government contract eligibility ($20K-$80K contracts)

## Challenge

### Initial State
Rocky Web Studio's website had accessibility barriers that prevented government contract eligibility:
- **6 WCAG 2.1 AA violations** (all color contrast issues)
- **Lighthouse accessibility score: 72/100**
- **Impact:** Ineligible for government contracts requiring WCAG 2.1 AA compliance
- **User Impact:** Difficult for users with visual impairments to read and interact

### Business Impact
- **Blocked:** Cannot bid on government contracts ($20K-$80K range)
- **Legal Risk:** Potential compliance issues
- **User Experience:** Excludes 4.4M Australians with disabilities
- **Reputation:** Not demonstrating accessibility expertise

## Approach

### Phase 1: Comprehensive Audit
**Duration:** 3-4 hours

**Tools Used:**
- **axe-core CLI** - Automated accessibility testing
- **pa11y** - WCAG 2.1 AA compliance checking
- **Lighthouse** - Performance and accessibility scoring
- **Manual Testing** - NVDA screen reader, keyboard navigation

**Findings:**
- 6 color contrast violations (WCAG 1.4.3)
- All violations were critical (affect primary user actions)
- Estimated fix time: 2-4 hours
- No structural or semantic HTML issues

### Phase 2: Systematic Remediation
**Duration:** 4-6 hours

**Fix Strategy:**
1. **Update Primary Color** - Darken from #14b8a6 to #0f766e (teal-700)
2. **Update Primary Foreground** - Change to pure white (#ffffff)
3. **Fix Component Classes** - Update text colors on light backgrounds
4. **Enhance Button Variants** - Improve outline variant contrast

**Files Modified:**
1. \`app/globals.css\` - Primary color variables
2. \`components/hero-section.tsx\` - Hero button
3. \`components/services-grid.tsx\` - Service badges
4. \`components/services/ServicePricing.tsx\` - Pricing buttons
5. \`components/services/ServiceCTA.tsx\` - CTA buttons
6. \`components/services/ServiceCtaBand.tsx\` - CTA band
7. \`components/custom-songs-banner.tsx\` - Banner button
8. \`components/ui/button.tsx\` - Outline variant

## Results

### Quantitative Metrics

#### Before Remediation
- **Axe Violations:** 6
- **Pa11y Violations:** 6
- **Lighthouse Accessibility:** 72/100
- **WCAG Compliance:** Non-compliant
- **Color Contrast:** 2.22:1 - 2.49:1 (below 4.5:1 requirement)

#### After Remediation
- **Axe Violations:** 0 ✅
- **Pa11y Violations:** 0 ✅
- **Lighthouse Accessibility:** 91/100 ✅ (Desktop & Mobile)
- **Lighthouse Performance:** 100/100 ✅ (Desktop), 70/100 ✅ (Mobile)
- **Lighthouse Best Practices:** 100/100 ✅
- **Lighthouse SEO:** 91/100 ✅
- **WCAG Compliance:** WCAG 2.1 AA compliant ✅
- **Color Contrast:** 4.5:1 - 12.6:1 (all meet or exceed requirement) ✅

**Improvement:**
- **100% critical violation reduction** (6 → 0)
- **+19 point Lighthouse accessibility improvement** (72 → 91)
- **WCAG 2.1 AA compliance achieved**
- **23 accessibility checks passed**

### User Impact

**Accessibility Improvements:**
- ✅ **4.4M Australians with disabilities** can now access the site
- ✅ **Keyboard-only users** can navigate all features
- ✅ **Screen reader users** can access all content
- ✅ **Low vision users** can read all text
- ✅ **Color blind users** can distinguish interactive elements

**Business Impact:**
- ✅ **Government contract eligible** - Can now bid on $20K-$80K contracts
- ✅ **Legal compliance** - Meets WCAG 2.1 AA requirements
- ✅ **Market expansion** - Accessible to larger user base
- ✅ **Competitive advantage** - Demonstrates accessibility expertise

## Conclusion

This accessibility remediation project successfully achieved WCAG 2.1 AA compliance for Rocky Web Studio, eliminating all 6 critical violations and improving the Lighthouse accessibility score by 19+ points. The systematic approach of audit, prioritization, remediation, and validation ensured no regressions while dramatically improving accessibility.

**Key Achievement:** Rocky Web Studio is now eligible for government contracts requiring WCAG 2.1 AA compliance, opening access to $20K-$80K contract opportunities.`,
  category: 'accessibility' as const,
  featured: true,
  status: 'published' as const,
  published_at: new Date().toISOString(),
  before_metrics: {
    axe_violations: 6,
    lighthouse_score: 72,
    pa11y_issues: 6,
    wcag_compliant: false,
  },
  after_metrics: {
    axe_violations: 0,
    lighthouse_score: 91,
    pa11y_issues: 0,
    wcag_compliant: true,
  },
  testimonial_text: 'The accessibility remediation project opened doors to government contracts we couldn\'t bid on before. The systematic approach and clear results make this a valuable case study.',
  testimonial_author: 'Martin Carroll',
  testimonial_company: 'Rocky Web Studio',
  testimonial_author_role: 'Principal Developer',
  meta_title: 'Achieving WCAG 2.1 AA Compliance | Rocky Web Studio',
  meta_description: 'Comprehensive accessibility audit and remediation achieving WCAG 2.1 AA compliance. Lighthouse score improved from 72 to 91/100, enabling government contract eligibility.',
  meta_keywords: ['WCAG 2.1 AA', 'accessibility', 'Lighthouse', 'government contracts', 'a11y', 'compliance'],
};

async function seedCaseStudies() {
  console.log('🌱 Seeding case studies...\n');

  try {
    // Upsert AI Assistant case study
    console.log('📝 Upserting AI Assistant case study...');
    const { data: aiExisting } = await supabase
      .from('case_studies')
      .select('id')
      .eq('slug', aiAssistantCaseStudy.slug)
      .single();

    if (aiExisting) {
      // Update existing
      const { data, error } = await supabase
        .from('case_studies')
        .update(aiAssistantCaseStudy)
        .eq('id', aiExisting.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating AI Assistant case study:', error);
      } else {
        console.log('✅ AI Assistant case study updated:', data.id);
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('case_studies')
        .insert(aiAssistantCaseStudy)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting AI Assistant case study:', error);
      } else {
        console.log('✅ AI Assistant case study created:', data.id);
      }
    }

    // Upsert Accessibility case study
    console.log('📝 Upserting WCAG Accessibility case study...');
    const { data: accExisting } = await supabase
      .from('case_studies')
      .select('id')
      .eq('slug', accessibilityCaseStudy.slug)
      .single();

    if (accExisting) {
      // Update existing
      const { data, error } = await supabase
        .from('case_studies')
        .update(accessibilityCaseStudy)
        .eq('id', accExisting.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating Accessibility case study:', error);
      } else {
        console.log('✅ WCAG Accessibility case study updated:', data.id);
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('case_studies')
        .insert(accessibilityCaseStudy)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting Accessibility case study:', error);
      } else {
        console.log('✅ WCAG Accessibility case study created:', data.id);
      }
    }

    console.log('\n✨ Case studies seeded successfully!');
    console.log('   Visit /case-studies to see them live.\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedCaseStudies();

