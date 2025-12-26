import ServiceHero from "@/components/services/ServiceHero";
import { getPricingTiers } from "@/lib/config/pricing";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import ServiceCtaBand from "@/components/services/ServiceCtaBand";

export default function WebsiteRedesignPage() {
  const features = [
    {
      icon: "✨",
      title: "Design Refresh & UX Polish",
      description:
        "Modern UI improvements, typography, and layout refinements that align with today’s standards.",
    },
    {
      icon: "⚡",
      title: "Performance Optimization",
      description:
        "Faster load times, reduced bundle sizes, and improved Core Web Vitals.",
    },
    {
      icon: "📱",
      title: "Mobile Responsiveness",
      description:
        "Mobile-first design tweaks to ensure consistent experiences across devices.",
    },
    {
      icon: "📦",
      title: "Content Migration Support",
      description:
        "Structured plans to move your existing pages, assets, and blog posts safely.",
    },
    {
      icon: "♿",
      title: "Accessibility Improvements",
      description:
        "WCAG-aware updates that make your refreshed site usable for everyone.",
    },
    {
      icon: "📊",
      title: "Analytics & Tracking Setup",
      description:
        "Ensure GA4, Search Console, and other tracking tools stay accurate throughout the refresh.",
    },
  ];

  // Get pricing from centralized configuration
  const pricingTiers = getPricingTiers('website-redesign-refresh');

  const process = [
    {
      step: "01",
      title: "Site Audit",
      description:
        "Analyze current site performance and UX issues, including analytics, SEO, and accessibility findings.",
    },
    {
      step: "02",
      title: "Strategy & Design",
      description:
        "Develop a modernized design system, content plan, and prioritized roadmap for rollout.",
    },
    {
      step: "03",
      title: "Development & Migration",
      description:
        "Rebuild templates, migrate content, and clean up code across your stack or new platform.",
    },
    {
      step: "04",
      title: "Testing & Handoff",
      description:
        "QA across devices, analytics verification, and team training before launch.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🔄</span>}
        subtitle="Services"
        title="Website Redesign & Refresh"
        description="Modernize existing sites with updated visuals, improved performance, and better mobile support. Breathe new life into your online presence."
      />

      <ServiceFeatures features={features} />

      <ServicePricing tiers={pricingTiers} />

      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="space-y-8">
            {process.map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="text-5xl font-bold text-muted-foreground/25">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceCtaBand
        title="Need a Fresh Start?"
        description="Share your existing site and goals—let’s plan a refresh that fits your timeline."
      />
    </>
  );
}

