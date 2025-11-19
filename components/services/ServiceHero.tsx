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
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-6">
          {icon}
        </div>
        <div className="text-sm uppercase tracking-wide text-blue-600 font-semibold mb-2">
          {subtitle}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        <a
          href={ctaHref}
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

