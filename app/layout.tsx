import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { BackButton } from "@/components/ui/back-button";
import { Navigation } from "@/components/navigation";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import SentryInit from "./sentry-init";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://rockywebstudio.com.au"
  ),
  title: {
    default: "Rocky Web Studio | WCAG 2.1 AA Compliant Web Development",
    template: "%s | Rocky Web Studio",
  },
  description:
    "Specialized web development agency creating accessible, high-performance digital solutions. WCAG 2.1 AA compliant websites, AI integration, and modern tech stack. Based in Queensland, Australia.",
  keywords: [
    "web development",
    "accessibility",
    "WCAG 2.1 AA",
    "Next.js",
    "TypeScript",
    "Queensland",
    "Australia",
    "government contracts",
    "accessible websites",
    "digital transformation",
  ],
  authors: [{ name: "Rocky Web Studio" }],
  creator: "Rocky Web Studio",
  publisher: "Rocky Web Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://rockywebstudio.com.au",
    siteName: "Rocky Web Studio",
    title: "Rocky Web Studio | WCAG 2.1 AA Compliant Web Development",
    description:
      "Specialized web development agency creating accessible, high-performance digital solutions for government and enterprise clients.",
    images: [
      {
        url: "/og-rocky-web-studio.png",
        width: 1200,
        height: 630,
        alt: "Rocky Web Studio - Accessible Web Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rocky Web Studio | WCAG 2.1 AA Compliant Web Development",
    description:
      "Specialized web development agency creating accessible, high-performance digital solutions.",
    images: ["/og-rocky-web-studio.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification if available
    // google: "verification-code-here",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SentryInit />
        <Navigation />
        <BackButton />
        {children}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
        <AIAssistantWidget />
      </body>
    </html>
  );
}