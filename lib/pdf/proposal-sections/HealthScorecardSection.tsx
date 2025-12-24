import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { HealthScorecard } from '@/lib/types/proposal';

const colors = {
  primary: '#208091',
  primaryDark: '#134252',
  secondary: '#5E5240',
  accent: '#e0d9d0',
  background: '#FFFCF9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
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
  scorecard: {
    padding: 18,
    border: `2 solid ${colors.accent}`,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  scoreTable: {
    marginBottom: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottom: `1 solid ${colors.accent}`,
  },
  scoreRowLast: {
    borderBottom: 'none',
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.secondary,
    flex: 1,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    width: 80,
    textAlign: 'right',
  },
  scoreBar: {
    width: 100,
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 4,
    marginLeft: 10,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  platform: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  subsection: {
    marginTop: 20,
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: `1 solid ${colors.accent}`,
  },
  issuesList: {
    marginTop: 8,
  },
  issueItem: {
    fontSize: 10,
    color: colors.primaryDark,
    marginBottom: 6,
    paddingLeft: 12,
    lineHeight: 1.5,
  },
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    fontSize: 10,
    color: colors.primaryDark,
    marginBottom: 6,
    paddingLeft: 12,
    lineHeight: 1.5,
  },
  emptyState: {
    fontSize: 10,
    color: colors.secondary,
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
});

interface HealthScorecardSectionProps {
  data: HealthScorecard;
}

/**
 * Get score color based on value
 */
const getScoreColor = (score: number): string => {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.danger;
};

export const HealthScorecardSection: React.FC<HealthScorecardSectionProps> = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Website Health Scorecard</Text>
        <Text style={styles.emptyState}>No health scorecard data available</Text>
      </View>
    );
  }

  const scores = [
    { label: 'Overall Health Score', value: data.overallScore, isOverall: true },
    { label: 'Performance Score', value: data.performanceScore },
    { label: 'SEO Score', value: data.seoScore },
    { label: 'Technical Score', value: data.technicalScore },
  ].filter((s) => s.value !== undefined);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Website Health Scorecard</Text>
      
      <View style={styles.scorecard}>
        <View style={styles.scoreTable}>
          {scores.map((score, index) => {
            const isLast = index === scores.length - 1;
            return (
              <View
                key={index}
                style={isLast ? [styles.scoreRow, styles.scoreRowLast] : styles.scoreRow}
              >
              <Text style={styles.scoreLabel}>{score.label}:</Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${score.value || 0}%`,
                      backgroundColor: getScoreColor(score.value || 0),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(score.value || 0) },
                ]}
              >
                {score.value}/100
              </Text>
              </View>
            );
          })}
        </View>
        
        {data.platform && (
          <Text style={styles.platform}>Detected Platform: {data.platform}</Text>
        )}
      </View>

      {data.topIssues && data.topIssues.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Top Issues Identified</Text>
          <View style={styles.issuesList}>
            {data.topIssues.slice(0, 5).map((issue, index) => (
              <Text key={index} style={styles.issueItem}>
                • {issue}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {data.recommendations && data.recommendations.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Key Recommendations</Text>
          <View style={styles.recommendationsList}>
            {data.recommendations.slice(0, 5).map((rec, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {rec}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};
