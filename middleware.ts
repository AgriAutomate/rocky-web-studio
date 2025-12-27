import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Middleware proxy handler (Next.js 16+ convention)
 * 
 * Migrated from deprecated middleware file convention to proxy pattern.
 * Protects private routes by checking authentication before allowing access.
 *
 * - If a request targets /admin/* or /consciousness/* and the user is not authenticated,
 *   redirect to /login with a callbackUrl back to the original page.
 * - If a request targets /api/consciousness/* and the user is not authenticated,
 *   return 401 JSON.
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const { nextUrl } = request;

  const isAdmin = nextUrl.pathname.startsWith("/admin");
  const isConsciousnessPage = nextUrl.pathname.startsWith("/consciousness");
  const isConsciousnessApi = nextUrl.pathname.startsWith("/api/consciousness");

  if (isConsciousnessApi && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role for admin routes
  if (isAdmin) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has admin role
    const userRole = (session?.user as any)?.role;
    if (userRole !== "admin") {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isConsciousnessPage && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/consciousness/:path*", "/api/consciousness/:path*"],
};


