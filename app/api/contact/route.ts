/**
 * Contact Form API Route
 * Week 6.1: Enhanced Contact Form
 * 
 * Handles contact form submissions with:
 * - Form validation
 * - Honeypot spam prevention
 * - Rate limiting
 * - Lead storage in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/supabase/leads';
import type { LeadCreate } from '@/types/lead';

// Simple in-memory rate limiting (for production, use Redis or Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  // Reset after 1 hour
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return true;
  }
  
  // Max 5 submissions per hour per IP
  if (limit.count >= 5) {
    return false;
  }
  
  limit.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  // Try various headers for IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0];
    if (firstIP) {
      return firstIP.trim();
    }
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback (shouldn't happen in production)
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Honeypot field - if filled, it's a bot
    if (body.website || body.url || body.website_url) {
      // Silently reject (don't let bots know they were caught)
      return NextResponse.json(
        { success: true, message: 'Thank you for your message!' },
        { status: 200 }
      );
    }
    
    // Validation
    const { name, email, company, budget, message } = body;
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name.' },
        { status: 400 }
      );
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }
    
    // Create lead in database
    const leadData: LeadCreate = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || undefined,
      project_type: budget || undefined, // Using budget as project_type
      message: message?.trim() || undefined,
      source: 'contact form',
      status: 'new',
    };
    
    try {
      await createLead(leadData);
      
      // TODO: Send email notification (Week 6.2 or later)
      // TODO: Send auto-reply to customer (Week 6.2 or later)
      
      return NextResponse.json(
        { success: true, message: 'Thank you for your message! We\'ll get back to you soon.' },
        { status: 200 }
      );
    } catch (error) {
      console.error('[SERVER] Error creating lead:', error);
      
      // Don't expose database errors to client
      return NextResponse.json(
        { error: 'Something went wrong. Please try again or email martin@rockywebstudio.com.au' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[SERVER] Contact form error:', error);
    
    return NextResponse.json(
      { error: 'Invalid request. Please check your input and try again.' },
      { status: 400 }
    );
  }
}

