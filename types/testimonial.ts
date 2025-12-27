/**
 * Testimonial TypeScript Types
 * 
 * Types for the testimonials CMS system
 */

export interface Testimonial {
  id: string;
  client_name: string;
  client_title: string | null;
  client_company: string | null;
  client_image_url: string | null;
  content: string;
  rating: number | null;
  service_type: 'accessibility' | 'ai' | 'cms' | 'general' | null;
  case_study_id: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface TestimonialCreate {
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_image_url?: string;
  content: string;
  rating?: number;
  service_type?: Testimonial['service_type'];
  case_study_id?: string;
  published?: boolean;
  display_order?: number;
}

export interface TestimonialUpdate extends Partial<TestimonialCreate> {
  id: string;
}

