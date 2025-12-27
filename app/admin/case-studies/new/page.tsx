"use client";

/**
 * Admin Create Case Study Page
 * 
 * Page for creating new case studies
 * Protected by admin role middleware
 */

import { useRouter } from "next/navigation";
import { AdminCaseStudyForm } from "@/components/AdminCaseStudyForm";
import type { CaseStudyCreate, CaseStudyUpdate } from "@/types/case-study";

export default function NewCaseStudyPage() {
  const router = useRouter();

  const handleSubmit = async (data: CaseStudyCreate | CaseStudyUpdate) => {
    // For new page, we always create, so cast to CaseStudyCreate
    const createData = data as CaseStudyCreate;
    const response = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create case study");
    }

    const caseStudy = await response.json();
    router.push(`/admin/case-studies/${caseStudy.id}`);
  };

  const handleCancel = () => {
    router.push("/admin/case-studies");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Case Study</h1>
        <p className="text-muted-foreground mt-1">
          Add a new case study to showcase your work
        </p>
      </div>

      <AdminCaseStudyForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

