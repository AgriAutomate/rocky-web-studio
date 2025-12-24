import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { CurrentStateAnalysis } from '@/lib/types/proposal';

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
  subsection: {
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

interface CurrentStateSectionProps {
  data: CurrentStateAnalysis;
}

export const CurrentStateSection: React.FC<CurrentStateSectionProps> = ({ data }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current State Analysis</Text>

      {/* Business Profile */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Business Profile</Text>
        <Text style={styles.text}>
          Annual Revenue: {data.businessProfile.annualRevenue}
        </Text>
        <Text style={styles.text}>
          Employee Count: {data.businessProfile.employeeCount}
        </Text>
        <Text style={styles.text}>
          Years in Business: {data.businessProfile.yearsInBusiness}
        </Text>
        <Text style={styles.text}>
          Digital Maturity: {data.businessProfile.digitalMaturity}
        </Text>
      </View>

      {/* Current Stack */}
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
              Load Time: {data.websiteInfo.loadTime}ms
            </Text>
          )}
        </View>
      )}

      {/* Pain Points */}
      {data.painPoints.length > 0 && (
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
      {data.goals.length > 0 && (
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
