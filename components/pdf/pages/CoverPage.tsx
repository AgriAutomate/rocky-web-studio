/**
 * Page 1: Cover Page
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 1.6,
  },
  credentials: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  credential: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    width: 120,
  },
  credentialIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  credentialText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  contact: {
    marginTop: 40,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
});

export const CoverPage = () => (
  <Page size="A4" style={styles.page}>
    {/* Logo - Top Left */}
    <View style={styles.logoContainer}>
      <Text style={{ fontSize: 24, color: colors.primary, fontWeight: 'bold' }}>
        Rocky Web Studio
      </Text>
    </View>
    
    {/* Main Headlines */}
    <View style={styles.titleContainer}>
      <Text style={styles.h1}>
        Production-Ready Digital Services
      </Text>
      <Text style={styles.h1}>
        For Government & Enterprise
      </Text>
    </View>
    
    {/* Subheadline */}
    <Text style={styles.subtitle}>
      Rocky Web Studio delivers enterprise-grade web development
      services tailored for Australian government agencies and public
      sector organisations. We specialise in accessible, secure, and
      compliant digital solutions that meet the highest standards of
      government procurement.
    </Text>
    
    {/* Credentials Badges */}
    <View style={styles.credentials}>
      <View style={styles.credential}>
        <Text style={styles.credentialIcon}>✓</Text>
        <Text style={styles.credentialText}>AVOB Certified</Text>
      </View>
      <View style={styles.credential}>
        <Text style={styles.credentialIcon}>✓</Text>
        <Text style={styles.credentialText}>WCAG 2.1 AA Compliant</Text>
      </View>
      <View style={styles.credential}>
        <Text style={styles.credentialIcon}>✓</Text>
        <Text style={styles.credentialText}>Enterprise Security</Text>
      </View>
      <View style={styles.credential}>
        <Text style={styles.credentialIcon}>✓</Text>
        <Text style={styles.credentialText}>99.9% Uptime SLA</Text>
      </View>
      <View style={styles.credential}>
        <Text style={styles.credentialIcon}>✓</Text>
        <Text style={styles.credentialText}>AI Integration Expertise</Text>
      </View>
    </View>
    
    {/* Contact Information */}
    <View style={styles.contact}>
      <Text style={styles.contactText}>Website: rockywebstudio.com.au</Text>
      <Text style={styles.contactText}>Email: hello@rockywebstudio.com.au</Text>
      <Text style={styles.contactText}>Location: Rockhampton, Queensland, Australia</Text>
      <Text style={styles.contactText}>ABN: 62 948 405 693</Text>
    </View>
    
    {/* Page Number */}
    <Text style={styles.pageNumber}>Page 1 of 8</Text>
  </Page>
);

