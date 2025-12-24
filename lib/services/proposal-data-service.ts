/**
 * Proposal Data Service
 * 
 * Fetches and shapes questionnaire response data into clean ProposalData
 * structure that maps 1:1 with PDF content sections.
 */

import { createServerSupabaseClient } from "@/lib/supabase/client";
import { calculateOverallHealthScore, extractAuditTechStack } from "@/lib/utils/audit-utils";
import { estimateProject } from "@/lib/utils/feature-estimator";
import { getFeatureKeysFromPriorities } from "@/lib/config/feature-estimates";
import { calculateRoiSnapshot } from "@/lib/services/roi-calculator";
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

  // Calculate SEO score using existing utility (if available)
  // For now, use a simplified calculation based on SEO metrics
  let seoScore: number | undefined;
  if (auditResults.seo) {
    let seoPoints = 0;
    let maxSeoPoints = 0;
    
    // Title tag (10 points)
    maxSeoPoints += 10;
    if (auditResults.seo.hasTitleTag) {
      seoPoints += 5;
      if (auditResults.seo.titleLength && auditResults.seo.titleLength >= 30 && auditResults.seo.titleLength <= 60) {
        seoPoints += 5;
      }
    }
    
    // Meta description (10 points)
    maxSeoPoints += 10;
    if (auditResults.seo.hasMetaDescription) {
      seoPoints += 5;
      if (auditResults.seo.descriptionLength && auditResults.seo.descriptionLength >= 120 && auditResults.seo.descriptionLength <= 160) {
        seoPoints += 5;
      }
    }
    
    // HTTPS (15 points)
    maxSeoPoints += 15;
    if (auditResults.seo.httpsEnabled) {
      seoPoints += 15;
    }
    
    // Mobile friendly (15 points)
    maxSeoPoints += 15;
    if (auditResults.seo.mobileFriendly) {
      seoPoints += 15;
    }
    
    // Structured data (10 points)
    maxSeoPoints += 10;
    if (auditResults.seo.hasStructuredData) {
      seoPoints += 10;
    }
    
    seoScore = maxSeoPoints > 0 ? Math.round((seoPoints / maxSeoPoints) * 100) : undefined;
  }

  // Calculate technical score using existing utility (if available)
  // For now, use a simplified calculation
  let technicalScore: number | undefined;
  if (auditResults.websiteInfo) {
    let techPoints = 0;
    let maxTechPoints = 0;
    
    // Website accessible (30 points)
    maxTechPoints += 30;
    if (auditResults.websiteInfo.isAccessible) {
      techPoints += 30;
    }
    
    // HTTPS enabled (20 points)
    maxTechPoints += 20;
    if (auditResults.seo.httpsEnabled) {
      techPoints += 20;
    }
    
    // Modern tech stack (20 points)
    maxTechPoints += 20;
    if (auditResults.techStack.cms || auditResults.techStack.frameworks?.length) {
      techPoints += 20;
    }
    
    // Fast load time (15 points)
    maxTechPoints += 15;
    if (auditResults.websiteInfo.loadTimeMs) {
      if (auditResults.websiteInfo.loadTimeMs < 3000) {
        techPoints += 15;
      } else if (auditResults.websiteInfo.loadTimeMs < 5000) {
        techPoints += 10;
      }
    }
    
    // Has contact info (15 points)
    maxTechPoints += 15;
    if (auditResults.metadata.contactInfo) {
      const hasEmail = (auditResults.metadata.contactInfo.emails?.length ?? 0) > 0;
      const hasPhone = (auditResults.metadata.contactInfo.phones?.length ?? 0) > 0;
      if (hasEmail && hasPhone) {
        techPoints += 15;
      } else if (hasEmail || hasPhone) {
        techPoints += 8;
      }
    }
    
    technicalScore = maxTechPoints > 0 ? Math.round((techPoints / maxTechPoints) * 100) : undefined;
  }

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
 * Calculate ROI snapshot using the ROI calculator service
 * 
 * This function uses the real ROI calculator with actual benchmarks
 * to calculate time savings, revenue increases, payback period, and 3-year ROI.
 */
async function calculateRoiSnapshotForProposal(
  businessProfile: BusinessProfile | null | undefined,
  sector: Sector | null | undefined,
  investment: Investment,
  projectScope: ProjectScope
): Promise<RoiSnapshot> {
  // If we don't have required data, return minimal ROI snapshot
  if (!sector || !projectScope.mustHaveFeatures || projectScope.mustHaveFeatures.length === 0) {
    return {
      assumptions: [
        "ROI calculations require sector and feature information",
        "Complete the discovery tree to get accurate ROI projections",
      ],
    };
  }

  // Extract annual revenue from business profile
  // Map revenue ranges to approximate values for calculation
  let currentYearlyRevenue: number | undefined;
  if (businessProfile?.annualRevenue) {
    const revenueMap: Record<string, number> = {
      "0-100k": 50000,
      "100-500k": 300000,
      "500k-1m": 750000,
      "1-5m": 3000000,
      "5m+": 7500000,
    };
    currentYearlyRevenue = revenueMap[businessProfile.annualRevenue] || 300000;
  }

  // Calculate ROI using the ROI calculator service
  const detailedRoi = await calculateRoiSnapshot({
    sector,
    mustHaveFeatures: projectScope.mustHaveFeatures,
    niceToHaveFeatures: projectScope.niceToHaveFeatures,
    totalInvestment: investment.totalCost,
    currentYearlyRevenue,
    confidence: 'moderate', // Use moderate confidence for proposals
  });

  // Map detailed ROI to proposal RoiSnapshot format
  const assumptions: string[] = [
    `Based on ${sector} sector benchmarks and ${detailedRoi.assumptions.featuresAnalyzed} features analyzed`,
    `Labor rate: $${detailedRoi.assumptions.laborRateAUD}/hour (${sector} sector average)`,
    `Baseline revenue: $${detailedRoi.assumptions.baselineYearlyRevenue.toLocaleString('en-AU')}`,
    `Confidence level: ${detailedRoi.assumptions.confidenceLevel} (realistic projections)`,
    "ROI calculations use industry-standard multipliers and verified benchmarks",
    "Actual results may vary based on implementation quality and market conditions",
    ...detailedRoi.summaryLines,
  ];

  return {
    estimatedAnnualSavings: detailedRoi.annualTimeSavingsValue > 0
      ? detailedRoi.annualTimeSavingsValue
      : undefined,
    estimatedAnnualRevenue: detailedRoi.annualRevenueIncrease > 0
      ? detailedRoi.annualRevenueIncrease
      : undefined,
    paybackPeriod: detailedRoi.paybackPeriodMonths < 999
      ? detailedRoi.paybackPeriodMonths
      : undefined,
    threeYearROI: detailedRoi.threeYearRoiPercent > 0
      ? detailedRoi.threeYearRoiPercent
      : undefined,
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
  const sector = (responseData.sector as Sector) || "other";
  const sectorSpecificData = responseData.sector_specific_data || {};

  // Extract current stack from audit using existing utility
  const currentStack = {
    systems: [] as string[],
    integrations: [] as string[],
    notes: "",
  };

  // Extract from audit if available
  if (auditResults?.techStack) {
    const auditTech = extractAuditTechStack(auditResults.techStack);
    currentStack.systems = auditTech.systems;
    currentStack.integrations = auditTech.integrations;
    
    // Add notes about detected technologies
    if (auditTech.allTechnologies.length > 0) {
      currentStack.notes = `Detected via site analysis: ${auditTech.allTechnologies.join(", ")}`;
    }
  }

  // Also extract from sector_specific_data if available (complement audit data)
  // This matches the logic from discovery-tree API
  if (sectorSpecificData && typeof sectorSpecificData === "object") {
    // Hospitality: POS/PMS stack
    if (sector === "hospitality" && sectorSpecificData.h9) {
      const systemsMatch = sectorSpecificData.h9.match(
        /\b(?:POS|PMS|Square|Toast|Resy|OpenTable|ResDiary)\b/gi
      );
      if (systemsMatch) {
        const sectorSystems = [...new Set(systemsMatch.map((s: string) => s.toLowerCase()))] as string[];
        // Merge with audit systems (avoid duplicates)
        sectorSystems.forEach((sys) => {
          if (!currentStack.systems.some((s) => s.toLowerCase() === sys)) {
            currentStack.systems.push(sys);
          }
        });
      }
    }

    // Retail: Channels
    if (sector === "retail" && sectorSpecificData.r7) {
      const channels = Array.isArray(sectorSpecificData.r7)
        ? sectorSpecificData.r7
        : [sectorSpecificData.r7];
      channels.forEach((channel: any) => {
        if (typeof channel === "string" && channel.length > 0) {
          if (!currentStack.systems.some((s) => s.toLowerCase() === channel.toLowerCase())) {
            currentStack.systems.push(channel);
          }
        }
      });
    }

    // Construction/Trades: Tools
    if (sector === "construction" && sectorSpecificData.t8) {
      const toolsMatch = (sectorSpecificData.t8 as string).match(
        /\b(?:Jobber|ServiceM8|AroFlo|Simpro|Xero|MYOB)\b/gi
      );
      if (toolsMatch) {
        const sectorSystems = [...new Set(toolsMatch.map((s: string) => s.toLowerCase()))] as string[];
        sectorSystems.forEach((sys) => {
          if (!currentStack.systems.some((s) => s.toLowerCase() === sys)) {
            currentStack.systems.push(sys);
          }
        });
      }
    }

    // Professional Services: Delivery tools
    if (sector === "professional-services" && sectorSpecificData.p9) {
      const toolsMatch = sectorSpecificData.p9.match(
        /\b(?:Asana|Trello|Monday|Jira|Notion|Airtable)\b/gi
      );
      if (toolsMatch) {
        const sectorSystems = [...new Set(toolsMatch.map((s: string) => s.toLowerCase()))] as string[];
        sectorSystems.forEach((sys) => {
          if (!currentStack.systems.some((s) => s.toLowerCase() === sys)) {
            currentStack.systems.push(sys);
          }
        });
      }
    }
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

    // Calculate ROI snapshot using real ROI calculator
    const roiSnapshot = await calculateRoiSnapshotForProposal(businessProfile, sector, investment, projectScope);

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
