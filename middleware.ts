import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Middleware proxy handler (Next.js 16+ convention)
 * 
 * Migrated from deprecated middleware file convention to proxy pattern.
 * Protects admin routes by checking authentication before allowing access.
 *
 * - If a request targets /admin/* and the user is not authenticated,
 *   redirect to /login with a callbackUrl back to the original page.
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const { nextUrl } = request;

  if (nextUrl.pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


