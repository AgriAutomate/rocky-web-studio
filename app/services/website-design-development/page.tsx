import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import ServiceCtaBand from "@/components/services/ServiceCtaBand";
import { getPricingTiers } from "@/lib/config/pricing";

export default function WebsiteDesignPage() {
  const features = [
    {
      icon: "🎨",
      title: "Custom Design Systems",
      description:
        "Unique visual identities that match your brand and resonate with your audience.",
    },
    {
      icon: "📱",
      title: "Responsive Layouts",
      description:
        "Perfect experiences across desktop, tablet, and mobile devices.",
    },
    {
      icon: "📄",
      title: "5-15 Page Builds with CMS",
      description:
        "Content management systems that let you update your site with ease.",
    },
    {
      icon: "⚡",
      title: "Modern Frameworks",
      description: "Built with Next.js and React for lightning-fast performance.",
    },
    {
      icon: "🔍",
      title: "Foundational SEO",
      description:
        "Technical setup for better search engine visibility from day one.",
    },
    {
      icon: "♿",
      title: "Accessibility First",
      description: "WCAG compliant designs that everyone can use.",
    },
  ];

  // Get pricing from centralized configuration
  const pricingTiers = getPricingTiers('website-design-development');

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🎨</span>}
        subtitle="Services"
        title="Website Design & Development"
        description="Professional, responsive websites built with modern frameworks. From small business sites to complex web applications, we create digital experiences that convert visitors into customers."
      />

      <ServiceFeatures features={features} />

      <ServicePricing tiers={pricingTiers} />

      {/* Process Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Discovery & Planning",
                description:
                  "We start with a workshop to understand your goals, audience, and brand.",
              },
              {
                step: "02",
                title: "Design & Prototyping",
                description:
                  "Create wireframes and high-fidelity designs for your approval.",
              },
              {
                step: "03",
                title: "Development",
                description:
                  "Build your site using modern, performant technologies.",
              },
              {
                step: "04",
                title: "Testing & Launch",
                description:
                  "Rigorous testing across devices, then deploy to your domain.",
              },
            ].map((item) => (
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
        title="Ready to Get Started?"
        description="Book a free consultation to discuss your project"
      />
    </>
  );
}

