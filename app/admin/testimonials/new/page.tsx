"use client";

/**
 * Admin Create Testimonial Page
 * 
 * Page for creating new testimonials
 * Protected by admin role middleware
 */

import { useRouter } from "next/navigation";
import { AdminTestimonialForm } from "@/components/AdminTestimonialForm";
import type { TestimonialCreate } from "@/types/testimonial";

export default function NewTestimonialPage() {
  const router = useRouter();

  const handleSubmit = async (data: TestimonialCreate) => {
    const response = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create testimonial");
    }

    const testimonial = await response.json();
    router.push(`/admin/testimonials/${testimonial.id}`);
  };

  const handleCancel = () => {
    router.push("/admin/testimonials");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Testimonial</h1>
        <p className="text-muted-foreground mt-1">
          Add a new client testimonial
        </p>
      </div>

      <AdminTestimonialForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

