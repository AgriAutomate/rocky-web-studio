import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { HealthScorecard } from '@/lib/types/proposal';

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
  scorecard: {
    padding: 15,
    border: '1 solid #e0d9d0',
    borderRadius: 8,
    backgroundColor: '#FFFCF9',
    marginBottom: 15,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#5E5240',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#208091',
  },
  platform: {
    fontSize: 10,
    color: '#134252',
    marginTop: 10,
    marginBottom: 10,
  },
  issuesList: {
    marginTop: 10,
  },
  issueItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
  recommendationsList: {
    marginTop: 10,
  },
  recommendationItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

interface HealthScorecardSectionProps {
  data: HealthScorecard;
}

export const HealthScorecardSection: React.FC<HealthScorecardSectionProps> = ({ data }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Website Health Scorecard</Text>
      
      <View style={styles.scorecard}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Overall Health Score:</Text>
          <Text style={styles.scoreValue}>{data.overallScore}/100</Text>
        </View>
        
        {data.performanceScore !== undefined && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Performance Score:</Text>
            <Text style={styles.scoreValue}>{data.performanceScore}/100</Text>
          </View>
        )}
        
        {data.seoScore !== undefined && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>SEO Score:</Text>
            <Text style={styles.scoreValue}>{data.seoScore}/100</Text>
          </View>
        )}
        
        {data.technicalScore !== undefined && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Technical Score:</Text>
            <Text style={styles.scoreValue}>{data.technicalScore}/100</Text>
          </View>
        )}
        
        {data.platform && (
          <Text style={styles.platform}>Platform: {data.platform}</Text>
        )}
      </View>

      {data.topIssues.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Top Issues Identified</Text>
          <View style={styles.issuesList}>
            {data.topIssues.map((issue, index) => (
              <Text key={index} style={styles.issueItem}>
                • {issue}
              </Text>
            ))}
          </View>
        </View>
      )}

      {data.recommendations.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Key Recommendations</Text>
          <View style={styles.recommendationsList}>
            {data.recommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {rec}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
