import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

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

  const pricingTiers = [
    {
      name: "SEO Audit",
      price: "$800",
      description: "Technical deep dive + prioritized roadmap",
      features: [
        "Full site crawl & Core Web Vitals report",
        "SEO scorecard + competitor review",
        "Prioritized backlog of fixes",
        "Review workshop",
      ],
    },
    {
      name: "Full Optimization",
      price: "$2,500",
      description: "We implement the critical improvements",
      features: [
        "Core Web Vitals remediation",
        "Structured data + metadata updates",
        "Performance budget setup",
        "Analytics + reporting configuration",
      ],
      highlighted: true,
    },
    {
      name: "Ongoing",
      price: "$5,000+",
      description: "Monthly technical SEO & performance support",
      features: [
        "Continuous monitoring",
        "Content collaboration",
        "Quarterly strategy reviews",
        "Dedicated Slack + support hours",
      ],
    },
  ];

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

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="space-y-8">
            {process.map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="text-5xl font-bold text-gray-200">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Boost performance without guesswork.</h2>
          <p className="text-xl mb-8 opacity-90">
            Share your latest metrics and we’ll map the fixes that move the needle.
          </p>
          <a
            href="/book"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Book Free Consultation
          </a>
        </div>
      </section>
    </>
  );
}
