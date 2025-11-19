import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

export default function AiAutomationPage() {
  const features = [
    {
      icon: "🤖",
      title: "Chatbot Embeds",
      description:
        "Add branded chat experiences powered by Intercom, Typebot, or custom GPT assistants.",
    },
    {
      icon: "🔁",
      title: "Workflow Automation",
      description:
        "Zapier, Make, or n8n workflows that move data between marketing, sales, and ops tools.",
    },
    {
      icon: "🧠",
      title: "Knowledge Base Prep",
      description:
        "Structure FAQs, policies, and support docs so AI tools answer accurately.",
    },
    {
      icon: "🔌",
      title: "Integration & APIs",
      description:
        "Connect AI services with CRMs, form captures, and project tools via secure APIs.",
    },
    {
      icon: "✅",
      title: "Governance & Compliance",
      description:
        "Vendor vetting, permissioning, and data handling guidelines to keep IT confident.",
    },
    {
      icon: "🤝",
      title: "Partner Network",
      description:
        "When bespoke AI/ML is required, we collaborate with vetted specialists and stay looped in.",
    },
  ];

  const pricingTiers = [
    {
      name: "Chatbot Setup",
      price: "$1,500",
      description: "Launch a helpful assistant fast",
      features: [
        "Tool selection + configuration",
        "Knowledge base mapping",
        "Brand styling + embed",
        "Team training session",
      ],
    },
    {
      name: "Automation Suite",
      price: "$3,500",
      description: "Multiple workflows & hand-offs",
      features: [
        "Process mapping workshop",
        "3–5 automations implemented",
        "Documentation + runbooks",
        "30 days of support",
      ],
      highlighted: true,
    },
    {
      name: "Bespoke AI",
      price: "Custom",
      description: "Advanced integrations or LLM projects",
      features: [
        "Stakeholder workshops",
        "Solution architecture",
        "Partner coordination",
        "Measurement + iteration plan",
      ],
    },
  ];

  const process = [
    {
      step: "01",
      title: "Assess & Prioritize",
      description:
        "Review current workflows, tools, and compliance requirements to identify quick wins.",
    },
    {
      step: "02",
      title: "Design & Prototype",
      description:
        "Select platforms, map data flows, and pilot the experience with a small user group.",
    },
    {
      step: "03",
      title: "Build & Integrate",
      description:
        "Implement automations, connect APIs, and document SOPs so the team can manage them.",
    },
    {
      step: "04",
      title: "Measure & Improve",
      description:
        "Track usage, gather feedback, and iterate—or bring in trusted partners for advanced needs.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🧠</span>}
        subtitle="Services"
        title="AI & Automation Support"
        description="Introduce practical AI assistants and automation workflows that save time without creating technical debt."
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
          <h2 className="text-3xl font-bold mb-4">Ship useful AI, not science projects.</h2>
          <p className="text-xl mb-8 opacity-90">
            Tell us where your team is losing time—we’ll design automations that stick.
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

