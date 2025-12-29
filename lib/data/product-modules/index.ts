/**
 * Product Module Registry
 * 
 * Central registry and lookup system for all product modules.
 * Provides functions to query modules by various criteria.
 */

import type { ProductModule, ModuleRecommendation, ProductModuleCategory } from "@/lib/types/product-modules";
import type { Sector } from "@/lib/types/questionnaire";

// Import all modules
import { workflowAutomation } from "./automation/01-workflow-automation";
import { dataEntryAutomation } from "./automation/02-data-entry-automation";
import { costVisibilityDashboards } from "./efficiency/01-cost-visibility-dashboards";
import { predictiveAnalytics } from "./efficiency/02-predictive-analytics";
import { dynamicPricing } from "./revenue/01-dynamic-pricing";
import { customerProfitabilityAnalysis } from "./revenue/02-customer-profitability-analysis";
import { upsellCrosssellAutomation } from "./revenue/03-upsell-crosssell-automation";
import { costStructureOptimization } from "./revenue/04-cost-structure-optimization";
import { revenueDiversification } from "./revenue/05-revenue-diversification";
import { invoicingCollectionAcceleration } from "./cash-flow/01-invoicing-collection-acceleration";
import { billingCashCollectionAcceleration } from "./cash-flow/02-billing-cash-collection-acceleration";
import { expenseManagementWorkingCapital } from "./cash-flow/03-expense-management-working-capital";
import { businessIntelligenceProfitability } from "./cash-flow/04-business-intelligence-profitability";
import { microLendingIntegration } from "./cash-flow/05-micro-lending-integration";
import { cashFlowForecasting } from "./cash-flow/06-cash-flow-forecasting";
import { complianceAutomationDocumentation } from "./compliance/01-compliance-automation-documentation";
import { regulatoryIntelligenceMonitoring } from "./compliance/02-regulatory-intelligence-monitoring";
import { professionalAdvisorsIntegration } from "./compliance/03-professional-advisors-integration";
import { sectorSpecificCompliance } from "./compliance/04-sector-specific-compliance";
import { governmentGrants } from "./compliance/05-government-grants";
import { technologyChoiceStrategy } from "./digital-transformation/01-technology-choice-strategy";
import { changeManagementStaffEnablement } from "./digital-transformation/02-change-management-staff-enablement";
import { endToEndImplementation } from "./digital-transformation/03-end-to-end-implementation";
import { vendorManagementIntegration } from "./digital-transformation/04-vendor-management-integration";
import { foundationalSecurity } from "./security/01-foundational-security";
import { multiLayerSecurity } from "./security/02-multi-layer-security";
import { monitoringIncidentResponse } from "./security/03-monitoring-incident-response";
import { staffCybersecurityTraining } from "./security/04-staff-cybersecurity-training";
import { cyberInsuranceSupport } from "./security/05-cyber-insurance-support";
import { labourAutomationProductivity } from "./labour/01-labour-automation-productivity";
import { staffProductivityUpskilling } from "./labour/02-staff-productivity-upskilling";
import { remoteWorkContractorIntegration } from "./labour/03-remote-work-contractor-integration";
import { workforcePlanningCapacity } from "./labour/04-workforce-planning-capacity";
import { marketIntelligenceCustomerUnderstanding } from "./customer/01-market-intelligence-customer-understanding";
import { retentionLifetimeValueOptimization } from "./customer/02-retention-lifetime-value-optimization";
import { digitalChannelExpansion } from "./customer/03-digital-channel-expansion";
import { personalization } from "./customer/04-personalization";
import { digitalMarketExpansion } from "./market-expansion/01-digital-market-expansion";
import { logisticsOptimization } from "./market-expansion/02-logistics-optimization";
import { regionalSupplyChainNetworks } from "./market-expansion/03-regional-supply-chain-networks";
import { serviceDeliveryDigitalization } from "./market-expansion/04-service-delivery-digitalization";
import { connectivityOptimizedDesign } from "./connectivity/01-connectivity-optimized-design";
import { connectivityRedundancy } from "./connectivity/02-connectivity-redundancy";
import { networkInfrastructureGuidance } from "./connectivity/03-network-infrastructure-guidance";
import { governmentAssistanceNavigation } from "./connectivity/04-government-assistance-navigation";
import { businessIntelligenceDashboard } from "./leadership/01-business-intelligence-dashboard";
import { processDocumentationSystematization } from "./leadership/02-process-documentation-systematization";
import { strategicPlanningGoalManagement } from "./leadership/03-strategic-planning-goal-management";
import { decisionSupportSystems } from "./leadership/04-decision-support-systems";

/**
 * Complete registry of all product modules
 */
export const ALL_MODULES: ProductModule[] = [
  // Automation
  workflowAutomation,
  dataEntryAutomation,
  
  // Efficiency
  costVisibilityDashboards,
  predictiveAnalytics,
  
  // Revenue
  dynamicPricing,
  customerProfitabilityAnalysis,
  upsellCrosssellAutomation,
  costStructureOptimization,
  revenueDiversification,
  
  // Cash Flow
  invoicingCollectionAcceleration,
  billingCashCollectionAcceleration,
  expenseManagementWorkingCapital,
  businessIntelligenceProfitability,
  microLendingIntegration,
  cashFlowForecasting,
  
  // Compliance
  complianceAutomationDocumentation,
  regulatoryIntelligenceMonitoring,
  professionalAdvisorsIntegration,
  sectorSpecificCompliance,
  governmentGrants,
  
  // Digital Transformation
  technologyChoiceStrategy,
  changeManagementStaffEnablement,
  endToEndImplementation,
  vendorManagementIntegration,
  
  // Security
  foundationalSecurity,
  multiLayerSecurity,
  monitoringIncidentResponse,
  staffCybersecurityTraining,
  cyberInsuranceSupport,
  
  // Labour
  labourAutomationProductivity,
  staffProductivityUpskilling,
  remoteWorkContractorIntegration,
  workforcePlanningCapacity,
  
  // Customer
  marketIntelligenceCustomerUnderstanding,
  retentionLifetimeValueOptimization,
  digitalChannelExpansion,
  personalization,
  
  // Market Expansion
  digitalMarketExpansion,
  logisticsOptimization,
  regionalSupplyChainNetworks,
  serviceDeliveryDigitalization,
  
  // Connectivity
  connectivityOptimizedDesign,
  connectivityRedundancy,
  networkInfrastructureGuidance,
  governmentAssistanceNavigation,
  
  // Leadership
  businessIntelligenceDashboard,
  processDocumentationSystematization,
  strategicPlanningGoalManagement,
  decisionSupportSystems,
];

/**
 * Module lookup by ID
 */
const MODULES_BY_ID = new Map<string, ProductModule>();
ALL_MODULES.forEach(module => {
  MODULES_BY_ID.set(module.id, module);
});

/**
 * Get a module by its ID
 */
export function getModuleById(id: string): ProductModule | undefined {
  return MODULES_BY_ID.get(id);
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category: ProductModuleCategory): ProductModule[] {
  return ALL_MODULES.filter(module => module.category === category);
}

/**
 * Get modules compatible with a specific sector
 * If module has empty sectorCompatibility array, it's compatible with all sectors
 */
export function getModulesBySector(sector: Sector): ProductModule[] {
  return ALL_MODULES.filter(module => 
    module.sectorCompatibility.length === 0 || module.sectorCompatibility.includes(sector)
  );
}

/**
 * Get modules that address specific challenges
 */
export function getModulesByChallengeIds(challengeIds: number[]): ProductModule[] {
  return ALL_MODULES.filter(module =>
    module.challengeIds.some(id => challengeIds.includes(id))
  );
}

/**
 * Get recommended modules based on client needs
 * 
 * @param challengeIds - Array of challenge IDs (1-10) the client faces
 * @param sector - Client's business sector
 * @param maxResults - Maximum number of recommendations to return (default: 10)
 * @returns Array of module recommendations sorted by relevance score
 */
export function getRecommendedModules(
  challengeIds: number[],
  sector?: Sector,
  maxResults: number = 10
): ModuleRecommendation[] {
  const recommendations: ModuleRecommendation[] = [];
  
  for (const module of ALL_MODULES) {
    // Skip if sector is specified and module is not compatible
    if (sector && module.sectorCompatibility.length > 0 && !module.sectorCompatibility.includes(sector)) {
      continue;
    }
    
    // Calculate relevance score
    let score = 0;
    const reasons: string[] = [];
    
    // Score based on challenge overlap
    const challengeOverlap = module.challengeIds.filter(id => challengeIds.includes(id)).length;
    if (challengeOverlap > 0) {
      score += challengeOverlap * 30;
      reasons.push(`Addresses ${challengeOverlap} of your selected challenge${challengeOverlap > 1 ? 's' : ''}`);
    }
    
    // Bonus for sector compatibility
    if (sector && (module.sectorCompatibility.length === 0 || module.sectorCompatibility.includes(sector))) {
      score += 10;
      reasons.push("Compatible with your sector");
    }
    
    // Lower score if module has dependencies that aren't met
    // (This could be enhanced to check if dependencies are in the recommendation list)
    
    if (score > 0) {
      recommendations.push({
        module,
        score,
        reasons,
      });
    }
  }
  
  // Sort by score (highest first) and return top results
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Get all modules (for testing/debugging)
 */
export function getAllModules(): ProductModule[] {
  return [...ALL_MODULES];
}

/**
 * Get module count by category
 */
export function getModuleCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  ALL_MODULES.forEach(module => {
    counts[module.category] = (counts[module.category] || 0) + 1;
  });
  return counts;
}

/**
 * Resolve module dependencies
 * Returns modules in order where dependencies come before dependents
 */
export function resolveModuleDependencies(moduleIds: string[]): ProductModule[] {
  const resolved: ProductModule[] = [];
  const resolvedIds = new Set<string>();
  const modules = moduleIds.map(id => getModuleById(id)).filter((m): m is ProductModule => Boolean(m));
  
  function resolve(module: ProductModule) {
    if (resolvedIds.has(module.id)) {
      return;
    }
    
    // Resolve dependencies first
    for (const depId of module.dependencies) {
      const dep = getModuleById(depId);
      if (dep && !resolvedIds.has(depId)) {
        resolve(dep);
      }
    }
    
    resolved.push(module);
    resolvedIds.add(module.id);
  }
  
  modules.forEach(module => resolve(module));
  return resolved;
}

/**
 * Get related modules for a given module ID
 */
export function getRelatedModules(moduleId: string): ProductModule[] {
  const module = getModuleById(moduleId);
  if (!module) {
    return [];
  }
  
  return module.relatedModules
    .map(id => getModuleById(id))
    .filter((m): m is ProductModule => Boolean(m));
}

