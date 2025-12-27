/**
 * Page 6: Pricing & Packages
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  pricingCard: {
    width: '32%',
    marginBottom: 20,
    marginRight: '2%',
    border: `2px solid ${colors.primary}`,
    overflow: 'hidden',
  },
  pricingCardLast: {
    width: '32%',
    marginBottom: 20,
    marginRight: 0,
    border: `2px solid ${colors.primary}`,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 12,
    textAlign: 'center',
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    padding: 20,
  },
  cardFeatures: {
    padding: 20,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  isLast?: boolean;
}

const PricingCard = ({ title, price, features, isLast }: PricingCardProps) => (
  <View style={isLast ? styles.pricingCardLast : styles.pricingCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardHeaderText}>{title}</Text>
    </View>
    <Text style={styles.cardPrice}>{price}</Text>
    <View style={styles.cardFeatures}>
      {features.map((feature, i) => (
        <View key={i} style={styles.featureItem}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.bodySmall}>{feature}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const PricingPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Pricing & Packages</Text>
    
    <View style={styles.threeColumn}>
      <PricingCard
        title="Strategic Intensive"
        price="$5,000"
        features={[
          '2-day intensive workshop',
          'Strategy & planning session',
          'Technical architecture review',
          'Roadmap development',
        ]}
      />
      <PricingCard
        title="Website Build"
        price="$10,000+"
        features={[
          '5-100+ page website',
          'CMS integration',
          'WCAG 2.1 AA compliant',
          'Performance optimisation',
          'SEO setup',
        ]}
      />
      <PricingCard
        title="Ongoing Support"
        price="From $500/mo"
        features={[
          'Security updates',
          'Performance monitoring',
          'Content updates',
          'Technical support',
        ]}
        isLast
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 6 of 8</Text>
  </Page>
);

