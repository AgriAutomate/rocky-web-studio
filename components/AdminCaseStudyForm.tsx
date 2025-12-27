"use client";

/**
 * Admin Case Study Form Component
 * 
 * Reusable form for creating and editing case studies
 * WCAG 2.1 AA compliant
 */

import { useState, useEffect } from "react";
import { Loader2, Save, X } from "lucide-react";
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
import type { CaseStudy, CaseStudyCreate, CaseStudyUpdate } from "@/types/case-study";

interface AdminCaseStudyFormProps {
  caseStudy?: CaseStudy;
  onSubmit: (data: CaseStudyCreate | CaseStudyUpdate) => Promise<void>;
  onCancel?: () => void;
}

export function AdminCaseStudyForm({
  caseStudy,
  onSubmit,
  onCancel,
}: AdminCaseStudyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CaseStudyCreate>({
    title: "",
    slug: "",
    excerpt: "",
    content: null,
    category: null,
    featured: false,
    status: "draft",
    published_at: null,
    before_metrics: null,
    after_metrics: null,
    hero_image_url: "",
    images: null,
    testimonial_text: "",
    testimonial_author: "",
    testimonial_company: "",
    testimonial_author_role: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: [],
  });

  useEffect(() => {
    if (caseStudy) {
      setFormData({
        title: caseStudy.title,
        slug: caseStudy.slug,
        excerpt: caseStudy.excerpt || "",
        content: caseStudy.content,
        category: caseStudy.category || null,
        featured: caseStudy.featured,
        status: caseStudy.status,
        published_at: caseStudy.published_at || null,
        before_metrics: caseStudy.before_metrics || null,
        after_metrics: caseStudy.after_metrics || null,
        hero_image_url: caseStudy.hero_image_url || "",
        images: caseStudy.images || null,
        testimonial_text: caseStudy.testimonial_text || "",
        testimonial_author: caseStudy.testimonial_author || "",
        testimonial_company: caseStudy.testimonial_company || "",
        testimonial_author_role: caseStudy.testimonial_author_role || "",
        meta_title: caseStudy.meta_title || "",
        meta_description: caseStudy.meta_description || "",
        meta_keywords: caseStudy.meta_keywords || [],
      });
    }
  }, [caseStudy]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = caseStudy
        ? ({ ...formData, id: caseStudy.id } as CaseStudyUpdate)
        : (formData as CaseStudyCreate);

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save case study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div>
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
              aria-required="true"
              pattern="[a-z0-9-]+"
              title="Slug must contain only lowercase letters, numbers, and hyphens"
            />
            <p className="text-sm text-muted-foreground mt-1">
              URL-friendly identifier (e.g., "ai-assistant-chatbot")
            </p>
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              rows={3}
              aria-describedby="excerpt-help"
            />
            <p id="excerpt-help" className="text-sm text-muted-foreground mt-1">
              Short description shown in listings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as CaseStudy["category"],
                  }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as CaseStudy["status"],
                  }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured case study
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Content (JSON)</Label>
            <Textarea
              id="content"
              value={
                formData.content
                  ? JSON.stringify(formData.content, null, 2)
                  : ""
              }
              onChange={(e) => {
                try {
                  const parsed = e.target.value
                    ? JSON.parse(e.target.value)
                    : null;
                  setFormData((prev) => ({ ...prev, content: parsed }));
                } catch {
                  // Invalid JSON, keep as is for now
                }
              }}
              rows={10}
              className="font-mono text-sm"
              aria-describedby="content-help"
            />
            <p id="content-help" className="text-sm text-muted-foreground mt-1">
              Portable Text or Markdown stored as JSON
            </p>
          </div>

          <div>
            <Label htmlFor="hero_image_url">Hero Image URL</Label>
            <Input
              id="hero_image_url"
              type="url"
              value={formData.hero_image_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hero_image_url: e.target.value,
                }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="before_metrics">Before Metrics (JSON)</Label>
            <Textarea
              id="before_metrics"
              value={
                formData.before_metrics
                  ? JSON.stringify(formData.before_metrics, null, 2)
                  : ""
              }
              onChange={(e) => {
                try {
                  const parsed = e.target.value
                    ? JSON.parse(e.target.value)
                    : null;
                  setFormData((prev) => ({ ...prev, before_metrics: parsed }));
                } catch {
                  // Invalid JSON
                }
              }}
              rows={5}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="after_metrics">After Metrics (JSON)</Label>
            <Textarea
              id="after_metrics"
              value={
                formData.after_metrics
                  ? JSON.stringify(formData.after_metrics, null, 2)
                  : ""
              }
              onChange={(e) => {
                try {
                  const parsed = e.target.value
                    ? JSON.parse(e.target.value)
                    : null;
                  setFormData((prev) => ({ ...prev, after_metrics: parsed }));
                } catch {
                  // Invalid JSON
                }
              }}
              rows={5}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testimonial_text">Testimonial Text</Label>
            <Textarea
              id="testimonial_text"
              value={formData.testimonial_text || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  testimonial_text: e.target.value,
                }))
              }
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testimonial_author">Author Name</Label>
              <Input
                id="testimonial_author"
                value={formData.testimonial_author || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    testimonial_author: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="testimonial_company">Company</Label>
              <Input
                id="testimonial_company"
                value={formData.testimonial_company || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    testimonial_company: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="testimonial_author_role">Author Role</Label>
            <Input
              id="testimonial_author_role"
              value={formData.testimonial_author_role || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  testimonial_author_role: e.target.value,
                }))
              }
              placeholder="e.g., CEO, Marketing Director"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
            <Input
              id="meta_keywords"
              value={
                formData.meta_keywords
                  ? formData.meta_keywords.join(", ")
                  : ""
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_keywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter((k) => k),
                }))
              }
              placeholder="keyword1, keyword2, keyword3"
            />
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
              {caseStudy ? "Update" : "Create"} Case Study
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

