import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ProjectScope } from '@/lib/types/proposal';

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
  list: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
  integrationItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
  metricItem: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

interface ProjectScopeSectionProps {
  data: ProjectScope;
}

export const ProjectScopeSection: React.FC<ProjectScopeSectionProps> = ({ data }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Project Scope</Text>

      {/* Must-Have Features */}
      {data.mustHaveFeatures.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Must-Have Features</Text>
          <View style={styles.list}>
            {data.mustHaveFeatures.map((feature, index) => (
              <Text key={index} style={styles.listItem}>
                • {feature}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Nice-to-Have Features */}
      {data.niceToHaveFeatures.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Nice-to-Have Features</Text>
          <View style={styles.list}>
            {data.niceToHaveFeatures.map((feature, index) => (
              <Text key={index} style={styles.listItem}>
                • {feature}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Future Features */}
      {data.futureFeatures.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Future Considerations</Text>
          <View style={styles.list}>
            {data.futureFeatures.map((feature, index) => (
              <Text key={index} style={styles.listItem}>
                • {feature}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Integrations */}
      {data.integrations.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Required Integrations</Text>
          <View style={styles.list}>
            {data.integrations.map((integration, index) => (
              <Text key={index} style={styles.integrationItem}>
                • {integration.name} ({integration.type}) - {integration.priority}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Data Migration */}
      {data.dataMigration && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Data Migration</Text>
          <Text style={styles.listItem}>
            Required: {data.dataMigration.required ? 'Yes' : 'No'}
          </Text>
          {data.dataMigration.dataTypes && data.dataMigration.dataTypes.length > 0 && (
            <View style={styles.list}>
              {data.dataMigration.dataTypes.map((type, index) => (
                <Text key={index} style={styles.listItem}>
                  • {type}
                </Text>
              ))}
            </View>
          )}
          {data.dataMigration.volume && (
            <Text style={styles.listItem}>
              Volume: {data.dataMigration.volume}
            </Text>
          )}
        </View>
      )}

      {/* Success Metrics */}
      {data.successMetrics.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Success Metrics</Text>
          <View style={styles.list}>
            {data.successMetrics.map((metric, index) => (
              <Text key={index} style={styles.metricItem}>
                • {metric.metric}
                {metric.target && ` (Target: ${metric.target})`}
                {metric.timeframe && ` (Timeframe: ${metric.timeframe})`}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
