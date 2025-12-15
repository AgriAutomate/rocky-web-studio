import {
  Section,
  Text,
  Heading,
  Hr,
  Link,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { DetailsBox } from "./components/DetailsBox";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

interface AdminOrderNotificationProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageName: string;
  packagePrice: number;
  occasion: string;
  turnaround: string;
  eventDate?: string;
  storyDetails: string;
  mood?: string;
  genre?: string;
  additionalInfo?: string;
  originalPrice?: number;
  finalPrice: number;
  discountApplied: boolean;
  promoCode?: string;
  paymentIntentId: string;
  amountPaid: number;
}

export function AdminOrderNotification({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  packageName,
  packagePrice,
  occasion,
  turnaround,
  eventDate,
  storyDetails,
  mood,
  genre,
  additionalInfo,
  originalPrice,
  finalPrice,
  discountApplied,
  promoCode,
  paymentIntentId,
  amountPaid,
}: AdminOrderNotificationProps) {
  const theme = getEmailThemeSync("light");
  const styles = createAdminOrderNotificationStyles(theme);
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
    <EmailLayout showUnsubscribe={false}>
      {/* Alert Banner */}
      <Section style={styles.alertBanner}>
        <Text style={styles.alertText}>
          🎵 New Custom Song Order Received
        </Text>
        <Text style={styles.alertSubtext}>
          Order ID: {orderId} • Payment Processed Successfully
        </Text>
      </Section>

      {/* Customer Information */}
      <DetailsBox title="Customer Information">
        <table style={styles.detailTable}>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Name:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{customerName}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Email:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>
                <Link href={`mailto:${customerEmail}`} style={styles.link}>
                  {customerEmail}
                </Link>
              </Text>
            </td>
          </tr>
          {customerPhone && (
            <tr>
              <td style={styles.detailLabelCell}>
                <Text style={styles.detailLabel}>Phone:</Text>
              </td>
              <td style={styles.detailValueCell}>
                <Text style={styles.detailValue}>
                  <Link href={`tel:${customerPhone}`} style={styles.link}>
                    {customerPhone}
                  </Link>
                </Text>
              </td>
            </tr>
          )}
        </table>
      </DetailsBox>

      {/* Order Details */}
      <DetailsBox title="Order Details" showDivider>
        <table style={styles.detailTable}>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Package:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{packageName} (${packagePrice})</Text>
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
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Event Date:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{formattedEventDate}</Text>
            </td>
          </tr>
          {mood && (
            <tr>
              <td style={styles.detailLabelCell}>
                <Text style={styles.detailLabel}>Desired Mood:</Text>
              </td>
              <td style={styles.detailValueCell}>
                <Text style={styles.detailValue}>{mood}</Text>
              </td>
            </tr>
          )}
          {genre && (
            <tr>
              <td style={styles.detailLabelCell}>
                <Text style={styles.detailLabel}>Preferred Genre:</Text>
              </td>
              <td style={styles.detailValueCell}>
                <Text style={styles.detailValue}>{genre}</Text>
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
              <Text style={styles.totalPrice}>${(amountPaid / 100).toFixed(2)} AUD</Text>
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

      {/* Story Details */}
      <Section style={styles.storyBox}>
        <Heading style={styles.sectionTitle}>Customer's Story</Heading>
        <Text style={styles.storyText}>{storyDetails}</Text>
      </Section>

      {/* Additional Info */}
      {additionalInfo && (
        <Section style={styles.infoBox}>
          <Heading style={styles.sectionTitle}>Additional Information</Heading>
          <Text style={styles.infoText}>{additionalInfo}</Text>
        </Section>
      )}

      {/* Payment Information */}
      <Section style={styles.paymentBox}>
        <Heading style={styles.sectionTitle}>Payment Information</Heading>
        <Text style={styles.infoText}>
          <strong>Payment Intent ID:</strong> {paymentIntentId}
        </Text>
        <Text style={styles.infoText}>
          <strong>Status:</strong> ✅ Payment Succeeded
        </Text>
        <Text style={styles.infoText}>
          <strong>Amount:</strong> ${(amountPaid / 100).toFixed(2)} AUD
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={styles.ctaSection}>
        <Button href={`${baseUrl}/admin/orders/${orderId}`}>
          View Order in Dashboard
        </Button>
      </Section>

      {/* Action Required */}
      <Section style={styles.actionBox}>
        <Text style={styles.actionText}>
          <strong>Next Steps:</strong> Review the order details and begin crafting the custom
          song according to the turnaround time specified.
        </Text>
      </Section>
    </EmailLayout>
  );
}

function createAdminOrderNotificationStyles(theme: ReturnType<typeof getEmailThemeSync>) {
  return {
    alertBanner: {
      backgroundColor: theme.brandSoft,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "16px 20px",
      marginBottom: "24px",
      borderRadius: "4px",
    },
    alertText: {
      fontSize: "18px",
      fontWeight: "bold",
      color: theme.foreground,
      margin: "0 0 4px 0",
    },
    alertSubtext: {
      fontSize: "14px",
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
    sectionTitle: {
      color: theme.foreground,
      fontSize: "18px",
      fontWeight: "bold",
      marginTop: "0",
      marginBottom: "12px",
    },
    storyBox: {
      background: theme.brandSoft,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "20px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    storyText: {
      margin: "0",
      color: theme.mutedForeground,
      fontSize: "14px",
      lineHeight: "24px",
      whiteSpace: "pre-wrap" as const,
    },
    infoBox: {
      background: theme.background,
      borderLeft: `4px solid ${theme.border}`,
      padding: "20px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    infoText: {
      margin: "0 0 8px 0",
      color: theme.mutedForeground,
      fontSize: "14px",
      lineHeight: "20px",
      whiteSpace: "pre-wrap" as const,
    },
    paymentBox: {
      background: theme.background,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "20px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    actionBox: {
      background: theme.background,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "20px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    actionText: {
      margin: "0",
      color: theme.foreground,
      fontSize: "14px",
      lineHeight: "20px",
    },
    ctaSection: {
      textAlign: "center" as const,
      margin: "32px 0",
    },
    link: {
      color: theme.primary,
      textDecoration: "underline",
    },
  };
}
