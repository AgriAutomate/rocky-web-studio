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
import { getEmailThemeSync } from "@/lib/email-templates/theme";

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
  const theme = getEmailThemeSync("light");
  const styles = createEmailLayoutStyles(theme);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://rockywebstudio.com.au";
  const logo = logoUrl || `${baseUrl}/logo.png`; // Placeholder - add logo later

  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Header with Logo */}
          <Section style={styles.header}>
            {logoUrl ? (
              <Img
                src={logo}
                alt="Rocky Web Studio"
                width="180"
                height="auto"
                style={styles.logoStyle}
              />
            ) : (
              <Text style={styles.logoText}>Rocky Web Studio</Text>
            )}
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>{children}</Section>

          {/* AVOB Badge Section */}
          <Section style={styles.avobSection}>
            <Img
              src={`${baseUrl}/images/avob/AVOB.jpg`}
              width="80"
              height="80"
              alt="Australian Veteran Owned Business Certification"
              style={styles.avobImage}
            />
            <Text style={styles.avobTitle}>
              Veteran-Owned Business Certified
            </Text>
            <Text style={styles.avobText}>
              Rocky Web Studio is a certified Australian Veteran Owned Business.
            </Text>
            <Link
              href="https://avob.org.au"
              style={styles.avobLink}
            >
              Verify Our Certification →
            </Link>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              <strong>Rocky Web Studio</strong>
            </Text>
            <Text style={styles.footerText}>
              Bold web experiences for ambitious teams
            </Text>
            <Text style={styles.footerDivider}>—</Text>
            <Text style={styles.footerText}>
              <Link href={`mailto:hello@rockywebstudio.com.au`} style={styles.footerLink}>
                hello@rockywebstudio.com.au
              </Link>
            </Text>
            <Text style={styles.footerText}>
              <Link href={`tel:+61400000000`} style={styles.footerLink}>
                +61 400 000 000
              </Link>
            </Text>
            <Text style={styles.footerDivider}>—</Text>
            <Text style={styles.footerSocial}>
              <Link href="https://rockywebstudio.com.au" style={styles.footerLink}>
                Website
              </Link>
              {" • "}
              <Link href="https://facebook.com/rockywebstudio" style={styles.footerLink}>
                Facebook
              </Link>
              {" • "}
              <Link href="https://instagram.com/rockywebstudio" style={styles.footerLink}>
                Instagram
              </Link>
            </Text>
            {showUnsubscribe && (
              <Text style={styles.footerUnsubscribe}>
                <Link
                  href={unsubscribeUrl || `${baseUrl}/unsubscribe`}
                  style={styles.footerLink}
                >
                  Unsubscribe from emails
                </Link>
              </Text>
            )}
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} Rocky Web Studio. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function rgbaFromHexOrFallback(hexOrAny: string | undefined, alpha: number, fallback: string) {
  if (!hexOrAny) return fallback;
  const hex = hexOrAny.trim();
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return fallback;
  const int = parseInt(m[1]!, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function createEmailLayoutStyles(theme: ReturnType<typeof getEmailThemeSync>) {
  const footerText = rgbaFromHexOrFallback(theme.brandForeground, 0.85, "rgba(248,250,252,0.85)");
  const footerDivider = rgbaFromHexOrFallback(theme.brandForeground, 0.35, "rgba(248,250,252,0.35)");
  const footerLink = rgbaFromHexOrFallback(theme.brandForeground, 0.7, "rgba(248,250,252,0.7)");
  const footerUnsubscribe = rgbaFromHexOrFallback(theme.brandForeground, 0.6, "rgba(248,250,252,0.6)");
  const footerCopyright = rgbaFromHexOrFallback(theme.brandForeground, 0.45, "rgba(248,250,252,0.45)");

  return {
    main: {
      backgroundColor: theme.background,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
    },
    container: {
      backgroundColor: theme.card,
      margin: "0 auto",
      padding: "0",
      maxWidth: "600px",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    header: {
      background: `linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo})`,
      padding: "32px 24px",
      textAlign: "center" as const,
    },
    logoStyle: {
      display: "block",
      margin: "0 auto",
    },
    logoText: {
      color: theme.brandForeground,
      fontSize: "28px",
      fontWeight: "bold",
      margin: "0",
      letterSpacing: "0.5px",
    },
    content: {
      padding: "32px 24px",
    },
    footer: {
      backgroundColor: theme.foreground,
      padding: "32px 24px",
      textAlign: "center" as const,
    },
    footerText: {
      color: footerText,
      fontSize: "14px",
      lineHeight: "20px",
      margin: "4px 0",
    },
    footerDivider: {
      color: footerDivider,
      fontSize: "12px",
      margin: "12px 0",
    },
    footerSocial: {
      color: footerText,
      fontSize: "14px",
      lineHeight: "20px",
      margin: "8px 0",
    },
    footerLink: {
      color: footerLink,
      textDecoration: "underline",
    },
    footerUnsubscribe: {
      color: footerUnsubscribe,
      fontSize: "12px",
      marginTop: "16px",
    },
    footerCopyright: {
      color: footerCopyright,
      fontSize: "11px",
      marginTop: "16px",
    },
    avobSection: {
      padding: "24px",
      textAlign: "center" as const,
      borderTop: `1px solid ${theme.border}`,
      backgroundColor: theme.background,
    },
    avobImage: {
      display: "block",
      margin: "0 auto 12px",
      borderRadius: "4px",
    },
    avobTitle: {
      fontSize: "13px",
      fontWeight: "600",
      color: theme.foreground,
      margin: "0 0 6px 0",
    },
    avobText: {
      fontSize: "12px",
      color: theme.mutedForeground,
      margin: "0 0 8px 0",
      lineHeight: "1.6",
    },
    avobLink: {
      color: theme.primary,
      textDecoration: "underline",
      fontSize: "11px",
      fontWeight: "500",
    },
  };
}

