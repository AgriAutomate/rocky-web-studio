"use client";

import { useReducer, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TrunkSection } from "./TrunkSection";
import { BranchSection } from "./BranchSection";
import { PrioritizationSection } from "./PrioritizationSection";
import { SummarySidebar } from "./SummarySidebar";
import type {
  DiscoveryTreePrePopulateResponse,
  DiscoveryTree,
  BusinessProfile,
} from "@/lib/types/discovery";
import type { WebsiteAuditResult } from "@/lib/types/audit";
import type { AuditStatus } from "@/lib/utils/audit-utils";

interface DiscoveryTreeState {
  businessProfile: BusinessProfile | null;
  discoveryTree: DiscoveryTree;
}

type DiscoveryTreeAction =
  | { type: "SET_BUSINESS_PROFILE"; payload: BusinessProfile }
  | { type: "UPDATE_TRUNK"; payload: Partial<DiscoveryTree["trunk"]> }
  | { type: "UPDATE_BRANCH"; payload: { sector: string; data: any } }
  | { type: "UPDATE_PRIORITIES"; payload: DiscoveryTree["priorities"] }
  | { type: "INITIALIZE"; payload: DiscoveryTreePrePopulateResponse };

function discoveryTreeReducer(
  state: DiscoveryTreeState,
  action: DiscoveryTreeAction
): DiscoveryTreeState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        businessProfile: action.payload.businessProfile,
        discoveryTree: action.payload.discoveryTree || {
          trunk: {},
          branches: {},
          priorities: { mustHave: [], niceToHave: [], future: [] },
        },
      };

    case "SET_BUSINESS_PROFILE":
      return {
        ...state,
        businessProfile: action.payload,
      };

    case "UPDATE_TRUNK":
      return {
        ...state,
        discoveryTree: {
          ...state.discoveryTree,
          trunk: {
            ...state.discoveryTree.trunk,
            ...action.payload,
          },
        },
      };

    case "UPDATE_BRANCH":
      return {
        ...state,
        discoveryTree: {
          ...state.discoveryTree,
          branches: {
            ...state.discoveryTree.branches,
            [action.payload.sector]: action.payload.data,
          },
        },
      };

    case "UPDATE_PRIORITIES":
      return {
        ...state,
        discoveryTree: {
          ...state.discoveryTree,
          priorities: action.payload,
        },
      };

    default:
      return state;
  }
}

interface DiscoveryTreeFormProps {
  questionnaireResponseId: string;
  prePopulateData: DiscoveryTreePrePopulateResponse;
  auditStatus: AuditStatus;
  audit?: WebsiteAuditResult;
  auditErrorMessage?: string;
  auditWarnings?: string[];
  auditLoading?: boolean;
}

export function DiscoveryTreeForm({
  questionnaireResponseId,
  prePopulateData,
  auditStatus,
  audit,
  auditErrorMessage,
  auditWarnings,
  auditLoading = false,
}: DiscoveryTreeFormProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(discoveryTreeReducer, {
    businessProfile: null,
    discoveryTree: {
      trunk: {},
      branches: {},
      priorities: { mustHave: [], niceToHave: [], future: [] },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize state from pre-populated data
  useEffect(() => {
    dispatch({ type: "INITIALIZE", payload: prePopulateData });
  }, [prePopulateData]);

  const handleSave = useCallback(
    async (showSuccess = false) => {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      try {
        const payload: any = {
          questionnaireResponseId,
          discoveryTree: state.discoveryTree,
        };

        if (state.businessProfile) {
          payload.businessProfile = state.businessProfile;
        }

        const response = await fetch("/api/discovery-tree", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save discovery data");
        }

        if (showSuccess) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (err) {
        console.error("Error saving discovery data:", err);
        setSaveError(
          err instanceof Error ? err.message : "Failed to save discovery data"
        );
      } finally {
        setIsSaving(false);
      }
    },
    [questionnaireResponseId, state]
  );

  const handleContinue = useCallback(async () => {
    await handleSave(false);
    // TODO: Redirect to review/confirmation page when implemented
    // router.push(`/discovery/${questionnaireResponseId}/review`);
  }, [handleSave, questionnaireResponseId]);

  const sector = prePopulateData.client.sector;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Trunk Section */}
        <TrunkSection
          trunk={state.discoveryTree.trunk}
          onUpdate={(trunk) => dispatch({ type: "UPDATE_TRUNK", payload: trunk })}
        />

        {/* Branch Section */}
        <BranchSection
          sector={sector}
          branchData={state.discoveryTree.branches?.[sector]}
          onUpdate={(data) =>
            dispatch({ type: "UPDATE_BRANCH", payload: { sector, data } })
          }
        />

        {/* Prioritization Section */}
        <PrioritizationSection
          priorities={state.discoveryTree.priorities}
          onUpdate={(priorities) =>
            dispatch({ type: "UPDATE_PRIORITIES", payload: priorities })
          }
        />

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isSaving}
          >
            Continue
          </Button>
        </div>

        {/* Error/Success Messages */}
        {saveError && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            Progress saved successfully!
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <SummarySidebar
          client={prePopulateData.client}
          businessProfile={state.businessProfile || prePopulateData.businessProfile}
          currentStack={prePopulateData.currentStack}
          discoveryTree={state.discoveryTree}
          auditStatus={auditStatus}
          audit={audit}
          auditErrorMessage={auditErrorMessage}
          auditWarnings={auditWarnings}
          auditLoading={auditLoading}
        />
      </div>
    </div>
  );
}
