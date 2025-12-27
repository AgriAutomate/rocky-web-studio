import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { getLogger } from "@/lib/logging";

const ADMIN_EMAIL = "admin@rockywebstudio.com.au";
const authLogger = getLogger("auth");

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
  callbacks: {
    ...(authConfig.callbacks ?? {}),
    async jwt({ token, user, account, profile, trigger, session }) {
      let nextToken: any = token;

      if (typeof authConfig.callbacks?.jwt === "function") {
        nextToken = await authConfig.callbacks.jwt({
          token,
          user,
          account,
          profile,
          trigger,
          session,
        } as any);
      }

      if (!nextToken.sessionId) {
        const base = user?.id ?? token.sub ?? "anonymous";
        nextToken.sessionId = `${base}-${Date.now()}`;
      }

      // Include user role in token (from authorize function)
      if (user?.role) {
        nextToken.role = user.role;
      }

      return nextToken;
    },
    async session({ session, token, user }) {
      let nextSession: any = session;

      if (typeof authConfig.callbacks?.session === "function") {
        nextSession = await authConfig.callbacks.session({
          session,
          token,
          user,
        } as any);
      }

      (nextSession as any).sessionId = (token as any).sessionId;
      
      // Include role in session from token
      if (token.role) {
        (nextSession.user as any).role = token.role;
      }

      return nextSession;
    },
  },
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
          authLogger.error("ADMIN_PASSWORD environment variable is not set");
          return null;
        }

        if (password !== adminPassword) {
          return null;
        }

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


