import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "Missing RESEND_API_KEY"),
  SUPABASE_URL: z.string().url("Invalid SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  CALENDLY_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
/**
 * Environment Variable Type Definitions
 * 
 * Provides type safety for process.env access throughout the application.
 * Extend this interface as new environment variables are added.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Stripe Configuration
      STRIPE_SECRET_KEY?: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;

      // Mobile Message SMS API Configuration
      MOBILE_MESSAGE_API_URL?: string;
      MOBILE_MESSAGE_API_USERNAME?: string;
      MOBILE_MESSAGE_API_PASSWORD?: string;
      MOBILE_MESSAGE_SENDER_ID?: string;

      // Resend Email API
      RESEND_API_KEY?: string;

      // Google Analytics
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;

      // Public URL
      NEXT_PUBLIC_URL?: string;

      // Database (optional)
      DATABASE_URL?: string;

      // Other environment variables (NODE_ENV is already defined by Next.js)
    }
  }
}

/**
 * Validated Mobile Message API Configuration
 * 
 * Use this type when you need to ensure all Mobile Message API
 * environment variables are set.
 */
export interface MobileMessageConfig {
  apiUrl: string;
  username: string;
  password: string;
  senderId: string;
}

/**
 * Validate and retrieve Mobile Message API configuration
 * 
 * @throws {Error} If any required environment variable is missing
 * @returns Validated Mobile Message API configuration
 */
export function getMobileMessageConfig(): MobileMessageConfig {
  const apiUrl = process.env.MOBILE_MESSAGE_API_URL || "https://api.mobilemessage.com.au/v1";
  const username = process.env.MOBILE_MESSAGE_API_USERNAME;
  const password = process.env.MOBILE_MESSAGE_API_PASSWORD;
  const senderId = process.env.MOBILE_MESSAGE_SENDER_ID;

  if (!username) {
    throw new Error(
      "MOBILE_MESSAGE_API_USERNAME environment variable is required. " +
      "Please set it in your .env.local file."
    );
  }

  if (!password) {
    throw new Error(
      "MOBILE_MESSAGE_API_PASSWORD environment variable is required. " +
      "Please set it in your .env.local file."
    );
  }

  if (!senderId) {
    throw new Error(
      "MOBILE_MESSAGE_SENDER_ID environment variable is required. " +
      "Please set it in your .env.local file. " +
      "The sender ID must be registered and active in your Mobile Message dashboard."
    );
  }

  return {
    apiUrl: apiUrl.trim().replace(/\/+$/, ""), // Remove trailing slashes
    username,
    password,
    senderId,
  };
}

/**
 * Check if Mobile Message API is configured
 * 
 * @returns true if all required environment variables are set
 */
export function isMobileMessageConfigured(): boolean {
  return !!(
    process.env.MOBILE_MESSAGE_API_USERNAME &&
    process.env.MOBILE_MESSAGE_API_PASSWORD &&
    process.env.MOBILE_MESSAGE_SENDER_ID
  );
}

// Export empty object to make this a module
export {};

