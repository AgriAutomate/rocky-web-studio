import { NextRequest, NextResponse } from "next/server";
import { GET as reminderHandler } from "@/app/api/notifications/send-reminder/route";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return reminderHandler(request);
}

