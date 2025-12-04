import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and smoke tests
 * 
 * GET /api/health
 * 
 * Returns 200 OK if service is healthy
 */
export async function GET(): Promise<NextResponse> {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "rocky-web-studio",
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
  };

  return NextResponse.json(health, { status: 200 });
}

