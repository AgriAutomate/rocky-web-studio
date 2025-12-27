/**
 * Page 7: Team & Continuity
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12,
    backgroundColor: colors.accentGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontSize: 48,
    color: colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  avobBadge: {
    fontSize: 48,
    marginTop: 12,
  },
  flowchart: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 12,
  },
  flowBox: {
    border: `2px solid ${colors.primary}`,
    padding: 12,
    borderRadius: 4,
    textAlign: 'center',
  },
  arrow: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 20,
  },
});

export const TeamPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Team & Continuity</Text>
    
    <View style={styles.twoColumn}>
      <View style={styles.leftColumn}>
        <View style={styles.profile}>
          <View style={styles.profilePhoto}>
            <Text style={styles.profilePhotoText}>MC</Text>
          </View>
          <Text style={styles.profileName}>Martin Carroll</Text>
          <Text style={styles.profileTitle}>Principal Developer</Text>
          <Text style={styles.bodySmall}>• 10+ years web development</Text>
          <Text style={styles.bodySmall}>• TypeScript & React expert</Text>
          <Text style={styles.bodySmall}>• Australian Veteran</Text>
          <Text style={styles.avobBadge}>🇦🇺</Text>
          <Text style={styles.bodySmall}>AVOB Certified</Text>
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={styles.h3}>Why Rocky Web Studio?</Text>
        <Text style={styles.body}>
          Solo founder operation ensures direct communication, consistent
          quality, and rapid decision-making. No account managers or
          middlemen—you work directly with the developer.
        </Text>
        
        <Text style={styles.h3}>Escalation & Support</Text>
        <View style={styles.flowchart}>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Day-to-Day Contact</Text>
          </View>
          <Text style={styles.arrow}>↓</Text>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Critical Issue</Text>
          </View>
          <Text style={styles.arrow}>↓</Text>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Principal Escalation</Text>
          </View>
        </View>
        
        <Text style={styles.h3}>Business Continuity</Text>
        <Text style={styles.body}>
          In the unlikely event that Rocky Web Studio ceases operations,
          clients receive full access to source code and complete data export,
          ensuring vendor independence and business continuity.
        </Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 7 of 8</Text>
  </Page>
);

