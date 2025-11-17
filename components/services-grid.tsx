import {
  Bot,
  LifeBuoy,
  LineChart,
  RefreshCw,
  Share2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    title: "Website Design & Development",
    description:
      "Professional, responsive websites built with modern frameworks (Next.js, React).",
    icon: Sparkles,
    bullets: [
      "Custom design systems",
      "5–15 page builds with CMS",
      "Responsive layouts & forms",
      "Foundational SEO setup",
    ],
    accent: "bg-teal-50 text-teal-600",
  },
  {
    title: "Website Redesign & Refresh",
    description:
      "Modernize existing sites with updated visuals, code cleanup, and better mobile support.",
    icon: RefreshCw,
    bullets: [
      "Design refresh & UX polish",
      "Performance and accessibility tuning",
      "Mobile responsiveness",
      "Content migration support",
    ],
    accent: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "Basic E-Commerce",
    description:
      "Simple storefronts using Shopify or Stripe-powered checkouts for straightforward catalogs.",
    icon: ShoppingBag,
    bullets: [
      "Product detail pages",
      "Cart & checkout configuration",
      "Stripe/PayPal payments",
      "Basic inventory workflows",
    ],
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "SEO & Performance Optimization",
    description:
      "Technical SEO setup and performance tuning for faster load times and better rankings.",
    icon: LineChart,
    bullets: [
      "Meta data & sitemap configuration",
      "Schema markup implementation",
      "Image & asset optimization",
      "Core Web Vitals improvements",
    ],
    accent: "bg-blue-50 text-blue-600",
  },
  {
    title: "Ongoing Support & Maintenance",
    description:
      "Keep your site secure and current with flexible monthly support retainers.",
    icon: LifeBuoy,
    bullets: [
      "Security & dependency updates",
      "Content and component tweaks",
      "Backup and uptime monitoring",
      "1–2 business day response",
    ],
    accent: "bg-slate-50 text-slate-700",
  },
  {
    title: "AI & Automation Support",
    description:
      "Simple chatbot embeds and workflow automations. Custom AI development handled with partners.",
    icon: Bot,
    bullets: [
      "No-code chatbot integrations",
      "Form automation & routing",
      "Knowledge base hand-offs",
      "Partner referrals for bespoke AI",
    ],
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "CRM Integration",
    description:
      "Connect websites to existing CRM tools like HubSpot or Salesforce for lead routing.",
    icon: Share2,
    bullets: [
      "Form-to-CRM pipelines",
      "Lead enrichment hooks",
      "Sales notifications",
      "Collaboration with your ops team",
    ],
    accent: "bg-purple-50 text-purple-600",
  },
];

export function ServicesGrid() {
  return (
    <section
      id="services"
      className="space-y-6 rounded-[32px] border border-gray-100 bg-gray-50 p-8 shadow-sm"
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Services
        </p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Professional, reliable partners for the entire product journey.
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg">
          From the first workshop to post-launch iteration, we plug in where you
          need experienced support.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.title}
            className="border border-gray-200 bg-white shadow-lg"
          >
            <CardHeader className="flex flex-row items-start gap-4">
              <div className={`rounded-2xl p-3 ${service.accent}`}>
                <service.icon className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary/60" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm text-muted-foreground">
        <p>
          We specialize in professional websites and simple e-commerce. For
          complex applications, enterprise solutions, or specialized needs, we
          collaborate with trusted development partners to secure the right
          expertise.
        </p>
        <p>
          All timelines and pricing are estimates based on project scope. We&apos;ll
          provide a detailed quote after understanding your requirements.
        </p>
      </div>
    </section>
  );
}