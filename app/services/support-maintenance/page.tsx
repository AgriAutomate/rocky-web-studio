import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

export default function SupportMaintenancePage() {
  const features = [
    {
      icon: "🛡️",
      title: "Security Updates",
      description:
        "Apply patches, monitor vulnerabilities, and keep dependencies current.",
    },
    {
      icon: "♻️",
      title: "Content & Component Updates",
      description:
        "Add new sections, landing pages, and tweaks without launching a new project.",
    },
    {
      icon: "🗂️",
      title: "Backups & Recovery",
      description:
        "Automated daily backups with tested restore plans for peace of mind.",
    },
    {
      icon: "🚨",
      title: "Uptime & Monitoring",
      description:
        "Proactive uptime checks and performance alerts so you stay ahead of issues.",
    },
    {
      icon: "💬",
      title: "Direct Support",
      description:
        "Email or Slack channels with guaranteed response times from the core team.",
    },
    {
      icon: "📄",
      title: "Monthly Reporting",
      description:
        "Summaries of completed work, site health, and recommendations for the next cycle.",
    },
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "$200/mo",
      description: "Small sites needing essential care",
      features: [
        "Security & plugin updates",
        "Monthly backups",
        "Email support",
        "2 hours of requests",
      ],
    },
    {
      name: "Professional",
      price: "$500/mo",
      description: "Most popular retainer",
      features: [
        "Weekly updates & monitoring",
        "Content edits + landing pages",
        "Shared Slack channel",
        "6 hours of requests",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$1,000+/mo",
      description: "High-touch support for complex stacks",
      features: [
        "Priority on-call support",
        "Custom SLA & escalation",
        "Dedicated engineer time",
        "10+ hours of requests",
      ],
    },
  ];

  const process = [
    {
      step: "01",
      title: "Onboarding & Audit",
      description:
        "Access, hosting, and stack review plus a health check to baseline your site.",
    },
    {
      step: "02",
      title: "Monthly Playbook",
      description:
        "Plan recurring tasks, security updates, and backlog items with clear priorities.",
    },
    {
      step: "03",
      title: "Execution & Communication",
      description:
        "Ship updates weekly, share Loom recaps, and keep everything transparent in a shared board.",
    },
    {
      step: "04",
      title: "Review & Adjust",
      description:
        "Monthly reporting plus quarterly planning to ensure the retainer continues to fit.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🛠️</span>}
        subtitle="Services"
        title="Ongoing Support & Maintenance"
        description="Security updates, backups, and content changes handled by the same team who builds your site."
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
          <h2 className="text-3xl font-bold mb-4">Keep your site healthy.</h2>
          <p className="text-xl mb-8 opacity-90">
            Tell us about your current maintenance load and we’ll reserve a plan that fits.
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

