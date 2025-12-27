import { NextResponse } from "next/server";

/**
 * Debug endpoint to check if required auth environment variables are set
 * Remove this file after debugging is complete
 */
export const dynamic = 'force-dynamic'; // Ensure this is a dynamic route

export async function GET() {
  const adminPasswordSet = !!process.env.ADMIN_PASSWORD;
  const adminPasswordLength = process.env.ADMIN_PASSWORD?.length || 0;
  const authSecretSet = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const authSecretLength = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.length || 0;
  const authSecretSource = process.env.AUTH_SECRET ? 'AUTH_SECRET' : (process.env.NEXTAUTH_SECRET ? 'NEXTAUTH_SECRET' : 'none');

  const issues: string[] = [];
  if (!adminPasswordSet) {
    issues.push("ADMIN_PASSWORD is NOT set - this will cause login failures");
  }
  if (!authSecretSet) {
    issues.push("AUTH_SECRET or NEXTAUTH_SECRET is NOT set - this will cause authentication configuration errors");
  }

  return NextResponse.json({
    adminPassword: {
      set: adminPasswordSet,
      length: adminPasswordLength,
    },
    authSecret: {
      set: authSecretSet,
      length: authSecretLength,
      source: authSecretSource,
    },
    allConfigured: adminPasswordSet && authSecretSet,
    issues: issues.length > 0 ? issues : ["All required environment variables are set"],
    message: issues.length > 0 
      ? `Configuration issues found: ${issues.join(", ")}`
      : "All authentication environment variables are properly configured",
    note: "Remove this endpoint after debugging",
  });
}

