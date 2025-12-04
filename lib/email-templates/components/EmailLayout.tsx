import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Link,
} from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  logoUrl?: string;
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}

export function EmailLayout({
  children,
  logoUrl,
  showUnsubscribe = true,
  unsubscribeUrl,
}: EmailLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://rockywebstudio.com.au";
  const logo = logoUrl || `${baseUrl}/logo.png`; // Placeholder - add logo later

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            {logoUrl ? (
              <Img
                src={logo}
                alt="Rocky Web Studio"
                width="180"
                height="auto"
                style={logoStyle}
              />
            ) : (
              <Text style={logoText}>Rocky Web Studio</Text>
            )}
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* AVOB Badge Section */}
          <Section style={avobSection}>
            <Img
              src={`${baseUrl}/images/avob/AVOB.jpg`}
              width="80"
              height="80"
              alt="Australian Veteran Owned Business Certification"
              style={avobImage}
            />
            <Text style={avobTitle}>
              Veteran-Owned Business Certified
            </Text>
            <Text style={avobText}>
              Rocky Web Studio is a certified Australian Veteran Owned Business.
            </Text>
            <Link
              href="https://avob.org.au"
              style={avobLink}
            >
              Verify Our Certification →
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Rocky Web Studio</strong>
            </Text>
            <Text style={footerText}>
              Bold web experiences for ambitious teams
            </Text>
            <Text style={footerDivider}>—</Text>
            <Text style={footerText}>
              <Link href={`mailto:hello@rockywebstudio.com.au`} style={footerLink}>
                hello@rockywebstudio.com.au
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={`tel:+61400000000`} style={footerLink}>
                +61 400 000 000
              </Link>
            </Text>
            <Text style={footerDivider}>—</Text>
            <Text style={footerSocial}>
              <Link href="https://rockywebstudio.com.au" style={footerLink}>
                Website
              </Link>
              {" • "}
              <Link href="https://facebook.com/rockywebstudio" style={footerLink}>
                Facebook
              </Link>
              {" • "}
              <Link href="https://instagram.com/rockywebstudio" style={footerLink}>
                Instagram
              </Link>
            </Text>
            {showUnsubscribe && (
              <Text style={footerUnsubscribe}>
                <Link
                  href={unsubscribeUrl || `${baseUrl}/unsubscribe`}
                  style={footerLink}
                >
                  Unsubscribe from emails
                </Link>
              </Text>
            )}
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Rocky Web Studio. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Brand Colors
const BRAND_TEAL = "#218081";
const BRAND_CREAM = "#fcfcf9";

// Styles
const main = {
  backgroundColor: BRAND_CREAM,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const header = {
  backgroundColor: BRAND_TEAL,
  padding: "32px 24px",
  textAlign: "center" as const,
};

const logoStyle = {
  display: "block",
  margin: "0 auto",
};

const logoText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  letterSpacing: "0.5px",
};

const content = {
  padding: "32px 24px",
};

const footer = {
  backgroundColor: "#1e293b",
  padding: "32px 24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
};

const footerDivider = {
  color: "#475569",
  fontSize: "12px",
  margin: "12px 0",
};

const footerSocial = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const footerLink = {
  color: "#94a3b8",
  textDecoration: "underline",
};

const footerUnsubscribe = {
  color: "#64748b",
  fontSize: "12px",
  marginTop: "16px",
};

const footerCopyright = {
  color: "#475569",
  fontSize: "11px",
  marginTop: "16px",
};

// AVOB Badge Section Styles
const avobSection = {
  padding: "24px",
  textAlign: "center" as const,
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
};

const avobImage = {
  display: "block",
  margin: "0 auto 12px",
  borderRadius: "4px",
};

const avobTitle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 6px 0",
};

const avobText = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0 0 8px 0",
  lineHeight: "1.6",
};

const avobLink = {
  color: BRAND_TEAL,
  textDecoration: "underline",
  fontSize: "11px",
  fontWeight: "500",
};

