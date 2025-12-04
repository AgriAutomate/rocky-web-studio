import type { NextAuthConfig } from "next-auth";

/**
 * Base NextAuth configuration shared between route handlers and middleware.
 */
const authConfig: Partial<NextAuthConfig> = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // 8 hours
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    /**
     * High-level authorization callback used by `auth()` in middleware.
     * We additionally enforce redirects in `middleware.ts`, but this
     * ensures non-admin access to /admin is rejected at the auth layer.
     */
    authorized({ auth, request }) {
      const { nextUrl } = request;

      if (nextUrl.pathname.startsWith("/admin")) {
        return !!auth?.user;
      }

      // Public routes are allowed by default.
      return true;
    },
  },
};

export default authConfig;


