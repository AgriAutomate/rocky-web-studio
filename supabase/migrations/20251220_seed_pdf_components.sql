-- Seed PDF Components and Templates
-- Migration: 20251220_seed_pdf_components.sql
--
-- Creates initial PDF components and template for questionnaire reports
-- Run this after creating the pdf_components and pdf_templates tables

-- -----------------------------------------------------------------------------
-- PDF Components
-- -----------------------------------------------------------------------------

-- Header Component
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  is_active
) VALUES (
  'header',
  'header',
  'Report Header',
  'Header section with business name and generation date',
  '<div class="header">
    <h1>Custom Deep-Dive Report</h1>
    <p>Prepared for <strong>{{businessName}}</strong></p>
    <p>Generated: {{generatedDate}}</p>
  </div>',
  1,
  true
) ON CONFLICT (component_key) DO NOTHING;

-- Introduction Section
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  is_active
) VALUES (
  'intro',
  'section',
  'Introduction',
  'Welcome message and report overview',
  '<div class="intro">
    <h2>Thank You, {{clientName}}!</h2>
    <p>We''ve analyzed your responses and prepared a tailored deep-dive report for <strong>{{businessName}}</strong> in the <strong>{{sector}}</strong> sector.</p>
    <p>This report identifies your top digital challenges and provides proven solutions with ROI projections.</p>
  </div>',
  2,
  true
) ON CONFLICT (component_key) DO NOTHING;

-- Challenges Section
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  is_active
) VALUES (
  'challenges',
  'section',
  'Top Challenges',
  'Section displaying the top digital challenges',
  '<div class="challenges">
    <h2>Your Top Digital Challenges</h2>
    <p>Based on your responses, we''ve identified the following key challenges and opportunities:</p>
    {{challenges}}
  </div>',
  10,
  true
) ON CONFLICT (component_key) DO NOTHING;

-- Call to Action Section
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  is_active
) VALUES (
  'cta',
  'cta',
  'Call to Action',
  'Next steps and consultation CTA',
  '<div class="cta">
    <h2>Ready to Transform Your Digital Future?</h2>
    <p>Let''s discuss how Rocky Web Studio can help {{businessName}} implement these solutions and achieve your digital transformation goals.</p>
    <p><strong>Schedule a 15-minute consultation:</strong> <a href="https://calendly.com/martin-rws/15min">Book Your Consultation</a></p>
  </div>',
  50,
  true
) ON CONFLICT (component_key) DO NOTHING;

-- Footer Component
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  is_active
) VALUES (
  'footer',
  'footer',
  'Report Footer',
  'Footer with contact information and branding',
  '<div class="footer">
    <p><strong>Martin Carroll</strong></p>
    <p>Founder, Rocky Web Studio</p>
    <p>AI-First Digital Transformation Partner</p>
    <p>martin@rockywebstudio.com.au | rockywebstudio.com.au</p>
    <p>Certified Australian Veteran Owned Business</p>
  </div>',
  100,
  true
) ON CONFLICT (component_key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- PDF Templates
-- -----------------------------------------------------------------------------

-- Questionnaire Report Template
INSERT INTO pdf_templates (
  template_key,
  template_name,
  description,
  component_keys,
  page_size,
  orientation,
  margins,
  is_active
) VALUES (
  'questionnaire-report',
  'Questionnaire Deep-Dive Report',
  'Standard questionnaire report template with header, intro, challenges, CTA, and footer',
  ARRAY['header', 'intro', 'challenges', 'cta', 'footer'],
  'A4',
  'portrait',
  '{"top": 40, "right": 40, "bottom": 40, "left": 40}'::jsonb,
  true
) ON CONFLICT (template_key) DO UPDATE
SET
  template_name = EXCLUDED.template_name,
  component_keys = EXCLUDED.component_keys,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Sector-Specific Components (Examples)
-- -----------------------------------------------------------------------------

-- Healthcare-specific intro (optional)
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  sector_filter,
  is_active
) VALUES (
  'intro-healthcare',
  'section',
  'Healthcare Introduction',
  'Healthcare-specific introduction section',
  '<div class="intro">
    <h2>Thank You, {{clientName}}!</h2>
    <p>We understand the unique challenges facing healthcare organizations like <strong>{{businessName}}</strong>.</p>
    <p>This report addresses compliance, patient data security, and operational efficiency specific to the healthcare sector.</p>
  </div>',
  2,
  ARRAY['healthcare'],
  true
) ON CONFLICT (component_key) DO NOTHING;

-- Manufacturing-specific intro (optional)
INSERT INTO pdf_components (
  component_key,
  component_type,
  title,
  description,
  content_html,
  display_order,
  sector_filter,
  is_active
) VALUES (
  'intro-manufacturing',
  'section',
  'Manufacturing Introduction',
  'Manufacturing-specific introduction section',
  '<div class="intro">
    <h2>Thank You, {{clientName}}!</h2>
    <p>Manufacturing businesses like <strong>{{businessName}}</strong> face unique digital transformation opportunities.</p>
    <p>This report focuses on Industry 4.0, supply chain optimization, and operational efficiency.</p>
  </div>',
  2,
  ARRAY['manufacturing'],
  true
) ON CONFLICT (component_key) DO NOTHING;
