import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

export default function CrmIntegrationPage() {
  const features = [
    {
      icon: "📥",
      title: "Form-to-CRM Pipelines",
      description:
        "Clean data hand-offs from web forms, chat, and lead magnets directly into HubSpot, Salesforce, or Pipedrive.",
    },
    {
      icon: "⚙️",
      title: "Lead Routing & Scoring",
      description:
        "Assign leads to the right reps, add scoring logic, and trigger alerts so warm opportunities aren’t missed.",
    },
    {
      icon: "🔗",
      title: "Automation & Workflows",
      description:
        "Build sequences that kick off emails, tasks, or Slack notifications the moment a lead converts.",
    },
    {
      icon: "🧹",
      title: "Data Hygiene",
      description:
        "Field mapping, deduplication, and enrichment so your CRM stays trustworthy.",
    },
    {
      icon: "📊",
      title: "Dashboards & Reporting",
      description:
        "Deal pipelines, attribution dashboards, and revenue reports tailored to your leadership team.",
    },
    {
      icon: "🎓",
      title: "Team Training",
      description:
        "Documentation, Loom walkthroughs, and live training so marketing and sales stay aligned.",
    },
  ];

  const pricingTiers = [
    {
      name: "Basic Integration",
      price: "$1,200",
      description: "Ideal for linking a new form to your CRM",
      features: [
        "Form + webhook configuration",
        "Field mapping & validation",
        "Lead notifications",
        "Documentation handoff",
      ],
    },
    {
      name: "Advanced Routing",
      price: "$2,500",
      description: "Full lead workflows and automations",
      features: [
        "Multi-source lead capture",
        "Routing + scoring logic",
        "Slack/email alert setup",
        "Analytics dashboard",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise RevOps",
      price: "$5,000+",
      description: "Complex pipelines or multi-team deployments",
      features: [
        "Custom API + middleware",
        "Attribution + reporting suite",
        "Sales enablement assets",
        "Launch + training support",
      ],
    },
  ];

  const process = [
    {
      step: "01",
      title: "Funnel Mapping",
      description:
        "Document every lead source, form, and CRM object to understand current state.",
    },
    {
      step: "02",
      title: "Configure & Connect",
      description:
        "Set up APIs, middleware, and automations with proper authentication and logging.",
    },
    {
      step: "03",
      title: "Test & Train",
      description:
        "Run test submissions, validate data, and teach your team how to manage the flow.",
    },
    {
      step: "04",
      title: "Launch & Optimize",
      description:
        "Monitor the pipeline, add reporting, and tweak routing rules as your team scales.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🔗</span>}
        subtitle="Services"
        title="CRM Integration"
        description="Connect your website to HubSpot, Salesforce, Pipedrive, or custom CRMs with reliable data flows and automation."
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
          <h2 className="text-3xl font-bold mb-4">Every lead routed perfectly.</h2>
          <p className="text-xl mb-8 opacity-90">
            Share your current stack and we’ll scope the integration plan.
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

