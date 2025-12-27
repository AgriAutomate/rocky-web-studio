/**
 * Admin Leads API Route
 * Week 6.2: Lead Management Admin
 * 
 * GET: List all leads (admin only)
 * POST: Not used (leads created via /api/contact)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllLeads, searchLeads, getLeadsByStatus } from '@/lib/supabase/leads';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    let leads;
    
    if (search) {
      // Search by name or email
      leads = await searchLeads(search);
    } else if (status && status !== 'all') {
      // Filter by status
      leads = await getLeadsByStatus(status as any);
    } else {
      // Get all leads
      leads = await getAllLeads();
    }
    
    return NextResponse.json(leads);
  } catch (error) {
    console.error('[SERVER] Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

