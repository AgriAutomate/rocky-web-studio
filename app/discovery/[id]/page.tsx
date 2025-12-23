"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DiscoveryTreeForm } from "@/components/discovery/DiscoveryTreeForm";
import { Footer } from "@/components/footer";
import type { DiscoveryTreePrePopulateResponse } from "@/lib/types/discovery";
import type { WebsiteAuditResult, AuditFetchResponse } from "@/lib/types/audit";
import {
  deriveAuditStatus,
  type AuditStatus,
} from "@/lib/utils/audit-utils";

export default function DiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireResponseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prePopulateData, setPrePopulateData] =
    useState<DiscoveryTreePrePopulateResponse | null>(null);
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("PENDING");
  const [audit, setAudit] = useState<WebsiteAuditResult | undefined>(undefined);
  const [auditErrorMessage, setAuditErrorMessage] = useState<
    string | undefined
  >(undefined);
  const [auditWarnings, setAuditWarnings] = useState<string[] | undefined>(
    undefined
  );
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!questionnaireResponseId) {
        setError("Invalid questionnaire ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch discovery data
        const discoveryResponse = await fetch(
          `/api/discovery-tree?questionnaireResponseId=${questionnaireResponseId}`
        );

        if (!discoveryResponse.ok) {
          const errorData = await discoveryResponse.json();
          throw new Error(errorData.error || "Failed to load discovery data");
        }

        const discoveryData = await discoveryResponse.json();
        setPrePopulateData(discoveryData);

        // Fetch audit results (if available)
        setAuditLoading(true);
        try {
          const auditResponse = await fetch(
            `/api/audit-website?questionnaireResponseId=${questionnaireResponseId}`
          );

          if (auditResponse.ok) {
            const auditData: AuditFetchResponse = await auditResponse.json();
            
            // Derive explicit audit status from API response
            const statusInfo = deriveAuditStatus(auditData);
            
            setAuditStatus(statusInfo.status);
            setAudit(statusInfo.audit);
            setAuditErrorMessage(statusInfo.errorMessage);
            setAuditWarnings(statusInfo.warnings);
          } else if (auditResponse.status === 404) {
            // Audit not yet completed - default to PENDING
            setAuditStatus("PENDING");
          } else {
            // Other error - default to PENDING
            setAuditStatus("PENDING");
          }
        } catch (auditErr) {
          // Audit fetch failed - not critical, default to PENDING
          console.log("Could not fetch audit:", auditErr);
          setAuditStatus("PENDING");
        } finally {
          setAuditLoading(false);
        }
      } catch (err) {
        console.error("Error fetching discovery data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load discovery data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [questionnaireResponseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading discovery data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-destructive mb-4">
            Error Loading Discovery
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!prePopulateData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:py-16 lg:px-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Guided Discovery
          </h1>
          <p className="text-muted-foreground">
            Help us understand your technical needs and priorities to create a
            detailed project plan.
          </p>
        </div>

        <DiscoveryTreeForm
          questionnaireResponseId={questionnaireResponseId}
          prePopulateData={prePopulateData}
          auditStatus={auditStatus}
          audit={audit}
          auditErrorMessage={auditErrorMessage}
          auditWarnings={auditWarnings}
          auditLoading={auditLoading}
        />
      </main>
      <Footer />
    </div>
  );
}
