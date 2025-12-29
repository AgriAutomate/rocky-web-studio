/**
 * Admin Capacity Monitoring API
 * 
 * Provides capacity monitoring data for admin dashboard.
 * Requires admin authentication.
 */

import { NextResponse } from "next/server";
import { generateCapacityReport, needsImmediateAttention } from "@/lib/utils/capacity-monitor";
import { getTodayUsageStats, getUsageHistory } from "@/lib/utils/perplexity-usage-tracker";

export const runtime = "nodejs";

/**
 * GET /api/admin/capacity
 * 
 * Returns comprehensive capacity report for admin dashboard
 */
export async function GET() {
  try {
    // TODO: Add admin authentication check
    // const supabase = createServerSupabaseClient(true);
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Generate capacity report
    const capacityReport = await generateCapacityReport();

    // Get Perplexity usage stats
    const perplexityStats = await getTodayUsageStats();
    const perplexityHistory = await getUsageHistory(30); // Last 30 days

    // Check if immediate attention needed
    const attentionCheck = await needsImmediateAttention();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      capacity: capacityReport,
      perplexity: {
        today: perplexityStats,
        history: perplexityHistory,
      },
      alerts: {
        needsAttention: attentionCheck.needsAttention,
        criticalAlerts: attentionCheck.alerts,
      },
    });
  } catch (error) {
    console.error("Admin capacity API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate capacity report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

