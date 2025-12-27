/**
 * Case Study Grid Component
 * 
 * Displays case studies in a responsive grid layout
 * WCAG 2.1 AA compliant
 */

import { CaseStudyCard } from "./CaseStudyCard";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyGridProps {
  caseStudies: CaseStudy[];
  emptyMessage?: string;
}

export function CaseStudyGrid({
  caseStudies,
  emptyMessage = "No case studies found.",
}: CaseStudyGridProps) {
  if (caseStudies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {caseStudies.map((caseStudy) => (
        <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
      ))}
    </div>
  );
}

