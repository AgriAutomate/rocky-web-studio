import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

export default function EcommercePage() {
  const features = [
    {
      icon: "🛒",
      title: "Product Catalog Setup",
      description:
        "Organize products, collections, and variants so shoppers find what they need fast.",
    },
    {
      icon: "💳",
      title: "Shopify & Stripe Integrations",
      description:
        "Secure payments with Stripe, Shopify Payments, PayPal, and buy-now-pay-later options.",
    },
    {
      icon: "🔄",
      title: "Inventory & Fulfillment",
      description:
        "Stock tracking, order flows, and shipping rules that match your operational reality.",
    },
    {
      icon: "📦",
      title: "Checkout Experiences",
      description:
        "Optimized cart and checkout funnels with abandoned cart recovery baked in.",
    },
    {
      icon: "📈",
      title: "Analytics & Reporting",
      description:
        "GA4, Shopify analytics, and dashboards that highlight sales performance.",
    },
    {
      icon: "🎓",
      title: "Team Training",
      description:
        "Hands-on training so your staff can add products, run promos, and fulfill orders confidently.",
    },
  ];

  const pricingTiers = [
    {
      name: "Basic Shop",
      price: "$2,000",
      description: "Perfect for small catalogs",
      features: [
        "Shopify theme customization",
        "Up to 25 products",
        "Payment + shipping setup",
        "1 automation workflow",
      ],
    },
    {
      name: "Professional",
      price: "$4,500",
      description: "Growing stores with custom needs",
      features: [
        "Advanced merchandising",
        "Custom sections & landing pages",
        "Subscriptions or bundles",
        "Analytics + reporting setup",
      ],
      highlighted: true,
    },
    {
      name: "Custom Commerce",
      price: "$8,000+",
      description: "Headless or bespoke builds",
      features: [
        "Next.js storefront",
        "ERP / fulfillment integrations",
        "Complex catalogs & filters",
        "Ongoing optimization support",
      ],
    },
  ];

  const process = [
    {
      step: "01",
      title: "Discovery & Catalog Planning",
      description:
        "We map out your products, fulfillment workflows, and tech stack requirements.",
    },
    {
      step: "02",
      title: "Design & Storefront Setup",
      description:
        "Craft branded storefronts, product detail pages, and conversion-focused customer journeys.",
    },
    {
      step: "03",
      title: "Integrations & QA",
      description:
        "Connect payments, shipping, and automation tools, then run test orders end-to-end.",
    },
    {
      step: "04",
      title: "Launch & Training",
      description:
        "Deploy the store, monitor first-week sales, and train your team to manage daily operations.",
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🛍️</span>}
        subtitle="Services"
        title="Basic E-Commerce"
        description="Shopify and Stripe storefronts that make selling online simple—from catalogs and checkout to fulfillment and analytics."
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
          <h2 className="text-3xl font-bold mb-4">
            Ready to launch your store?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            We’ll review your catalog, fulfillment rules, and growth goals.
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

