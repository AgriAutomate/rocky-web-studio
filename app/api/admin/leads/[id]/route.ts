/**
 * Admin Leads API Route (by ID)
 * Week 6.2: Lead Management Admin
 * 
 * GET: Get lead by ID
 * PUT: Update lead (status, notes, etc.)
 * DELETE: Delete lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getLeadById, updateLead, deleteLead } from '@/lib/supabase/leads';
import type { LeadUpdate } from '@/types/lead';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const lead = await getLeadById(id);
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('[SERVER] Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const updates: LeadUpdate = {
      id,
      ...body,
    };
    
    const updatedLead = await updateLead(id, updates);
    
    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('[SERVER] Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    await deleteLead(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SERVER] Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

