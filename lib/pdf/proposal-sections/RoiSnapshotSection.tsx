import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { RoiSnapshot } from '@/lib/types/proposal';

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
    break: false,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#134252',
    marginBottom: 15,
  },
  snapshot: {
    padding: 15,
    border: '1 solid #e0d9d0',
    borderRadius: 8,
    backgroundColor: '#FFFCF9',
    marginBottom: 15,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  snapshotLabel: {
    fontSize: 11,
    color: '#5E5240',
  },
  snapshotValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#208091',
  },
  assumptions: {
    marginTop: 15,
  },
  assumptionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 8,
  },
  assumptionItem: {
    fontSize: 9,
    color: '#5E5240',
    marginBottom: 4,
    paddingLeft: 10,
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ROI Snapshot</Text>

      <View style={styles.snapshot}>
        {data.estimatedAnnualSavings !== undefined && (
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Estimated Annual Savings:</Text>
            <Text style={styles.snapshotValue}>
              {formatCurrency(data.estimatedAnnualSavings)}
            </Text>
          </View>
        )}

        {data.estimatedAnnualRevenue !== undefined && (
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Estimated Annual Revenue Increase:</Text>
            <Text style={styles.snapshotValue}>
              {formatCurrency(data.estimatedAnnualRevenue)}
            </Text>
          </View>
        )}

        {data.paybackPeriod !== undefined && (
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Estimated Payback Period:</Text>
            <Text style={styles.snapshotValue}>{data.paybackPeriod} months</Text>
          </View>
        )}

        {data.threeYearROI !== undefined && (
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>3-Year ROI:</Text>
            <Text style={styles.snapshotValue}>{data.threeYearROI.toFixed(1)}%</Text>
          </View>
        )}
      </View>

      {/* Assumptions */}
      {data.assumptions.length > 0 && (
        <View style={styles.assumptions}>
          <Text style={styles.assumptionsTitle}>ROI Calculation Assumptions</Text>
          {data.assumptions.map((assumption, index) => (
            <Text key={index} style={styles.assumptionItem}>
              • {assumption}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
