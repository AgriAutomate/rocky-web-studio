/**
 * Case Studies List Page
 * 
 * Public page displaying all published case studies
 * Server component with SEO optimization
 */

import { Metadata } from "next";
import { getPublishedCaseStudies } from "@/lib/supabase/case-studies";
import { CaseStudiesClient } from "./CaseStudiesClient";

export const metadata: Metadata = {
  title: "Case Studies | Rocky Web Studio",
  description:
    "Explore our portfolio of successful web development projects. See how we've helped businesses improve accessibility, implement AI solutions, and build custom CMS platforms.",
  keywords: [
    "case studies",
    "web development portfolio",
    "accessibility projects",
    "AI implementation",
    "CMS development",
    "Rocky Web Studio",
  ],
  openGraph: {
    title: "Case Studies | Rocky Web Studio",
    description:
      "Explore our portfolio of successful web development projects.",
    type: "website",
  },
};

export default async function CaseStudiesPage() {
  const caseStudies = await getPublishedCaseStudies();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Case Studies</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore our portfolio of successful projects. See how we've helped
            businesses achieve their goals through innovative web solutions.
          </p>
        </div>

        <CaseStudiesClient initialCaseStudies={caseStudies} />
      </main>
    </div>
  );
}

