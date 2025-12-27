"use client";

/**
 * Admin Testimonials List Page
 * 
 * Displays all testimonials with filtering, sorting, and quick actions
 * Protected by admin role middleware
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Loader2,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Testimonial } from "@/types/testimonial";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/testimonials");
      if (!response.ok) throw new Error("Failed to load testimonials");
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete testimonial");

      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client_company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && t.published) ||
      (publishedFilter === "unpublished" && !t.published);
    return matchesSearch && matchesPublished;
  });

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">
            Manage client testimonials and social proof
          </p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Testimonial
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search testimonials"
              />
            </div>
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger aria-label="Filter by status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading testimonials...</p>
          </CardContent>
        </Card>
      ) : filteredTestimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No testimonials found</h3>
            <p className="text-muted-foreground mb-4">
              {testimonials.length === 0
                ? "Get started by creating your first testimonial"
                : "Try adjusting your filters"}
            </p>
            {testimonials.length === 0 && (
              <Link href="/admin/testimonials/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Testimonial
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold">{testimonial.client_name}</h2>
                      {testimonial.published ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                          <Eye className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                      {testimonial.rating && renderStars(testimonial.rating)}
                    </div>
                    {testimonial.client_title && testimonial.client_company && (
                      <p className="text-muted-foreground mb-2">
                        {testimonial.client_title} at {testimonial.client_company}
                      </p>
                    )}
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </span>
                      {testimonial.service_type && (
                        <Badge variant="outline">{testimonial.service_type}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/testimonials/${testimonial.id}`}>
                      <Button variant="outline" size="sm" aria-label={`Edit ${testimonial.client_name}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      disabled={deletingId === testimonial.id}
                      aria-label={`Delete ${testimonial.client_name}`}
                    >
                      {deletingId === testimonial.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

