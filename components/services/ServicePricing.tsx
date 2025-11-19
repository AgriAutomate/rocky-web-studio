interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

interface ServicePricingProps {
  tiers: PricingTier[];
}

export default function ServicePricing({ tiers }: ServicePricingProps) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Choose the package that fits your needs
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-lg ${
                tier.highlighted
                  ? "bg-blue-600 text-white shadow-2xl scale-105"
                  : "bg-white border"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="text-4xl font-bold mb-2">{tier.price}</div>
              <p
                className={`mb-6 ${
                  tier.highlighted ? "text-blue-100" : "text-gray-600"
                }`}
              >
                {tier.description}
              </p>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/book"
                className={`block text-center py-3 rounded-lg font-semibold transition ${
                  tier.highlighted
                    ? "bg-white text-blue-600 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

