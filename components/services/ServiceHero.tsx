import { type ReactNode } from "react";

interface ServiceHeroProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function ServiceHero({
  icon,
  title,
  subtitle,
  description,
  ctaText = "Book Consultation",
  ctaHref = "/book",
}: ServiceHeroProps) {
  return (
    <section className="bg-gradient-to-br from-background via-brand-soft to-accent py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block rounded-full bg-card p-4 shadow-lg mb-6">
          {icon}
        </div>
        <div className="text-sm uppercase tracking-wide text-primary font-semibold mb-2">
          {subtitle}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          {title}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        <a
          href={ctaHref}
          className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition shadow-lg"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

