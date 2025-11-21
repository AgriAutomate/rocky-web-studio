import { NextResponse } from "next/server";
import { CreditsResult, fetchMobileMessageCredits } from "@/lib/mobile-message/credits";

export async function GET(): Promise<NextResponse<CreditsResult>> {
  const result = await fetchMobileMessageCredits();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}

