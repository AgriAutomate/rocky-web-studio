import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ProposalData } from '@/lib/types/proposal';
import { HealthScorecardSection } from './proposal-sections/HealthScorecardSection';
import { CurrentStateSection } from './proposal-sections/CurrentStateSection';
import { ProjectScopeSection } from './proposal-sections/ProjectScopeSection';
import { ProposedSolutionSection } from './proposal-sections/ProposedSolutionSection';
import { InvestmentSection } from './proposal-sections/InvestmentSection';
import { RoiSnapshotSection } from './proposal-sections/RoiSnapshotSection';

// Design system colors (matching existing app colors)
const colors = {
  primary: '#208091',
  primaryDark: '#134252',
  secondary: '#5E5240',
  accent: '#e0d9d0',
  background: '#FFFCF9',
  text: '#134252',
  textMuted: '#5E5240',
};

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 80, // Space for header
    paddingBottom: 60, // Space for footer
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.6,
  },
  // Header (appears on every page)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottom: `2 solid ${colors.primary}`,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
  },
  headerRight: {
    flex: 1,
    textAlign: 'right',
  },
  headerMetadata: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  // Cover page header (centered)
  coverHeader: {
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 30,
    borderBottom: `2 solid ${colors.primary}`,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 5,
  },
  // Footer (appears on every page)
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingTop: 10,
    borderTop: `1 solid ${colors.accent}`,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: 8,
    color: colors.textMuted,
  },
  footerText: {
    marginBottom: 3,
  },
  footerLink: {
    color: colors.primary,
    textDecoration: 'none',
  },
});

interface ProposalPDFDocumentProps {
  data: ProposalData;
}

/**
 * Header component (appears on every page)
 */
const PDFHeader: React.FC<{ client: ProposalData['client']; metadata: ProposalData['metadata'] }> = ({ client, metadata }) => (
  <View style={styles.header} fixed>
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Rocky Web Studio</Text>
        <Text style={styles.headerSubtitle}>Project Proposal</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerMetadata}>{client.businessName}</Text>
        <Text style={styles.headerMetadata}>
          {new Date(metadata.proposalDate).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  </View>
);

/**
 * Footer component (appears on every page)
 */
const PDFFooter: React.FC<{ metadata: ProposalData['metadata'] }> = ({ metadata }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Rocky Web Studio - Australian Veteran Owned Business
    </Text>
    <Text style={styles.footerText}>
      Proposal ID: {metadata.proposalId} | Version: {metadata.version || '1.0'}
    </Text>
    <Text style={styles.footerText}>
      Contact: martin@rockywebstudio.com.au | www.rockywebstudio.com.au
    </Text>
  </View>
);

/**
 * Main Proposal PDF Document Component
 * 
 * Renders the complete proposal PDF using react-pdf/renderer
 * Supports multi-page layout with headers/footers on each page
 */
export const ProposalPDFDocument: React.FC<ProposalPDFDocumentProps> = ({ data }) => {
  const { client, metadata, healthScorecard, currentStateAnalysis, projectScope, proposedSolution, investment, roiSnapshot } = data;

  // Format dates
  const proposalDate = new Date(metadata.proposalDate).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const validUntilDate = metadata.validUntil
    ? new Date(metadata.validUntil).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page} wrap>
        <PDFHeader client={client} metadata={metadata} />
        <PDFFooter metadata={metadata} />

        {/* Cover Page Content */}
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>Project Proposal</Text>
          <Text style={styles.coverSubtitle}>Prepared for</Text>
          <Text style={styles.coverSubtitle}>{client.businessName}</Text>
          {client.firstName && (
            <Text style={styles.coverSubtitle}>
              {client.firstName} {client.lastName || ''}
            </Text>
          )}
          <Text style={styles.coverSubtitle}>Proposal Date: {proposalDate}</Text>
          {validUntilDate && (
            <Text style={styles.coverSubtitle}>Valid Until: {validUntilDate}</Text>
          )}
        </View>

        {/* Executive Summary (on cover page) */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 10 }}>
            Executive Summary
          </Text>
          <Text style={{ fontSize: 11, color: colors.text, lineHeight: 1.6, marginBottom: 10 }}>
            {proposedSolution.overview}
          </Text>
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
              Investment Summary
            </Text>
            <Text style={{ fontSize: 11, color: colors.text, marginBottom: 5 }}>
              Total Investment: ${investment.totalCost.toLocaleString('en-AU')} AUD
            </Text>
            <Text style={{ fontSize: 11, color: colors.text }}>
              Estimated Timeline: {investment.totalWeeks} weeks
            </Text>
          </View>
        </View>
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page} wrap>
        <PDFHeader client={client} metadata={metadata} />
        <PDFFooter metadata={metadata} />

        {/* Health Scorecard Section */}
        <HealthScorecardSection data={healthScorecard} />

        {/* Current State Analysis Section */}
        <CurrentStateSection data={currentStateAnalysis} />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <PDFHeader client={client} metadata={metadata} />
        <PDFFooter metadata={metadata} />

        {/* Project Scope Section */}
        <ProjectScopeSection data={projectScope} />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <PDFHeader client={client} metadata={metadata} />
        <PDFFooter metadata={metadata} />

        {/* Proposed Solution Section */}
        <ProposedSolutionSection data={proposedSolution} />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <PDFHeader client={client} metadata={metadata} />
        <PDFFooter metadata={metadata} />

        {/* Investment Section */}
        <InvestmentSection data={investment} />

        {/* ROI Snapshot Section */}
        <RoiSnapshotSection data={roiSnapshot} />
      </Page>
    </Document>
  );
};
