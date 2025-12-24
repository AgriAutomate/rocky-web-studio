/**
 * Proposal Data Service
 * 
 * Fetches and shapes questionnaire response data into clean ProposalData
 * structure that maps 1:1 with PDF content sections.
 */

import { createServerSupabaseClient } from "@/lib/supabase/client";
import { calculateOverallHealthScore } from "@/lib/utils/audit-utils";
import { estimateProject } from "@/lib/utils/feature-estimator";
import { getFeatureKeysFromPriorities } from "@/lib/config/feature-estimates";
import type { ProposalData, HealthScorecard, ProjectScope, Investment, RoiSnapshot, CurrentStateAnalysis, ProposedSolution } from "@/lib/types/proposal";
import type { WebsiteAuditResult } from "@/lib/types/audit";
import type { DiscoveryTree, BusinessProfile } from "@/lib/types/discovery";
import type { Sector } from "@/lib/types/questionnaire";
import { logger } from "@/lib/utils/logger";

/**
 * Fetch complete questionnaire response record
 */
async function fetchQuestionnaireResponse(
  questionnaireResponseId: string | number
): Promise<any> {
  const supabase = createServerSupabaseClient(true);

  const { data, error } = await (supabase as any)
    .from("questionnaire_responses")
    .select(
      "*, audit_results, discovery_tree, sector_specific_data, business_profile, goals, primary_offers, pain_points, sector, first_name, last_name, business_name, business_email, business_phone"
    )
    .eq("id", questionnaireResponseId)
    .single();

  if (error) {
    await logger.error("Failed to fetch questionnaire response", {
      questionnaireResponseId,
      error: error.message,
    });
    throw new Error(`Failed to fetch questionnaire response: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Questionnaire response not found: ${questionnaireResponseId}`);
  }

  return data;
}

/**
 * Calculate health scorecard from audit results
 */
function calculateHealthScorecard(
  auditResults: WebsiteAuditResult | null | undefined
): HealthScorecard {
  if (!auditResults) {
    return {
      overallScore: 0,
      topIssues: ["No audit data available"],
      recommendations: ["Complete website audit to assess current state"],
    };
  }

  // Calculate overall health score
  const overallScore = calculateOverallHealthScore(auditResults);

  // Extract performance score
  const performanceScore = auditResults.performance?.overallScore ||
    auditResults.performance?.mobileScore ||
    auditResults.performance?.desktopScore;

  // Calculate SEO score (simplified - can be enhanced)
  const seoScore = auditResults.seo.httpsEnabled ? 80 : 60; // Placeholder

  // Calculate technical score (simplified - can be enhanced)
  const technicalScore = auditResults.websiteInfo.isAccessible ? 70 : 40; // Placeholder

  // Extract platform
  const platform = auditResults.techStack.cms?.name ||
    auditResults.techStack.frameworks?.[0]?.name ||
    "Unknown";

  // Extract top issues from recommendations (prioritized)
  const topIssues = auditResults.recommendations
    .filter((rec) => rec.priority === "critical" || rec.priority === "high")
    .slice(0, 5)
    .map((rec) => rec.title);

  // Extract top recommendations
  const recommendations = auditResults.recommendations
    .slice(0, 5)
    .map((rec) => rec.title);

  return {
    overallScore,
    performanceScore,
    seoScore,
    technicalScore,
    platform,
    topIssues: topIssues.length > 0 ? topIssues : ["No critical issues identified"],
    recommendations: recommendations.length > 0 ? recommendations : ["No recommendations available"],
  };
}

/**
 * Calculate ROI snapshot
 * TODO: Implement actual ROI calculation based on business profile, sector, and features
 */
function calculateRoiSnapshot(
  _businessProfile: BusinessProfile | null | undefined,
  _sector: Sector | null | undefined,
  investment: Investment,
  _projectScope: ProjectScope
): RoiSnapshot {
  // Placeholder ROI calculation
  // TODO: Implement actual ROI logic based on:
  // - Business size (annualRevenue, employeeCount)
  // - Sector-specific benchmarks
  // - Feature-specific ROI multipliers
  // - Industry averages

  const assumptions: string[] = [
    "ROI calculations are estimates based on industry benchmarks",
    "Actual results may vary based on implementation and market conditions",
    "Savings include time efficiency, reduced manual processes, and improved conversion rates",
  ];

  // Placeholder calculations
  const estimatedAnnualSavings = investment.totalCost * 0.3; // 30% of investment as annual savings
  const estimatedAnnualRevenue = investment.totalCost * 0.5; // 50% of investment as additional revenue
  const paybackPeriod = Math.ceil((investment.totalCost / estimatedAnnualSavings) * 12); // Months
  const threeYearROI = ((estimatedAnnualSavings * 3 - investment.totalCost) / investment.totalCost) * 100;

  return {
    estimatedAnnualSavings: estimatedAnnualSavings > 0 ? estimatedAnnualSavings : undefined,
    estimatedAnnualRevenue: estimatedAnnualRevenue > 0 ? estimatedAnnualRevenue : undefined,
    paybackPeriod: paybackPeriod > 0 ? paybackPeriod : undefined,
    threeYearROI: threeYearROI > 0 ? threeYearROI : undefined,
    assumptions,
  };
}

/**
 * Shape project scope from discovery tree
 */
function shapeProjectScope(
  discoveryTree: DiscoveryTree | null | undefined
): ProjectScope {
  if (!discoveryTree) {
    return {
      mustHaveFeatures: [],
      niceToHaveFeatures: [],
      futureFeatures: [],
      integrations: [],
      successMetrics: [],
    };
  }

  const priorities = discoveryTree.priorities || {
    mustHave: [],
    niceToHave: [],
    future: [],
  };
  const trunk = discoveryTree.trunk || {};

  // Shape integrations
  const integrations = (trunk.integrations || []).map((integration) => ({
    name: integration.systemName,
    type: integration.systemType || "other",
    priority: integration.priority || "important",
  }));

  // Shape data migration
  const dataMigration = trunk.dataMigration
    ? {
        required: trunk.dataMigration.hasExistingData || false,
        dataTypes: trunk.dataMigration.dataTypes,
        volume: trunk.dataMigration.dataVolume,
      }
    : undefined;

  // Shape success metrics
  const successMetrics = (trunk.successMetrics || []).map((metric) => ({
    metric: metric.metric,
    target: metric.target,
    timeframe: metric.timeframe,
  }));

  return {
    mustHaveFeatures: priorities.mustHave || [],
    niceToHaveFeatures: priorities.niceToHave || [],
    futureFeatures: priorities.future || [],
    integrations,
    dataMigration,
    successMetrics,
  };
}

/**
 * Calculate investment from discovery tree priorities
 */
function calculateInvestment(
  sector: Sector | null | undefined,
  projectScope: ProjectScope
): Investment {
  // Get feature keys from priorities
  const featureKeys = getFeatureKeysFromPriorities({
    mustHave: projectScope.mustHaveFeatures,
    niceToHave: projectScope.niceToHaveFeatures,
    future: projectScope.futureFeatures,
  });

  // Calculate estimate
  const estimate = estimateProject({
    sector: sector || "other",
    featureKeys,
  });

  // Shape cost breakdown
  const costBreakdown = estimate.breakdown.map((item) => ({
    feature: item.label,
    cost: item.appliedCost,
    weeks: item.appliedWeeks,
  }));

  return {
    totalCost: estimate.totalCost,
    totalWeeks: estimate.totalWeeks,
    costBreakdown,
  };
}

/**
 * Shape current state analysis
 */
function shapeCurrentStateAnalysis(
  responseData: any,
  auditResults: WebsiteAuditResult | null | undefined
): CurrentStateAnalysis {
  const businessProfile = responseData.business_profile as BusinessProfile | null | undefined;

  // Extract current stack from sector_specific_data or audit
  const currentStack = {
    systems: [] as string[],
    integrations: [] as string[],
    notes: "",
  };

  // Extract from audit if available
  if (auditResults?.techStack) {
    if (auditResults.techStack.cms) {
      currentStack.systems.push(auditResults.techStack.cms.name);
    }
    if (auditResults.techStack.ecommerce) {
      currentStack.systems.push(auditResults.techStack.ecommerce.name);
    }
    auditResults.techStack.paymentProcessors?.forEach((p) => {
      currentStack.integrations.push(p.name);
    });
    auditResults.techStack.analytics?.forEach((a) => {
      currentStack.integrations.push(a.name);
    });
  }

  // Extract pain points
  const painPoints = Array.isArray(responseData.pain_points)
    ? responseData.pain_points
    : [];

  // Extract goals
  const goals = Array.isArray(responseData.goals)
    ? responseData.goals
    : [];

  // Extract website info from audit
  const websiteInfo = auditResults
    ? {
        url: auditResults.websiteInfo.url,
        platform: auditResults.techStack.cms?.name || auditResults.techStack.frameworks?.[0]?.name,
        isAccessible: auditResults.websiteInfo.isAccessible,
        loadTime: auditResults.websiteInfo.loadTimeMs,
      }
    : undefined;

  return {
    businessProfile: businessProfile || {
      annualRevenue: "0-100k",
      employeeCount: "1-5",
      yearsInBusiness: "0-2",
      digitalMaturity: "basic",
    },
    currentStack,
    websiteInfo,
    painPoints,
    goals,
  };
}

/**
 * Shape proposed solution
 */
function shapeProposedSolution(
  projectScope: ProjectScope,
  investment: Investment
): ProposedSolution {
  // Generate overview
  const featureCount = projectScope.mustHaveFeatures.length + projectScope.niceToHaveFeatures.length;
  const overview = `This proposal outlines a comprehensive digital solution for your business, including ${featureCount} key features designed to address your specific needs and goals.`;

  // Key features (from must-have)
  const keyFeatures = projectScope.mustHaveFeatures.slice(0, 7);

  // Expected outcomes (generic - can be enhanced)
  const expectedOutcomes = [
    "Improved operational efficiency",
    "Enhanced customer experience",
    "Increased online visibility and engagement",
    "Streamlined business processes",
    "Better data insights and reporting",
  ];

  // Timeline phases (simplified)
  const phases = [
    {
      phase: "Planning & Design",
      duration: "2-3 weeks",
      deliverables: ["Project plan", "Design mockups", "Technical specifications"],
    },
    {
      phase: "Development",
      duration: `${Math.max(1, Math.ceil(investment.totalWeeks * 0.6))} weeks`,
      deliverables: ["Core features", "Integrations", "Testing"],
    },
    {
      phase: "Launch & Support",
      duration: "1-2 weeks",
      deliverables: ["Deployment", "Training", "Documentation"],
    },
  ];

  return {
    overview,
    keyFeatures,
    expectedOutcomes,
    timeline: {
      phases,
      totalDuration: `${investment.totalWeeks} weeks`,
    },
  };
}

/**
 * Get proposal data for a questionnaire response
 * 
 * Fetches the complete questionnaire response and shapes it into
 * a clean ProposalData structure that maps 1:1 with PDF content sections.
 * 
 * @param questionnaireResponseId - The ID of the questionnaire response
 * @returns ProposalData object ready for PDF generation
 * 
 * @throws Error if questionnaire response cannot be fetched
 */
export async function getProposalData(
  questionnaireResponseId: string | number
): Promise<ProposalData> {
  try {
    await logger.info("Fetching proposal data", {
      questionnaireResponseId,
    });

    // Fetch complete questionnaire response
    const responseData = await fetchQuestionnaireResponse(questionnaireResponseId);

    // Extract typed data
    const auditResults = responseData.audit_results as WebsiteAuditResult | null | undefined;
    const discoveryTree = responseData.discovery_tree as DiscoveryTree | null | undefined;
    const businessProfile = responseData.business_profile as BusinessProfile | null | undefined;
    const sector = (responseData.sector as Sector) || "other";

    // Calculate health scorecard
    const healthScorecard = calculateHealthScorecard(auditResults);

    // Shape project scope
    const projectScope = shapeProjectScope(discoveryTree);

    // Calculate investment
    const investment = calculateInvestment(sector, projectScope);

    // Calculate ROI snapshot
    const roiSnapshot = calculateRoiSnapshot(businessProfile, sector, investment, projectScope);

    // Shape current state analysis
    const currentStateAnalysis = shapeCurrentStateAnalysis(responseData, auditResults);

    // Shape proposed solution
    const proposedSolution = shapeProposedSolution(projectScope, investment);

    // Build complete proposal data
    const proposalData: ProposalData = {
      client: {
        firstName: responseData.first_name || "",
        lastName: responseData.last_name || undefined,
        businessName: responseData.business_name || "",
        email: responseData.business_email || "",
        phone: responseData.business_phone || undefined,
        sector,
      },
      metadata: {
        proposalDate: new Date().toISOString(),
        proposalId: String(questionnaireResponseId),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        version: "1.0",
      },
      healthScorecard,
      currentStateAnalysis,
      projectScope,
      proposedSolution,
      investment,
      roiSnapshot,
      rawData: {
        auditResults,
        discoveryTree,
        businessProfile,
      },
    };

    await logger.info("Proposal data fetched and shaped successfully", {
      questionnaireResponseId,
      businessName: proposalData.client.businessName,
    });

    return proposalData;
  } catch (error) {
    await logger.error("Failed to get proposal data", {
      questionnaireResponseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
