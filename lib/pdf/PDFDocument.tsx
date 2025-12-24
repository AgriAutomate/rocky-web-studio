import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12, // Increased from 11 to meet accessibility standards (12pt minimum)
    color: '#134252',
    lineHeight: 1.6, // 1.5-1.6 is optimal for readability
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1 solid #e0d9d0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#5E5240',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
    break: false, // Allow breaking between sections
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#134252',
    marginBottom: 15,
  },
  challenge: {
    marginBottom: 24, // Increased spacing between challenges
    padding: 18, // Increased padding for better breathing room
    border: '1 solid #e0d9d0',
    borderRadius: 8,
    backgroundColor: '#FFFCF9',
    break: false, // Prevent breaking inside challenge box
  },
  challengeTitle: {
    fontSize: 16, // Increased from 14 for better hierarchy
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 12, // Increased spacing
  },
  challengeText: {
    fontSize: 10,
    marginBottom: 8,
    color: '#134252',
  },
  challengeLabel: {
    fontWeight: 'bold',
    fontSize: 12, // Increased from 10 for better readability
    color: '#208091',
  },
  challengeMetadata: {
    marginTop: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderTop: '1 solid #e0d9d0',
    backgroundColor: '#F9F9F9',
    borderRadius: 4,
    padding: 10,
  },
  challengeMetadataRow: {
    marginBottom: 10, // Increased spacing between rows
  },
  problemSection: {
    marginTop: 12, // Increased spacing
    marginBottom: 14,
  },
  problemTitle: {
    fontSize: 13, // Increased from 11 for better hierarchy
    fontWeight: 'bold',
    color: '#134252',
    marginBottom: 8, // Increased spacing
  },
  problemBullet: {
    fontSize: 12, // Increased from 9 to meet accessibility standards (12pt minimum)
    color: '#134252',
    marginBottom: 8, // Increased spacing between bullets
    marginLeft: 12,
    paddingLeft: 4,
    lineHeight: 1.6, // Increased from 1.4 to meet accessibility standards (1.5 minimum)
    textAlign: 'left',
  },
  solutionSection: {
    marginTop: 12,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#F0F8FA',
    borderRadius: 4,
    border: '1 solid #208091',
  },
  solutionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 8,
  },
  solutionItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 12,
    height: 12,
    border: '1 solid #208091',
    borderRadius: 2,
    marginRight: 8,
    marginTop: 2,
  },
  solutionText: {
    fontSize: 9,
    color: '#134252',
    flex: 1,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e0d9d0',
    textAlign: 'center',
    fontSize: 10, // Increased from 9 for better readability
    color: '#5E5240',
    lineHeight: 1.5,
  },
  footerText: {
    marginBottom: 6, // Slightly increased spacing
    fontSize: 10, // Explicit font size for footer
    lineHeight: 1.5,
  },
});

interface PDFDocumentProps {
  clientName: string;
  businessName: string;
  sector: string;
  generatedDate: string;
  topChallenges: Array<{
    number: number;
    title: string;
    sections: string[];
    problems: string[];
    solutions: string[];
    roiTimeline: string;
    projectCostRange: string;
  }>;
  selectedGoals?: string[]; // All selected goals from q3
  selectedPrimaryOffers?: string[]; // All selected primary offers from q5
  cqAdvantage?: {
    cqInsiderInsight: string;
    localCompetitorFailure: string;
    rwsSurvivalKit: string;
  } | null;
}

// Goal labels mapping
const goalLabels: Record<string, string> = {
  "reduce-operating-costs": "1. Reduce Operating Costs",
  "increase-online-visibility": "2. Increase Online Visibility & Lead Generation",
  "improve-digital-maturity": "3. Improve Digital Maturity",
  "enhance-customer-experience": "4. Enhance Customer Experience",
  "streamline-operations": "5. Streamline Operations with Automation",
  "grow-revenue-ecommerce": "6. Grow Revenue Through E-commerce",
  "better-security": "7. Better Security & Cyber Protection",
  "simplify-marketing": "8. Simplify Marketing & Social Media Management",
  "build-trust-professionalism": "9. Build Trust & Professionalism Online",
  "access-grants-support": "10. Access Grants & Support for Digital Upgrades",
};

// Primary offer labels mapping
const primaryOfferLabels: Record<string, string> = {
  "hospitality-food": "Hospitality & Food Services",
  "retail-trade": "Retail Trade",
  "trades-services": "Trades & Services",
  "health-wellness": "Health & Wellness",
  "property-real-estate": "Property & Real Estate",
  "professional-services": "Professional Services",
  "manufacturing-industrial": "Manufacturing & Industrial",
  "agriculture-primary": "Agriculture & Primary Production",
  "transport-logistics": "Transport & Logistics",
  "creative-media": "Creative & Media",
};

export const QuestionnairePDFDocument: React.FC<PDFDocumentProps> = ({
  clientName,
  businessName,
  sector,
  generatedDate,
  topChallenges,
  selectedGoals = [],
  selectedPrimaryOffers = [],
  cqAdvantage = null,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Custom Deep-Dive Report</Text>
          <Text style={styles.headerSubtitle}>Prepared for {businessName}</Text>
          <Text style={styles.headerSubtitle}>Generated: {generatedDate}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thank You, {clientName}!</Text>
          <Text style={styles.challengeText}>
            We've analyzed your responses and prepared a tailored deep-dive report for{' '}
            <Text style={{ fontWeight: 'bold' }}>{businessName}</Text> in the{' '}
            <Text style={{ fontWeight: 'bold' }}>{sector}</Text> sector.
          </Text>
        </View>

        {/* CQ Advantage Section */}
        {cqAdvantage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Central Queensland Advantage</Text>
            <Text style={styles.challengeText}>
              You operate in a unique market. Rockhampton isn't Brisbane, and your digital strategy shouldn't look like it is.
            </Text>
            
            <View style={{ marginTop: 15, marginBottom: 10 }}>
              <Text style={[styles.challengeTitle, { fontSize: 12, marginBottom: 8 }]}>The Local Reality</Text>
              <Text style={styles.challengeText}>{cqAdvantage.cqInsiderInsight}</Text>
            </View>
            
            <View style={{ marginTop: 15, marginBottom: 10 }}>
              <Text style={[styles.challengeTitle, { fontSize: 12, marginBottom: 8 }]}>Where Your Competitors Are Failing</Text>
              <Text style={styles.challengeText}>{cqAdvantage.localCompetitorFailure}</Text>
            </View>
            
            <View style={{ marginTop: 15, marginBottom: 10 }}>
              <Text style={[styles.challengeTitle, { fontSize: 12, marginBottom: 8 }]}>How You Win: The Non-Negotiable Upgrade</Text>
              <Text style={styles.challengeText}>
                To dominate this market, you don't just need a "better website." You need a digital system that captures local opportunities and converts them into revenue. This means investing in local SEO, 'open now near me' optimization, and simple online booking systems that capture transient traffic and drive market spend.
              </Text>
              {cqAdvantage.rwsSurvivalKit && (
                <Text style={[styles.challengeText, { marginTop: 10 }]}>
                  {cqAdvantage.rwsSurvivalKit}
                </Text>
              )}
            </View>
            
            <Text style={[styles.challengeText, { marginTop: 15, fontStyle: 'italic' }]}>
              This is why Rocky Web Studio recommends the following roadmap...
            </Text>
          </View>
        )}

        {/* Goals Section */}
        {selectedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Business Goals</Text>
            <Text style={styles.challengeText}>
              Based on your responses, you've identified the following key goals:
            </Text>
            {selectedGoals.map((goal, index) => (
              <View key={index} style={{ marginBottom: 8, paddingLeft: 10 }}>
                <Text style={styles.challengeText}>
                  • {goalLabels[goal] || goal}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Primary Offers Section */}
        {selectedPrimaryOffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Primary Business Offers</Text>
            <Text style={styles.challengeText}>
              Your business focuses on the following service areas:
            </Text>
            {selectedPrimaryOffers.map((offer, index) => (
              <View key={index} style={{ marginBottom: 8, paddingLeft: 10 }}>
                <Text style={styles.challengeText}>
                  • {primaryOfferLabels[offer] || offer}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Digital Challenges & Solutions
            {topChallenges.length > 0 && ` (${topChallenges.length} identified)`}
          </Text>
          {topChallenges.length > 0 ? (
            topChallenges.map((challenge, index) => (
              <View key={index} style={styles.challenge}>
                <Text style={styles.challengeTitle}>
                  Challenge {challenge.number}: {challenge.title}
                </Text>
                
                {/* Problems Section - Bullet Points */}
                {(challenge.problems && challenge.problems.length > 0) && (
                  <View style={styles.problemSection}>
                    <Text style={styles.problemTitle}>The Challenge:</Text>
                    {challenge.problems.map((problem, problemIndex) => (
                      <View key={problemIndex} style={{ flexDirection: 'row', marginBottom: 6 }}>
                        <Text style={[styles.problemBullet, { marginLeft: 0, paddingLeft: 0, marginRight: 8, flexShrink: 0 }]}>•</Text>
                        <Text style={[styles.problemBullet, { marginLeft: 0, paddingLeft: 0, flex: 1 }]}>{problem}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Solutions Section - With Checkboxes */}
                {(challenge.solutions && challenge.solutions.length > 0) && (
                  <View style={styles.solutionSection}>
                    <Text style={styles.solutionTitle}>
                      Proposed Solutions (✓ Check the solutions you'd like to explore):
                    </Text>
                    {challenge.solutions.map((solution, solutionIndex) => (
                      <View key={solutionIndex} style={styles.solutionItem}>
                        <View style={styles.checkbox} />
                        <Text style={styles.solutionText}>{solution}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Investment Details */}
                <View style={styles.challengeMetadata}>
                  <View style={styles.challengeMetadataRow}>
                    <Text style={styles.challengeLabel}>ROI Timeline: </Text>
                    <Text style={styles.challengeText}>
                      {challenge.roiTimeline && challenge.roiTimeline.trim() 
                        ? challenge.roiTimeline 
                        : 'To be determined based on project scope'}
                    </Text>
                  </View>
                  <View style={styles.challengeMetadataRow}>
                    <Text style={styles.challengeLabel}>Investment Range: </Text>
                    <Text style={styles.challengeText}>
                      {challenge.projectCostRange && challenge.projectCostRange.trim() 
                        ? challenge.projectCostRange 
                        : 'To be determined based on project scope'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.challengeText}>
              No specific challenges identified. We can help you assess your digital needs.
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={{ fontWeight: 'bold' }}>Martin Carroll</Text>
          </Text>
          <Text style={styles.footerText}>Founder, Rocky Web Studio</Text>
          <Text style={styles.footerText}>martin@rockywebstudio.com.au</Text>
          <Text style={styles.footerText}>rockywebstudio.com.au</Text>
        </View>
      </Page>
    </Document>
  );
};
