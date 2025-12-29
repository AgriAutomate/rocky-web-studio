/**
 * Capacity Calculator
 * 
 * Calculates current capacity, per-client resource usage, and scaling thresholds
 * based on subscription limits and usage patterns.
 */

// PerplexityUsageStats type imported when needed

export interface ServiceLimits {
  service: string;
  planTier: string;
  limits: {
    [key: string]: {
      limit: number;
      currentUsage: number;
      unit: string;
    };
  };
}

export interface CapacityCalculation {
  service: string;
  limitingResource: string;
  maxClients: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "critical" | "over-capacity";
  notes: string[];
}

export interface PerClientResourceUsage {
  resource: string;
  usagePerClient: number;
  unit: string;
  notes: string;
}

/**
 * Calculate maximum clients supported based on most limiting resource
 */
export function calculateMaxClients(
  serviceLimits: ServiceLimits[],
  perClientUsage: PerClientResourceUsage[]
): CapacityCalculation[] {
  const calculations: CapacityCalculation[] = [];

  for (const service of serviceLimits) {
    let maxClients = Infinity;
    let limitingResource = "";
    let utilizationPercent = 0;
    const notes: string[] = [];

    // Find the most limiting resource for this service
    const serviceLimit = serviceLimits.find((s) => s.service === service.service);
    if (!serviceLimit) {
      notes.push(`Service limits not found for ${service.service}`);
      continue;
    }
    
    for (const [resourceName, resourceData] of Object.entries(serviceLimit.limits)) {
      // Find per-client usage for this resource
      const perClient = perClientUsage.find((p) => p.resource === resourceName);
      
      if (!perClient || !resourceData) {
        notes.push(`No per-client usage data for ${resourceName}`);
        continue;
      }

      if (perClient.usagePerClient <= 0) {
        notes.push(`${resourceName} has zero or negative per-client usage`);
        continue;
      }

      // Calculate max clients based on this resource
      const availableCapacity = resourceData.limit - resourceData.currentUsage;
      const clientsForThisResource = Math.floor(availableCapacity / perClient.usagePerClient);

      if (clientsForThisResource < maxClients) {
        maxClients = clientsForThisResource;
        limitingResource = resourceName;
        utilizationPercent = (resourceData.currentUsage / resourceData.limit) * 100;
      }
    }

    // Determine status
    let status: CapacityCalculation["status"] = "safe";
    if (utilizationPercent >= 90) {
      status = "over-capacity";
    } else if (utilizationPercent >= 75) {
      status = "critical";
    } else if (utilizationPercent >= 50) {
      status = "warning";
    }

    calculations.push({
      service: service.service,
      limitingResource,
      maxClients: maxClients === Infinity ? 0 : maxClients,
      utilizationPercent,
      status,
      notes,
    });
  }

  return calculations;
}

/**
 * Calculate Perplexity-specific capacity
 * Special handling for the 300/day hard limit
 */
export function calculatePerplexityCapacity(
  dailyLimit: number,
  searchesPerJourney: number = 1,
  searchesPerProposal: number = 0
): {
  maxJourneysPerDay: number;
  maxProposalsPerDay: number;
  maxClientsPerMonth: {
    journeysOnly: number;
    proposalsOnly: number;
    mixed: { journeys: number; proposals: number };
  };
  notes: string[];
} {
  const notes: string[] = [];
  
  // If only journeys
  const maxJourneysPerDay = Math.floor(dailyLimit / searchesPerJourney);
  const maxJourneysPerMonth = maxJourneysPerDay * 30;
  
  // If only proposals
  let maxProposalsPerDay = 0;
  let maxProposalsPerMonth = 0;
  if (searchesPerProposal > 0) {
    maxProposalsPerDay = Math.floor(dailyLimit / searchesPerProposal);
    maxProposalsPerMonth = maxProposalsPerDay * 30;
  }

  // Mixed scenario: allocate 50% to journeys, 50% to proposals
  let mixedJourneys = 0;
  let mixedProposals = 0;
  if (searchesPerProposal > 0) {
    const halfLimit = Math.floor(dailyLimit / 2);
    mixedJourneys = Math.floor(halfLimit / searchesPerJourney);
    mixedProposals = Math.floor(halfLimit / searchesPerProposal);
  }

  // Calculate max clients based on usage patterns
  // Assumptions:
  // - 1 journey per client per month (conservative)
  // - 1 proposal per client per month (conservative)
  const maxClientsJourneysOnly = maxJourneysPerMonth; // 1 journey/client/month
  const maxClientsProposalsOnly = maxProposalsPerMonth; // 1 proposal/client/month
  // const maxClientsMixed = Math.min(
  //   mixedJourneys * 30, // clients from journeys
  //   mixedProposals * 30  // clients from proposals
  // );

  notes.push(`Daily limit: ${dailyLimit} searches/day`);
  notes.push(`Searches per journey: ${searchesPerJourney}`);
  if (searchesPerProposal > 0) {
    notes.push(`Searches per proposal: ${searchesPerProposal}`);
  }
  notes.push(`This is a HARD DAILY LIMIT - resets at midnight UTC`);

  return {
    maxJourneysPerDay,
    maxProposalsPerDay,
    maxClientsPerMonth: {
      journeysOnly: maxClientsJourneysOnly,
      proposalsOnly: maxClientsProposalsOnly,
      mixed: {
        journeys: mixedJourneys * 30,
        proposals: mixedProposals * 30,
      },
    },
    notes,
  };
}

/**
 * Calculate cost per client
 */
export function calculateCostPerClient(
  fixedMonthlyCosts: number,
  variableCostsPerClient: number,
  totalClients: number
): {
  fixedCostPerClient: number;
  variableCostPerClient: number;
  totalCostPerClient: number;
  totalMonthlyCost: number;
} {
  const fixedCostPerClient = fixedMonthlyCosts / totalClients;
  const totalCostPerClient = fixedCostPerClient + variableCostsPerClient;
  const totalMonthlyCost = fixedMonthlyCosts + (variableCostsPerClient * totalClients);

  return {
    fixedCostPerClient,
    variableCostPerClient: variableCostsPerClient,
    totalCostPerClient,
    totalMonthlyCost,
  };
}

/**
 * Calculate when to scale based on growth rate
 */
export function calculateScalingTimeline(
  currentClients: number,
  maxClients: number,
  growthRatePerMonth: number // e.g., 0.1 for 10% growth
): {
  monthsUntilWarning: number;
  monthsUntilCritical: number;
  monthsUntilOverCapacity: number;
  projectedClients: {
    month: number;
    clients: number;
    utilization: number;
  }[];
} {
  const warningThreshold = maxClients * 0.5;
  const criticalThreshold = maxClients * 0.75;
  const overCapacityThreshold = maxClients * 0.9;

  let monthsUntilWarning = 0;
  let monthsUntilCritical = 0;
  let monthsUntilOverCapacity = 0;

  let projectedClients = currentClients;
  const projections: { month: number; clients: number; utilization: number }[] = [];

  for (let month = 0; month <= 24; month++) {
    if (month === 0) {
      projectedClients = currentClients;
    } else {
      projectedClients = Math.floor(projectedClients * (1 + growthRatePerMonth));
    }

    const utilization = (projectedClients / maxClients) * 100;

    projections.push({
      month,
      clients: projectedClients,
      utilization,
    });

    if (monthsUntilWarning === 0 && projectedClients >= warningThreshold) {
      monthsUntilWarning = month;
    }
    if (monthsUntilCritical === 0 && projectedClients >= criticalThreshold) {
      monthsUntilCritical = month;
    }
    if (monthsUntilOverCapacity === 0 && projectedClients >= overCapacityThreshold) {
      monthsUntilOverCapacity = month;
    }
  }

  return {
    monthsUntilWarning,
    monthsUntilCritical,
    monthsUntilOverCapacity,
    projectedClients: projections,
  };
}

/**
 * Get capacity status based on utilization
 */
export function getCapacityStatus(utilizationPercent: number): {
  status: "safe" | "warning" | "critical" | "over-capacity";
  message: string;
  actionRequired: string;
} {
  if (utilizationPercent >= 90) {
    return {
      status: "over-capacity",
      message: "Over capacity - immediate action required",
      actionRequired: "Upgrade plan or implement optimizations immediately",
    };
  } else if (utilizationPercent >= 75) {
    return {
      status: "critical",
      message: "Critical zone - scaling planning required",
      actionRequired: "Plan upgrade within 1-2 months, implement optimizations",
    };
  } else if (utilizationPercent >= 50) {
    return {
      status: "warning",
      message: "Warning zone - monitor closely",
      actionRequired: "Monitor trends, plan for scaling, review optimization opportunities",
    };
  } else {
    return {
      status: "safe",
      message: "Safe zone - normal operations",
      actionRequired: "Continue monitoring, no immediate action needed",
    };
  }
}

