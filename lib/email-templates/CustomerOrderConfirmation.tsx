import {
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { DetailsBox } from "./components/DetailsBox";

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
  customerName: _customerName,
  packageName,
  packagePrice: _packagePrice,
  occasion,
  turnaround,
  eventDate,
  originalPrice,
  finalPrice,
  discountApplied,
  promoCode,
  paymentIntentId,
}: CustomerOrderConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://rockywebstudio.com.au";
  const formattedEventDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  return (
    <EmailLayout>
      {/* Hero Section */}
      <Section style={heroSection}>
        <Heading style={heroTitle}>🎵 Order Confirmed!</Heading>
        <Text style={heroText}>
          Thank you for your custom song order. We're excited to create something special for you!
        </Text>
      </Section>

      {/* Order Details */}
      <DetailsBox title="Order Details" showDivider>
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
      </DetailsBox>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Button href={`${baseUrl}/orders/${orderId}`}>
          View Order Details
        </Button>
      </Section>

      {/* Next Steps */}
      <Section style={{ marginTop: "32px" }}>
        <Heading style={sectionTitle}>What happens next?</Heading>
        <Text style={listItem}>1. Diamonds McFly will review your story and requirements</Text>
        <Text style={listItem}>2. We'll reach out if we need any clarification</Text>
        <Text style={listItem}>3. Your custom song will be crafted with care</Text>
        <Text style={listItem}>4. You'll receive your song via email within the turnaround time</Text>
      </Section>

      {/* Payment Info */}
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Payment Confirmation:</strong> Your payment has been processed successfully.
          Payment ID: {paymentIntentId.substring(0, 20)}...
        </Text>
      </Section>

      {/* Contact */}
      <Section style={contactSection}>
        <Text style={paragraph}>
          Have questions? Reply to this email or contact us at{" "}
          <a href="mailto:music@rockywebstudio.com.au" style={link}>
            music@rockywebstudio.com.au
          </a>
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Brand Colors
const BRAND_TEAL = "#218081";

// Styles
const heroSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const heroTitle = {
  color: BRAND_TEAL,
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  lineHeight: "1.3",
};

const heroText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#475569",
  margin: "0",
};

const detailTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailLabelCell = {
  padding: "8px 0",
  width: "40%",
  verticalAlign: "top" as const,
};

const detailValueCell = {
  padding: "8px 0",
  width: "60%",
  textAlign: "right" as const,
  verticalAlign: "top" as const,
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
  fontSize: "20px",
  fontWeight: "bold",
  color: BRAND_TEAL,
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

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const sectionTitle = {
  color: "#334155",
  fontSize: "20px",
  fontWeight: "bold",
  marginTop: "32px",
  marginBottom: "16px",
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
  padding: "16px",
  margin: "24px 0",
  borderRadius: "4px",
};

const infoText = {
  margin: "0",
  color: BRAND_TEAL,
  fontSize: "14px",
  lineHeight: "20px",
};

const contactSection = {
  marginTop: "32px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#475569",
  marginBottom: "16px",
};

const link = {
  color: BRAND_TEAL,
  textDecoration: "underline",
};
