import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSessionRevoked } from "@/lib/auth/session";
import { getLogger } from "@/lib/logging";

const sessionLogger = getLogger("auth.session");

export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const sessionId = (session as any).sessionId as string | undefined;

  if (await isSessionRevoked(sessionId)) {
    sessionLogger.warn("Revoked session used", {
      sessionId,
      userEmail: session.user?.email,
    });
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        email: session.user?.email,
        name: session.user?.name,
      },
      sessionId,
    },
    { status: 200 }
  );
}


