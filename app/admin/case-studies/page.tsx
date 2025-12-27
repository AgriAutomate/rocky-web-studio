"use client";

/**
 * Admin Case Studies List Page
 * 
 * Displays all case studies with filtering, sorting, and quick actions
 * Protected by admin role middleware
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
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
import type { CaseStudy } from "@/types/case-study";

export default function AdminCaseStudiesPage() {
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const loadCaseStudies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/case-studies");
      if (!response.ok) throw new Error("Failed to load case studies");
      const data = await response.json();
      setCaseStudies(data);
    } catch (error) {
      console.error("Error loading case studies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete case study");

      // Remove from local state
      setCaseStudies(caseStudies.filter((cs) => cs.id !== id));
    } catch (error) {
      console.error("Error deleting case study:", error);
      alert("Failed to delete case study. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCaseStudies = caseStudies.filter((cs) => {
    const matchesSearch =
      searchQuery === "" ||
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cs.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || cs.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: CaseStudy["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            <Eye className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            <EyeOff className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20">
            Archived
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: CaseStudy["category"]) => {
    if (!category) return null;
    const colors: Record<string, string> = {
      accessibility: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      ai: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      cms: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      general: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };
    return (
      <Badge className={colors[category] || colors.general}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Case Studies</h1>
          <p className="text-muted-foreground mt-1">
            Manage your case studies and showcase your work
          </p>
        </div>
        <Link href="/admin/case-studies/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Case Study
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search case studies"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filter by status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label="Filter by category">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="accessibility">Accessibility</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="cms">CMS</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading case studies...</p>
          </CardContent>
        </Card>
      ) : filteredCaseStudies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No case studies found</h3>
            <p className="text-muted-foreground mb-4">
              {caseStudies.length === 0
                ? "Get started by creating your first case study"
                : "Try adjusting your filters"}
            </p>
            {caseStudies.length === 0 && (
              <Link href="/admin/case-studies/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Case Study
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCaseStudies.map((caseStudy) => (
            <Card key={caseStudy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold">{caseStudy.title}</h2>
                      {caseStudy.featured && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Featured
                        </Badge>
                      )}
                      {getStatusBadge(caseStudy.status)}
                      {getCategoryBadge(caseStudy.category)}
                    </div>
                    {caseStudy.excerpt && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {caseStudy.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(caseStudy.created_at).toLocaleDateString()}
                      </span>
                      {caseStudy.published_at && (
                        <span>
                          Published:{" "}
                          {new Date(caseStudy.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/case-studies/${caseStudy.id}`}>
                      <Button variant="outline" size="sm" aria-label={`Edit ${caseStudy.title}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(caseStudy.id)}
                      disabled={deletingId === caseStudy.id}
                      aria-label={`Delete ${caseStudy.title}`}
                    >
                      {deletingId === caseStudy.id ? (
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

