import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Investment } from '@/lib/types/proposal';

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
  summary: {
    padding: 15,
    border: '1 solid #e0d9d0',
    borderRadius: 8,
    backgroundColor: '#FFFCF9',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#134252',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#208091',
  },
  breakdown: {
    marginTop: 15,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1 solid #e0d9d0',
    marginBottom: 5,
  },
  breakdownFeature: {
    fontSize: 10,
    color: '#134252',
    flex: 1,
  },
  breakdownCost: {
    fontSize: 10,
    color: '#134252',
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
  breakdownWeeks: {
    fontSize: 10,
    color: '#5E5240',
    width: 80,
    textAlign: 'right',
  },
});

interface InvestmentSectionProps {
  data: Investment;
}

export const InvestmentSection: React.FC<InvestmentSectionProps> = ({ data }) => {
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
      <Text style={styles.sectionTitle}>Investment Summary</Text>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Investment:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.totalCost)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Timeline:</Text>
          <Text style={styles.summaryValue}>{data.totalWeeks} weeks</Text>
        </View>
      </View>

      {/* Cost Breakdown */}
      {data.costBreakdown.length > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Cost Breakdown by Feature</Text>
          {data.costBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <Text style={styles.breakdownFeature}>{item.feature}</Text>
              <Text style={styles.breakdownWeeks}>{item.weeks} weeks</Text>
              <Text style={styles.breakdownCost}>{formatCurrency(item.cost)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Payment Options */}
      {data.paymentOptions && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Payment Options</Text>
          {data.paymentOptions.upfront !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Upfront Payment:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.paymentOptions.upfront)}
              </Text>
            </View>
          )}
          {data.paymentOptions.milestones && data.paymentOptions.milestones.length > 0 && (
            <View style={styles.breakdown}>
              {data.paymentOptions.milestones.map((milestone, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <Text style={styles.breakdownFeature}>
                    {milestone.milestone} ({milestone.trigger})
                  </Text>
                  <Text style={styles.breakdownCost}>
                    {formatCurrency(milestone.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
