interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  packageValue?: string; // For Custom Songs: "standard", "express", "wedding"
  orderLink?: string; // Custom order link (e.g., "/services/custom-songs/order?package=standard")
}

interface ServicePricingProps {
  tiers: PricingTier[];
  defaultLink?: string; // Default link if orderLink not provided (defaults to "/book")
}

export default function ServicePricing({ tiers, defaultLink = "/book" }: ServicePricingProps) {
  return (
    <section className="py-16 px-6 bg-muted">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Transparent Pricing
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Choose the package that fits your needs
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-lg ${
                tier.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl scale-105"
                  : "bg-card border border-border"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-2">
                <div className={`text-4xl font-bold ${
                  tier.highlighted ? "text-primary-foreground" : "text-primary"
                }`}>
                  {tier.price}
                </div>
                <div className={`text-sm mt-1 ${
                  tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  AUD
                </div>
              </div>
              <p
                className={`mb-6 ${
                  tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
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
                href={tier.orderLink || defaultLink}
                className={`block text-center py-3 rounded-lg font-semibold transition ${
                  tier.highlighted
                    ? "bg-card text-primary hover:bg-card/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
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

