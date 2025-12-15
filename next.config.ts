import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Fix: ensure Turbopack resolves workspace root correctly on Windows/Cursor setups.
    // Without this, Next may infer `app/` as root and fail to locate `next/package.json`.
    root: path.join(__dirname),
  },
  images: {
    // Suppress "unconfigured qualities" warnings when using quality={95} for hero imagery.
    qualities: [70, 75, 95],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Wrap Next.js config with Sentry
export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  silent: true, // Suppress source map uploading logs during build
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Upload source maps to Sentry
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
