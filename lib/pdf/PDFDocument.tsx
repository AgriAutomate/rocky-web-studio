import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#134252',
    lineHeight: 1.6,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#134252',
    marginBottom: 15,
  },
  challenge: {
    marginBottom: 20,
    padding: 15,
    border: '1 solid #e0d9d0',
    borderRadius: 8,
    backgroundColor: '#FFFCF9',
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#208091',
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 10,
    marginBottom: 8,
    color: '#134252',
  },
  challengeLabel: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e0d9d0',
    textAlign: 'center',
    fontSize: 9,
    color: '#5E5240',
  },
  footerText: {
    marginBottom: 5,
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
    roiTimeline: string;
    projectCostRange: string;
  }>;
}

export const QuestionnairePDFDocument: React.FC<PDFDocumentProps> = ({
  clientName,
  businessName,
  sector,
  generatedDate,
  topChallenges,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
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

        {/* Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Top Digital Challenges</Text>
          {topChallenges.map((challenge, index) => (
            <View key={index} style={styles.challenge}>
              <Text style={styles.challengeTitle}>
                Challenge {challenge.number}: {challenge.title}
              </Text>
              {challenge.sections.map((section, sectionIndex) => (
                <Text key={sectionIndex} style={styles.challengeText}>
                  {section}
                </Text>
              ))}
              <Text style={styles.challengeText}>
                <Text style={styles.challengeLabel}>ROI Timeline:</Text> {challenge.roiTimeline}
              </Text>
              <Text style={styles.challengeText}>
                <Text style={styles.challengeLabel}>Investment Range:</Text> {challenge.projectCostRange}
              </Text>
            </View>
          ))}
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
