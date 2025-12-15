import Link from "next/link";
import {
  Bot,
  LifeBuoy,
  LineChart,
  RefreshCw,
  Share2,
  ShoppingBag,
    Music,
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
    accent: "bg-accent text-primary",
    href: "/services/website-design-development",
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
    accent: "bg-accent text-primary",
    href: "/services/website-redesign-refresh",
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
    accent: "bg-accent text-primary",
    href: "/services/ecommerce",
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
    accent: "bg-accent text-primary",
    href: "/services/seo-performance",
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
    accent: "bg-muted text-foreground",
    href: "/services/support-maintenance",
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
    accent: "bg-accent text-primary",
    href: "/services/ai-automation",
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
    accent: "bg-accent text-primary",
    href: "/services/crm-integration",
  },
    {
    title: "Custom AI Songs",
    description:
      "AI-crafted, personally curated songs for weddings, birthdays, and special moments in Central Queensland.",
    icon: Music,
    bullets: [
      "Fast 24-48 hour turnaround available",
      "AI-generated with human creative direction",
      "Multiple formats (MP3, WAV, video)",
      "Wedding, birthday, anniversary packages",
    ],
    accent: "bg-accent text-primary",
    href: "/services/custom-songs",
  },
];

export function ServicesGrid() {
  return (
    <section
      id="services"
      className="space-y-6 rounded-[32px] border border-border bg-muted p-8 shadow-sm"
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
          <Link
            key={service.title}
            href={service.href}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="border border-border bg-card shadow-lg transition-transform group-hover:-translate-y-1">
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
          </Link>
        ))}
      </div>
      <div className="space-y-2 rounded-2xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
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
