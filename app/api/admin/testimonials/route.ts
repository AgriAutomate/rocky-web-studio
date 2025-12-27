/**
 * Admin Testimonials API Route
 * 
 * GET: List all testimonials (admin only)
 * POST: Create new testimonial (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllTestimonials, createTestimonial } from "@/lib/supabase/testimonials";
import type { TestimonialCreate } from "@/types/testimonial";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonials = await getAllTestimonials();
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: TestimonialCreate = await request.json();
    const userId = session.user?.id || undefined;

    // Validate required fields
    if (!body.client_name || !body.content) {
      return NextResponse.json(
        { error: "Client name and content are required" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const testimonial = await createTestimonial(body, userId);
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

