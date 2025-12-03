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
            <Heading style={headerTitle}>🎵 New Custom Song Order</Heading>
            <Text style={headerSubtitle}>Order ID: {orderId}</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={alertText}>
              A new custom song order has been received and payment has been processed successfully.
            </Text>

            {/* Customer Information */}
            <Section style={detailsBox}>
              <Heading style={detailsTitle}>Customer Information</Heading>
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
            </Section>

            {/* Order Details */}
            <Section style={detailsBox}>
              <Heading style={detailsTitle}>Order Details</Heading>
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
            </Section>

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

            {/* Action Required */}
            <Section style={actionBox}>
              <Text style={actionText}>
                <strong>Next Steps:</strong> Review the order details and begin crafting the custom
                song according to the turnaround time specified.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Rocky Web Studio - Admin Notification</Text>
            <Text style={footerText}>Order received at {new Date().toLocaleString("en-AU")}</Text>
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
  margin: "0 0 8px 0",
};

const headerSubtitle = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
  opacity: 0.9,
};

const content = {
  padding: "30px",
};

const alertText = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
  color: "#1e293b",
  fontWeight: "600",
  backgroundColor: "#fef3c7",
  padding: "12px",
  borderRadius: "6px",
  borderLeft: "4px solid #f59e0b",
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

const storyBox = {
  background: "#f0fdfa",
  borderLeft: "4px solid #14b8a6",
  padding: "15px",
  margin: "20px 0",
};

const storyText = {
  margin: "0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "20px",
  whiteSpace: "pre-wrap" as const,
};

const infoBox = {
  background: "#f8fafc",
  borderLeft: "4px solid #64748b",
  padding: "15px",
  margin: "20px 0",
};

const infoText = {
  margin: "0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: "20px",
  whiteSpace: "pre-wrap" as const,
};

const paymentBox = {
  background: "#ecfdf5",
  borderLeft: "4px solid #10b981",
  padding: "15px",
  margin: "20px 0",
};

const actionBox = {
  background: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  padding: "15px",
  margin: "20px 0",
};

const actionText = {
  margin: "0",
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
};

const link = {
  color: "#0d9488",
  textDecoration: "underline",
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

