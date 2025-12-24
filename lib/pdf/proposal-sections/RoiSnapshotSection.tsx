import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { RoiSnapshot } from '@/lib/types/proposal';

const colors = {
  primary: '#208091',
  primaryDark: '#134252',
  secondary: '#5E5240',
  accent: '#e0d9d0',
  background: '#FFFCF9',
  success: '#22c55e',
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
    break: false,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: `2 solid ${colors.primary}`,
  },
  snapshot: {
    padding: 20,
    border: `2 solid ${colors.primary}`,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: `1 solid ${colors.accent}`,
  },
  snapshotRowLast: {
    borderBottom: 'none',
    marginBottom: 0,
    paddingBottom: 0,
  },
  snapshotLabel: {
    fontSize: 12,
    color: colors.secondary,
    flex: 1,
  },
  snapshotValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },
  roiHighlight: {
    padding: 15,
    backgroundColor: colors.success,
    borderRadius: 4,
    marginTop: 15,
  },
  roiHighlightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  assumptions: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 4,
    border: `1 solid ${colors.accent}`,
  },
  assumptionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: `1 solid ${colors.accent}`,
  },
  assumptionItem: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 5,
    paddingLeft: 12,
    lineHeight: 1.4,
  },
  emptyState: {
    fontSize: 10,
    color: colors.secondary,
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
});

interface RoiSnapshotSectionProps {
  data: RoiSnapshot;
}

export const RoiSnapshotSection: React.FC<RoiSnapshotSectionProps> = ({ data }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ROI Snapshot</Text>
        <Text style={styles.emptyState}>No ROI data available</Text>
      </View>
    );
  }

  const hasRoiData =
    data.estimatedAnnualSavings !== undefined ||
    data.estimatedAnnualRevenue !== undefined ||
    data.paybackPeriod !== undefined ||
    data.threeYearROI !== undefined;

  const roiRows = [
    {
      label: 'Estimated Annual Savings',
      value: data.estimatedAnnualSavings,
      format: (v: number) => formatCurrency(v),
    },
    {
      label: 'Estimated Annual Revenue Increase',
      value: data.estimatedAnnualRevenue,
      format: (v: number) => formatCurrency(v),
    },
    {
      label: 'Estimated Payback Period',
      value: data.paybackPeriod,
      format: (v: number) => `${v} ${v === 1 ? 'month' : 'months'}`,
    },
    {
      label: '3-Year ROI',
      value: data.threeYearROI,
      format: (v: number) => `${v.toFixed(1)}%`,
      isLast: true,
    },
  ].filter((row) => row.value !== undefined);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ROI Snapshot</Text>

      {hasRoiData ? (
        <>
          <View style={styles.snapshot}>
            {roiRows.map((row, index) => {
              const isLast = row.isLast;
              return (
                <View
                  key={index}
                  style={isLast ? [styles.snapshotRow, styles.snapshotRowLast] : styles.snapshotRow}
                >
                  <Text style={styles.snapshotLabel}>{row.label}:</Text>
                  <Text style={styles.snapshotValue}>
                    {row.value !== undefined ? row.format(row.value) : 'N/A'}
                  </Text>
                </View>
              );
            })}

            {data.threeYearROI !== undefined && data.threeYearROI > 0 && (
              <View style={styles.roiHighlight}>
                <Text style={styles.roiHighlightText}>
                  Projected 3-Year Return: {data.threeYearROI.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          {/* Assumptions */}
          {data.assumptions && data.assumptions.length > 0 && (
            <View style={styles.assumptions}>
              <Text style={styles.assumptionsTitle}>ROI Calculation Assumptions</Text>
              {data.assumptions.map((assumption, index) => (
                <Text key={index} style={styles.assumptionItem}>
                  • {assumption}
                </Text>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.emptyState}>
          ROI calculations will be available once business metrics are finalized.
        </Text>
      )}
    </View>
  );
};
