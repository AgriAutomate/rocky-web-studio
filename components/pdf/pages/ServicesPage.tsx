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
    marginBottom: 30,
    marginRight: '4%',
    padding: 15,
    backgroundColor: colors.white,
    border: `1px solid ${colors.accentGray}`,
  },
  gridItemLast: {
    width: '48%',
    marginBottom: 30,
    marginRight: 0,
    padding: 15,
    backgroundColor: colors.white,
    border: `1px solid ${colors.accentGray}`,
  },
  gridIcon: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  bulletText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 6,
    paddingLeft: 15,
  },
});

interface ServiceCardProps {
  icon: string;
  title: string;
  bullets: string[];
  isLast?: boolean;
}

const ServiceCard = ({ icon, title, bullets, isLast }: ServiceCardProps) => (
  <View style={isLast ? styles.gridItemLast : styles.gridItem}>
    <Text style={styles.gridIcon}>{icon}</Text>
    <Text style={styles.gridTitle}>{title}</Text>
    {bullets.map((bullet, i) => (
      <Text key={i} style={styles.bulletText}>• {bullet}</Text>
    ))}
  </View>
);

export const ServicesPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>What We Deliver</Text>
    
    <View style={styles.grid}>
      <ServiceCard
        icon="[WEB]"
        title="Web Design & Development"
        bullets={[
          'Responsive, content-managed websites',
          'Modern CMS with role-based access',
          'Mobile-first responsive design',
          'SEO optimisation and metadata',
        ]}
      />
      <ServiceCard
        icon="[SEC]"
        title="Accessibility & Compliance"
        bullets={[
          'WCAG 2.1 AA compliance audits',
          'Automated testing (axe-core, WAVE)',
          'Manual testing (NVDA, keyboard)',
          'Accessibility documentation',
        ]}
        isLast
      />
      <ServiceCard
        icon="[AI]"
        title="AI-Powered Solutions"
        bullets={[
          'AI chatbot development (Claude API)',
          'Lead qualification automation',
          'Content generation tools',
          'Real-time streaming responses',
        ]}
      />
      <ServiceCard
        icon="[CRM]"
        title="Lead Capture & CRM"
        bullets={[
          'Secure contact forms',
          'Admin dashboards',
          'CRM integration (API-ready)',
          'Automated workflows',
        ]}
        isLast
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 2 of 8</Text>
  </Page>
);

