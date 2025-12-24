import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Investment } from '@/lib/types/proposal';

const colors = {
  primary: '#208091',
  primaryDark: '#134252',
  secondary: '#5E5240',
  accent: '#e0d9d0',
  background: '#FFFCF9',
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
  summary: {
    padding: 20,
    border: `2 solid ${colors.primary}`,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: `1 solid ${colors.accent}`,
  },
  summaryRowLast: {
    borderBottom: 'none',
    marginBottom: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  breakdown: {
    marginTop: 20,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1 solid ${colors.accent}`,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 2,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: `1 solid ${colors.accent}`,
    backgroundColor: colors.background,
  },
  tableRowAlt: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    fontSize: 10,
    color: colors.primaryDark,
  },
  tableCellFeature: {
    flex: 2,
  },
  tableCellWeeks: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
  },
  tableCellCost: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  paymentOptions: {
    marginTop: 20,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1 solid ${colors.accent}`,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottom: `1 solid ${colors.accent}`,
    marginBottom: 5,
    backgroundColor: colors.background,
  },
  milestoneLabel: {
    fontSize: 10,
    color: colors.primaryDark,
    flex: 1,
  },
  milestoneAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    width: 120,
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

  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investment Summary</Text>
        <Text style={{ fontSize: 10, color: colors.secondary, fontStyle: 'italic', padding: 10 }}>
          No investment data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Investment Summary</Text>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Investment:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.totalCost || 0)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={styles.summaryLabel}>Estimated Timeline:</Text>
          <Text style={styles.summaryValue}>{data.totalWeeks || 0} weeks</Text>
        </View>
      </View>

      {/* Cost Breakdown Table */}
      {data.costBreakdown && data.costBreakdown.length > 0 ? (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Cost Breakdown by Feature</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableCellFeature]}>Feature</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellWeeks]}>Timeline</Text>
              <Text style={[styles.tableHeaderText, styles.tableCellCost]}>Cost</Text>
            </View>
            {/* Table Rows */}
            {data.costBreakdown.map((item, index) => {
              const isAlt = index % 2 === 1;
              return (
                <View
                  key={index}
                  style={isAlt ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                >
                  <Text style={[styles.tableCell, styles.tableCellFeature]}>
                    {item.feature || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellWeeks]}>
                    {item.weeks || 0} {item.weeks === 1 ? 'week' : 'weeks'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellCost]}>
                    {formatCurrency(item.cost || 0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Payment Options */}
      {data.paymentOptions && (
        <View style={styles.paymentOptions}>
          <Text style={styles.paymentTitle}>Payment Options</Text>
          {data.paymentOptions.upfront !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Upfront Payment:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.paymentOptions.upfront)}
              </Text>
            </View>
          )}
          {data.paymentOptions.milestones && data.paymentOptions.milestones.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {data.paymentOptions.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <Text style={styles.milestoneLabel}>
                    {milestone.milestone} ({milestone.trigger})
                  </Text>
                  <Text style={styles.milestoneAmount}>
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
