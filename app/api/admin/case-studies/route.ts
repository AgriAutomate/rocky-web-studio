/**
 * Admin Case Studies API Route
 * 
 * GET: List all case studies (admin only)
 * POST: Create new case study (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllCaseStudies, createCaseStudy } from "@/lib/supabase/case-studies";
import type { CaseStudyCreate } from "@/types/case-study";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseStudies = await getAllCaseStudies();
    return NextResponse.json(caseStudies);
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return NextResponse.json(
      { error: "Failed to fetch case studies" },
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

    const body: CaseStudyCreate = await request.json();
    const userId = session.user?.id || null;

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Set published_at if status is published
    if (body.status === "published" && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const caseStudy = await createCaseStudy(body, userId);
    return NextResponse.json(caseStudy, { status: 201 });
  } catch (error) {
    console.error("Error creating case study:", error);
    return NextResponse.json(
      { error: "Failed to create case study" },
      { status: 500 }
    );
  }
}

