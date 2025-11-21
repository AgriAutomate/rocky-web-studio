import { NextResponse } from "next/server";
import { GET as reminderHandler } from "@/app/api/notifications/send-reminder/route";

export async function GET(request: Request) {
  return reminderHandler(new Request(request.url));
}

