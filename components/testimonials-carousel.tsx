import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TestimonialsCarousel() {
  return (
    <section
      id="testimonials"
      className="space-y-6 rounded-[32px] bg-white p-8 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Testimonials
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Case studies in development.
        </h2>
      </div>
      <Card className="border border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle>Client testimonials available upon request.</CardTitle>
          <CardDescription>
            We provide references and outcome summaries once we confirm fit and
            confidentiality requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Ask during our intro call for relevant case studies across SaaS,
            civic, and regional business engagements.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}