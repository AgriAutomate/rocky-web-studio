/**
 * Main Capability Statement PDF Document
 * Rocky Web Studio - Government Capability Statement
 */

import { Document } from '@react-pdf/renderer';
import { CoverPage } from './pages/CoverPage';
import { ServicesPage } from './pages/ServicesPage';
import { TechnicalPage } from './pages/TechnicalPage';
import { EngagementPage } from './pages/EngagementPage';
import { ProofPointsPage } from './pages/ProofPointsPage';
import { PricingPage } from './pages/PricingPage';
import { TeamPage } from './pages/TeamPage';
import { ContactPage } from './pages/ContactPage';

export const CapabilityStatement = () => (
  <Document>
    <CoverPage />
    <ServicesPage />
    <TechnicalPage />
    <EngagementPage />
    <ProofPointsPage />
    <PricingPage />
    <TeamPage />
    <ContactPage />
  </Document>
);

