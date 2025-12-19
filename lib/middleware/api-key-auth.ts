/**
 * Rocky Web Studio / API Key Authentication Middleware
 * File: lib/middleware/api-key-auth.ts
 *
 * Purpose: Validate API key and extract business_id for multi-tenant isolation
 * Usage: Add to API routes that require multi-tenant authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends NextRequest {
  businessId?: number;
  business?: {
    id: number;
    business_name: string;
    pricing_tier: 'starter' | 'pro' | 'enterprise';
    features: Record<string, boolean>;
    max_leads_per_month: number;
    max_service_types: number;
  };
}

/**
 * Middleware to validate API key and extract business context
 * 
 * @param request - Next.js request object
 * @returns NextResponse with error if invalid, or modified request with business context
 */
export async function validateApiKey(
  request: NextRequest
): Promise<NextResponse | null> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key. Include X-API-Key header.' },
      { status: 401 }
    );
  }

  try {
    // Use environment variables for Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
    
    // Query business by API key
    const { data: business, error } = await supabase
      .from('service_businesses')
      .select('id, business_name, pricing_tier, features, max_leads_per_month, max_service_types, status, subscription_status')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .eq('subscription_status', 'active')
      .single();

    if (error || !business) {
      return NextResponse.json(
        { error: 'Invalid API key or business account inactive.' },
        { status: 401 }
      );
    }

    // Update last used timestamp (async, don't block)
    supabase
      .from('service_businesses')
      .update({ api_key_last_used: new Date().toISOString() })
      .eq('id', business.id)
      .then(() => {}); // Fire and forget

    // Attach business context to request
    (request as AuthenticatedRequest).businessId = business.id;
    (request as AuthenticatedRequest).business = {
      id: business.id,
      business_name: business.business_name,
      pricing_tier: business.pricing_tier as 'starter' | 'pro' | 'enterprise',
      features: (business.features as Record<string, boolean>) || {},
      max_leads_per_month: business.max_leads_per_month,
      max_service_types: business.max_service_types,
    };

    return null; // Success, continue
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}

/**
 * Wrapper function to protect API routes with API key authentication
 * 
 * @param handler - API route handler function
 * @returns Protected handler that validates API key before execution
 */
export function withApiKeyAuth<T = any>(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    // Validate API key
    const authError = await validateApiKey(request);
    if (authError) {
      return authError as NextResponse<T | { error: string }>;
    }

    // Call original handler with authenticated request
    return handler(request as AuthenticatedRequest);
  };
}

/**
 * Check if business has access to a specific feature
 * 
 * @param business - Business object from authenticated request
 * @param feature - Feature name to check
 * @returns true if feature is enabled
 */
export function hasFeature(
  business: AuthenticatedRequest['business'],
  feature: string
): boolean {
  if (!business) return false;
  return business.features[feature] === true;
}

/**
 * Check if business has reached a limit
 * 
 * @param business - Business object from authenticated request
 * @param limitType - Type of limit to check ('leads', 'service_types')
 * @param currentCount - Current count for the limit
 * @returns true if limit is reached
 */
export function isLimitReached(
  business: AuthenticatedRequest['business'],
  limitType: 'leads' | 'service_types',
  currentCount: number
): boolean {
  if (!business) return true;

  const limit = limitType === 'leads'
    ? business.max_leads_per_month
    : business.max_service_types;

  return currentCount >= limit;
}

/**
 * Get pricing tier limits
 */
export const PRICING_TIER_LIMITS = {
  starter: {
    max_leads_per_month: 100,
    max_service_types: 1,
    max_users: 1,
    features: {
      recurring_billing: false,
      sms_notifications: false,
      lead_scoring: false,
      nps_surveys: false,
      hubspot_integration: false,
    },
  },
  pro: {
    max_leads_per_month: 1000,
    max_service_types: 5,
    max_users: 5,
    features: {
      recurring_billing: true,
      sms_notifications: true,
      lead_scoring: true,
      nps_surveys: true,
      hubspot_integration: true,
    },
  },
  enterprise: {
    max_leads_per_month: 999999,
    max_service_types: 999999,
    max_users: 999999,
    features: {
      recurring_billing: true,
      sms_notifications: true,
      lead_scoring: true,
      nps_surveys: true,
      hubspot_integration: true,
      custom_integrations: true,
      dedicated_support: true,
    },
  },
} as const;
