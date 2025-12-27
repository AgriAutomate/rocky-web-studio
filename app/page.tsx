import { ContactForm } from "@/components/contact-form";
import { HeroSection } from "@/components/hero-section";
import { PricingTable } from "@/components/pricing-table";
import { ServicesGrid } from "@/components/services-grid";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { VeteranOwnedCallout } from "@/components/veteran-owned-callout";
import { CustomSongsBanner } from "@/components/custom-songs-banner";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rocky Web Studio | WCAG 2.1 AA Compliant Web Development",
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
  openGraph: {
    title: "Rocky Web Studio | WCAG 2.1 AA Compliant Web Development",
    description:
      "Specialized web development agency creating accessible, high-performance digital solutions for government and enterprise clients.",
    url: "https://rockywebstudio.com.au",
    siteName: "Rocky Web Studio",
    locale: "en_AU",
    type: "website",
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
  alternates: {
    canonical: "https://rockywebstudio.com.au",
  },
};

export default function Home() {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rocky Web Studio',
    url: 'https://rockywebstudio.com.au',
    logo: 'https://rockywebstudio.com.au/images/rws-logo-transparent.png',
    description: 'Specialized web development agency creating accessible, high-performance digital solutions. WCAG 2.1 AA compliant websites.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
      addressRegion: 'QLD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'martin@rockywebstudio.com.au',
    },
    sameAs: [
      'https://github.com/AgriAutomate/rocky-web-studio',
    ],
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
    serviceType: [
      'Web Development',
      'Accessibility Services',
      'WCAG 2.1 AA Compliance',
      'AI Integration',
      'Digital Transformation',
    ],
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 md:gap-20 md:py-16 lg:px-12">
          <HeroSection />
          <VeteranOwnedCallout />
          <CustomSongsBanner />
          <ServicesGrid />
          <TestimonialsCarousel />
          <PricingTable />
          <ContactForm />
        </main>
        <Footer />
      </div>
    </>
  );
}












