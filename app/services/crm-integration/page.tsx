import ServiceHero from "@/components/services/ServiceHero";
import { getPricingTiers } from "@/lib/config/pricing";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import ServiceCtaBand from "@/components/services/ServiceCtaBand";

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

  // Get pricing from centralized configuration
  const pricingTiers = getPricingTiers('crm-integration');

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
        title="Every lead routed perfectly."
        description="Share your current stack and we’ll scope the integration plan."
      />
    </>
  );
}

