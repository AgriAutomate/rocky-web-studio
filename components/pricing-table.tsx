import { Check, Sparkle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Foundations",
    price: "Pricing available upon consultation",
    cadence: "Based on project scope",
    description:
      "Brand strategy, UX flows, and component library starter set.",
    features: [
      "Focused discovery intensive",
      "UX prototypes & user flows",
      "Lightweight design system",
      "Implementation playbook",
    ],
    cta: "Book discovery call",
  },
  {
    name: "Scale",
    price: "Pricing available upon consultation",
    cadence: "Based on project scope",
    description:
      "End-to-end product squads on demand for structured delivery cycles.",
    features: [
      "Dedicated PM + design + eng pod",
      "Priority async collaboration",
      "Regular QA & lighthouse reports",
      "Iterative revisions during sprint",
    ],
    highlighted: true,
    cta: "Reserve a pod",
  },
  {
    name: "Embedded",
    price: "Pricing available upon consultation",
    cadence: "Based on project scope",
    description: "On-call leadership across product, data, and engineering.",
    features: [
      "Principal-level leads in house",
      "Dedicated incident & launch support",
      "Fractional CTO & design director",
      "Experimentation & analytics crew",
    ],
    cta: "Join the waitlist",
  },
];

export function PricingTable() {
  return (
    <section
      id="pricing"
      className="space-y-6 rounded-[32px] border border-gray-100 bg-gray-50 p-8"
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Pricing
        </p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Flexible engagements built for momentum.
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg">
          We scope by outcomes, not billable hours. Each sprint ships planned
          milestones with senior oversight.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "border border-gray-200 bg-white shadow-lg",
              plan.highlighted &&
                "border-teal-500 shadow-[0_10px_40px_rgba(20,184,166,0.25)]"
            )}
          >
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.cadence}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.cta === "Book discovery call" ? (
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  <Link href="/book">
                    {plan.highlighted ? <Sparkle className="mr-2 size-4" /> : null}
                    {plan.cta}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.highlighted ? <Sparkle className="mr-2 size-4" /> : null}
                  {plan.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        All prices are listed in AUD and subject to project requirements. Pricing
        varies based on project scope.
      </p>
    </section>
  );
}