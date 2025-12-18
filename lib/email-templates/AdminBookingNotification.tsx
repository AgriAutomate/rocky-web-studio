import {
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { DetailsBox } from "./components/DetailsBox";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

interface AdminBookingNotificationProps {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:00
  message?: string;
}

export function AdminBookingNotification({
  bookingId,
  customerName,
  customerEmail,
  customerPhone,
  serviceType,
  appointmentDate,
  appointmentTime,
  message,
}: AdminBookingNotificationProps) {
  const theme = getEmailThemeSync("light");
  
  // Format date for display
  const formattedDate = new Date(appointmentDate + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format time for display
  const [hours] = appointmentTime.split(":");
  const hour = parseInt(hours || "0", 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const formattedTime = `${displayHour}:00 ${period}`;

  const styles = {
    alertBanner: {
      backgroundColor: theme.primary,
      color: theme.primaryForeground,
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "24px",
      textAlign: "center" as const,
    },
    alertText: {
      fontSize: "20px",
      fontWeight: "bold",
      margin: "0 0 8px 0",
      color: theme.primaryForeground,
    },
    alertSubtext: {
      fontSize: "14px",
      margin: "0",
      color: theme.primaryForeground,
      opacity: 0.9,
    },
    detailTable: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    detailLabelCell: {
      padding: "8px 12px 8px 0",
      verticalAlign: "top" as const,
      width: "140px",
    },
    detailLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: theme.foreground,
      margin: "0",
    },
    detailValueCell: {
      padding: "8px 0",
      verticalAlign: "top" as const,
    },
    detailValue: {
      fontSize: "14px",
      color: theme.foreground,
      margin: "0",
    },
    link: {
      color: theme.primary,
      textDecoration: "underline",
    },
    actionBox: {
      backgroundColor: theme.brandSoft,
      borderRadius: "8px",
      padding: "20px",
      margin: "24px 0",
    },
    actionText: {
      fontSize: "16px",
      fontWeight: "600",
      color: theme.foreground,
      margin: "0 0 12px 0",
    },
    footer: {
      fontSize: "12px",
      color: theme.mutedForeground,
      marginTop: "24px",
      padding: "16px",
      backgroundColor: theme.background,
      borderRadius: "8px",
    },
  };

  return (
    <EmailLayout showUnsubscribe={false}>
      {/* Alert Banner */}
      <Section style={styles.alertBanner}>
        <Text style={styles.alertText}>
          📅 New Booking Received
        </Text>
        <Text style={styles.alertSubtext}>
          Booking ID: {bookingId} • Action Required
        </Text>
      </Section>

      {/* Booking Details */}
      <DetailsBox title="Booking Details">
        <table style={styles.detailTable}>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Booking ID:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{bookingId}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Service Type:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{serviceType}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Date:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </td>
          </tr>
          <tr>
            <td style={styles.detailLabelCell}>
              <Text style={styles.detailLabel}>Time:</Text>
            </td>
            <td style={styles.detailValueCell}>
              <Text style={styles.detailValue}>{formattedTime}</Text>
            </td>
          </tr>
        </table>
      </DetailsBox>

      {/* Customer Information */}
      <DetailsBox title="Customer Information" showDivider>
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
        </table>
      </DetailsBox>

      {/* Customer Message */}
      {message && (
        <DetailsBox title="Customer Message" showDivider>
          <Text style={styles.detailValue}>{message}</Text>
        </DetailsBox>
      )}

      {/* Action Required */}
      <Section style={styles.actionBox}>
        <Text style={styles.actionText}>
          ⚠️ Action Required: Please call the customer to confirm the booking
        </Text>
        <Text style={styles.detailValue}>
          <Link href={`tel:${customerPhone}`} style={styles.link}>
            📞 Call {customerName}
          </Link>
          {" • "}
          <Link href={`mailto:${customerEmail}`} style={styles.link}>
            ✉️ Email {customerName}
          </Link>
        </Text>
      </Section>

      <Hr style={{ borderColor: theme.border, margin: "24px 0" }} />

      <Section style={styles.footer}>
        <Text style={styles.footer}>
          This is an automated notification from Rocky Web Studio booking system.
        </Text>
      </Section>
    </EmailLayout>
  );
}
