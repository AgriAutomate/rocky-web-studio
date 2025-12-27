/**
 * Case Studies Supabase Client Functions
 * 
 * Database operations for case studies CMS
 */

import { createServerSupabaseClient } from './client';
import type { CaseStudy, CaseStudyCreate, CaseStudyUpdate } from '@/types/case-study';
import type { Database } from '@/types/supabase';

type CaseStudyRow = Database['public']['Tables']['case_studies']['Row'];

/**
 * Get all published case studies (public)
 */
export async function getPublishedCaseStudies(): Promise<CaseStudy[]> {
  const supabase = createServerSupabaseClient(false);
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('[SERVER] Error fetching published case studies:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
  
  if (!data) {
    console.warn('[SERVER] No data returned from case_studies query');
    return [];
  }
  
  console.log(`[SERVER] Found ${data.length} published case studies`);
  return (data as CaseStudyRow[]) as CaseStudy[];
}

/**
 * Get case study by slug (public)
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const supabase = createServerSupabaseClient(false);
  
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
  
  return (data as CaseStudyRow) as CaseStudy;
}

/**
 * Get featured case studies (public)
 */
export async function getFeaturedCaseStudies(limit = 3): Promise<CaseStudy[]> {
  const supabase = createServerSupabaseClient(false);
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data as CaseStudyRow[]) as CaseStudy[];
}

/**
 * Get all case studies (admin - includes drafts)
 */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as CaseStudyRow[]) as CaseStudy[];
}

/**
 * Get case study by ID (admin - includes drafts)
 */
export async function getCaseStudyById(id: string): Promise<CaseStudy | null> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return (data as CaseStudyRow) as CaseStudy;
}

/**
 * Create case study (admin only)
 */
export async function createCaseStudy(
  caseStudy: CaseStudyCreate,
  userId?: string
): Promise<CaseStudy> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { images, ...restCaseStudy } = caseStudy;
  const { data, error } = await supabase
    .from('case_studies')
    .insert({
      ...restCaseStudy,
      images: images ? (images as any) : undefined,
      created_by: userId || undefined,
      updated_by: userId || undefined,
    })
    .select()
    .single();
  
  if (error) throw error;
  return (data as CaseStudyRow) as CaseStudy;
}

/**
 * Update case study (admin only)
 */
export async function updateCaseStudy(
  id: string,
  updates: CaseStudyUpdate,
  userId?: string
): Promise<CaseStudy> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  // Remove id from updates (it's in the function parameter)
  // Extract images separately to handle type casting
  const { id: _, images, ...restUpdateData } = updates;
  
  const { data, error } = await supabase
    .from('case_studies')
    .update({
      ...restUpdateData,
      images: images ? (images as any) : undefined,
      updated_at: new Date().toISOString(),
      updated_by: userId || undefined,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return (data as CaseStudyRow) as CaseStudy;
}

/**
 * Delete case study (admin only)
 */
export async function deleteCaseStudy(id: string): Promise<void> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Search case studies (full-text search) - public
 * Uses ilike for pattern matching across multiple columns
 */
export async function searchCaseStudies(query: string): Promise<CaseStudy[]> {
  const supabase = createServerSupabaseClient(false);
  
  const searchPattern = `%${query}%`;
  
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern}`)
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return (data as CaseStudyRow[]) as CaseStudy[];
}

/**
 * Get case studies by category (public)
 */
export async function getCaseStudiesByCategory(
  category: CaseStudy['category']
): Promise<CaseStudy[]> {
  const supabase = createServerSupabaseClient(false);
  
  let query = supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published');
  
  // Handle null category (filter for null categories)
  if (category === null) {
    query = query.is('category', null);
  } else if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return (data as CaseStudyRow[]) as CaseStudy[];
}

