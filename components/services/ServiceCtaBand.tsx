import Link from "next/link";
import { Button } from "@/components/ui/button";

type ServiceCtaBandProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function ServiceCtaBand({
  title,
  description,
  ctaLabel = "Book Free Consultation",
  ctaHref = "/book",
}: ServiceCtaBandProps) {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-brand-from to-brand-to text-brand-foreground">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl mb-8 opacity-90">{description}</p>
        <Button
          asChild
          size="lg"
          className="bg-card text-primary hover:bg-card/90"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}

