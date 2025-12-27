/**
 * Case Study Card Component
 * 
 * Displays a case study in card format for listings
 * WCAG 2.1 AA compliant
 */

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const getCategoryColor = (category: CaseStudy["category"]) => {
    const colors: Record<string, string> = {
      accessibility: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      ai: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      cms: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      general: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };
    return colors[category || "general"] || colors.general;
  };

  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      aria-label={`View case study: ${caseStudy.title}`}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        {caseStudy.hero_image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={caseStudy.hero_image_url}
              alt={caseStudy.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-semibold line-clamp-2 flex-1">
              {caseStudy.title}
            </h3>
            {caseStudy.featured && (
              <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
                Featured
              </Badge>
            )}
          </div>

          {caseStudy.excerpt && (
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {caseStudy.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {caseStudy.category && (
              <Badge className={getCategoryColor(caseStudy.category)}>
                {caseStudy.category}
              </Badge>
            )}
            {caseStudy.published_at && (
              <span className="text-sm text-muted-foreground">
                {new Date(caseStudy.published_at).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

