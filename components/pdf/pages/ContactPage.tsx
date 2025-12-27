/**
 * Page 8: Contact & Next Steps
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  step: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  stepIcon: {
    fontSize: 24,
    color: colors.primary,
    marginRight: 8,
  },
  stepContent: {
    flex: 1,
  },
  contactItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: 8,
  },
  testimonialBox: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 16,
    borderRadius: 4,
    marginBottom: 20,
  },
  testimonialText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.white,
  },
  credentials: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  credential: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    width: 100,
  },
  credentialIcon: {
    fontSize: 32,
    color: colors.primary,
  },
  credentialText: {
    fontSize: 14,
    color: colors.text,
  },
});

export const ContactPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.centered}>
      <Text style={styles.h2}>Contact & Next Steps</Text>
      
      <Text style={styles.h2}>What Happens Next?</Text>
      
      <View style={styles.step}>
        <Text style={styles.stepIcon}>[1]</Text>
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 1: Initial Consultation</Text>
          <Text style={styles.body}>Contact us to discuss your project requirements and timeline.</Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <Text style={styles.stepIcon}>[2]</Text>
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 2: Proposal & Agreement</Text>
          <Text style={styles.body}>Receive detailed proposal with timeline, deliverables, and pricing.</Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <Text style={styles.stepIcon}>[3]</Text>
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 3: Project Kickoff</Text>
          <Text style={styles.body}>Begin 8-week development cycle with regular check-ins and updates.</Text>
        </View>
      </View>
      
      <Text style={styles.h3}>Contact Information</Text>
      
      <View style={styles.contactItem}>
        <Text style={styles.contactIcon}>Email:</Text>
        <Text style={styles.body}>hello@rockywebstudio.com.au</Text>
      </View>
      
      <View style={styles.contactItem}>
        <Text style={styles.contactIcon}>Web:</Text>
        <Text style={styles.body}>rockywebstudio.com.au</Text>
      </View>
      
      <View style={styles.contactItem}>
        <Text style={styles.contactIcon}>Location:</Text>
        <Text style={styles.body}>Rockhampton, Queensland, Australia</Text>
      </View>
      
      <Text style={styles.h3}>Our Credentials</Text>
      <View style={styles.credentials}>
        <View style={styles.credential}>
          <Text style={styles.credentialIcon}>✓</Text>
          <Text style={styles.credentialText}>AVOB Certified</Text>
        </View>
        <View style={styles.credential}>
          <Text style={styles.credentialIcon}>✓</Text>
          <Text style={styles.credentialText}>WCAG 2.1 AA</Text>
        </View>
        <View style={styles.credential}>
          <Text style={styles.credentialIcon}>✓</Text>
          <Text style={styles.credentialText}>Enterprise Security</Text>
        </View>
        <View style={styles.credential}>
          <Text style={styles.credentialIcon}>✓</Text>
          <Text style={styles.credentialText}>99.9% Uptime</Text>
        </View>
      </View>
      
      <Text style={styles.h3}>Client Testimonials</Text>
      <View style={styles.testimonialBox}>
        <Text style={styles.testimonialText}>
          "Rocky Web Studio delivered exactly what we needed, on time and
          within budget. The accessibility compliance work was exceptional."
        </Text>
      </View>
      <View style={styles.testimonialBox}>
        <Text style={styles.testimonialText}>
          "The AI chatbot integration was seamless and has significantly
          improved our lead qualification process."
        </Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 8 of 8</Text>
  </Page>
);

