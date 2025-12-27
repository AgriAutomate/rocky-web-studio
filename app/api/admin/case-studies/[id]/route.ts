/**
 * Admin Case Study API Route (Single)
 * 
 * GET: Get case study by ID (admin only)
 * PUT: Update case study (admin only)
 * DELETE: Delete case study (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
} from "@/lib/supabase/case-studies";
import type { CaseStudyUpdate } from "@/types/case-study";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const caseStudy = await getCaseStudyById(id);
    if (!caseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error("Error fetching case study:", error);
    return NextResponse.json(
      { error: "Failed to fetch case study" },
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

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: CaseStudyUpdate = await request.json();
    const userId = session.user?.id || null;

    // Set published_at if status is being changed to published
    if (body.status === "published" && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const caseStudy = await updateCaseStudy(id, body, userId);
    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error("Error updating case study:", error);
    return NextResponse.json(
      { error: "Failed to update case study" },
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

    if (!session || userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteCaseStudy(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case study:", error);
    return NextResponse.json(
      { error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}

