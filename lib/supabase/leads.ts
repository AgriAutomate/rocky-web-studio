/**
 * Leads Supabase Client Functions
 * 
 * Database operations for leads/contact form system
 */

import { createServerSupabaseClient } from './client';
import type { Lead, LeadCreate, LeadUpdate } from '@/types/lead';
import type { Database } from '@/types/supabase';

type LeadRow = Database['public']['Tables']['leads']['Row'];

/**
 * Create a new lead (public - for contact form)
 */
export async function createLead(lead: LeadCreate): Promise<Lead> {
  const supabase = createServerSupabaseClient(false); // Public client for form submissions
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...lead,
      source: lead.source || 'contact form',
      status: lead.status || 'new',
    })
    .select()
    .single();
  
  if (error) {
    console.error('[SERVER] Supabase error in createLead:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow) as Lead;
}

/**
 * Get all leads (admin only)
 */
export async function getAllLeads(): Promise<Lead[]> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[SERVER] Supabase error in getAllLeads:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow[]) as Lead[];
}

/**
 * Get lead by ID (admin only)
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[SERVER] Supabase error in getLeadById:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow) as Lead;
}

/**
 * Update lead (admin only)
 */
export async function updateLead(
  id: string,
  updates: LeadUpdate
): Promise<Lead> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  // Remove id from updates (it's in the function parameter)
  const { id: _, ...updateData } = updates;
  
  const { data, error } = await supabase
    .from('leads')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('[SERVER] Supabase error in updateLead:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow) as Lead;
}

/**
 * Delete lead (admin only)
 */
export async function deleteLead(id: string): Promise<void> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('[SERVER] Supabase error in deleteLead:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
}

/**
 * Search leads by name or email (admin only)
 */
export async function searchLeads(query: string): Promise<Lead[]> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const searchPattern = `%${query}%`;
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .or(`name.ilike.${searchPattern},email.ilike.${searchPattern}`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[SERVER] Supabase error in searchLeads:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow[]) as Lead[];
}

/**
 * Get leads by status (admin only)
 */
export async function getLeadsByStatus(status: Lead['status']): Promise<Lead[]> {
  const supabase = createServerSupabaseClient(true); // Service role for admin
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[SERVER] Supabase error in getLeadsByStatus:', {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
  
  return (data as LeadRow[]) as Lead[];
}

