/**
 * Page 5: Proof Points & Case Studies
 * Capability Statement PDF
 */

import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  caseStudy: {
    marginBottom: 60,
  },
  metricsBox: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 12,
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 12,
  },
  metricsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
});

interface CaseStudyProps {
  title: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: string;
}

const CaseStudy = ({ title, challenge, solution, results, metrics }: CaseStudyProps) => (
  <View style={styles.caseStudy}>
    <Text style={styles.h3}>{title}</Text>
    
    <Text style={styles.h4}>Challenge</Text>
    <Text style={styles.body}>{challenge}</Text>
    
    <Text style={styles.h4}>Solution</Text>
    <Text style={styles.body}>{solution}</Text>
    
    <Text style={styles.h4}>Results</Text>
    <Text style={styles.body}>{results}</Text>
    
    {metrics && (
      <View style={styles.metricsBox}>
        <Text style={styles.metricsText}>{metrics}</Text>
      </View>
    )}
  </View>
);

export const ProofPointsPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Proof Points</Text>
    
    <CaseStudy
      title="Case Study: WCAG 2.1 AA Compliance"
      challenge="Rocky Web Studio needed to achieve WCAG 2.1 AA compliance to be eligible for government contracts requiring accessibility standards."
      solution="Conducted comprehensive accessibility audit using Lighthouse, axe-core, and manual testing. Implemented fixes for color contrast (4.5:1+ ratios), keyboard navigation (Tab, Enter, Escape), screen reader support (ARIA labels, semantic HTML), and visible focus indicators (2px solid outline)."
      results="Achieved Lighthouse accessibility score of 91/100, meeting WCAG 2.1 AA standards. Rocky Web Studio is now eligible for government contracts requiring accessibility compliance, opening access to $20K-$80K contract opportunities."
      metrics="72 → 91 Lighthouse Score"
    />
    
    <CaseStudy
      title="Case Study: AI-Powered Lead Qualification Chatbot"
      challenge="Needed cost-effective lead qualification solution without expensive SaaS subscriptions ($100-500/month). Required integration with existing contact form and CRM system."
      solution="Built custom AI chatbot using Claude API with lead capture integration. Implemented real-time streaming responses, conversation history, and automatic lead extraction (email, name, company). Deployed in 48 hours using Next.js API routes and Supabase database."
      results="99.9% cost reduction vs. SaaS alternatives (one-time development cost vs. ongoing subscription). Automated lead qualification with 24/7 availability. Integrated seamlessly with existing contact form and CRM system."
      metrics="99.9% Cost Reduction"
    />
    
    <Text style={styles.pageNumber}>Page 5 of 8</Text>
  </Page>
);

