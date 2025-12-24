import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { CurrentStateAnalysis } from '@/lib/types/proposal';

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
  subsection: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 4,
    border: `1 solid ${colors.accent}`,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: `1 solid ${colors.accent}`,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 10,
    color: colors.primaryDark,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
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

interface CurrentStateSectionProps {
  data: CurrentStateAnalysis;
}

export const CurrentStateSection: React.FC<CurrentStateSectionProps> = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current State Analysis</Text>
        <Text style={styles.emptyState}>No current state data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current State Analysis</Text>

      {/* Business Profile */}
      {data.businessProfile && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Business Profile</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Annual Revenue</Text>
              <Text style={styles.infoValue}>
                {data.businessProfile.annualRevenue || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Employee Count</Text>
              <Text style={styles.infoValue}>
                {data.businessProfile.employeeCount || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Years in Business</Text>
              <Text style={styles.infoValue}>
                {data.businessProfile.yearsInBusiness || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Digital Maturity</Text>
              <Text style={styles.infoValue}>
                {data.businessProfile.digitalMaturity || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Current Stack */}
      {data.currentStack && (
        <>
          {(data.currentStack.systems?.length || 0) > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Current Systems</Text>
              <View style={styles.list}>
                {data.currentStack.systems?.map((system, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {system}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {(data.currentStack.integrations?.length || 0) > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Current Integrations</Text>
              <View style={styles.list}>
                {data.currentStack.integrations?.map((integration, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {integration}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {data.currentStack.notes && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Notes</Text>
              <Text style={styles.text}>{data.currentStack.notes}</Text>
            </View>
          )}
        </>
      )}

      {/* Website Info */}
      {data.websiteInfo && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Website Information</Text>
          {data.websiteInfo.url && (
            <Text style={styles.text}>URL: {data.websiteInfo.url}</Text>
          )}
          {data.websiteInfo.platform && (
            <Text style={styles.text}>Platform: {data.websiteInfo.platform}</Text>
          )}
          {data.websiteInfo.isAccessible !== undefined && (
            <Text style={styles.text}>
              Accessible: {data.websiteInfo.isAccessible ? 'Yes' : 'No'}
            </Text>
          )}
          {data.websiteInfo.loadTime && (
            <Text style={styles.text}>
              Load Time: {(data.websiteInfo.loadTime / 1000).toFixed(2)}s
            </Text>
          )}
        </View>
      )}

      {/* Pain Points */}
      {data.painPoints && data.painPoints.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Identified Pain Points</Text>
          <View style={styles.list}>
            {data.painPoints.map((painPoint, index) => (
              <Text key={index} style={styles.listItem}>
                • {painPoint}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Goals */}
      {data.goals && data.goals.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Business Goals</Text>
          <View style={styles.list}>
            {data.goals.map((goal, index) => (
              <Text key={index} style={styles.listItem}>
                • {goal}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
