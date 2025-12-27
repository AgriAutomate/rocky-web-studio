'use client';

/**
 * Accessibility & Compliance Page
 * 
 * Production-ready accessibility page for Rocky Web Studio
 * WCAG 2.1 AA compliant, government-appropriate design
 * 
 * Sections:
 * 1. WCAG 2.1 AA Compliance
 * 2. Data Privacy & Security
 * 3. Backup & Business Continuity
 * 4. Incident Response & SLAs
 * 5. Compliance Statements
 * 6. Contact & Support
 */

import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-[#fcfcf9] text-[#1f2121]">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#218092] focus:text-white focus:rounded-lg focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      {/* Hero Section */}
      <section className="bg-[#218092] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Accessibility & Compliance
          </h1>
          <p className="text-xl md:text-2xl text-teal-100">
            Production-ready digital services built for government and enterprise standards
          </p>
        </div>
      </section>

      {/* Section 1: WCAG 2.1 AA Compliance */}
      <section id="main-content" className="py-20 px-4" aria-labelledby="wcag-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="wcag-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            WCAG 2.1 AA Compliance
          </h2>
          
          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              Rocky Web Studio builds all websites to meet <strong>WCAG 2.1 Level AA</strong> standards, 
              ensuring digital accessibility for users with disabilities. We follow the Web Content 
              Accessibility Guidelines (WCAG) published by the World Wide Web Consortium (W3C), 
              which are recognised as the international standard for web accessibility.
            </p>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Our Accessibility Features
          </h3>
          
          <ul className="space-y-3 mb-8 list-disc list-inside">
            <li>
              <strong>Color Contrast:</strong> All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
            </li>
            <li>
              <strong>Keyboard Navigation:</strong> All interactive elements are fully accessible via keyboard (Tab, Enter, Escape)
            </li>
            <li>
              <strong>Screen Reader Support:</strong> Semantic HTML, ARIA labels, and proper heading hierarchy for assistive technologies
            </li>
            <li>
              <strong>Focus Indicators:</strong> Visible focus states on all interactive elements (2px solid outline, 2px offset)
            </li>
            <li>
              <strong>Alt Text:</strong> Descriptive alternative text for all images and meaningful icons
            </li>
            <li>
              <strong>Resize & Zoom:</strong> Content remains functional and readable when zoomed to 200%
            </li>
            <li>
              <strong>Automated Testing:</strong> Continuous accessibility testing using axe-core, WAVE, and Lighthouse
            </li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Testing Methodology
          </h3>
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <h4 className="text-xl font-semibold mb-3">Automated Testing</h4>
            <p className="mb-4">
              We use automated accessibility testing tools throughout development:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>axe-core:</strong> Integrated into our build process for continuous testing</li>
              <li><strong>WAVE:</strong> Browser extension testing for visual accessibility issues</li>
              <li><strong>Lighthouse:</strong> Automated accessibility audits with scoring (target: 90+)</li>
            </ul>
            
            <h4 className="text-xl font-semibold mb-3 mt-6">Manual Testing</h4>
            <p className="mb-4">
              Every website undergoes manual accessibility testing:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Keyboard Navigation:</strong> Full site navigation using only keyboard (Tab, Enter, Escape)</li>
              <li><strong>Screen Readers:</strong> Testing with NVDA (Windows) and VoiceOver (macOS/iOS)</li>
              <li><strong>Color Contrast:</strong> Visual verification of text contrast ratios</li>
              <li><strong>Focus Management:</strong> Verification of focus indicators and logical tab order</li>
            </ul>
          </div>

          <div className="bg-teal-50 border-l-4 border-[#218092] p-6 mb-6">
            <h4 className="text-xl font-semibold mb-2">Current Performance</h4>
            <p className="mb-2">
              <strong>Lighthouse Accessibility Score:</strong> 91/100
            </p>
            <p>
              Our websites consistently achieve high accessibility scores, with ongoing improvements 
              based on automated and manual testing results.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-6">
            <h4 className="text-xl font-semibold mb-2">Known Limitations</h4>
            <p>
              While we strive for full WCAG 2.1 AA compliance, some third-party integrations 
              (such as embedded maps, social media widgets, or payment processors) may have 
              accessibility limitations beyond our direct control. We work with vendors to 
              ensure the best possible accessibility outcomes and provide alternative access 
              methods where necessary.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Data Privacy & Security */}
      <section className="py-20 px-4 bg-white" aria-labelledby="privacy-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="privacy-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            Data Privacy & Security
          </h2>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              Rocky Web Studio is committed to protecting user data and maintaining the highest 
              standards of privacy and security. Our practices align with Australian and 
              international privacy legislation.
            </p>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Privacy Compliance
          </h3>
          
          <dl className="space-y-4 mb-8">
            <div>
              <dt className="font-semibold text-lg mb-2">Privacy Act 1988 (Cth)</dt>
              <dd className="ml-4">
                We comply with the Australian Privacy Principles (APPs) under the Privacy Act, 
                including requirements for collection, use, disclosure, and storage of personal information.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-lg mb-2">GDPR (General Data Protection Regulation)</dt>
              <dd className="ml-4">
                For international clients or users, we implement GDPR-compliant data handling practices, 
                including right to access, right to erasure, and data portability.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-lg mb-2">State Privacy Laws</dt>
              <dd className="ml-4">
                We comply with relevant state privacy legislation, including Queensland's Information 
                Privacy Act 2009 where applicable.
              </dd>
            </div>
          </dl>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Data Handling Practices
          </h3>
          
          <ul className="space-y-3 mb-8 list-disc list-inside">
            <li>
              <strong>Encryption in Transit:</strong> All data transmitted over the internet uses TLS 1.2+ encryption (HTTPS)
            </li>
            <li>
              <strong>Encryption at Rest:</strong> Sensitive data stored in databases is encrypted using industry-standard methods
            </li>
            <li>
              <strong>Data Retention:</strong> Personal data is retained only as long as necessary for business purposes or as required by law
            </li>
            <li>
              <strong>User Rights:</strong> Users can request access to, correction of, or deletion of their personal data
            </li>
            <li>
              <strong>Data Minimisation:</strong> We collect only the minimum data necessary for service delivery
            </li>
          </ul>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Security Protections (OWASP Top 10)
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="mb-4">
              We implement protections against the OWASP Top 10 security risks:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 list-disc list-inside">
              <li>SQL Injection prevention (parameterised queries)</li>
              <li>Cross-Site Scripting (XSS) protection (input sanitisation)</li>
              <li>Cross-Site Request Forgery (CSRF) tokens</li>
              <li>Insecure direct object references (authorisation checks)</li>
              <li>Security misconfiguration (hardened defaults)</li>
              <li>Sensitive data exposure (encryption, secure storage)</li>
              <li>Missing function-level access control (RBAC)</li>
              <li>Insecure deserialisation (input validation)</li>
              <li>Using components with known vulnerabilities (dependency scanning)</li>
              <li>Insufficient logging and monitoring (comprehensive audit logs)</li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Security Headers
          </h3>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="mb-4">
              Our websites implement the following security headers:
            </p>
            <ul className="space-y-2 font-mono text-sm">
              <li><strong>X-Content-Type-Options:</strong> nosniff</li>
              <li><strong>X-Frame-Options:</strong> DENY</li>
              <li><strong>X-XSS-Protection:</strong> 1; mode=block</li>
              <li><strong>Strict-Transport-Security:</strong> max-age=31536000; includeSubDomains</li>
              <li><strong>Content-Security-Policy:</strong> Restrictive policy based on site requirements</li>
              <li><strong>Referrer-Policy:</strong> strict-origin-when-cross-origin</li>
              <li><strong>Permissions-Policy:</strong> Restrictive permissions for geolocation, camera, microphone</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Backup & Business Continuity */}
      <section className="py-20 px-4" aria-labelledby="backup-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="backup-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            Backup & Business Continuity
          </h2>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              Rocky Web Studio maintains robust backup and business continuity practices to ensure 
              your website remains available and recoverable in any scenario.
            </p>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Infrastructure & Hosting
          </h3>
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <ul className="space-y-4">
              <li>
                <strong>Vercel CDN:</strong> Enterprise-grade hosting with 99.9% uptime SLA, 
                global content delivery network, and automatic scaling
              </li>
              <li>
                <strong>Daily Backups:</strong> Automated daily backups of all databases and 
                content, retained for 30 days
              </li>
              <li>
                <strong>Point-in-Time Recovery:</strong> Database backups support point-in-time 
                recovery for the past 7 days
              </li>
              <li>
                <strong>Redundancy:</strong> Multi-region deployment ensures availability even 
                during regional outages
              </li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Uptime Monitoring
          </h3>
          
          <p className="mb-6">
            We monitor website uptime using automated monitoring services that check site 
            availability every 60 seconds. Alerts are sent immediately if downtime is detected, 
            triggering our incident response procedures.
          </p>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Disaster Recovery
          </h3>
          
          <div className="bg-teal-50 border-l-4 border-[#218092] p-6 mb-6">
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">Recovery Time Objective (RTO):</dt>
                <dd className="ml-4">&lt; 4 hours</dd>
                <dd className="ml-4 text-sm text-gray-600">
                  Maximum acceptable time to restore service after a disaster
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Recovery Point Objective (RPO):</dt>
                <dd className="ml-4">&lt; 24 hours</dd>
                <dd className="ml-4 text-sm text-gray-600">
                  Maximum acceptable data loss in the event of a disaster
                </dd>
              </div>
            </dl>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Business Continuity
          </h3>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="mb-4">
              In the unlikely event that Rocky Web Studio is unable to continue operations, 
              clients have full access to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Source Code:</strong> Complete source code repository (GitHub/GitLab access)</li>
              <li><strong>Data Export:</strong> Full database export in standard formats (SQL, JSON, CSV)</li>
              <li><strong>Documentation:</strong> Complete technical documentation and deployment guides</li>
              <li><strong>Hosting Access:</strong> Direct access to hosting platform (Vercel) for seamless transition</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              This ensures zero vendor lock-in and complete client control over their digital assets.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Incident Response & SLAs */}
      <section className="py-20 px-4 bg-white" aria-labelledby="sla-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="sla-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            Incident Response & Service Level Agreements
          </h2>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              Rocky Web Studio provides defined service level agreements (SLAs) with clear response 
              and resolution times based on issue severity.
            </p>
          </div>

          {/* SLA Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border-collapse border border-gray-300">
              <caption className="sr-only">
                Service Level Agreement response and resolution times by severity level
              </caption>
              <thead>
                <tr className="bg-[#218092] text-white">
                  <th scope="col" className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Severity
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Definition
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Response Time
                  </th>
                  <th scope="col" className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-red-50">
                  <th scope="row" className="border border-gray-300 px-4 py-3 font-semibold">
                    Critical
                  </th>
                  <td className="border border-gray-300 px-4 py-3">
                    Site completely down, security breach, data loss
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    2 hours
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    24 hours
                  </td>
                </tr>
                <tr className="bg-orange-50">
                  <th scope="row" className="border border-gray-300 px-4 py-3 font-semibold">
                    High
                  </th>
                  <td className="border border-gray-300 px-4 py-3">
                    Major feature broken, significant performance degradation
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    4 hours
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    3 business days
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <th scope="row" className="border border-gray-300 px-4 py-3 font-semibold">
                    Medium
                  </th>
                  <td className="border border-gray-300 px-4 py-3">
                    Minor feature issue, cosmetic problem, non-critical bug
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    1 business day
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    1 week
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <th scope="row" className="border border-gray-300 px-4 py-3 font-semibold">
                    Low
                  </th>
                  <td className="border border-gray-300 px-4 py-3">
                    Enhancement request, documentation update, minor improvement
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    2 business days
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    Next release cycle
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Monthly Audits
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="mb-4">
              We conduct monthly audits to ensure ongoing compliance and performance:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Dependency Scanning:</strong> Automated scanning for known vulnerabilities in dependencies</li>
              <li><strong>Lighthouse Audits:</strong> Performance, accessibility, SEO, and best practices scoring</li>
              <li><strong>Log Review:</strong> Security and error log analysis for anomalies</li>
              <li><strong>Uptime Report:</strong> Monthly uptime statistics and incident summary</li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Quarterly Reviews
          </h3>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="mb-4">
              Quarterly compliance and performance reviews include:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Compliance Spot-Check:</strong> Manual review of accessibility, privacy, and security practices</li>
              <li><strong>Performance Trends:</strong> Analysis of performance metrics over time</li>
              <li><strong>Security Assessment:</strong> Review of security headers, dependencies, and configurations</li>
              <li><strong>Client Feedback:</strong> Review of support tickets and client satisfaction</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Compliance Statements */}
      <section className="py-20 px-4" aria-labelledby="compliance-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="compliance-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            Compliance Statements
          </h2>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              Rocky Web Studio maintains compliance with industry standards and certifications 
              relevant to government and enterprise procurement.
            </p>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Standards & Frameworks
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-xl font-semibold mb-3">Accessibility</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>WCAG 2.1 Level AA</li>
                <li>Automated + manual testing</li>
                <li>Lighthouse accessibility scoring</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-xl font-semibold mb-3">Security</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>OWASP Top 10 protections</li>
                <li>Security headers implementation</li>
                <li>Regular dependency scanning</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-xl font-semibold mb-3">Privacy</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Privacy Act 1988 (Cth) compliance</li>
                <li>GDPR alignment</li>
                <li>State privacy legislation</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-xl font-semibold mb-3">Infrastructure</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>SOC 2 (via Vercel hosting)</li>
                <li>ISO 27001 (via vendors)</li>
                <li>99.9% uptime SLA</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Certifications
          </h3>
          
          <div className="bg-teal-50 border-l-4 border-[#218092] p-6 mb-6">
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-lg mb-2">AVOB Certified</dt>
                <dd className="ml-4">
                  Rocky Web Studio is certified as an Australian Verified Business (AVOB), 
                  verified for government procurement processes. This certification confirms 
                  our Australian business registration, ABN verification, and eligibility for 
                  government contracts.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-lg mb-2">Vercel Compliance</dt>
                <dd className="ml-4">
                  Our hosting provider, Vercel, maintains SOC 2 Type II certification, 
                  ISO 27001 compliance, and GDPR compliance. All websites hosted on Vercel 
                  benefit from these enterprise-grade certifications.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-lg mb-2">Stripe PCI DSS</dt>
                <dd className="ml-4">
                  For e-commerce websites, payment processing is handled by Stripe, which 
                  maintains PCI DSS Level 1 compliance—the highest level of payment card 
                  industry security standards.
                </dd>
              </div>
            </dl>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-[#218092]">
            Government Procurement
          </h3>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="mb-4">
              As an <strong>AVOB Certified</strong> business, Rocky Web Studio offers advantages 
              for government procurement:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Verified Australian business registration and ABN</li>
              <li>Eligible for government contracts and tenders</li>
              <li>Compliance with Australian Privacy Act and data sovereignty requirements</li>
              <li>Regional Queensland business supporting local economy</li>
              <li>Direct accountability and principal-level expertise</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: Contact & Support */}
      <section className="py-20 px-4 bg-white" aria-labelledby="contact-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold mb-6 text-[#218092]">
            Contact & Support
          </h2>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg mb-6">
              We're here to help with accessibility, security, or general inquiries. 
              Choose the appropriate contact method based on your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-teal-50 rounded-lg p-6 border-l-4 border-[#218092]">
              <h3 className="text-xl font-semibold mb-3 text-[#218092]">
                Accessibility Issues
              </h3>
              <p className="mb-3">
                Report accessibility barriers or request accessibility improvements:
              </p>
              <p className="font-mono text-sm mb-2">
                <a 
                  href="mailto:accessibility@rockywebstudio.com.au"
                  className="text-[#218092] hover:text-teal-700 underline focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 rounded"
                >
                  accessibility@rockywebstudio.com.au
                </a>
              </p>
              <p className="text-sm text-gray-600">
                Response time: 1 business day
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-semibold mb-3 text-red-700">
                Security Concerns
              </h3>
              <p className="mb-3">
                Report security vulnerabilities or data breaches (urgent):
              </p>
              <p className="font-mono text-sm mb-2">
                <a 
                  href="mailto:security@rockywebstudio.com.au"
                  className="text-red-700 hover:text-red-800 underline focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 rounded"
                >
                  security@rockywebstudio.com.au
                </a>
              </p>
              <p className="text-sm text-gray-600">
                Response time: Immediate (24/7 for critical issues)
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-[#218092]">
              General Inquiries
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">Email:</dt>
                <dd>
                  <a 
                    href="mailto:hello@rockywebstudio.com.au"
                    className="text-[#218092] hover:text-teal-700 underline focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 rounded"
                  >
                    hello@rockywebstudio.com.au
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Website:</dt>
                <dd>
                  <Link 
                    href="/"
                    className="text-[#218092] hover:text-teal-700 underline focus:outline-none focus:ring-2 focus:ring-[#218092] focus:ring-offset-2 rounded"
                  >
                    rockywebstudio.com.au
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Location:</dt>
                <dd>Rockhampton, Queensland, Australia</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-[#218092]">
              Office Hours & Response Times
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">Standard Office Hours:</dt>
                <dd>Monday–Friday, 9:00 AM–5:00 PM AEST</dd>
              </div>
              <div>
                <dt className="font-semibold">Critical Support:</dt>
                <dd>24-hour response for critical issues (site down, security breach)</dd>
              </div>
              <div>
                <dt className="font-semibold">Non-Critical Support:</dt>
                <dd>Response within business hours, following SLA guidelines</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-[#218092] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="mb-6 text-teal-100">
            Let's discuss how Rocky Web Studio can deliver production-ready digital services for your organisation.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-[#218092] px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#218092]"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}

