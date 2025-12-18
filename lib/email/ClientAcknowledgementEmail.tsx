import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/**
 * Props for the questionnaire acknowledgement email.
 */
export interface ClientAcknowledgementEmailProps {
  /** First name of the primary client contact */
  clientFirstName: string;
  /** Name of the client's business */
  businessName: string;
  /** Sector label used to tailor the copy */
  sector: string;
}

/**
 * Rocky Web Studio questionnaire acknowledgement email.
 *
 * Sent after a client completes the discovery questionnaire, with the
 * personalised deep-dive PDF attached by the caller.
 */
const ClientAcknowledgementEmail: React.FC<ClientAcknowledgementEmailProps> = ({
  clientFirstName,
  businessName,
  sector,
}) => {
  const previewText = `Your Custom Deep-Dive Report  ${businessName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://rockywebstudio.com.au/images/rws-logo-transparent.png"
              alt="Rocky Web Studio"
              width={150}
              style={{ display: "inline-block" }}
            />
          </Section>

          {/* Main heading */}
          <Section>
            <Text style={heading}>Thanks for Completing Your Questionnaire!</Text>
            <Text style={bodyText}>Hi {clientFirstName || "there"},</Text>
            <Text style={bodyText}>
              Thanks for taking the time to complete the Rocky Web Studio discovery questionnaire for
              <strong> {businessName}</strong>. We&rsquo;ve used your responses to prepare a tailored deep-dive report for
              your <strong>{sector}</strong> organisation.
            </Text>

            <ul style={bodyList as React.CSSProperties}>
              <li>
                <strong>&#10003; Custom analysis</strong> of your biggest digital challenges
              </li>
              <li>
                <strong>&#10003; Proven solutions</strong> Rocky Web Studio uses with {sector} businesses
              </li>
              <li>
                <strong>&#10003; Real ROI projections</strong> &mdash; payback timelines and investment ranges
              </li>
              <li>
                <strong>&#10003; Clear next steps</strong> to move your digital transformation forward with confidence
              </li>
            </ul>

            <Text style={bodyText}>
              Your report is attached and ready to review. There&rsquo;s no login or portal required &mdash; just open the
              PDF and explore the insights and recommendations for your business.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>Ready to discuss your digital future?</Text>
            <Button
              href="https://calendly.com/martin-rws/15min"
              style={button}
            >
              Schedule a 15-Minute Consultation
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Martin Carroll</strong>
              <br />
              Founder, Rocky Web Studio
              <br />
              AI-First Digital Transformation Partner
            </Text>
            <Text style={footerText}>
              <Link href="mailto:martin@rockywebstudio.com.au" style={link}>
                martin@rockywebstudio.com.au
              </Link>
              <br />
              <Link href="https://rockywebstudio.com.au" style={link}>
                rockywebstudio.com.au
              </Link>
            </Text>

            <Section style={avobSection}>
              <Img
                src="https://rockywebstudio.com.au/images/avob-footer-image.jpg"
                alt="Australian Veteran Owned Business"
                width={100}
                height="auto"
                style={{ display: "inline-block" }}
              />
              <Text style={{ ...footerText, marginTop: 8 }}>
                <Link
                  href="https://www.avob.org.au/"
                  style={link}
                >
                  Certified Australian Veteran Owned Business
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main: React.CSSProperties = {
  backgroundColor: "#FFFCF9",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
  padding: "20px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e0d9d0",
  borderRadius: 12,
  margin: "20px auto",
  maxWidth: 600,
  padding: 40,
};

const logoSection: React.CSSProperties = {
  marginBottom: 30,
  textAlign: "center",
};

const heading: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#208091",
  marginBottom: 20,
};

const bodyText: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  marginBottom: 15,
  color: "#134252",
};

const bodyList: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.8,
  marginBottom: 20,
  paddingLeft: 20,
  color: "#134252",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "40px 0",
};

const ctaText: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#208091",
  marginBottom: 20,
};

const button: React.CSSProperties = {
  backgroundColor: "#208091",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 700,
  textDecoration: "none",
  borderRadius: 8,
  display: "inline-block",
  padding: "12px 24px",
};

const hr: React.CSSProperties = {
  borderColor: "#e0d9d0",
  margin: "30px 0",
};

const footer: React.CSSProperties = {
  marginTop: 40,
  paddingTop: 20,
  borderTop: "1px solid #e0d9d0",
};

const footerText: React.CSSProperties = {
  fontSize: 13,
  color: "#5E5240",
  lineHeight: 1.6,
};

const link: React.CSSProperties = {
  color: "#208091",
  textDecoration: "underline",
};

const avobSection: React.CSSProperties = {
  textAlign: "center",
  marginTop: 30,
};

export default ClientAcknowledgementEmail;
