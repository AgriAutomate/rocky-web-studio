/**
 * Page 4: Engagement Model & Timeline
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  timelineLine: {
    width: 2,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineWeek: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 12,
    color: colors.text,
  },
});

export const EngagementPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Engagement Model & Timeline</Text>
    
    <View style={styles.twoColumn}>
      <View style={styles.leftColumn}>
        <Text style={styles.h3}>8-Week Project Timeline</Text>
        <View style={styles.timeline}>
          {[
            { week: 'Week 1', desc: 'Discovery & Planning' },
            { week: 'Week 2', desc: 'Design & Wireframes' },
            { week: 'Week 3-4', desc: 'Development Phase 1' },
            { week: 'Week 5-6', desc: 'Development Phase 2' },
            { week: 'Week 7', desc: 'Testing & QA' },
            { week: 'Week 8', desc: 'Launch & Handover' },
          ].map((item, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineWeek}>{item.week}</Text>
                <Text style={styles.timelineDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={styles.h3}>Team Structure</Text>
        <Text style={styles.body}>
          Rocky Web Studio operates as a solo founder with direct client
          engagement. All projects are managed by Martin Carroll, Principal
          Developer, ensuring consistent communication and quality.
        </Text>
        
        <Text style={styles.h3}>Support SLAs</Text>
        <Text style={styles.bodySmall}>• Critical: 2 hour response, 24 hour resolution</Text>
        <Text style={styles.bodySmall}>• High: 4 hour response, 3 business days resolution</Text>
        <Text style={styles.bodySmall}>• Medium: 1 business day response, 1 week resolution</Text>
        <Text style={styles.bodySmall}>• Low: 2 business days response, next release cycle</Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 4 of 8</Text>
  </Page>
);

