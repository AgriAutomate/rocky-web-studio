/**
 * ROI Calculator Service
 * 
 * Calculates Return on Investment (ROI) for proposed features based on:
 * - Sector-specific labor costs (from roi-benchmarks)
 * - Feature-specific time savings and revenue multipliers
 * - Confidence levels (conservative, moderate, optimistic)
 * 
 * All calculations use real Australian data and industry benchmarks.
 * 
 * Example:
 * ```typescript
 * const roi = calculateRoiSnapshot({
 *   sector: 'hospitality',
 *   mustHaveFeatures: ['onlineBooking', 'paymentProcessing', 'emailAutomation'],
 *   totalInvestment: 7500,
 *   currentYearlyRevenue: 585000,
 *   confidence: 'moderate'
 * });
 * ```
 */

import {
  getSectorLaborCost,
  getFeatureRoiMultiplier,
  getSectorAssumptions,
  ROI_CONFIDENCE,
} from '@/lib/config/roi-benchmarks';
import type { Sector } from '@/lib/types/questionnaire';
import { logger } from '@/lib/utils/logger';

/**
 * Input for ROI calculation
 */
export interface RoiInput {
  sector: string;
  mustHaveFeatures: string[];
  niceToHaveFeatures?: string[];
  totalInvestment: number; // AUD
  currentYearlyRevenue?: number; // AUD (optional, will use sector default if not provided)
  confidence?: 'conservative' | 'moderate' | 'optimistic'; // Default: 'moderate'
}

/**
 * Detailed ROI calculation result
 * 
 * This is the internal detailed ROI snapshot. For the proposal PDF,
 * this gets mapped to the simpler RoiSnapshot type in lib/types/proposal.ts
 */
export interface DetailedRoiSnapshot {
  annualTimeSavingsHours: number; // Total hours saved per year
  annualTimeSavingsValue: number; // AUD value of time saved
  annualRevenueIncrease: number; // AUD increase in revenue
  totalAnnualBenefit: number; // Time savings + revenue increase (after confidence adjustment)
  projectInvestment: number; // Original investment amount
  paybackPeriodMonths: number; // Months to recoup investment
  threeYearRoiPercent: number; // Percentage ROI over 3 years
  threeYearTotalBenefit: number; // Total benefit over 3 years (with compound growth)
  assumptions: {
    sector: string;
    confidenceLevel: string;
    laborRateAUD: number;
    baselineYearlyRevenue: number;
    featuresAnalyzed: number;
  };
  summaryLines: string[]; // Human-readable summary statements
}

/**
 * Return type for calculateRoiSnapshot (matches DetailedRoiSnapshot)
 */
export type RoiSnapshot = DetailedRoiSnapshot;

/**
 * Calculate annual time savings from features
 * 
 * For each feature, looks up timeSavedPerWeek and multiplies by 52 weeks,
 * then multiplies by sector labor rate to get AUD value.
 * 
 * @param features - Array of feature keys
 * @param sector - Business sector
 * @param hourlyRate - Labor cost per hour (AUD)
 * @returns Object with total hours and AUD value
 */
function calculateAnnualTimeSavings(
  features: string[],
  sector: Sector,
  hourlyRate: number
): { hours: number; valueAUD: number } {
  let totalHours = 0;

  for (const featureKey of features) {
    const multiplier = getFeatureRoiMultiplier(featureKey);
    
    if (!multiplier) {
      // Feature not found in benchmarks - skip it (non-fatal)
      continue;
    }

    // Check if feature applies to this sector
    if (!multiplier.affectsSectors.includes(sector)) {
      continue; // Skip features that don't apply to this sector
    }

    // Calculate annual hours saved
    const weeklyHours = multiplier.timeSavedPerWeek || 0;
    const annualHours = weeklyHours * 52;
    totalHours += annualHours;
  }

  // Calculate AUD value: hours × hourly rate
  const valueAUD = totalHours * hourlyRate;

  return {
    hours: Math.round(totalHours),
    valueAUD: Math.round(valueAUD),
  };
}

/**
 * Calculate annual revenue increase from features
 * 
 * For each feature with a revenueMultiplier, calculates the revenue impact
 * based on baseline revenue. Sums all impacts to get total increase.
 * 
 * @param features - Array of feature keys
 * @param sector - Business sector
 * @param baselineRevenue - Current annual revenue (AUD)
 * @returns Object with multiplier and AUD value
 */
function calculateRevenueIncrease(
  features: string[],
  sector: Sector,
  baselineRevenue: number
): { multiplier: number; valueAUD: number } {
  let totalMultiplier = 0;
  let totalAbsolute = 0;

  for (const featureKey of features) {
    const multiplier = getFeatureRoiMultiplier(featureKey);
    
    if (!multiplier) {
      continue; // Skip unknown features
    }

    // Check if feature applies to this sector
    if (!multiplier.affectsSectors.includes(sector)) {
      continue;
    }

    // Add percentage multiplier
    if (multiplier.revenueMultiplier) {
      totalMultiplier += multiplier.revenueMultiplier;
    }

    // Add absolute revenue increase
    if (multiplier.revenueAbsolute) {
      totalAbsolute += multiplier.revenueAbsolute;
    }
  }

  // Calculate total revenue increase
  // Percentage-based: baselineRevenue × totalMultiplier
  // Plus any absolute increases
  const valueAUD = baselineRevenue * totalMultiplier + totalAbsolute;

  return {
    multiplier: totalMultiplier,
    valueAUD: Math.round(valueAUD),
  };
}

/**
 * Calculate ROI snapshot from input parameters
 * 
 * This is the main function that orchestrates the ROI calculation:
 * 
 * 1. Gets sector-specific labor costs and assumptions
 * 2. Calculates time savings from all features
 * 3. Calculates revenue increases from features with revenue multipliers
 * 4. Sums time + revenue = total annual benefit
 * 5. Applies confidence multiplier
 * 6. Calculates payback period (investment ÷ monthly benefit)
 * 7. Calculates 3-year ROI with compound growth
 * 8. Generates human-readable summary
 * 
 * @param input - ROI calculation input parameters
 * @returns Complete ROI snapshot with all calculations
 */
export async function calculateRoiSnapshot(input: RoiInput): Promise<RoiSnapshot> {
  try {
    // Normalize sector (handle case variations, default to 'other' if invalid)
    const sector = (input.sector?.toLowerCase() || 'other') as Sector;
    const validSectors: Sector[] = [
      'hospitality',
      'retail',
      'construction',
      'professional-services',
      'healthcare',
      'manufacturing',
      'mining',
      'agriculture',
      'other',
    ];
    
    const normalizedSector = validSectors.includes(sector) ? sector : 'other';

    // Get confidence level (default to 'moderate')
    const confidence = input.confidence || 'moderate';
    const confidenceMultiplier = ROI_CONFIDENCE[confidence];

    // Get sector-specific data
    const laborRate = getSectorLaborCost(normalizedSector);
    const sectorAssumptions = getSectorAssumptions(normalizedSector);

    // Determine baseline revenue
    // Use provided revenue, or fall back to sector typical revenue
    const baselineRevenue = input.currentYearlyRevenue || sectorAssumptions.typicalAnnualRevenue;

    // Combine all features (must-have + nice-to-have)
    const allFeatures = [
      ...input.mustHaveFeatures,
      ...(input.niceToHaveFeatures || []),
    ];

    // Step 1: Calculate time savings
    // For each feature, get weekly time saved, multiply by 52 weeks, then by labor rate
    const timeSavings = calculateAnnualTimeSavings(
      allFeatures,
      normalizedSector,
      laborRate
    );

    // Step 2: Calculate revenue increase
    // For each feature with revenueMultiplier, calculate impact on baseline revenue
    const revenueIncrease = calculateRevenueIncrease(
      allFeatures,
      normalizedSector,
      baselineRevenue
    );

    // Step 3: Calculate total annual benefit
    // Total benefit = time savings value + revenue increase
    const totalAnnualBenefit = timeSavings.valueAUD + revenueIncrease.valueAUD;

    // Step 4: Apply confidence multiplier
    // Conservative: 0.7 (30% reduction), Moderate: 1.0, Optimistic: 1.5 (50% increase)
    const adjustedAnnualBenefit = totalAnnualBenefit * confidenceMultiplier;

    // Step 5: Calculate payback period
    // Payback = investment ÷ (annual benefit ÷ 12 months)
    // If benefit is 0 or negative, set payback to a high number (999 months = never)
    const monthlyBenefit = adjustedAnnualBenefit / 12;
    const paybackPeriodMonths = monthlyBenefit > 0
      ? Math.round((input.totalInvestment / monthlyBenefit) * 10) / 10 // Round to 1 decimal
      : 999;

    // Step 6: Calculate 3-year ROI
    // Year 1: adjustedAnnualBenefit
    // Year 2: adjustedAnnualBenefit × 1.11 (11% compound growth - conservative estimate)
    // Year 3: adjustedAnnualBenefit × 1.15 (15% compound growth - accounts for scaling)
    // Total 3-year benefit = Year 1 + Year 2 + Year 3
    // 3-Year ROI = ((Total 3-Year Benefit - Investment) ÷ Investment) × 100
    const year1Benefit = adjustedAnnualBenefit;
    const year2Benefit = adjustedAnnualBenefit * 1.11; // 11% compound growth
    const year3Benefit = adjustedAnnualBenefit * 1.15; // 15% compound growth (scaling effects)
    const threeYearTotalBenefit = year1Benefit + year2Benefit + year3Benefit;
    
    const threeYearRoiPercent = input.totalInvestment > 0
      ? Math.round(((threeYearTotalBenefit - input.totalInvestment) / input.totalInvestment) * 100 * 10) / 10 // Round to 1 decimal
      : 0;

    // Step 7: Generate assumptions object
    const assumptions = {
      sector: normalizedSector,
      confidenceLevel: confidence,
      laborRateAUD: laborRate,
      baselineYearlyRevenue: baselineRevenue,
      featuresAnalyzed: allFeatures.length,
    };

    // Step 8: Generate human-readable summary lines
    const summaryLines: string[] = [];

    if (timeSavings.hours > 0) {
      summaryLines.push(
        `Saves ${timeSavings.hours.toLocaleString('en-AU')} hours per year (${Math.round(timeSavings.hours / 52)} hours per week)`
      );
      summaryLines.push(
        `Time savings value: $${timeSavings.valueAUD.toLocaleString('en-AU')} per year (at $${laborRate}/hour)`
      );
    }

    if (revenueIncrease.valueAUD > 0) {
      if (revenueIncrease.multiplier > 0) {
        summaryLines.push(
          `Revenue increase: ${(revenueIncrease.multiplier * 100).toFixed(1)}% ($${revenueIncrease.valueAUD.toLocaleString('en-AU')} per year)`
        );
      } else {
        summaryLines.push(
          `Revenue increase: $${revenueIncrease.valueAUD.toLocaleString('en-AU')} per year`
        );
      }
    }

    summaryLines.push(
      `Total annual benefit: $${Math.round(adjustedAnnualBenefit).toLocaleString('en-AU')} per year`
    );

    if (paybackPeriodMonths < 999) {
      if (paybackPeriodMonths < 1) {
        summaryLines.push(`Payback period: Less than 1 month`);
      } else if (paybackPeriodMonths < 12) {
        summaryLines.push(
          `Payback period: ${paybackPeriodMonths.toFixed(1)} months (${(paybackPeriodMonths / 12).toFixed(1)} years)`
        );
      } else {
        summaryLines.push(
          `Payback period: ${(paybackPeriodMonths / 12).toFixed(1)} years`
        );
      }
    } else {
      summaryLines.push(`Payback period: Not achievable with current projections`);
    }

    summaryLines.push(
      `3-Year ROI: ${threeYearRoiPercent.toFixed(1)}% ($${Math.round(threeYearTotalBenefit).toLocaleString('en-AU')} total benefit over 3 years)`
    );

    // Log calculation for debugging
    await logger.info('ROI calculation completed', {
      sector: normalizedSector,
      features: allFeatures.length,
      investment: input.totalInvestment,
      annualBenefit: Math.round(adjustedAnnualBenefit),
      paybackMonths: paybackPeriodMonths,
      threeYearROI: threeYearRoiPercent,
    });

    return {
      annualTimeSavingsHours: timeSavings.hours,
      annualTimeSavingsValue: timeSavings.valueAUD,
      annualRevenueIncrease: revenueIncrease.valueAUD,
      totalAnnualBenefit: Math.round(adjustedAnnualBenefit),
      projectInvestment: input.totalInvestment,
      paybackPeriodMonths,
      threeYearRoiPercent,
      threeYearTotalBenefit: Math.round(threeYearTotalBenefit),
      assumptions,
      summaryLines,
    };
  } catch (error) {
    await logger.error('ROI calculation failed', {
      sector: input.sector,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
