import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
} from "@react-email/components";

interface CustomerOrderConfirmationProps {
  orderId: string;
  customerName: string;
  packageName: string;
  packagePrice: number;
  occasion: string;
  turnaround: string;
  eventDate?: string;
  originalPrice?: number;
  finalPrice: number;
  discountApplied: boolean;
  promoCode?: string;
  paymentIntentId: string;
}

export function CustomerOrderConfirmation({
  orderId,
  customerName,
  packageName,
  packagePrice,
  occasion,
  turnaround,
  eventDate,
  originalPrice,
  finalPrice,
  discountApplied,
  promoCode,
  paymentIntentId,
}: CustomerOrderConfirmationProps) {
  const formattedEventDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎵 Custom Song Order Confirmed</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={paragraph}>
              Thank you for your custom song order with Rocky Web Studio! Your payment has been
              processed successfully and we're excited to create something special for you.
            </Text>

            {/* Order Details Box */}
            <Section style={detailsBox}>
              <Heading style={detailsTitle}>Order Details</Heading>
              <table style={detailTable}>
                <tr>
                  <td style={detailLabelCell}>
                    <Text style={detailLabel}>Order ID:</Text>
                  </td>
                  <td style={detailValueCell}>
                    <Text style={detailValue}>{orderId}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailLabelCell}>
                    <Text style={detailLabel}>Package:</Text>
                  </td>
                  <td style={detailValueCell}>
                    <Text style={detailValue}>{packageName}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailLabelCell}>
                    <Text style={detailLabel}>Occasion:</Text>
                  </td>
                  <td style={detailValueCell}>
                    <Text style={detailValue}>{occasion}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailLabelCell}>
                    <Text style={detailLabel}>Turnaround:</Text>
                  </td>
                  <td style={detailValueCell}>
                    <Text style={detailValue}>{turnaround}</Text>
                  </td>
                </tr>
                {eventDate && (
                  <tr>
                    <td style={detailLabelCell}>
                      <Text style={detailLabel}>Event Date:</Text>
                    </td>
                    <td style={detailValueCell}>
                      <Text style={detailValue}>{formattedEventDate}</Text>
                    </td>
                  </tr>
                )}
              </table>
              <Hr style={divider} />
              <table style={detailTable}>
                <tr>
                  <td style={detailLabelCell}>
                    <Text style={detailLabel}>Amount Paid:</Text>
                  </td>
                  <td style={detailValueCell}>
                    <Text style={totalPrice}>
                      ${(finalPrice / 100).toFixed(2)} AUD
                    </Text>
                  </td>
                </tr>
                {discountApplied && originalPrice && (
                  <tr>
                    <td colSpan={2} style={detailLabelCell}>
                      <Text style={discountText}>
                        Discount Applied ({promoCode || "Promo Code"}): -$
                        {((originalPrice - finalPrice) / 100).toFixed(2)}
                      </Text>
                    </td>
                  </tr>
                )}
              </table>
            </Section>

            {/* Next Steps */}
            <Heading style={sectionTitle}>What happens next?</Heading>
            <Text style={listItem}>1. Diamonds McFly will review your story and requirements</Text>
            <Text style={listItem}>2. We'll reach out if we need any clarification</Text>
            <Text style={listItem}>3. Your custom song will be crafted with care</Text>
            <Text style={listItem}>4. You'll receive your song via email within the turnaround time</Text>

            {/* Payment Info */}
            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Payment Confirmation:</strong> Your payment has been processed successfully.
                Payment ID: {paymentIntentId.substring(0, 20)}...
              </Text>
            </Section>

            {/* Contact */}
            <Text style={paragraph}>
              If you have any questions, please reply to this email or contact us at{" "}
              <Link href="mailto:music@rockywebstudio.com.au" style={link}>
                music@rockywebstudio.com.au
              </Link>
            </Text>

            <Text style={signature}>
              Thank you for choosing Rocky Web Studio!
              <br />
              <br />
              Diamonds McFly & The Rocky Web Studio Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Rocky Web Studio | Custom AI Songs for Central Queensland
            </Text>
            <Text style={footerText}>
              <Link href="mailto:hello@rockywebstudio.com.au" style={footerLink}>
                hello@rockywebstudio.com.au
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  background: "linear-gradient(135deg, #0d9488, #14b8a6)",
  padding: "30px",
  textAlign: "center" as const,
  borderRadius: "12px 12px 0 0",
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "30px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
  color: "#1e293b",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#475569",
  marginBottom: "16px",
};

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const detailsTitle = {
  color: "#0d9488",
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "0",
  marginBottom: "16px",
};

const detailTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailLabelCell = {
  padding: "8px 0",
  width: "40%",
};

const detailValueCell = {
  padding: "8px 0",
  width: "60%",
  textAlign: "right" as const,
};

const detailLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  padding: "0",
};

const detailValue = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0",
  padding: "0",
};

const divider = {
  borderColor: "#cbd5e1",
  margin: "16px 0",
};

const totalPrice = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0d9488",
  margin: "8px 0",
  padding: "0",
  textAlign: "right" as const,
};

const discountText = {
  fontSize: "14px",
  color: "#10b981",
  margin: "8px 0",
  padding: "0",
};

const sectionTitle = {
  color: "#334155",
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "24px",
  marginBottom: "12px",
};

const listItem = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#475569",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const infoBox = {
  background: "#f0fdfa",
  borderLeft: "4px solid #14b8a6",
  padding: "15px",
  margin: "20px 0",
};

const infoText = {
  margin: "0",
  color: "#0d9488",
  fontSize: "14px",
  lineHeight: "20px",
};

const link = {
  color: "#0d9488",
  textDecoration: "underline",
};

const signature = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#475569",
  marginTop: "24px",
};

const footer = {
  background: "#1e293b",
  padding: "20px",
  textAlign: "center" as const,
  borderRadius: "0 0 12px 12px",
};

const footerText = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "5px 0",
};

const footerLink = {
  color: "#64748b",
  textDecoration: "none",
};

