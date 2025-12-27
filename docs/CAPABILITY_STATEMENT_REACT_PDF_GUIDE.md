# Capability Statement React PDF Design Guide
## Rocky Web Studio - 8-Page Government Capability Statement

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Purpose:** Complete implementation guide for creating professional government-grade capability statement using @react-pdf/renderer  
**Technology:** React, TypeScript, @react-pdf/renderer

---

## Quick Reference Card

**Colors:**
- Primary Teal: `#218092`
- Background Cream: `#fcfcf9`
- Text Dark: `#1f2121`
- Accent Gray: `#a7a9a9`
- Accent Teal: `#32b8c6`

**Typography:**
- H1: 48px, Bold, Teal
- H2: 28px, Semibold (600), Dark
- H3: 20px, Semibold (600), Dark
- Body: 14-16px, Regular (400), Dark

**Spacing:**
- Margins: 40px all sides
- Section gap: 60px
- Heading to content: 20px
- Bullet spacing: 8px

**Icons:**
- Small: 24x24px
- Medium: 32x32px
- Large: 40x40px

**Page Size:**
- A4 (8.27" x 11.69" or 595 x 842 points)

---

## 1. Installation & Setup

### Install Dependencies

```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf-renderer
```

### Project Structure

```
components/
  pdf/
    CapabilityStatement.tsx      # Main PDF document
    pages/
      CoverPage.tsx              # Page 1
      ServicesPage.tsx           # Page 2
      TechnicalPage.tsx          # Page 3
      EngagementPage.tsx         # Page 4
      ProofPointsPage.tsx        # Page 5
      PricingPage.tsx            # Page 6
      TeamPage.tsx               # Page 7
      ContactPage.tsx            # Page 8
    styles/
      colors.ts                  # Color constants
      typography.ts              # Typography styles
      layout.ts                  # Layout utilities
    assets/
      logo.png                   # Rocky Web Studio logo
      icons/
        checkmark.svg
        shield.svg
        star.svg
        # ... more icons
app/
  api/
    capability-statement/
      pdf/
        route.ts                 # PDF generation API route
```

---

## 2. Brand Colors

### Color Constants

```typescript
// components/pdf/styles/colors.ts
export const colors = {
  primary: '#218092',      // Teal Primary
  background: '#fcfcf9',    // Cream Background
  text: '#1f2121',         // Dark Charcoal
  accentGray: '#a7a9a9',   // Light Gray
  accentTeal: '#32b8c6',   // Light Teal
  white: '#ffffff',
} as const;
```

### Usage in Styles

```typescript
import { StyleSheet } from '@react-pdf/renderer';
import { colors } from './styles/colors';

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    padding: 40,
  },
  title: {
    color: colors.primary,
  },
  text: {
    color: colors.text,
  },
});
```

---

## 3. Typography System

### Typography Styles

```typescript
// components/pdf/styles/typography.ts
import { StyleSheet } from '@react-pdf/renderer';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 20,
  },
  h2: {
    fontSize: 28,
    fontWeight: 600, // Semibold
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 1.3,
    marginBottom: 20,
  },
  h3: {
    fontSize: 20,
    fontWeight: 600, // Semibold
    color: colors.text,
    lineHeight: 1.4,
    marginBottom: 12,
  },
  h4: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.accentGray,
    lineHeight: 1.4,
  },
  bullet: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
    lineHeight: 1.6,
    marginBottom: 8,
    paddingLeft: 20,
  },
});
```

### Font Registration (Optional - Custom Fonts)

```typescript
// components/pdf/CapabilityStatement.tsx
import { Font } from '@react-pdf/renderer';

// Register custom fonts (if using Inter, Poppins, etc.)
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
  ],
});

// Default fonts available: Helvetica, Times-Roman, Courier
```

---

## 4. Layout Utilities

### Common Layout Patterns

```typescript
// components/pdf/styles/layout.ts
import { StyleSheet } from '@react-pdf/renderer';
import { colors } from './colors';

export const layout = StyleSheet.create({
  // Page container
  page: {
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  
  // Section spacing
  section: {
    marginBottom: 60,
  },
  
  // Two-column layout
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 40,
  },
  leftColumn: {
    width: '50%',
  },
  rightColumn: {
    width: '50%',
  },
  
  // Three-column layout
  threeColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 30,
  },
  column: {
    flex: 1, // Equal width
  },
  
  // 2x2 Grid
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 40,
  },
  gridItem: {
    width: '48%', // 2 columns with gap
    marginBottom: 40,
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    padding: 20,
    border: `1px solid ${colors.accentGray}`,
    borderRadius: 4,
  },
  
  // Centered content
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
});
```

---

## 5. Page-by-Page Implementation

### Page 1: Cover Page

```typescript
// components/pdf/pages/CoverPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  logo: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 40,
    left: 40,
  },
  titleContainer: {
    marginTop: 200,
    marginBottom: 40,
  },
  credentials: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 40,
    marginTop: 40,
    marginBottom: 40,
  },
  credential: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    width: 'auto',
  },
  credentialIcon: {
    width: 32,
    height: 32,
  },
  credentialText: {
    fontSize: 14,
    color: colors.text,
  },
  contact: {
    marginTop: 60,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 12,
    color: colors.accentGray,
  },
});

export const CoverPage = () => (
  <Page size="A4" style={styles.page}>
    <Image src="/logo.png" style={styles.logo} />
    
    <View style={styles.titleContainer}>
      <Text style={styles.h1}>
        Production-Ready Digital Services
      </Text>
      <Text style={styles.h1}>
        For Government & Enterprise
      </Text>
    </View>
    
    <Text style={styles.body}>
      Rocky Web Studio delivers enterprise-grade web development
      services tailored for Australian government agencies and public
      sector organisations.
    </Text>
    
    <View style={styles.credentials}>
      <View style={styles.credential}>
        <Image src="/icons/checkmark.svg" style={styles.credentialIcon} />
        <Text style={styles.credentialText}>AVOB Certified</Text>
      </View>
      <View style={styles.credential}>
        <Image src="/icons/shield.svg" style={styles.credentialIcon} />
        <Text style={styles.credentialText}>WCAG 2.1 AA Compliant</Text>
      </View>
      <View style={styles.credential}>
        <Image src="/icons/star.svg" style={styles.credentialIcon} />
        <Text style={styles.credentialText}>Enterprise Security</Text>
      </View>
      <View style={styles.credential}>
        <Image src="/icons/clock.svg" style={styles.credentialIcon} />
        <Text style={styles.credentialText}>99.9% Uptime SLA</Text>
      </View>
    </View>
    
    <View style={styles.contact}>
      <Text style={styles.contactText}>Website: rockywebstudio.com.au</Text>
      <Text style={styles.contactText}>Email: hello@rockywebstudio.com.au</Text>
      <Text style={styles.contactText}>Location: Rockhampton, Queensland, Australia</Text>
      <Text style={styles.contactText}>ABN: 62 948 405 693</Text>
    </View>
    
    <Text style={styles.pageNumber}>Page 1 of 8</Text>
  </Page>
);
```

### Page 2: What We Deliver (2x2 Grid)

```typescript
// components/pdf/pages/ServicesPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  gridItem: {
    width: '48%',
    marginBottom: 40,
    padding: 20,
    backgroundColor: colors.white,
    border: `1px solid ${colors.accentGray}`,
  },
  gridIcon: {
    width: 40,
    height: 40,
    marginBottom: 20,
    alignSelf: 'center',
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
});

const ServiceCard = ({ icon, title, bullets }: {
  icon: string;
  title: string;
  bullets: string[];
}) => (
  <View style={styles.gridItem}>
    <Image src={icon} style={styles.gridIcon} />
    <Text style={styles.gridTitle}>{title}</Text>
    {bullets.map((bullet, i) => (
      <Text key={i} style={styles.bullet}>• {bullet}</Text>
    ))}
  </View>
);

export const ServicesPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>What We Deliver</Text>
    
    <View style={styles.grid}>
      <ServiceCard
        icon="/icons/code.svg"
        title="Web Design & Development"
        bullets={[
          'Responsive, content-managed websites (5–100+ pages)',
          'Modern CMS with role-based access controls',
          'Mobile-first responsive design',
        ]}
      />
      <ServiceCard
        icon="/icons/shield.svg"
        title="Accessibility & Compliance"
        bullets={[
          'WCAG 2.1 AA compliance audits and remediation',
          'Automated testing (axe-core, WAVE, Lighthouse)',
          'Manual testing (NVDA, JAWS, keyboard navigation)',
        ]}
      />
      <ServiceCard
        icon="/icons/robot.svg"
        title="AI-Powered Solutions"
        bullets={[
          'AI chatbot development and deployment',
          'Lead qualification and customer support automation',
          'Real-time streaming responses',
        ]}
      />
      <ServiceCard
        icon="/icons/database.svg"
        title="Lead Capture & CRM"
        bullets={[
          'Secure contact forms with honeypot protection',
          'Admin dashboards with role-based access',
          'CRM integration capabilities',
        ]}
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 2 of 8</Text>
  </Page>
);
```

### Page 3: Technical Foundation (3-Column)

```typescript
// components/pdf/pages/TechnicalPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  columnIcon: {
    width: 32,
    height: 32,
    marginBottom: 12,
  },
});

const TechnicalColumn = ({ icon, title, items }: {
  icon: string;
  title: string;
  items: string[];
}) => (
  <View style={styles.column}>
    <Image src={icon} style={styles.columnIcon} />
    <Text style={styles.h3}>{title}</Text>
    {items.map((item, i) => (
      <Text key={i} style={styles.bullet}>• {item}</Text>
    ))}
  </View>
);

export const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Technical Foundation</Text>
    
    <View style={styles.threeColumn}>
      <TechnicalColumn
        icon="/icons/stack.svg"
        title="Build Stack"
        items={[
          'Next.js 16 (Turbopack)',
          'React 19',
          'TypeScript (strict mode)',
          'PostgreSQL (Supabase)',
        ]}
      />
      <TechnicalColumn
        icon="/icons/shield.svg"
        title="Security"
        items={[
          'OWASP Top 10 aligned',
          'Privacy Act 1988 (Cth) compliant',
          'GDPR-ready',
          'Security headers (HSTS, CSP)',
        ]}
      />
      <TechnicalColumn
        icon="/icons/checkmark.svg"
        title="Accessibility Testing"
        items={[
          'Lighthouse (target: 91+)',
          'axe-core automated testing',
          'Manual keyboard navigation',
          'Screen reader testing (NVDA)',
        ]}
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 3 of 8</Text>
  </Page>
);
```

### Page 4: Engagement Model (Two-Column)

```typescript
// components/pdf/pages/EngagementPage.tsx
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  timelineLine: {
    width: 2,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineWeek: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 12,
    color: colors.text,
  },
});

export const EngagementPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Engagement Model & Timeline</Text>
    
    <View style={styles.twoColumn}>
      <View style={styles.leftColumn}>
        <Text style={styles.h3}>8-Week Project Timeline</Text>
        <View style={styles.timeline}>
          {[
            { week: 'Week 1', desc: 'Discovery & Planning' },
            { week: 'Week 2', desc: 'Design & Wireframes' },
            { week: 'Week 3-4', desc: 'Development Phase 1' },
            { week: 'Week 5-6', desc: 'Development Phase 2' },
            { week: 'Week 7', desc: 'Testing & QA' },
            { week: 'Week 8', desc: 'Launch & Handover' },
          ].map((item, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineWeek}>{item.week}</Text>
                <Text style={styles.timelineDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={styles.h3}>Team Structure</Text>
        <Text style={styles.body}>
          Rocky Web Studio operates as a solo founder with direct client
          engagement. All projects are managed by Martin Carroll, Principal
          Developer, ensuring consistent communication and quality.
        </Text>
        
        <Text style={styles.h3}>Support SLAs</Text>
        <Text style={styles.bodySmall}>• Critical: 2 hour response, 24 hour resolution</Text>
        <Text style={styles.bodySmall}>• High: 4 hour response, 3 business days resolution</Text>
        <Text style={styles.bodySmall}>• Medium: 1 business day response, 1 week resolution</Text>
        <Text style={styles.bodySmall}>• Low: 2 business days response, next release cycle</Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 4 of 8</Text>
  </Page>
);
```

### Page 5: Proof Points (Case Studies)

```typescript
// components/pdf/pages/ProofPointsPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
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
  screenshot: {
    width: 400,
    height: 300,
    marginTop: 12,
    alignSelf: 'center',
  },
});

const CaseStudy = ({ title, challenge, solution, results, metrics, screenshot }: {
  title: string;
  challenge: string;
  solution: string;
  results: string;
  metrics?: string;
  screenshot?: string;
}) => (
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
    
    {screenshot && (
      <Image src={screenshot} style={styles.screenshot} />
    )}
  </View>
);

export const ProofPointsPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Proof Points</Text>
    
    <CaseStudy
      title="Case Study: WCAG 2.1 AA Compliance"
      challenge="Rocky Web Studio needed to achieve WCAG 2.1 AA compliance to be eligible for government contracts."
      solution="Conducted comprehensive accessibility audit, implemented fixes for color contrast, keyboard navigation, screen reader support, and focus indicators."
      results="Achieved Lighthouse accessibility score of 91/100, meeting WCAG 2.1 AA standards. Now eligible for government contracts requiring accessibility compliance."
      metrics="72 → 91 Lighthouse Score"
      screenshot="/screenshots/lighthouse-91.png"
    />
    
    <CaseStudy
      title="Case Study: AI-Powered Lead Qualification Chatbot"
      challenge="Needed cost-effective lead qualification solution without expensive SaaS subscriptions."
      solution="Built custom AI chatbot using Claude API with lead capture integration, deployed in 48 hours."
      results="99.9% cost reduction vs. SaaS alternatives, automated lead qualification, integrated with CRM system."
      metrics="99.9% Cost Reduction"
    />
    
    <Text style={styles.pageNumber}>Page 5 of 8</Text>
  </Page>
);
```

### Page 6: Pricing

```typescript
// components/pdf/pages/PricingPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  pricingCard: {
    width: '32%',
    marginBottom: 20,
    border: `2px solid ${colors.primary}`,
    borderRadius: 4,
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
    width: 16,
    height: 16,
    marginRight: 8,
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});

const PricingCard = ({ title, price, features }: {
  title: string;
  price: string;
  features: string[];
}) => (
  <View style={styles.pricingCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardHeaderText}>{title}</Text>
    </View>
    <Text style={styles.cardPrice}>{price}</Text>
    <View style={styles.cardFeatures}>
      {features.map((feature, i) => (
        <View key={i} style={styles.featureItem}>
          <Image src="/icons/checkmark.svg" style={styles.checkmark} />
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
          'Strategy & planning',
          'Technical architecture',
        ]}
      />
      <PricingCard
        title="Website Build"
        price="$10,000+"
        features={[
          '5-100+ page website',
          'CMS integration',
          'WCAG 2.1 AA compliant',
        ]}
      />
      <PricingCard
        title="Ongoing Support"
        price="From $500/mo"
        features={[
          'Security updates',
          'Performance monitoring',
          'Content updates',
        ]}
      />
    </View>
    
    <Text style={styles.pageNumber}>Page 6 of 8</Text>
  </Page>
);
```

### Page 7: Team & Continuity

```typescript
// components/pdf/pages/TeamPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  avobBadge: {
    width: 80,
    height: 80,
    marginTop: 12,
  },
  flowchart: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 12,
  },
  flowBox: {
    border: `2px solid ${colors.primary}`,
    padding: 12,
    borderRadius: 4,
    textAlign: 'center',
  },
  arrow: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 20,
  },
});

export const TeamPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Team & Continuity</Text>
    
    <View style={styles.twoColumn}>
      <View style={styles.leftColumn}>
        <View style={styles.profile}>
          <Image src="/profile-photo.png" style={styles.profilePhoto} />
          <Text style={styles.profileName}>Martin Carroll</Text>
          <Text style={styles.profileTitle}>Principal Developer</Text>
          <Text style={styles.bodySmall}>• 10+ years web development</Text>
          <Text style={styles.bodySmall}>• TypeScript & React expert</Text>
          <Text style={styles.bodySmall}>• Australian Veteran</Text>
          <Image src="/avob-badge.png" style={styles.avobBadge} />
        </View>
      </View>
      
      <View style={styles.rightColumn}>
        <Text style={styles.h3}>Why Rocky Web Studio?</Text>
        <Text style={styles.body}>
          Solo founder operation ensures direct communication, consistent
          quality, and rapid decision-making. No account managers or
          middlemen—you work directly with the developer.
        </Text>
        
        <Text style={styles.h3}>Escalation & Support</Text>
        <View style={styles.flowchart}>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Day-to-Day Contact</Text>
          </View>
          <Text style={styles.arrow}>↓</Text>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Critical Issue</Text>
          </View>
          <Text style={styles.arrow}>↓</Text>
          <View style={styles.flowBox}>
            <Text style={styles.bodySmall}>Principal Escalation</Text>
          </View>
        </View>
        
        <Text style={styles.h3}>Business Continuity</Text>
        <Text style={styles.body}>
          In the unlikely event that Rocky Web Studio ceases operations,
          clients receive full access to source code and complete data export,
          ensuring vendor independence and business continuity.
        </Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 7 of 8</Text>
  </Page>
);
```

### Page 8: Contact & Next Steps

```typescript
// components/pdf/pages/ContactPage.tsx
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

const styles = StyleSheet.create({
  ...layout,
  ...typography,
  step: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 24,
    height: 24,
  },
  stepContent: {
    flex: 1,
  },
  contactItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  contactIcon: {
    width: 20,
    height: 20,
  },
  testimonialBox: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 16,
    borderRadius: 4,
    marginBottom: 20,
  },
  testimonialText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.white,
  },
});

export const ContactPage = () => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.h2}>Contact & Next Steps</Text>
    
    <View style={styles.centered}>
      <Text style={styles.h2}>What Happens Next?</Text>
      
      <View style={styles.step}>
        <Image src="/icons/email.svg" style={styles.stepIcon} />
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 1: Initial Consultation</Text>
          <Text style={styles.body}>Contact us to discuss your project requirements and timeline.</Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <Image src="/icons/document.svg" style={styles.stepIcon} />
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 2: Proposal & Agreement</Text>
          <Text style={styles.body}>Receive detailed proposal with timeline, deliverables, and pricing.</Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <Image src="/icons/rocket.svg" style={styles.stepIcon} />
        <View style={styles.stepContent}>
          <Text style={styles.h4}>Step 3: Project Kickoff</Text>
          <Text style={styles.body}>Begin 8-week development cycle with regular check-ins and updates.</Text>
        </View>
      </View>
      
      <Text style={styles.h3}>Contact Information</Text>
      
      <View style={styles.contactItem}>
        <Image src="/icons/mail.svg" style={styles.contactIcon} />
        <Text style={styles.body}>hello@rockywebstudio.com.au</Text>
      </View>
      
      <View style={styles.contactItem}>
        <Image src="/icons/link.svg" style={styles.contactIcon} />
        <Text style={styles.body}>rockywebstudio.com.au</Text>
      </View>
      
      <View style={styles.contactItem}>
        <Image src="/icons/location.svg" style={styles.contactIcon} />
        <Text style={styles.body}>Rockhampton, Queensland, Australia</Text>
      </View>
      
      <Text style={styles.h3}>Our Credentials</Text>
      <View style={styles.credentials}>
        <View style={styles.credential}>
          <Image src="/icons/checkmark.svg" style={styles.credentialIcon} />
          <Text style={styles.credentialText}>AVOB Certified</Text>
        </View>
        {/* More credentials */}
      </View>
      
      <Text style={styles.h3}>Client Testimonials</Text>
      <View style={styles.testimonialBox}>
        <Text style={styles.testimonialText}>
          "Rocky Web Studio delivered exactly what we needed, on time and
          within budget. The accessibility compliance work was exceptional."
        </Text>
      </View>
    </View>
    
    <Text style={styles.pageNumber}>Page 8 of 8</Text>
  </Page>
);
```

---

## 6. Main Document Component

```typescript
// components/pdf/CapabilityStatement.tsx
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
```

---

## 7. API Route for PDF Generation

```typescript
// app/api/capability-statement/pdf/route.ts
import { renderToStream } from '@react-pdf/renderer';
import { CapabilityStatement } from '@/components/pdf/CapabilityStatement';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stream = await renderToStream(<CapabilityStatement />);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Capability-Statement-Gov-Enterprise.pdf"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response('Error generating PDF', { status: 500 });
  }
}
```

---

## 8. Build-Time Generation (Alternative)

```typescript
// scripts/generate-capability-statement.ts
import { renderToFile } from '@react-pdf/renderer';
import { CapabilityStatement } from '../components/pdf/CapabilityStatement';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generatePDF() {
  const outputPath = join(process.cwd(), 'public', 'Capability-Statement-Gov-Enterprise.pdf');
  
  try {
    await renderToFile(<CapabilityStatement />, outputPath);
    console.log('✅ PDF generated:', outputPath);
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    process.exit(1);
  }
}

generatePDF();
```

Add to `package.json`:
```json
{
  "scripts": {
    "generate:pdf": "tsx scripts/generate-capability-statement.ts"
  }
}
```

---

## 9. Icon Setup

### Download Icons

1. Download Feather or Tabler icons as SVG
2. Store in `public/icons/` folder
3. Use in components as `<Image src="/icons/checkmark.svg" />`

### Icon Sources
- **Feather Icons:** https://feathericons.com/
- **Tabler Icons:** https://tabler.io/icons

### Icon Sizes
- Small: 24x24px
- Medium: 32x32px
- Large: 40x40px

---

## 10. Testing & Development

### Development Workflow

1. **Make changes** to PDF components
2. **Generate PDF** via API route or build script
3. **Review PDF** in browser or PDF viewer
4. **Iterate** until design is correct

### Preview PDF Locally

```bash
# Start dev server
npm run dev

# Visit API route
http://localhost:3000/api/capability-statement/pdf
```

### Generate Static PDF

```bash
# Generate PDF during build
npm run generate:pdf

# PDF saved to public/Capability-Statement-Gov-Enterprise.pdf
```

---

## 11. Design Checklist

Before deploying:

- [ ] All 8 pages render correctly
- [ ] Colors match brand guidelines (#218092, #fcfcf9, #1f2121)
- [ ] Typography sizes correct (48px H1, 28px H2, 20px H3, 14-16px body)
- [ ] Spacing consistent (40px margins, 60px sections, 20px gaps)
- [ ] Icons display correctly (SVG format)
- [ ] Images load (logo, screenshots)
- [ ] Page numbers visible (bottom right, "Page X of 8")
- [ ] Text readable (no overlapping, proper contrast)
- [ ] Layouts correct (grids, columns align properly)
- [ ] PDF file size reasonable (<2MB)

---

## 12. Troubleshooting

### Icons Not Displaying
- **Issue:** Icons don't appear in PDF
- **Solution:** Ensure SVG files are in `/public/icons/` and paths are correct

### Fonts Not Loading
- **Issue:** Custom fonts not applied
- **Solution:** Register fonts using `Font.register()` before rendering

### Layout Issues
- **Issue:** Elements not aligning correctly
- **Solution:** Use Flexbox (`display: 'flex'`) for layouts, check `gap` and `width` properties

### Text Overflow
- **Issue:** Text cuts off or overlaps
- **Solution:** Reduce font size, increase container width, or split into multiple lines

### PDF Too Large
- **Issue:** PDF file size >2MB
- **Solution:** Compress images before adding, reduce image count, optimize SVGs

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Technology:** @react-pdf/renderer, React, TypeScript

