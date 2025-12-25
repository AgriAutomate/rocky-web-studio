# Supabase Case Studies Schema Design
**Date:** January 23, 2025  
**Status:** Ready for Week 3-4 Implementation  
**Database:** Supabase PostgreSQL

## Overview

This document defines the database schema for the case studies system. The schema is designed to support:
- Case study content management
- SEO metadata
- Metrics tracking (before/after)
- Testimonials
- Media management
- Draft/published workflow

---

## Schema Design

### Table: `case_studies`

```sql
-- Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB, -- Portable Text or Markdown stored as JSON
  
  -- Categorization
  category TEXT, -- 'accessibility', 'ai', 'cms', 'general'
  featured BOOLEAN DEFAULT false,
  
  -- Publishing
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  
  -- Metrics (for case study results)
  before_metrics JSONB, -- { axe_violations: 6, lighthouse_score: 72, ... }
  after_metrics JSONB,  -- { axe_violations: 0, lighthouse_score: 98, ... }
  
  -- Media
  hero_image_url TEXT,
  images JSONB, -- Array of image objects: [{ url, alt, caption }]
  
  -- Testimonial
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_company TEXT,
  testimonial_author_role TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_category ON case_studies(category);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_created ON case_studies(created_at DESC);

-- Full-text search index (for search functionality)
CREATE INDEX IF NOT EXISTS idx_case_studies_search ON case_studies USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content::text, ''))
);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read published case studies
CREATE POLICY "Public can read published case studies"
  ON case_studies
  FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read all (for admin preview)
CREATE POLICY "Authenticated users can read all case studies"
  ON case_studies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins can manage all case studies
CREATE POLICY "Admins can manage case studies"
  ON case_studies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role full access"
  ON case_studies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

## Migration Script

**File:** `supabase/migrations/[timestamp]_create_case_studies_table.sql`

```sql
-- Migration: Create case_studies table
-- Date: [Date]
-- Description: Creates table and indexes for case studies CMS

BEGIN;

-- Create table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  before_metrics JSONB,
  after_metrics JSONB,
  hero_image_url TEXT,
  images JSONB,
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_company TEXT,
  testimonial_author_role TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON case_studies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_case_studies_category ON case_studies(category);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_created ON case_studies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_search ON case_studies USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content::text, ''))
);

-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read published case studies"
  ON case_studies FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all case studies"
  ON case_studies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage case studies"
  ON case_studies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

COMMIT;
```

---

## TypeScript Types

**File:** `types/case-study.ts`

```typescript
export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any; // Portable Text or Markdown JSON
  category: 'accessibility' | 'ai' | 'cms' | 'general' | null;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  before_metrics: CaseStudyMetrics | null;
  after_metrics: CaseStudyMetrics | null;
  hero_image_url: string | null;
  images: CaseStudyImage[] | null;
  testimonial_text: string | null;
  testimonial_author: string | null;
  testimonial_company: string | null;
  testimonial_author_role: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CaseStudyMetrics {
  axe_violations?: number;
  lighthouse_score?: number;
  pa11y_issues?: number;
  response_time?: number;
  conversion_rate?: number;
  [key: string]: any; // Allow custom metrics
}

export interface CaseStudyImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface CaseStudyCreate {
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  category?: CaseStudy['category'];
  featured?: boolean;
  status?: CaseStudy['status'];
  published_at?: string;
  before_metrics?: CaseStudyMetrics;
  after_metrics?: CaseStudyMetrics;
  hero_image_url?: string;
  images?: CaseStudyImage[];
  testimonial_text?: string;
  testimonial_author?: string;
  testimonial_company?: string;
  testimonial_author_role?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
}

export interface CaseStudyUpdate extends Partial<CaseStudyCreate> {
  id: string;
}
```

---

## Supabase Client Queries

**File:** `lib/supabase/case-studies.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { CaseStudy, CaseStudyCreate, CaseStudyUpdate } from '@/types/case-study';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

/**
 * Get all published case studies
 */
export async function getPublishedCaseStudies(): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data as CaseStudy[];
}

/**
 * Get case study by slug
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data as CaseStudy;
}

/**
 * Get featured case studies
 */
export async function getFeaturedCaseStudies(limit = 3): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as CaseStudy[];
}

/**
 * Create case study (admin only)
 */
export async function createCaseStudy(caseStudy: CaseStudyCreate): Promise<CaseStudy> {
  const { data, error } = await supabase
    .from('case_studies')
    .insert(caseStudy)
    .select()
    .single();
  
  if (error) throw error;
  return data as CaseStudy;
}

/**
 * Update case study (admin only)
 */
export async function updateCaseStudy(
  id: string,
  updates: CaseStudyUpdate
): Promise<CaseStudy> {
  const { data, error } = await supabase
    .from('case_studies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as CaseStudy;
}

/**
 * Delete case study (admin only)
 */
export async function deleteCaseStudy(id: string): Promise<void> {
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Search case studies (full-text search)
 */
export async function searchCaseStudies(query: string): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .textSearch('title,excerpt,content', query)
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data as CaseStudy[];
}
```

---

## Implementation Checklist

### Week 3-4: Implementation
- [ ] Create migration file
- [ ] Run migration in Supabase
- [ ] Verify table created
- [ ] Verify indexes created
- [ ] Verify RLS policies work
- [ ] Create TypeScript types
- [ ] Create Supabase client functions
- [ ] Test CRUD operations
- [ ] Test RLS policies
- [ ] Test search functionality

---

**Created:** January 23, 2025  
**Status:** Ready for Week 3-4 Implementation  
**Database:** Supabase PostgreSQL

