import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";

const ADMIN_EMAIL = "admin@rockywebstudio.com.au";

/**
 * NextAuth.js v5 entrypoint.
 *
 * Exports:
 * - auth   : server-side helper (used in middleware)
 * - signIn : client/server helper
 * - signOut: client/server helper
 * - handlers: { GET, POST } for /api/auth
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;
        if (email !== ADMIN_EMAIL) return null;

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          console.error(
            "[auth] ADMIN_PASSWORD environment variable is not set"
          );
          return null;
        }

        if (password !== adminPassword) return null;

        // Minimal admin user object
        return {
          id: "admin",
          email: ADMIN_EMAIL,
          name: "Rocky Web Studio Admin",
          role: "admin",
        };
      },
    }),
  ],
});


