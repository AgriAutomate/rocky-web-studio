import { ContactForm } from "@/components/contact-form";
import { HeroSection } from "@/components/hero-section";
import { PricingTable } from "@/components/pricing-table";
import { ServicesGrid } from "@/components/services-grid";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { VeteranOwnedCallout } from "@/components/veteran-owned-callout";
import { CustomSongsBanner } from "@/components/custom-songs-banner";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
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
  );
}












