/**
 * Testimonials Page
 * 
 * Public page displaying all published testimonials
 * Server component with SEO optimization
 */

import { Metadata } from "next";
import { getPublishedTestimonials } from "@/lib/supabase/testimonials";
import { TestimonialCard } from "@/components/TestimonialCard";
import type { Testimonial } from "@/types/testimonial";

export const metadata: Metadata = {
  title: "Testimonials | Rocky Web Studio",
  description:
    "Read what our clients have to say about working with Rocky Web Studio. Real testimonials from businesses we've helped achieve their goals.",
  keywords: [
    "testimonials",
    "client reviews",
    "customer feedback",
    "Rocky Web Studio",
    "web development testimonials",
  ],
  openGraph: {
    title: "Testimonials | Rocky Web Studio",
    description: "Read what our clients have to say about working with us.",
    type: "website",
  },
};

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  
  try {
    testimonials = await getPublishedTestimonials();
  } catch (error: any) {
    // Handle case where testimonials table doesn't exist yet
    if (error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      console.warn('Testimonials table not found. Please run the migration: supabase/migrations/20250127_create_testimonials_table.sql');
    } else {
      console.error('Error loading testimonials:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Client Testimonials</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            See what our clients have to say about working with Rocky Web Studio.
            Real feedback from businesses we've helped achieve their goals.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No testimonials available at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

