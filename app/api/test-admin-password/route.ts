import { NextResponse } from "next/server";

/**
 * Debug endpoint to check if ADMIN_PASSWORD is set
 * Remove this file after debugging is complete
 */
export async function GET() {
  const adminPasswordSet = !!process.env.ADMIN_PASSWORD;
  const adminPasswordLength = process.env.ADMIN_PASSWORD?.length || 0;

  return NextResponse.json({
    adminPasswordSet,
    adminPasswordLength,
    message: adminPasswordSet
      ? "ADMIN_PASSWORD is set (length hidden for security)"
      : "ADMIN_PASSWORD is NOT set - this will cause login failures",
    note: "Remove this endpoint after debugging",
  });
}

