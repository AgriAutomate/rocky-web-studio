/**
 * Testimonial Card Component
 * 
 * Displays a single testimonial in card format
 * WCAG 2.1 AA compliant
 */

import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/types/testimonial";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1 mb-3" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  return (
    <Card className={`h-full ${className || ""}`}>
      <CardContent className="p-6">
        {testimonial.rating && renderStars(testimonial.rating)}
        
        <blockquote className="text-lg mb-4 italic">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>

        <div className="flex items-center gap-4">
          {testimonial.client_image_url && (
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
              <Image
                src={testimonial.client_image_url}
                alt={testimonial.client_name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}
          <div>
            <div className="font-semibold">{testimonial.client_name}</div>
            {(testimonial.client_title || testimonial.client_company) && (
              <div className="text-sm text-muted-foreground">
                {testimonial.client_title}
                {testimonial.client_title && testimonial.client_company && " at "}
                {testimonial.client_company}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

