import ServiceHero from "@/components/services/ServiceHero";
import { getPricingTiers } from "@/lib/config/pricing";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import ServiceCtaBand from "@/components/services/ServiceCtaBand";

export default function SeoPerformancePage() {
  const features = [
    {
      icon: "🔍",
      title: "Technical SEO Audit",
      description:
        "Identify crawl issues, metadata gaps, schema needs, and redirect problems.",
    },
    {
      icon: "⚡",
      title: "Core Web Vitals",
      description:
        "Improve LCP, FID, and CLS through smarter asset loading and code splitting.",
    },
    {
      icon: "🛠️",
      title: "On-page Optimization",
      description:
        "Meta titles, descriptions, heading structures, and internal links aligned with your keywords.",
    },
    {
      icon: "🗺️",
      title: "Structured Data",
      description:
        "Schema markup for products, FAQs, articles, events, and more to earn rich results.",
    },
    {
      icon: "📡",
      title: "Monitoring & Alerts",
      description:
        "Automated PageSpeed and uptime monitoring so issues are caught early.",
    },
    {
      icon: "📊",
      title: "Reporting & Insights",
      description:
        "GA4 + Search Console dashboards that highlight traffic, rankings, and performance trends.",
    },
  ];

  // Get pricing from centralized configuration
  const pricingTiers = getPricingTiers('seo-performance');

  const process = [
    {
      step: "01",
      title: "Audit & Baseline",
      description:
        "Collect metrics, crawl data, and user insights to understand current performance.",
    },
    {
      step: "02",
      title: "Plan & Prioritize",
      description:
        "Translate findings into an actionable roadmap ranked by impact and effort.",
    },
    {
      step: "03",
      title: "Implement & Monitor",
      description:
        "Ship improvements, verify in PageSpeed Insights/Search Console, and track metrics.",
    },
    {
      step: "04",
      title: "Report & Iterate",
      description:
        "Share clear reports, update stakeholders, and keep iterating as algorithms evolve.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">📈</span>}
        subtitle="Services"
        title="SEO & Performance Optimization"
        description="Technical SEO, Core Web Vitals, and speed optimizations that keep your site ranking and loading fast."
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
        title="Boost performance without guesswork."
        description="Share your latest metrics and we’ll map the fixes that move the needle."
      />
    </>
  );
}
