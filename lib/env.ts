import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "Missing RESEND_API_KEY"),
  SUPABASE_URL: z.string().url("Invalid SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  CALENDLY_URL: z.string().url().optional(),
});

// Lazy validation - only validate when env is accessed, not at module load
let _env: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (_env) {
    return _env;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const missingVars = Object.keys(errors).filter((key): key is keyof typeof errors => {
      const errorArray = errors[key as keyof typeof errors];
      return errorArray !== undefined && errorArray.length > 0;
    });
    
    // eslint-disable-next-line no-console
    console.error("❌ Invalid environment configuration:", errors);
    
    // In production build/runtime, throw immediately (fail fast)
    // BUT: During Next.js build phase, we might not have env vars set locally
    // So we check if we're in actual runtime (not build) by checking for Vercel-specific vars
    const isVercelRuntime = !!(
      process.env.VERCEL || 
      process.env.VERCEL_ENV || 
      (process.env.NODE_ENV === "production" && process.env.NEXT_RUNTIME)
    );
    
    if (isVercelRuntime) {
      // Actual production runtime - fail fast
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}. ` +
        `Please configure these in your Vercel project settings.`
      );
    }
    
    // During local build (npm run build), log warning but don't throw
    // This allows the build to complete - env vars will be set in Vercel
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `⚠️  Build-time warning: Missing environment variables: ${missingVars.join(", ")}. ` +
        `These must be set in Vercel project settings for the deployment to work. ` +
        `Continuing build...`
      );
      // Return empty object - Proxy will throw when accessed in actual runtime
      _env = { _missingVars: missingVars } as unknown as z.infer<typeof envSchema>;
      return _env;
    }
    
    // In development, store error info but don't throw yet
    // The Proxy getter will throw when properties are accessed, allowing route handler to catch
    // This prevents Next.js from rendering HTML error pages during module import
    console.warn(
      `⚠️  Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Please ensure .env.local exists and contains these variables. ` +
      `Restart the dev server after updating .env.local. ` +
      `The API will return JSON errors when these variables are accessed.`
    );
    
    // Store error info for Proxy getter to use
    // Return empty object - Proxy will throw on property access
    _env = { _missingVars: missingVars } as unknown as z.infer<typeof envSchema>;
    return _env;
  }

  _env = parsed.data;
  return _env;
}

// Export a Proxy that validates lazily on first property access
// This allows the route to import env without immediately throwing
// Validation only happens when a property is actually accessed (e.g., env.RESEND_API_KEY)
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop) {
    // Skip internal properties
    if (prop === "_missingVars" || prop === "toString" || prop === "valueOf") {
      return undefined;
    }
    
    const validated = getEnv();
    
    // Check if this is the error marker object from getEnv()
    if ("_missingVars" in validated && Array.isArray((validated as any)._missingVars)) {
      const missingVars = (validated as any)._missingVars as string[];
      const propName = String(prop);
      
      // In development, throw with helpful message (route handler will catch and return JSON)
      if (process.env.NODE_ENV !== "production") {
        throw new Error(
          `Environment variable ${propName} is not set. ` +
          `Missing variables: ${missingVars.join(", ")}. ` +
          `Please add them to .env.local and restart the dev server.`
        );
      }
      
      // In production, should have already thrown in getEnv(), but be safe
      throw new Error(
        `Environment variable ${propName} is not set. ` +
        `Please configure ${missingVars.join(", ")} in your Vercel project settings.`
      );
    }
    
    return validated[prop as keyof typeof validated];
  },
  has(_target, prop) {
    const validated = getEnv();
    return prop in validated;
  },
  ownKeys() {
    const validated = getEnv();
    return Object.keys(validated);
  },
});
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

