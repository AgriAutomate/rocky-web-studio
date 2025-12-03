import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Global middleware to protect admin routes.
 *
 * - If a request targets /admin/* and the user is not authenticated,
 *   redirect to /login with a callbackUrl back to the original page.
 */
export default auth((request) => {
  const isLoggedIn = !!request.auth;
  const { nextUrl } = request;

  if (nextUrl.pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};


