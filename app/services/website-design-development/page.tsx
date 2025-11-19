import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

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

  const pricingTiers = [
    {
      name: "Starter Site",
      price: "$2,500",
      description: "Perfect for new businesses",
      features: [
        "5 custom pages",
        "Responsive design",
        "Contact forms",
        "Basic SEO setup",
        "CMS integration",
        "2 rounds of revisions",
      ],
    },
    {
      name: "Professional",
      price: "$5,000",
      description: "Most popular choice",
      features: [
        "10 custom pages",
        "Advanced animations",
        "Blog/news system",
        "Advanced SEO",
        "Analytics setup",
        "3 rounds of revisions",
        "30 days post-launch support",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$10,000+",
      description: "For complex projects",
      features: [
        "15+ custom pages",
        "Custom functionality",
        "Multi-language support",
        "Advanced integrations",
        "Performance optimization",
        "Unlimited revisions",
        "90 days post-launch support",
      ],
    },
  ];

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
      <section className="py-16 px-6 bg-white">
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

      {/* CTA Section */}
      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Book a free consultation to discuss your project
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

