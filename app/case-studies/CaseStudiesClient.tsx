"use client";

/**
 * Client Component for Case Studies Page
 * 
 * Handles filtering and search on the client side
 */

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseStudyGrid } from "@/components/CaseStudyGrid";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudiesClientProps {
  initialCaseStudies: CaseStudy[];
}

export function CaseStudiesClient({
  initialCaseStudies,
}: CaseStudiesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredCaseStudies = useMemo(() => {
    return initialCaseStudies.filter((cs) => {
      const matchesSearch =
        searchQuery === "" ||
        cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || cs.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [initialCaseStudies, searchQuery, categoryFilter]);

  const categories = Array.from(
    new Set(
      initialCaseStudies
        .map((cs) => cs.category)
        .filter((cat): cat is NonNullable<typeof cat> => cat !== null)
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search case studies"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCaseStudies.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {filteredCaseStudies.length} of {initialCaseStudies.length}{" "}
            case studies
          </p>
          <CaseStudyGrid caseStudies={filteredCaseStudies} />
        </>
      ) : (
        <CaseStudyGrid
          caseStudies={[]}
          emptyMessage={
            searchQuery || categoryFilter !== "all"
              ? "No case studies match your filters. Try adjusting your search."
              : "No case studies available at this time."
          }
        />
      )}
    </div>
  );
}

