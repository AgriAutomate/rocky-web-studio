import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ProposalData } from '@/lib/types/proposal';
import { HealthScorecardSection } from './proposal-sections/HealthScorecardSection';
import { CurrentStateSection } from './proposal-sections/CurrentStateSection';
import { ProjectScopeSection } from './proposal-sections/ProjectScopeSection';
import { ProposedSolutionSection } from './proposal-sections/ProposedSolutionSection';
import { InvestmentSection } from './proposal-sections/InvestmentSection';
import { RoiSnapshotSection } from './proposal-sections/RoiSnapshotSection';

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

interface ProposalPDFDocumentProps {
  data: ProposalData;
}

/**
 * Main Proposal PDF Document Component
 * 
 * Renders the complete proposal PDF using react-pdf/renderer
 */
export const ProposalPDFDocument: React.FC<ProposalPDFDocumentProps> = ({ data }) => {
  const { client, metadata, healthScorecard, currentStateAnalysis, projectScope, proposedSolution, investment, roiSnapshot } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Project Proposal</Text>
          <Text style={styles.headerSubtitle}>
            Prepared for {client.businessName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {client.firstName} {client.lastName || ''}
          </Text>
          <Text style={styles.headerSubtitle}>
            Proposal Date: {new Date(metadata.proposalDate).toLocaleDateString()}
          </Text>
          {metadata.validUntil && (
            <Text style={styles.headerSubtitle}>
              Valid Until: {new Date(metadata.validUntil).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Health Scorecard Section */}
        <HealthScorecardSection data={healthScorecard} />

        {/* Current State Analysis Section */}
        <CurrentStateSection data={currentStateAnalysis} />

        {/* Project Scope Section */}
        <ProjectScopeSection data={projectScope} />

        {/* Proposed Solution Section */}
        <ProposedSolutionSection data={proposedSolution} />

        {/* Investment Section */}
        <InvestmentSection data={investment} />

        {/* ROI Snapshot Section */}
        <RoiSnapshotSection data={roiSnapshot} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Rocky Web Studio - Australian Veteran Owned
          </Text>
          <Text style={styles.footerText}>
            Proposal ID: {metadata.proposalId} | Version: {metadata.version || '1.0'}
          </Text>
          <Text style={styles.footerText}>
            For questions, contact: martin@rockywebstudio.com.au
          </Text>
        </View>
      </Page>
    </Document>
  );
};
