import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ServiceCTAProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function ServiceCTA({
  title,
  description,
  primaryLabel = "Book a consultation",
  primaryHref = "/book",
  secondaryLabel = "See recent work",
  secondaryHref = "/#projects",
}: ServiceCTAProps) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-500 p-8 text-white shadow-lg md:p-12">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em]">
          Ready when you are
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
        <p className="text-base text-teal-50 md:text-lg">{description}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/40 bg-transparent text-white hover:bg-white/10"
        >
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </section>
  );
}

