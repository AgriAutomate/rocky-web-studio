import { ContactForm } from "@/components/contact-form";
import { HeroSection } from "@/components/hero-section";
import { PricingTable } from "@/components/pricing-table";
import { ServicesGrid } from "@/components/services-grid";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { VeteranOwnedCallout } from "@/components/veteran-owned-callout";

export default function Home() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 md:gap-20 md:py-16 lg:px-12">
        <HeroSection />
        <VeteranOwnedCallout />
        <ServicesGrid />
        <TestimonialsCarousel />
        <PricingTable />
        <ContactForm />
      </main>
      <footer className="mt-16 bg-slate-900 py-8 text-gray-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-6 lg:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Rocky Web Studio
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>Rockhampton, QLD</span>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <a
              href="mailto:martin@rockywebstudio.com.au"
              className="text-white hover:text-teal-300"
            >
              martin@rockywebstudio.com.au
            </a>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <span>© {currentYear} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}