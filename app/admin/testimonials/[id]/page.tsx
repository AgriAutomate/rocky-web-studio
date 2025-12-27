"use client";

/**
 * Admin Edit Testimonial Page
 * 
 * Page for editing existing testimonials
 * Protected by admin role middleware
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminTestimonialForm } from "@/components/AdminTestimonialForm";
import type { Testimonial, TestimonialUpdate } from "@/types/testimonial";

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestimonial();
  }, [id]);

  const loadTestimonial = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/testimonials/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Testimonial not found");
        } else {
          setError("Failed to load testimonial");
        }
        return;
      }

      const data = await response.json();
      setTestimonial(data);
    } catch (error) {
      console.error("Error loading testimonial:", error);
      setError("Failed to load testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: TestimonialUpdate) => {
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update testimonial");
    }

    await loadTestimonial();
  };

  const handleCancel = () => {
    router.push("/admin/testimonials");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading testimonial...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !testimonial) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error || "Testimonial not found"}</p>
            <Link href="/admin/testimonials">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Testimonials
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/admin/testimonials">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Testimonials
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Testimonial</h1>
        <p className="text-muted-foreground mt-1">
          Update testimonial details
        </p>
      </div>

      <AdminTestimonialForm
        testimonial={testimonial}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

