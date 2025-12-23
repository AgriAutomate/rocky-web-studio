"use client";

import { Card } from "@/components/ui/card";
import { useEstimate } from "@/lib/hooks/useEstimate";
import { getFeatureKeysFromPriorities } from "@/lib/config/feature-estimates";
import { formatCost, formatTimeline } from "@/lib/utils/feature-estimator";
import { AuditCard } from "./AuditCard";
import type {
  BusinessProfile,
  DiscoveryTreePrePopulateResponse,
  DiscoveryTree,
} from "@/lib/types/discovery";
import type { WebsiteAuditResult } from "@/lib/types/audit";
import type { AuditStatus } from "@/lib/utils/audit-utils";

interface SummarySidebarProps {
  client: DiscoveryTreePrePopulateResponse["client"];
  businessProfile: BusinessProfile | null;
  currentStack: DiscoveryTreePrePopulateResponse["currentStack"];
  discoveryTree?: DiscoveryTree;
  auditStatus: AuditStatus;
  audit?: WebsiteAuditResult;
  auditErrorMessage?: string;
  auditWarnings?: string[];
  auditLoading?: boolean;
}

export function SummarySidebar({
  client,
  businessProfile,
  currentStack,
  discoveryTree,
  audit,
  auditLoading = false,
}: SummarySidebarProps) {
  // Calculate estimates from priorities
  const featureKeys = discoveryTree?.priorities
    ? getFeatureKeysFromPriorities(discoveryTree.priorities)
    : [];
  
  const estimate = useEstimate(client.sector, featureKeys);
  return (
    <div className="space-y-6">
      {/* Website Audit Card */}
      {auditLoading ? (
        <AuditCard status="PENDING" />
      ) : (
        <AuditCard
          status={auditStatus}
          audit={audit}
          errorMessage={auditErrorMessage}
          warnings={auditWarnings}
        />
      )}

      {/* Client Info Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{client.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Business:</span>{" "}
            <span className="font-medium">{client.businessName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sector:</span>{" "}
            <span className="font-medium capitalize">{client.sector}</span>
          </div>
        </div>
      </Card>

      {/* Business Profile Card */}
      {businessProfile && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Profile</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Annual Revenue:</span>{" "}
              <span className="font-medium">{businessProfile.annualRevenue}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Employees:</span>{" "}
              <span className="font-medium">{businessProfile.employeeCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Years in Business:</span>{" "}
              <span className="font-medium">{businessProfile.yearsInBusiness}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Digital Maturity:</span>{" "}
              <span className="font-medium capitalize">
                {businessProfile.digitalMaturity}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Current Stack Card */}
      {currentStack && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Technology Stack</h3>
          {currentStack.systems && currentStack.systems.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {currentStack.systems.map((system, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs capitalize"
                  >
                    {system}
                  </span>
                ))}
              </div>
              {currentStack.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentStack.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No current systems identified.
            </p>
          )}
        </Card>
      )}

      {/* Cost/Time Estimate */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Project Estimate</h3>
        {estimate && featureKeys.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cost:</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCost(estimate.totalCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timeline:</span>
                <span className="text-lg font-semibold">
                  {formatTimeline(estimate.totalWeeks)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Selected Features:</h4>
              <ul className="space-y-2 text-sm">
                {estimate.breakdown.map((feature, index) => (
                  <li key={index} className="flex items-start justify-between">
                    <span className="text-muted-foreground flex-1">
                      {feature.label}
                    </span>
                    <span className="font-medium ml-2">
                      {formatCost(feature.appliedCost)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Cost and timeline estimates will be calculated based on your
              feature selections.
            </p>
            <p className="text-xs italic">
              Select features in the prioritization section to see estimates.
            </p>
          </div>
        )}
      </Card>

      {/* Progress Indicator */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progress</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Universal Questions</span>
            <span className="font-medium">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sector-Specific</span>
            <span className="font-medium">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Prioritization</span>
            <span className="font-medium">In Progress</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
