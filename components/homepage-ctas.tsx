/**
 * Homepage CTA Components for Rocky Web Studio
 * 
 * Three production-ready call-to-action sections for government/enterprise traffic
 * - Option A: Footer CTA (Professional, non-intrusive)
 * - Option B: Sticky Banner (High visibility, dismissable)
 * - Option C: Hero Section CTA (Balanced, good CTR)
 * 
 * All components are:
 * - WCAG 2.1 AA compliant
 * - Mobile-responsive (375px+)
 * - Tailwind CSS only
 * - Production-ready
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// OPTION A: FOOTER CTA (Recommended - Professional, Non-Intrusive)
// ============================================================================
// Placement: Add just before existing <footer> tag in your homepage
// ============================================================================

export function FooterCTA() {
  return (
    <section 
      className="bg-[#218092] border-t-4 border-[#fcfcf9] py-12 px-4"
      aria-labelledby="gov-enterprise-cta-heading"
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <h2 
          id="gov-enterprise-cta-heading"
          className="text-2xl md:text-3xl font-bold text-white mb-3"
        >
          🇦🇺 Government & Enterprise Services
        </h2>
        
        {/* Subtext */}
        <p className="text-white text-lg mb-8 max-w-2xl mx-auto opacity-95">
          AVOB certified. WCAG 2.1 AA compliant. Production-ready.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          {/* Primary: Download PDF */}
          <a
            href="/Capability-Statement-Gov-Enterprise.pdf"
            download="Rocky-Web-Studio-Capability-Statement.pdf"
            className="bg-white text-[#218092] px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] min-w-[200px] text-center"
            aria-label="Download Government Capability Statement PDF"
          >
            Download Capability Statement
          </a>
          
          {/* Secondary: View Accessibility */}
          <Link
            href="/accessibility"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#218092] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] min-w-[200px] text-center"
            aria-label="View accessibility and compliance information"
          >
            View Accessibility Details
          </Link>
        </div>
        
        {/* Closing Text */}
        <p className="text-white text-sm max-w-2xl mx-auto opacity-95">
          Ready for government tenders and enterprise procurement. 
          Our capability statement includes compliance certifications, 
          security practices, and service level agreements.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// OPTION B: STICKY BANNER (High Visibility - Dismissable)
// ============================================================================
// Placement: Top of <main> element in your homepage
// Features: Uses React state for dismissal (not persisted across reloads)
// ============================================================================

export function StickyBannerCTA() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <aside
      className="sticky top-0 z-50 bg-gradient-to-r from-[#218092] to-[#0f5d6f] text-white shadow-lg"
      role="banner"
      aria-label="Government and enterprise services announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Text Content */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm sm:text-base font-medium">
              🇦🇺 <strong>Government & Enterprise:</strong> Tender-ready services available
            </p>
          </div>
          
          {/* Right: Action Links */}
          <div className="flex items-center gap-4">
            {/* Capability Statement Link */}
            <a
              href="/Capability-Statement-Gov-Enterprise.pdf"
              download="Rocky-Web-Studio-Capability-Statement.pdf"
              className="text-white underline hover:text-teal-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] rounded px-2 py-1 text-sm font-semibold whitespace-nowrap"
              aria-label="Download Government Capability Statement PDF"
            >
              Capability Statement
            </a>
            
            {/* Close Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white hover:text-teal-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092] rounded p-1 transition-colors"
              aria-label="Dismiss banner"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// OPTION C: HERO SECTION CTA (Balanced - Good CTR)
// ============================================================================
// Placement: After hero section or before services section
// ============================================================================

export function HeroSectionCTA() {
  return (
    <section
      className="bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 py-16 px-4"
      aria-labelledby="tender-cta-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-[#218092] p-8 md:p-12">
          {/* Heading */}
          <h2
            id="tender-cta-heading"
            className="text-3xl md:text-4xl font-bold text-[#1f2121] mb-4"
          >
            Bidding on Government Tenders?
          </h2>
          
          {/* Body Text */}
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Rocky Web Studio delivers production-ready digital services designed 
              for government and enterprise procurement. Our capability statement 
              includes everything you need for tender submissions.
            </p>
            
            {/* Benefits List */}
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>WCAG 2.1 AA Compliant:</strong> Automated and manual accessibility testing</li>
              <li><strong>Lead Capture & CRM:</strong> Built-in contact forms and admin dashboards</li>
              <li><strong>Enterprise Infrastructure:</strong> 99.9% uptime SLA, daily backups, security headers</li>
              <li><strong>AVOB Certified:</strong> Verified Australian business, ready for government contracts</li>
            </ul>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary: Download Statement */}
            <a
              href="/Capability-Statement-Gov-Enterprise.pdf"
              download="Rocky-Web-Studio-Capability-Statement.pdf"
              className="bg-[#218092] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0f5d6f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 text-center"
              aria-label="Download Government Capability Statement PDF"
            >
              Download Capability Statement
            </a>
            
            {/* Secondary: View Security */}
            <Link
              href="/accessibility"
              className="bg-white border-2 border-[#218092] text-[#218092] px-8 py-4 rounded-lg font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 text-center"
              aria-label="View accessibility, security, and compliance details"
            >
              View Security & Compliance
            </Link>
          </div>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-600 mt-6">
            Includes compliance certifications, security practices, SLAs, and 
            technical specifications for government tender submissions.
          </p>
        </div>
      </div>
    </section>
  );
}

