import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type {
  DiscoveryTreeUpdateRequest,
  DiscoveryTreeUpdateResponse,
  DiscoveryTreePrePopulateResponse,
  BusinessProfile,
  DiscoveryTree,
} from "@/lib/types/discovery";
import type { Sector } from "@/lib/types/questionnaire";
import type { WebsiteAuditResult } from "@/lib/types/audit";
import {
  normalizeSystemName,
  deduplicateSystems,
  extractAuditTechStack,
  deriveIntegrationsFromAudit,
  mergeIntegrations,
} from "@/lib/utils/audit-utils";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Default business profile values
const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  annualRevenue: "0-100k",
  employeeCount: "1-5",
  yearsInBusiness: "0-2",
  digitalMaturity: "basic",
};

/**
 * Derive current stack information from sector-specific data and audit results
 * 
 * Smart merge algorithm:
 * 1. Extract sector-derived systems/integrations (existing logic)
 * 2. Extract audit-detected technologies (CMS, e-commerce, payment processors, analytics)
 * 3. Normalize names for deduplication (case-insensitive, remove suffixes)
 * 4. Merge arrays (sector precedence, audit complements)
 * 5. Build sources array to track origin of each item
 * 6. Merge notes (sector notes + audit context)
 * 
 * Example:
 * - Sector: ["square"], Audit: ["Square", "wordpress"]
 * - Result: { systems: ["square", "wordpress"], sources: { systems: ["sector", "audit"] } }
 */
function deriveCurrentStack(
  sectorSpecificData: any,
  sector: Sector,
  auditResults?: WebsiteAuditResult | null
): {
  systems?: string[];
  integrations?: string[];
  notes?: string;
  sources?: {
    systems?: ("sector" | "audit")[];
    integrations?: ("sector" | "audit")[];
  };
} {
  // Step 1: Extract sector-derived data (existing logic)
  const sectorStack: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
  } = {
    systems: [],
    integrations: [],
    notes: "",
  };

  if (sectorSpecificData && typeof sectorSpecificData === "object") {
    // Extract system names from sector-specific data
    // Hospitality: POS/PMS stack
    if (sector === "hospitality" && sectorSpecificData.h9) {
      sectorStack.notes = sectorSpecificData.h9;
      const systemsMatch = sectorSpecificData.h9.match(
        /\b(?:POS|PMS|Square|Toast|Resy|OpenTable|ResDiary)\b/gi
      );
      if (systemsMatch) {
        sectorStack.systems = [
          ...new Set(systemsMatch.map((s: string) => s.toLowerCase())),
        ];
      }
    }

    // Trades: Dispatch/routing tools
    if (sector === "construction" && sectorSpecificData.t8) {
      sectorStack.notes = sectorSpecificData.t8;
      const toolsMatch = sectorSpecificData.t8.match(
        /\b(?:Jobber|ServiceM8|AroFlo|Simpro|Xero|MYOB)\b/gi
      );
      if (toolsMatch) {
        sectorStack.systems = [
          ...new Set(toolsMatch.map((s: string) => s.toLowerCase())),
        ];
      }
    }

    // Retail: Channels (Shopify, POS, etc.)
    if (sector === "retail" && sectorSpecificData.r7) {
      const channels = Array.isArray(sectorSpecificData.r7)
        ? sectorSpecificData.r7
        : [sectorSpecificData.r7];
      sectorStack.systems = channels.filter((c: string) => c);
    }

    // Professional: Delivery tooling
    if (sector === "professional-services" && sectorSpecificData.p9) {
      sectorStack.notes = sectorSpecificData.p9;
      const toolsMatch = sectorSpecificData.p9.match(
        /\b(?:Asana|Trello|Monday|Jira|Notion|Airtable)\b/gi
      );
      if (toolsMatch) {
        sectorStack.systems = [
          ...new Set(toolsMatch.map((s: string) => s.toLowerCase())),
        ];
      }
    }
  }

  const sectorSystems = sectorStack.systems || [];
  const sectorIntegrations = sectorStack.integrations || [];
  const sectorNotes = sectorStack.notes || "";

  // Step 2: Extract audit-derived technologies
  const auditTech = auditResults?.techStack
    ? extractAuditTechStack(auditResults.techStack)
    : { systems: [], integrations: [], allTechnologies: [] };

  const auditSystems = auditTech.systems;
  const auditIntegrations = auditTech.integrations;
  const auditTechnologies = auditTech.allTechnologies;

  // Step 3: Normalize all names for deduplication
  const normalizedSectorSystems = sectorSystems.map(normalizeSystemName);
  const normalizedAuditSystems = auditSystems.map(normalizeSystemName);
  const normalizedSectorIntegrations = sectorIntegrations.map(normalizeSystemName);
  const normalizedAuditIntegrations = auditIntegrations.map(normalizeSystemName);

  // Step 4: Merge systems array (sector precedence)
  const mergedSystems: string[] = [...sectorSystems]; // Start with sector (preserve order)
  const mergedSystemsSources: ("sector" | "audit")[] = sectorSystems.map(
    () => "sector" as const
  );

  for (let i = 0; i < auditSystems.length; i++) {
    const auditSystem = auditSystems[i];
    const normalizedAuditSystem = normalizedAuditSystems[i];

    // Check if normalized name already exists in sector systems
    if (!normalizedSectorSystems.includes(normalizedAuditSystem)) {
      mergedSystems.push(auditSystem);
      mergedSystemsSources.push("audit");
    }
    // If exists, skip (sector takes precedence)
  }

  // Deduplicate merged systems (in case of duplicates within same source)
  const { systems: deduplicatedSystems } = deduplicateSystems(mergedSystems);
  // Rebuild sources array to match deduplicated systems
  const finalSystemsSources: ("sector" | "audit")[] = [];
  const seenNormalized = new Set<string>();
  for (let i = 0; i < mergedSystems.length; i++) {
    const normalized = normalizeSystemName(mergedSystems[i]);
    if (!seenNormalized.has(normalized)) {
      seenNormalized.add(normalized);
      finalSystemsSources.push(mergedSystemsSources[i]);
    }
  }

  // Step 5: Merge integrations array (same logic)
  const mergedIntegrations: string[] = [...sectorIntegrations];
  const mergedIntegrationsSources: ("sector" | "audit")[] = sectorIntegrations.map(
    () => "sector" as const
  );

  for (let i = 0; i < auditIntegrations.length; i++) {
    const auditIntegration = auditIntegrations[i];
    const normalizedAuditIntegration = normalizedAuditIntegrations[i];

    // Check if normalized name already exists in sector integrations
    if (!normalizedSectorIntegrations.includes(normalizedAuditIntegration)) {
      mergedIntegrations.push(auditIntegration);
      mergedIntegrationsSources.push("audit");
    }
  }

  // Deduplicate merged integrations
  const { systems: deduplicatedIntegrations } = deduplicateSystems(mergedIntegrations);
  // Rebuild sources array to match deduplicated integrations
  const finalIntegrationsSources: ("sector" | "audit")[] = [];
  const seenNormalizedInt = new Set<string>();
  for (let i = 0; i < mergedIntegrations.length; i++) {
    const normalized = normalizeSystemName(mergedIntegrations[i]);
    if (!seenNormalizedInt.has(normalized)) {
      seenNormalizedInt.add(normalized);
      finalIntegrationsSources.push(mergedIntegrationsSources[i]);
    }
  }

  // Step 6: Merge notes
  let mergedNotes = sectorNotes;
  if (auditTechnologies.length > 0) {
    const auditContext = `Detected via site analysis: ${auditTechnologies.join(", ")}`;
    if (mergedNotes) {
      mergedNotes = `${mergedNotes} | ${auditContext}`;
    } else {
      mergedNotes = auditContext;
    }
  }

  // Step 7: Build final object
  const result: {
    systems?: string[];
    integrations?: string[];
    notes?: string;
    sources?: {
      systems?: ("sector" | "audit")[];
      integrations?: ("sector" | "audit")[];
    };
  } = {
    systems: deduplicatedSystems.length > 0 ? deduplicatedSystems : undefined,
    integrations:
      deduplicatedIntegrations.length > 0 ? deduplicatedIntegrations : undefined,
    notes: mergedNotes || undefined,
  };

  // Add sources if we have any systems or integrations
  if (
      (finalSystemsSources.length > 0 || finalIntegrationsSources.length > 0)
  ) {
    result.sources = {};
    if (finalSystemsSources.length > 0) {
      result.sources.systems = finalSystemsSources;
    }
    if (finalIntegrationsSources.length > 0) {
      result.sources.integrations = finalIntegrationsSources;
    }
  }

  return result;
}

/**
 * GET /api/discovery-tree?questionnaireResponseId=...
 * 
 * Fetches existing questionnaire data and returns pre-population payload
 * for the discovery UI.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionnaireResponseId = searchParams.get("questionnaireResponseId");

    if (!questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(true);

    // Fetch questionnaire response
    const { data: response, error } = await (supabase as any)
      .from("questionnaire_responses")
      .select(
        "id, first_name, last_name, business_name, sector, sector_specific_data, business_profile, goals, primary_offers, discovery_tree"
      )
      .eq("id", questionnaireResponseId)
      .single();

    if (error) {
      console.error("[DiscoveryTree] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch questionnaire response", details: error.message },
        { status: 500 }
      );
    }

    if (!response) {
      return NextResponse.json(
        { error: "Questionnaire response not found" },
        { status: 404 }
      );
    }

    // Merge audit integrations into discoveryTree.trunk.integrations (pre-population only)
    // Note: This only runs in GET (pre-population), not POST.
    // User-edited integrations always take precedence - audit-based integrations are just a starting point.
    const auditResults = response.audit_results as WebsiteAuditResult | null;
    const existingIntegrations =
      response.discovery_tree?.trunk?.integrations || [];
    let mergedIntegrations = existingIntegrations;

    if (auditResults) {
      // Derive integrations from audit tech stack
      const auditDerivedIntegrations =
        deriveIntegrationsFromAudit(auditResults);

      // Merge with existing integrations (preserves user edits, adds new audit findings)
      mergedIntegrations = mergeIntegrations(
        existingIntegrations,
        auditDerivedIntegrations
      );
    }

    // Build discovery tree with merged integrations
    const discoveryTree: DiscoveryTree | null = response.discovery_tree
      ? {
          ...response.discovery_tree,
          trunk: {
            ...response.discovery_tree.trunk,
            integrations:
              mergedIntegrations.length > 0
                ? mergedIntegrations
                : response.discovery_tree.trunk?.integrations,
          },
        }
      : mergedIntegrations.length > 0
        ? {
            trunk: {
              integrations: mergedIntegrations,
            },
          }
        : null;

    // Build pre-population response
    const prePopulateData: DiscoveryTreePrePopulateResponse = {
      client: {
        name: `${response.first_name} ${response.last_name}`,
        businessName: response.business_name,
        sector: response.sector as Sector,
      },
      businessProfile: response.business_profile || DEFAULT_BUSINESS_PROFILE,
      currentStack: deriveCurrentStack(
        response.sector_specific_data,
        response.sector as Sector,
        auditResults
      ),
      goals: Array.isArray(response.goals) ? response.goals : [],
      primaryOffers: Array.isArray(response.primary_offers)
        ? response.primary_offers
        : [],
      discoveryTree,
    };

    return NextResponse.json(prePopulateData, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("[DiscoveryTree] GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discovery-tree
 * 
 * Updates questionnaire response with discovery tree data.
 * Merges new data into existing fields without overwriting unrelated data.
 */
export async function POST(req: NextRequest) {
  try {
    const body: DiscoveryTreeUpdateRequest = await req.json();

    // Validate required field
    if (!body.questionnaireResponseId) {
      return NextResponse.json(
        { error: "questionnaireResponseId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient(true);

    // Fetch existing record to merge with
    const { data: existing, error: fetchError } = await (supabase as any)
      .from("questionnaire_responses")
      .select("business_profile, discovery_tree, goals, primary_offers")
      .eq("id", body.questionnaireResponseId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Questionnaire response not found" },
        { status: 404 }
      );
    }

    // Merge business profile (partial update)
    let mergedBusinessProfile: BusinessProfile | null = existing.business_profile || null;
    if (body.businessProfile) {
      mergedBusinessProfile = {
        ...(mergedBusinessProfile || DEFAULT_BUSINESS_PROFILE),
        ...body.businessProfile,
      };
    }

    // Merge discovery tree (deep merge)
    let mergedDiscoveryTree: DiscoveryTree | null = existing.discovery_tree || null;
    if (body.discoveryTree) {
      mergedDiscoveryTree = {
        trunk: {
          ...mergedDiscoveryTree?.trunk,
          ...body.discoveryTree.trunk,
          // Deep merge arrays
          integrations: body.discoveryTree.trunk?.integrations ?? mergedDiscoveryTree?.trunk?.integrations,
          successMetrics: body.discoveryTree.trunk?.successMetrics ?? mergedDiscoveryTree?.trunk?.successMetrics,
        },
        branches: {
          ...mergedDiscoveryTree?.branches,
          ...body.discoveryTree.branches,
        },
        priorities: {
          ...mergedDiscoveryTree?.priorities,
          ...body.discoveryTree.priorities,
        },
      };
    }

    // Update goals if provided (replace, not merge)
    const updatedGoals = body.goals !== undefined ? body.goals : existing.goals;

    // Update primary offers if provided (replace, not merge)
    const updatedPrimaryOffers =
      body.primaryOffers !== undefined ? body.primaryOffers : existing.primary_offers;

    // Build update payload
    const updatePayload: Record<string, any> = {};

    if (body.businessProfile) {
      updatePayload.business_profile = mergedBusinessProfile;
    }
    if (body.discoveryTree) {
      updatePayload.discovery_tree = mergedDiscoveryTree;
    }
    if (body.goals !== undefined) {
      updatePayload.goals = updatedGoals;
    }
    if (body.primaryOffers !== undefined) {
      updatePayload.primary_offers = updatedPrimaryOffers;
    }

    // Update database
    const { data: updated, error: updateError } = await (supabase as any)
      .from("questionnaire_responses")
      .update(updatePayload)
      .eq("id", body.questionnaireResponseId)
      .select("id, business_profile, discovery_tree, goals, primary_offers, updated_at")
      .single();

    if (updateError) {
      console.error("[DiscoveryTree] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update questionnaire response", details: updateError.message },
        { status: 500 }
      );
    }

    // Build response
    const response: DiscoveryTreeUpdateResponse = {
      id: updated.id,
      businessProfile: updated.business_profile,
      discoveryTree: updated.discovery_tree,
      goals: updated.goals,
      primaryOffers: updated.primary_offers,
      updatedAt: updated.updated_at,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("[DiscoveryTree] POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
