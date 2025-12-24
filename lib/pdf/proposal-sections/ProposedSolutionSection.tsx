import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ProposedSolution } from '@/lib/types/proposal';

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
  overview: {
    fontSize: 11,
    color: colors.primaryDark,
    marginBottom: 20,
    lineHeight: 1.7,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 4,
    border: `1 solid ${colors.accent}`,
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
  phase: {
    marginBottom: 12,
    padding: 12,
    border: `1 solid ${colors.accent}`,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  phaseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  phaseDuration: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  deliverable: {
    fontSize: 10,
    color: colors.primaryDark,
    marginBottom: 4,
    paddingLeft: 12,
    lineHeight: 1.4,
  },
  timelineSummary: {
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  timelineSummaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptyState: {
    fontSize: 10,
    color: colors.secondary,
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
  },
});

interface ProposedSolutionSectionProps {
  data: ProposedSolution;
}

export const ProposedSolutionSection: React.FC<ProposedSolutionSectionProps> = ({ data }) => {
  if (!data) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proposed Solution</Text>
        <Text style={styles.emptyState}>No proposed solution data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Proposed Solution</Text>

      {/* Overview */}
      {data.overview && (
        <Text style={styles.overview}>{data.overview}</Text>
      )}

      {/* Key Features */}
      {data.keyFeatures && data.keyFeatures.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Key Features</Text>
          <View style={styles.list}>
            {data.keyFeatures.map((feature, index) => (
              <Text key={index} style={styles.listItem}>
                • {feature}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Expected Outcomes */}
      {data.expectedOutcomes && data.expectedOutcomes.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Expected Outcomes</Text>
          <View style={styles.list}>
            {data.expectedOutcomes.map((outcome, index) => (
              <Text key={index} style={styles.listItem}>
                • {outcome}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Timeline */}
      {data.timeline && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Project Timeline</Text>
          
          {data.timeline.phases && data.timeline.phases.length > 0 && (
            <View style={styles.list}>
              {data.timeline.phases.map((phase, index) => (
                <View key={index} style={styles.phase}>
                  <Text style={styles.phaseTitle}>{phase.phase}</Text>
                  <Text style={styles.phaseDuration}>Duration: {phase.duration}</Text>
                  {phase.deliverables && phase.deliverables.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      {phase.deliverables.map((deliverable, dIndex) => (
                        <Text key={dIndex} style={styles.deliverable}>
                          • {deliverable}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {data.timeline.totalDuration && (
            <View style={styles.timelineSummary}>
              <Text style={styles.timelineSummaryText}>
                Total Project Duration: {data.timeline.totalDuration}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
