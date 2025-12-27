"use client";

/**
 * Admin Testimonial Form Component
 * 
 * Reusable form for creating and editing testimonials
 * WCAG 2.1 AA compliant
 */

import { useState, useEffect } from "react";
import { Loader2, Save, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Testimonial, TestimonialCreate, TestimonialUpdate } from "@/types/testimonial";

interface AdminTestimonialFormProps {
  testimonial?: Testimonial;
  onSubmit: (data: TestimonialCreate | TestimonialUpdate) => Promise<void>;
  onCancel?: () => void;
}

export function AdminTestimonialForm({
  testimonial,
  onSubmit,
  onCancel,
}: AdminTestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TestimonialCreate>({
    client_name: "",
    client_title: "",
    client_company: "",
    client_image_url: "",
    content: "",
    rating: undefined,
    service_type: undefined,
    case_study_id: undefined,
    published: false,
    display_order: 0,
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        client_name: testimonial.client_name,
        client_title: testimonial.client_title || "",
        client_company: testimonial.client_company || "",
        client_image_url: testimonial.client_image_url || "",
        content: testimonial.content,
        rating: testimonial.rating || undefined,
        service_type: testimonial.service_type || undefined,
        case_study_id: testimonial.case_study_id || undefined,
        published: testimonial.published,
        display_order: testimonial.display_order,
      });
    }
  }, [testimonial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = testimonial
        ? ({ ...formData, id: testimonial.id } as TestimonialUpdate)
        : (formData as TestimonialCreate);

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save testimonial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client_name">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, client_name: e.target.value }))
              }
              required
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_title">Client Title</Label>
              <Input
                id="client_title"
                value={formData.client_title || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_title: e.target.value }))
                }
                placeholder="e.g., CEO, Marketing Director"
              />
            </div>

            <div>
              <Label htmlFor="client_company">Company</Label>
              <Input
                id="client_company"
                value={formData.client_company || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_company: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client_image_url">Client Image URL</Label>
            <Input
              id="client_image_url"
              type="url"
              value={formData.client_image_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  client_image_url: e.target.value,
                }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonial Content */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonial Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={6}
              required
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Select
                value={formData.rating?.toString() || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: value ? parseInt(value) : undefined,
                  }))
                }
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No rating</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              {formData.rating && (
                <div className="mt-2">{renderStars(formData.rating)}</div>
              )}
            </div>

            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={formData.service_type || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    service_type: value as Testimonial["service_type"],
                  }))
                }
              >
                <SelectTrigger id="service_type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="cms">CMS</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published (visible on website)
            </Label>
          </div>

          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  display_order: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Lower numbers appear first. Use 0 for default ordering.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {testimonial ? "Update" : "Create"} Testimonial
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

