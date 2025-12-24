import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import type { ProposedSolution } from '@/lib/types/proposal';

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
  overview: {
    fontSize: 11,
    color: '#134252',
    marginBottom: 15,
    lineHeight: 1.6,
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
  phase: {
    marginBottom: 12,
    padding: 10,
    border: '1 solid #e0d9d0',
    borderRadius: 4,
    backgroundColor: '#FFFCF9',
  },
  phaseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 5,
  },
  phaseDuration: {
    fontSize: 10,
    color: '#5E5240',
    marginBottom: 8,
  },
  deliverable: {
    fontSize: 10,
    color: '#134252',
    marginBottom: 3,
    paddingLeft: 10,
  },
});

interface ProposedSolutionSectionProps {
  data: ProposedSolution;
}

export const ProposedSolutionSection: React.FC<ProposedSolutionSectionProps> = ({ data }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Proposed Solution</Text>

      {/* Overview */}
      <Text style={styles.overview}>{data.overview}</Text>

      {/* Key Features */}
      {data.keyFeatures.length > 0 && (
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
      {data.expectedOutcomes.length > 0 && (
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
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Project Timeline</Text>
        <Text style={styles.listItem}>
          Total Duration: {data.timeline.totalDuration}
        </Text>
        
        {data.timeline.phases && data.timeline.phases.length > 0 && (
          <View style={styles.list}>
            {data.timeline.phases.map((phase, index) => (
              <View key={index} style={styles.phase}>
                <Text style={styles.phaseTitle}>{phase.phase}</Text>
                <Text style={styles.phaseDuration}>Duration: {phase.duration}</Text>
                {phase.deliverables && phase.deliverables.length > 0 && (
                  <View>
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
      </View>
    </View>
  );
};
