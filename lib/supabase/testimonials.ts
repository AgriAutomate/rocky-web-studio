/**
 * Testimonials Supabase Client Functions
 * 
 * Database operations for testimonials CMS
 */

import { createServerSupabaseClient } from './client';
import type { Testimonial, TestimonialCreate, TestimonialUpdate } from '@/types/testimonial';
import type { Database } from '@/types/supabase';

type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];

/**
 * Get all published testimonials (public)
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient(false);
  
  // Simplified query - remove nullsFirst option which might not be supported
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Supabase error in getPublishedTestimonials:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  
  // Sort by created_at descending if display_order is the same
  const sorted = (data || []).sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return (a.display_order || 0) - (b.display_order || 0);
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
  
  return (sorted as TestimonialRow[]) as Testimonial[];
}

/**
 * Get featured testimonials (public)
 */
export async function getFeaturedTestimonials(limit = 3): Promise<Testimonial[]> {
  try {
    const supabase = createServerSupabaseClient(false);
    
    // Verify client was created successfully
    if (!supabase) {
      console.error('[SERVER] ⚠️  Supabase client is null or undefined');
      return [];
    }
    
    
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .limit(limit);
  
    if (error) {
      // Log to server console (terminal) - this will show the actual error
      const errorMessage = (error as any)?.message || String(error);
      const errorDetails = (error as any)?.details || '';
      
      // Check for network/DNS errors
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo') || errorMessage.includes('fetch failed')) {
        console.error('[SERVER] ⚠️  NETWORK ERROR: Cannot connect to Supabase');
        console.error('[SERVER] Error:', errorMessage);
        console.error('[SERVER] Details:', errorDetails);
        console.error('[SERVER]');
        console.error('[SERVER] DEBUG: Checking Supabase URL...');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        console.error('[SERVER] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
        
        // Return empty array gracefully
        return [];
      }
      
      // Log other errors
      console.error('[SERVER] ========================================');
      console.error('[SERVER] Supabase error in getFeaturedTestimonials');
      console.error('[SERVER] ========================================');
      console.error('[SERVER] Error message:', errorMessage);
      console.error('[SERVER] Error details:', errorDetails);
      
      // Check for common database errors
      const errorStr = String(errorMessage || errorDetails || '');
      if (errorStr.includes('relation') || errorStr.includes('does not exist')) {
        console.error('[SERVER] ⚠️  TABLE NOT FOUND: Testimonials table does not exist');
        console.error('[SERVER] Run migration: supabase/migrations/20250127_create_testimonials_table.sql');
      }
      
      if (errorStr.includes('permission denied') || errorStr.includes('policy')) {
        console.error('[SERVER] ⚠️  RLS POLICY ERROR: Access denied by Row Level Security');
      }
      
      console.error('[SERVER] ========================================');
      
      // Return empty array instead of throwing to prevent serialization issues
      return [];
    }
  
    // Sort by created_at descending if display_order is the same
    const sorted = (data || []).sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  
    return (sorted as TestimonialRow[]) as Testimonial[];
  } catch (err: any) {
    // Catch any unexpected errors (like client creation failures)
    console.error('[SERVER] ⚠️  UNEXPECTED ERROR in getFeaturedTestimonials:', err?.message || err);
    console.error('[SERVER] Stack:', err?.stack);
    return [];
  }
}

/**
 * Get testimonials by service type (public)
 */
export async function getTestimonialsByServiceType(
  serviceType: Testimonial['service_type']
): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient(false);
  
  if (!serviceType) {
    return [];
  }
  
  // Simplified query - remove nullsFirst option which might not be supported
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .eq('service_type', serviceType)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Supabase error in getTestimonialsByServiceType:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  
  // Sort by created_at descending if display_order is the same
  const sorted = (data || []).sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return (a.display_order || 0) - (b.display_order || 0);
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
  
  return (sorted as TestimonialRow[]) as Testimonial[];
}

/**
 * Get all testimonials (admin - includes unpublished)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  // Simplified query - remove nullsFirst option which might not be supported
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Supabase error in getAllTestimonials:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  
  // Sort by created_at descending if display_order is the same
  const sorted = (data || []).sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return (a.display_order || 0) - (b.display_order || 0);
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
  
  return (sorted as TestimonialRow[]) as Testimonial[];
}

/**
 * Get testimonial by ID (admin - includes unpublished)
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return (data as TestimonialRow) as Testimonial;
}

/**
 * Create testimonial (admin only)
 */
export async function createTestimonial(
  testimonial: TestimonialCreate,
  userId?: string
): Promise<Testimonial> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      ...testimonial,
      created_by: userId || null,
      updated_by: userId || null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return (data as TestimonialRow) as Testimonial;
}

/**
 * Update testimonial (admin only)
 */
export async function updateTestimonial(
  id: string,
  updates: TestimonialUpdate,
  userId?: string
): Promise<Testimonial> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  // Remove id from updates (it's in the function parameter)
  const { id: _, ...updateData } = updates;
  
  const { data, error } = await supabase
    .from('testimonials')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: userId || null,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return (data as TestimonialRow) as Testimonial;
}

/**
 * Delete testimonial (admin only)
 */
export async function deleteTestimonial(id: string): Promise<void> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

