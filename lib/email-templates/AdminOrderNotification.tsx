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
      <Section style={alertBanner}>
        <Text style={alertText}>
          🎵 New Custom Song Order Received
        </Text>
        <Text style={alertSubtext}>
          Order ID: {orderId} • Payment Processed Successfully
        </Text>
      </Section>

      {/* Customer Information */}
      <DetailsBox title="Customer Information">
        <table style={detailTable}>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Name:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{customerName}</Text>
            </td>
          </tr>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Email:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>
                <Link href={`mailto:${customerEmail}`} style={link}>
                  {customerEmail}
                </Link>
              </Text>
            </td>
          </tr>
          {customerPhone && (
            <tr>
              <td style={detailLabelCell}>
                <Text style={detailLabel}>Phone:</Text>
              </td>
              <td style={detailValueCell}>
                <Text style={detailValue}>
                  <Link href={`tel:${customerPhone}`} style={link}>
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
        <table style={detailTable}>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Package:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{packageName} (${packagePrice})</Text>
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
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Event Date:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{formattedEventDate}</Text>
            </td>
          </tr>
          {mood && (
            <tr>
              <td style={detailLabelCell}>
                <Text style={detailLabel}>Desired Mood:</Text>
              </td>
              <td style={detailValueCell}>
                <Text style={detailValue}>{mood}</Text>
              </td>
            </tr>
          )}
          {genre && (
            <tr>
              <td style={detailLabelCell}>
                <Text style={detailLabel}>Preferred Genre:</Text>
              </td>
              <td style={detailValueCell}>
                <Text style={detailValue}>{genre}</Text>
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
              <Text style={totalPrice}>${(amountPaid / 100).toFixed(2)} AUD</Text>
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

      {/* Story Details */}
      <Section style={storyBox}>
        <Heading style={sectionTitle}>Customer's Story</Heading>
        <Text style={storyText}>{storyDetails}</Text>
      </Section>

      {/* Additional Info */}
      {additionalInfo && (
        <Section style={infoBox}>
          <Heading style={sectionTitle}>Additional Information</Heading>
          <Text style={infoText}>{additionalInfo}</Text>
        </Section>
      )}

      {/* Payment Information */}
      <Section style={paymentBox}>
        <Heading style={sectionTitle}>Payment Information</Heading>
        <Text style={infoText}>
          <strong>Payment Intent ID:</strong> {paymentIntentId}
        </Text>
        <Text style={infoText}>
          <strong>Status:</strong> ✅ Payment Succeeded
        </Text>
        <Text style={infoText}>
          <strong>Amount:</strong> ${(amountPaid / 100).toFixed(2)} AUD
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={ctaSection}>
        <Button href={`${baseUrl}/admin/orders/${orderId}`}>
          View Order in Dashboard
        </Button>
      </Section>

      {/* Action Required */}
      <Section style={actionBox}>
        <Text style={actionText}>
          <strong>Next Steps:</strong> Review the order details and begin crafting the custom
          song according to the turnaround time specified.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Brand Colors
const BRAND_TEAL = "#218081";

// Styles
const alertBanner = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  padding: "16px 20px",
  marginBottom: "24px",
  borderRadius: "4px",
};

const alertText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "0 0 4px 0",
};

const alertSubtext = {
  fontSize: "14px",
  color: "#78350f",
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

const sectionTitle = {
  color: "#334155",
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "0",
  marginBottom: "12px",
};

const storyBox = {
  background: "#f0fdfa",
  borderLeft: "4px solid #14b8a6",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const storyText = {
  margin: "0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "24px",
  whiteSpace: "pre-wrap" as const,
};

const infoBox = {
  background: "#f8fafc",
  borderLeft: "4px solid #64748b",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const infoText = {
  margin: "0 0 8px 0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "20px",
  whiteSpace: "pre-wrap" as const,
};

const paymentBox = {
  background: "#ecfdf5",
  borderLeft: "4px solid #10b981",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const actionBox = {
  background: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const actionText = {
  margin: "0",
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const link = {
  color: BRAND_TEAL,
  textDecoration: "underline",
};
