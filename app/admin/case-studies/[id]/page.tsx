"use client";

/**
 * Admin Edit Case Study Page
 * 
 * Page for editing existing case studies
 * Protected by admin role middleware
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminCaseStudyForm } from "@/components/AdminCaseStudyForm";
import type { CaseStudy, CaseStudyUpdate } from "@/types/case-study";

export default function EditCaseStudyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCaseStudy();
  }, [id]);

  const loadCaseStudy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/case-studies/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Case study not found");
        } else {
          setError("Failed to load case study");
        }
        return;
      }

      const data = await response.json();
      setCaseStudy(data);
    } catch (error) {
      console.error("Error loading case study:", error);
      setError("Failed to load case study");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CaseStudyUpdate) => {
    const response = await fetch(`/api/admin/case-studies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update case study");
    }

    // Reload the case study to show updated data
    await loadCaseStudy();
  };

  const handleCancel = () => {
    router.push("/admin/case-studies");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading case study...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error || "Case study not found"}</p>
            <Link href="/admin/case-studies">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Case Studies
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
        <Link href="/admin/case-studies">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Case Study</h1>
        <p className="text-muted-foreground mt-1">
          Update case study details and content
        </p>
      </div>

      <AdminCaseStudyForm
        caseStudy={caseStudy}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

