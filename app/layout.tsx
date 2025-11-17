import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Rocky Web Studio | Bold web experiences for ambitious teams",
  description:
    "Rocky Web Studio blends strategy, design, and engineering to ship premium marketing sites, dashboards, and commerce experiences.",
  openGraph: {
    title: "Rocky Web Studio",
    description:
      "Strategy, design, and engineering partners for high-velocity product teams.",
    url: "https://rocky-web-studio.vercel.app",
    siteName: "Rocky Web Studio",
    images: [
      {
        url: "/og-rocky-web-studio.png",
        width: 1200,
        height: 630,
        alt: "Rocky Web Studio showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rocky Web Studio",
    description:
      "Boutique studio crafting bold digital experiences with Next.js.",
    images: ["/og-rocky-web-studio.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}