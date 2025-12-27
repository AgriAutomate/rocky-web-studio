/**
 * Lead TypeScript Types
 * 
 * Types for the leads/contact form system
 */

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: string | null;
  message: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  project_type?: string;
  message?: string;
  source?: string;
  status?: Lead['status'];
}

export interface LeadUpdate extends Partial<LeadCreate> {
  id: string;
  status?: Lead['status'];
}

