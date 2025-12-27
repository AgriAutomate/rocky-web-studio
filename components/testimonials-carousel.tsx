import { getFeaturedTestimonials } from "@/lib/supabase/testimonials";
import { TestimonialCarousel } from "./TestimonialCarousel";

export async function TestimonialsCarousel() {
  // Function now returns empty array on error instead of throwing
  // Check server console (terminal) for error details
  const testimonials = await getFeaturedTestimonials(5);

  if (testimonials.length === 0) {
    return (
      <section
        id="testimonials"
        className="space-y-6 rounded-[32px] bg-card p-8 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Testimonials
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            What Our Clients Say
          </h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>Testimonials coming soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      className="space-y-6 rounded-[32px] bg-card p-8 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Testimonials
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          What Our Clients Say
        </h2>
      </div>
      <TestimonialCarousel testimonials={testimonials} autoRotate={true} />
    </section>
  );
}