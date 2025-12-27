/**
 * Individual Case Study Page
 * 
 * Public page displaying a single case study
 * Server component with dynamic SEO metadata
 */

import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCaseStudyBySlug, getPublishedCaseStudies } from "@/lib/supabase/case-studies";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const caseStudies = await getPublishedCaseStudies();
  return caseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
  }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return {
      title: "Case Study Not Found | Rocky Web Studio",
    };
  }

  const metadata: Metadata = {
    title: `${caseStudy.meta_title || caseStudy.title} | Rocky Web Studio`,
    description: caseStudy.meta_description || caseStudy.excerpt || undefined,
    keywords: caseStudy.meta_keywords || undefined,
    openGraph: {
      title: caseStudy.meta_title || caseStudy.title,
      description: caseStudy.meta_description || caseStudy.excerpt || undefined,
      type: "article",
      images: caseStudy.hero_image_url
        ? [
            {
              url: caseStudy.hero_image_url,
              width: 1200,
              height: 630,
              alt: caseStudy.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: caseStudy.meta_title || caseStudy.title,
      description: caseStudy.meta_description || caseStudy.excerpt || undefined,
      images: caseStudy.hero_image_url ? [caseStudy.hero_image_url] : undefined,
    },
  };

  return metadata;
}

function MetricsDisplay({
  label,
  metrics,
}: {
  label: string;
  metrics: CaseStudy["before_metrics"] | CaseStudy["after_metrics"];
}) {
  if (!metrics) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, value]) => {
          if (typeof value !== "number") return null;
          return (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialSection({ caseStudy }: { caseStudy: CaseStudy }) {
  if (!caseStudy.testimonial_text) return null;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <blockquote className="text-lg italic mb-4">
          &ldquo;{caseStudy.testimonial_text}&rdquo;
        </blockquote>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-semibold">
              {caseStudy.testimonial_author}
              {caseStudy.testimonial_author_role && (
                <span className="text-muted-foreground font-normal">
                  , {caseStudy.testimonial_author_role}
                </span>
              )}
            </div>
            {caseStudy.testimonial_company && (
              <div className="text-sm text-muted-foreground">
                {caseStudy.testimonial_company}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-16">
        <Link
          href="/case-studies"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Case Studies
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {caseStudy.category && (
                <Badge className={getCategoryColor(caseStudy.category)}>
                  {caseStudy.category}
                </Badge>
              )}
              {caseStudy.featured && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Featured
                </Badge>
              )}
              {caseStudy.published_at && (
                <time
                  dateTime={caseStudy.published_at}
                  className="text-sm text-muted-foreground"
                >
                  {new Date(caseStudy.published_at).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {caseStudy.title}
            </h1>

            {caseStudy.excerpt && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {caseStudy.excerpt}
              </p>
            )}
          </header>

          {/* Hero Image */}
          {caseStudy.hero_image_url && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={caseStudy.hero_image_url}
                alt={caseStudy.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          )}

          {/* Metrics Comparison */}
          {(caseStudy.before_metrics || caseStudy.after_metrics) && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Results</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <MetricsDisplay label="Before" metrics={caseStudy.before_metrics} />
                  <MetricsDisplay label="After" metrics={caseStudy.after_metrics} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {caseStudy.content && (
              <div className="case-study-content">
                {typeof caseStudy.content === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: caseStudy.content }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(caseStudy.content, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Images Gallery */}
          {caseStudy.images && caseStudy.images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          <TestimonialSection caseStudy={caseStudy} />

          {/* CTA Section */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
              <p className="text-muted-foreground mb-6">
                Let's discuss how we can help you achieve similar results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/questionnaire">
                  <Button size="lg">
                    Get Started
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
}

