import {
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { DetailsBox } from "./components/DetailsBox";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

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
  const theme = getEmailThemeSync("light");
  const styles = createCustomerOrderConfirmationStyles(theme);
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
      <Section style={styles.heroSection}>
        <Heading style={styles.heroTitle}>🎵 Order Confirmed!</Heading>
        <Text style={styles.heroText}>
          Thank you for your custom song order. We're excited to create something special for you!
        </Text>
      </Section>

      {/* Order Details */}
      <DetailsBox title="Order Details" showDivider>
        <table style={styles.detailTable}>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Order ID:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{orderId}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Package:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{packageName}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Occasion:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{occasion}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Turnaround:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{turnaround}</Text>
            </td>
          </tr>
          {eventDate && (
            <tr>
              <td style={styles.detailLabelCell}>
                <Text style={styles.detailLabel}>Event Date:</Text>
              </td>
              <td style={styles.detailValueCell}>
                <Text style={styles.detailValue}>{formattedEventDate}</Text>
              </td>
            </tr>
          )}
        </table>
        <Hr style={styles.divider} />
        <table style={styles.detailTable}>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Amount Paid:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.totalPrice}>
                ${(finalPrice / 100).toFixed(2)} AUD
              </Text>
            </td>
          </tr>
          {discountApplied && originalPrice && (
            <tr>
              <td colSpan={2} style={styles.detailLabelCell}>
                <Text style={styles.discountText}>
                  Discount Applied ({promoCode || "Promo Code"}): -$
                  {((originalPrice - finalPrice) / 100).toFixed(2)}
                </Text>
              </td>
            </tr>
          )}
        </table>
      </DetailsBox>

      {/* CTA Button */}
      <Section style={styles.ctaSection}>
        <Button href={`${baseUrl}/orders/${orderId}`}>
          View Order Details
        </Button>
      </Section>

      {/* Next Steps */}
      <Section style={{ marginTop: "32px" }}>
        <Heading style={styles.sectionTitle}>What happens next?</Heading>
        <Text style={styles.listItem}>1. Diamonds McFly will review your story and requirements</Text>
        <Text style={styles.listItem}>2. We'll reach out if we need any clarification</Text>
        <Text style={styles.listItem}>3. Your custom song will be crafted with care</Text>
        <Text style={styles.listItem}>4. You'll receive your song via email within the turnaround time</Text>
      </Section>

      {/* Payment Info */}
      <Section style={styles.infoBox}>
        <Text style={styles.infoText}>
          <strong>Payment Confirmation:</strong> Your payment has been processed successfully.
          Payment ID: {paymentIntentId.substring(0, 20)}...
        </Text>
      </Section>

      {/* Contact */}
      <Section style={styles.contactSection}>
        <Text style={styles.paragraph}>
          Have questions? Reply to this email or contact us at{" "}
          <a href="mailto:music@rockywebstudio.com.au" style={styles.link}>
            music@rockywebstudio.com.au
          </a>
        </Text>
      </Section>
    </EmailLayout>
  );
}

function createCustomerOrderConfirmationStyles(theme: ReturnType<typeof getEmailThemeSync>) {
  return {
    heroSection: {
      textAlign: "center" as const,
      marginBottom: "32px",
    },
    heroTitle: {
      color: theme.primary,
      fontSize: "28px",
      fontWeight: "bold",
      margin: "0 0 12px 0",
      lineHeight: "1.3",
    },
    heroText: {
      fontSize: "16px",
      lineHeight: "24px",
      color: theme.mutedForeground,
      margin: "0",
    },
    detailTable: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    detailLabelCell: {
      padding: "8px 0",
      width: "40%",
      verticalAlign: "top" as const,
    },
    detailValueCell: {
      padding: "8px 0",
      width: "60%",
      textAlign: "right" as const,
      verticalAlign: "top" as const,
    },
    detailLabel: {
      fontSize: "14px",
      color: theme.mutedForeground,
      margin: "0",
      padding: "0",
    },
    detailValue: {
      fontSize: "14px",
      fontWeight: "bold",
      color: theme.foreground,
      margin: "0",
      padding: "0",
    },
    divider: {
      borderColor: theme.border,
      margin: "16px 0",
    },
    totalPrice: {
      fontSize: "20px",
      fontWeight: "bold",
      color: theme.primary,
      margin: "8px 0",
      padding: "0",
      textAlign: "right" as const,
    },
    discountText: {
      fontSize: "14px",
      color: theme.primary,
      margin: "8px 0",
      padding: "0",
    },
    ctaSection: {
      textAlign: "center" as const,
      margin: "32px 0",
    },
    sectionTitle: {
      color: theme.foreground,
      fontSize: "20px",
      fontWeight: "bold",
      marginTop: "32px",
      marginBottom: "16px",
    },
    listItem: {
      fontSize: "16px",
      lineHeight: "1.8",
      color: theme.mutedForeground,
      marginBottom: "8px",
      paddingLeft: "8px",
    },
    infoBox: {
      background: theme.brandSoft,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "16px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    infoText: {
      margin: "0",
      color: theme.foreground,
      fontSize: "14px",
      lineHeight: "20px",
    },
    contactSection: {
      marginTop: "32px",
    },
    paragraph: {
      fontSize: "16px",
      lineHeight: "24px",
      color: theme.mutedForeground,
      marginBottom: "16px",
    },
    link: {
      color: theme.primary,
      textDecoration: "underline",
    },
  };
}
