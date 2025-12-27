"use client";

/**
 * Testimonial Carousel Component
 * 
 * Displays testimonials in a carousel/slider format
 * WCAG 2.1 AA compliant with keyboard navigation
 */

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "./TestimonialCard";
import type { Testimonial } from "@/types/testimonial";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  rotateInterval?: number; // milliseconds
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoRotate = true,
  rotateInterval = 5000,
  className = "",
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
          role="region"
          aria-label="Testimonials carousel"
          aria-live="polite"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="min-w-full px-2"
              role="group"
              aria-roledescription="slide"
              aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {testimonials.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Testimonial navigation">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-selected={index === currentIndex}
                role="tab"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

