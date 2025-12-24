import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ProjectScope } from '@/lib/types/proposal';

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
  integrationTable: {
    marginTop: 10,
  },
  integrationHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 2,
  },
  integrationHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  integrationRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `1 solid ${colors.accent}`,
    backgroundColor: colors.background,
  },
  integrationRowAlt: {
    backgroundColor: '#ffffff',
  },
  integrationCell: {
    fontSize: 9,
    color: colors.primaryDark,
  },
  integrationName: {
    flex: 2,
  },
  integrationType: {
    flex: 1,
  },
  integrationPriority: {
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    fontSize: 10,
    color: colors.secondary,
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
});

interface ProjectScopeSectionProps {
  data: ProjectScope;
}

export const ProjectScopeSection: React.FC<ProjectScopeSectionProps> = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Scope</Text>
        <Text style={styles.emptyState}>No project scope data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Project Scope</Text>

      {/* Must-Have Features */}
      {data.mustHaveFeatures && data.mustHaveFeatures.length > 0 && (
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
      {data.niceToHaveFeatures && data.niceToHaveFeatures.length > 0 && (
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
      {data.futureFeatures && data.futureFeatures.length > 0 && (
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

      {/* Integrations Table */}
      {data.integrations && data.integrations.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Required Integrations</Text>
          <View style={styles.integrationTable}>
            <View style={styles.integrationHeader}>
              <Text style={[styles.integrationHeaderText, styles.integrationName]}>System</Text>
              <Text style={[styles.integrationHeaderText, styles.integrationType]}>Type</Text>
              <Text style={[styles.integrationHeaderText, styles.integrationPriority]}>Priority</Text>
            </View>
            {data.integrations.map((integration, index) => {
              const isAlt = index % 2 === 1;
              return (
                <View
                  key={index}
                  style={isAlt ? [styles.integrationRow, styles.integrationRowAlt] : styles.integrationRow}
                >
                  <Text style={[styles.integrationCell, styles.integrationName]}>
                    {integration.name || 'N/A'}
                  </Text>
                  <Text style={[styles.integrationCell, styles.integrationType]}>
                    {integration.type || 'N/A'}
                  </Text>
                  <Text style={[styles.integrationCell, styles.integrationPriority]}>
                    {integration.priority || 'N/A'}
                  </Text>
                </View>
              );
            })}
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
              Estimated Volume: {data.dataMigration.volume}
            </Text>
          )}
        </View>
      )}

      {/* Success Metrics */}
      {data.successMetrics && data.successMetrics.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Success Metrics</Text>
          <View style={styles.list}>
            {data.successMetrics.map((metric, index) => (
              <Text key={index} style={styles.listItem}>
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
