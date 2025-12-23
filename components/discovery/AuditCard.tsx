"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WebsiteAuditResult } from "@/lib/types/audit";
import { getSummaryForClient, type AuditStatus } from "@/lib/utils/audit-utils";

interface AuditCardProps {
  status: AuditStatus;
  audit?: WebsiteAuditResult;
  errorMessage?: string;
  warnings?: string[];
}

export function AuditCard({
  status,
  audit,
  errorMessage,
  warnings,
}: AuditCardProps) {
  // State 1: NOT_REQUESTED
  if (status === "NOT_REQUESTED") {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
        <p className="text-sm text-muted-foreground">
          No audit data available. Audit will run automatically when a website URL is provided.
        </p>
      </Card>
    );
  }

  // State 2: PENDING
  if (status === "PENDING") {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">
              Analyzing website...
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This may take 10-30 seconds
          </p>
        </div>
      </Card>
    );
  }

  // State 3: FAILED
  if (status === "FAILED") {
    return (
      <Card className="p-6 border-t-4 border-t-red-500">
        <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800 mb-1">
            ⚠️ Analysis unavailable
          </p>
          <p className="text-sm text-red-700">{errorMessage || "Unknown error"}</p>
        </div>
      </Card>
    );
  }

  // State 4: FAILED_WITH_PARTIAL_DATA
  if (status === "FAILED_WITH_PARTIAL_DATA") {
    return (
      <Card className="p-6 border-t-4 border-t-red-500">
        <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-sm font-medium text-red-800 mb-1">
            ⚠️ Analysis incomplete
          </p>
          <p className="text-sm text-red-700">{errorMessage || "Unknown error"}</p>
        </div>
        {audit && (
          <div className="text-sm text-muted-foreground">
            <p>Some data was collected before the error occurred.</p>
          </div>
        )}
        {warnings && warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
            <ul className="text-xs text-yellow-700 list-disc list-inside">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  }

  // State 5 & 6: SUCCESS_FULL or SUCCESS_PARTIAL
  if (!audit) {
    // Fallback: Shouldn't reach here, but handle gracefully
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Unable to load audit data.
        </p>
      </Card>
    );
  }

  const summary = getSummaryForClient(audit);
  const isPartial = status === "SUCCESS_PARTIAL";

  // Performance score color
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Performance badge variant
  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  return (
    <Card
      className={`p-6 ${
        isPartial
          ? "border-t-4 border-t-yellow-500"
          : "border-t-4 border-t-green-500"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Current Site Analysis</h3>

      {/* Warning Banner for Partial State */}
      {isPartial && (warnings && warnings.length > 0) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            ⚠️ Some data unavailable
          </p>
          <ul className="text-xs text-yellow-700 list-disc list-inside">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Indicate missing performance metrics if partial */}
      {isPartial && !audit.performance && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Performance metrics unavailable
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Platform */}
        <div>
          <span className="text-sm text-muted-foreground">Platform:</span>
          <div className="mt-1">
            <Badge variant="outline">{summary.platform}</Badge>
          </div>
        </div>

        {/* Performance Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Performance</span>
            <div className={`text-2xl font-bold mt-1 ${getPerformanceColor(summary.performanceScore)}`}>
              {summary.performanceScore}
            </div>
            <Badge variant={getPerformanceBadge(summary.performanceScore)} className="mt-1">
              {summary.performanceScore >= 80 ? "Excellent" : summary.performanceScore >= 50 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Mobile Score</span>
            <div className={`text-2xl font-bold mt-1 ${getPerformanceColor(summary.mobileScore)}`}>
              {summary.mobileScore}
            </div>
            <Badge variant={getPerformanceBadge(summary.mobileScore)} className="mt-1">
              Mobile
            </Badge>
          </div>
        </div>

        {/* Social Profiles */}
        {summary.socialsFound > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">Social Profiles Found:</span>
            <div className="mt-1">
              <Badge variant="outline">{summary.socialsFound} platform{summary.socialsFound !== 1 ? "s" : ""}</Badge>
            </div>
          </div>
        )}

        {/* Top Issue */}
        <div className="pt-4 border-t">
          <span className="text-sm font-semibold">Top Priority Issue:</span>
          <p className="text-sm text-muted-foreground mt-1">
            {summary.topIssue}
          </p>
        </div>

        {/* View Full Report Link */}
        <div className="pt-2">
          <a
            href={audit.websiteInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View Website →
          </a>
        </div>
      </div>
    </Card>
  );
}
