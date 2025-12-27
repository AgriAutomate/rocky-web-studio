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
    fontSize: 20,
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  columnBullet: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 6,
    paddingLeft: 15,
  },
});

interface TechnicalColumnProps {
  icon: string;
  title: string;
  items: string[];
  isLast?: boolean;
}

const TechnicalColumn = ({ icon, title, items, isLast }: TechnicalColumnProps) => (
  <View style={isLast ? styles.columnLast : styles.column}>
    <Text style={styles.columnIcon}>{icon}</Text>
    <Text style={styles.h3}>{title}</Text>
    {items.map((item, i) => (
      <Text key={i} style={styles.columnBullet}>• {item}</Text>
    ))}
  </View>
);

export const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Technical Foundation</Text>
    
    <View style={styles.threeColumn}>
      <TechnicalColumn
        icon="[STACK]"
        title="Build Stack"
        items={[
          'Next.js 16 (Turbopack)',
          'React 19',
          'TypeScript (strict)',
          'PostgreSQL (Supabase)',
          'Tailwind CSS',
        ]}
      />
      <TechnicalColumn
        icon="[SEC]"
        title="Security"
        items={[
          'OWASP Top 10 aligned',
          'Privacy Act 1988 compliant',
          'GDPR-ready',
          'Security headers',
          'Encryption enabled',
        ]}
      />
      <TechnicalColumn
        icon="[TEST]"
        title="Accessibility"
        items={[
          'Lighthouse (target: 91+)',
          'axe-core testing',
          'Keyboard navigation',
          'Screen reader (NVDA)',
          'Color contrast',
        ]}
        isLast
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 3 of 8</Text>
  </Page>
);

