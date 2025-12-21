import { createServerSupabaseClient } from "@/lib/supabase/client";

export interface PDFComponent {
  id: number;
  component_key: string;
  component_type: string;
  title: string | null;
  description: string | null;
  content_html: string;
  content_json: any;
  styles: any;
  display_order: number;
  is_active: boolean;
  sector_filter: string[] | null;
  version: number;
}

export interface PDFTemplate {
  id: number;
  template_key: string;
  template_name: string;
  description: string | null;
  component_keys: string[];
  page_size: string;
  orientation: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  theme: any;
  is_active: boolean;
  version: number;
}

/**
 * Fetch PDF template by key
 */
export async function fetchPDFTemplate(templateKey: string): Promise<PDFTemplate | null> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    const { data, error } = await (supabase as any)
      .from('pdf_templates')
      .select('*')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching PDF template:', error);
      return null;
    }

    return data as PDFTemplate;
  } catch (error) {
    console.error('Exception fetching PDF template:', error);
    return null;
  }
}

/**
 * Fetch PDF components by keys
 * Optionally filter by sector
 */
export async function fetchPDFComponents(
  componentKeys: string[],
  sector?: string
): Promise<PDFComponent[]> {
  try {
    const supabase = createServerSupabaseClient(true);
    
    let query = (supabase as any)
      .from('pdf_components')
      .select('*')
      .in('component_key', componentKeys)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Filter by sector if provided
    // Components with empty sector_filter apply to all sectors
    if (sector) {
      // This query gets components that either:
      // 1. Have no sector_filter (empty array or null) - applies to all
      // 2. Have the specific sector in their sector_filter array
      query = query.or(`sector_filter.is.null,sector_filter.eq.[],sector_filter.cs.{${sector}}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching PDF components:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('No PDF components found for keys:', componentKeys);
      return [];
    }

    return data as PDFComponent[];
  } catch (error) {
    console.error('Exception fetching PDF components:', error);
    return [];
  }
}

/**
 * Replace placeholders in HTML template with actual data
 */
export function replacePlaceholders(
  html: string,
  data: Record<string, any>
): string {
  let result = html;
  
  // Replace all {{key}} placeholders with values from data
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  
  return result;
}
