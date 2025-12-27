/**
 * Page 3: Technical Foundation
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  columnIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
});

interface TechnicalColumnProps {
  icon: string;
  title: string;
  items: string[];
}

const TechnicalColumn = ({ icon, title, items }: TechnicalColumnProps) => (
  <View style={styles.column}>
    <Text style={styles.columnIcon}>{icon}</Text>
    <Text style={styles.h3}>{title}</Text>
    {items.map((item, i) => (
      <Text key={i} style={styles.bullet}>• {item}</Text>
    ))}
  </View>
);

export const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Technical Foundation</Text>
    
    <View style={styles.threeColumn}>
      <TechnicalColumn
        icon="⚙️"
        title="Build Stack"
        items={[
          'Next.js 16 (Turbopack)',
          'React 19',
          'TypeScript (strict mode)',
          'PostgreSQL (Supabase)',
          'Tailwind CSS',
        ]}
      />
      <TechnicalColumn
        icon="🔒"
        title="Security"
        items={[
          'OWASP Top 10 aligned',
          'Privacy Act 1988 (Cth) compliant',
          'GDPR-ready',
          'Security headers (HSTS, CSP)',
          'Encryption in transit and at rest',
        ]}
      />
      <TechnicalColumn
        icon="✅"
        title="Accessibility Testing"
        items={[
          'Lighthouse (target: 91+)',
          'axe-core automated testing',
          'Manual keyboard navigation',
          'Screen reader testing (NVDA)',
          'Color contrast verification',
        ]}
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 3 of 8</Text>
  </Page>
);

