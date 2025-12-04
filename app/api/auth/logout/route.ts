import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revokeSession } from "@/lib/auth/session";
import { getLogger } from "@/lib/logging";

const logoutLogger = getLogger("auth.logout");

export async function POST() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const sessionId = (session as any).sessionId as string | undefined;

  await revokeSession(sessionId);

  logoutLogger.info("Session revoked via logout", {
    sessionId,
    userEmail: session.user?.email,
  });

  // Cookie clearing is handled by NextAuth signOut on the client side.
  return NextResponse.json({ success: true }, { status: 200 });
}


