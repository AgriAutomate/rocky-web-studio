/**
 * Page 2: What We Deliver
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  gridItem: {
    width: '48%',
    marginBottom: 40,
    padding: 20,
    backgroundColor: colors.white,
    border: `1px solid ${colors.accentGray}`,
  },
  gridIcon: {
    fontSize: 40,
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
});

interface ServiceCardProps {
  icon: string;
  title: string;
  bullets: string[];
}

const ServiceCard = ({ icon, title, bullets }: ServiceCardProps) => (
  <View style={styles.gridItem}>
    <Text style={styles.gridIcon}>{icon}</Text>
    <Text style={styles.gridTitle}>{title}</Text>
    {bullets.map((bullet, i) => (
      <Text key={i} style={styles.bullet}>• {bullet}</Text>
    ))}
  </View>
);

export const ServicesPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>What We Deliver</Text>
    
    <View style={styles.grid}>
      <ServiceCard
        icon="🌐"
        title="Web Design & Development"
        bullets={[
          'Responsive, content-managed websites (5–100+ pages)',
          'Modern CMS with role-based access controls',
          'Mobile-first responsive design (iOS, Android, tablet)',
          'SEO optimisation and metadata management',
        ]}
      />
      <ServiceCard
        icon="🛡️"
        title="Accessibility & Compliance Services"
        bullets={[
          'WCAG 2.1 AA compliance audits and remediation',
          'Automated testing (axe-core, WAVE, Lighthouse)',
          'Manual testing (NVDA, JAWS, keyboard navigation)',
          'Accessibility statements and compliance documentation',
        ]}
      />
      <ServiceCard
        icon="🤖"
        title="AI-Powered Solutions & Automation"
        bullets={[
          'AI chatbot development and deployment (Claude API integration)',
          'Lead qualification and customer support automation',
          'Content generation and management tools',
          'Real-time streaming responses',
        ]}
      />
      <ServiceCard
        icon="📊"
        title="Lead Capture & CRM Integration"
        bullets={[
          'Secure contact forms with honeypot protection',
          'Admin dashboards with role-based access',
          'CRM integration capabilities (API-ready)',
          'Automated notifications and workflows',
        ]}
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 2 of 8</Text>
  </Page>
);

