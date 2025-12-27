/**
 * Case Study TypeScript Types
 * 
 * Types for the case studies CMS system
 */

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


