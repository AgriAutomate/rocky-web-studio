import {
  Section,
  Text,
  Heading,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { DetailsBox } from "./components/DetailsBox";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

interface BookingConfirmationProps {
  bookingId: string;
  customerName: string;
  email: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
}

export function BookingConfirmation({
  bookingId,
  customerName: _customerName,
  email: _email,
  serviceType,
  appointmentDate,
  appointmentTime,
}: BookingConfirmationProps) {
  const theme = getEmailThemeSync("light");
  const styles = createBookingConfirmationStyles(theme);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://rockywebstudio.com.au";
  const formattedDate = appointmentDate.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EmailLayout>
      {/* Hero Section */}
      <Section style={styles.heroSection}>
        <Heading style={styles.heroTitle}>📅 Booking Confirmed!</Heading>
        <Text style={styles.heroText}>
          Your appointment with Rocky Web Studio has been confirmed. We're looking forward to meeting you!
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
              <Text style={styles.detailLabel}>Service:</Text>
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
              <Text style={styles.detailValue}>{appointmentTime}</Text>
            </td>
          </tr>
        </table>
      </DetailsBox>

      {/* CTA Buttons */}
      <Section style={styles.ctaSection}>
        <Button href={`${baseUrl}/bookings/${bookingId}`}>
          View Booking Details
        </Button>
        <Text style={styles.ctaSpacer}>&nbsp;</Text>
        <Button href={`${baseUrl}/bookings/${bookingId}/cancel`} variant="secondary">
          Cancel Booking
        </Button>
      </Section>

      {/* Location & Contact */}
      <Section style={styles.infoBox}>
        <Heading style={styles.sectionTitle}>Location & Contact</Heading>
        <Text style={styles.infoText}>
          <strong>Location:</strong> Rocky Web Studio HQ
          <br />
          <strong>Email:</strong>{" "}
          <a href="mailto:bookings@rockywebstudio.com.au" style={styles.link}>
            bookings@rockywebstudio.com.au
          </a>
          <br />
          <strong>Phone:</strong>{" "}
          <a href="tel:+61400000000" style={styles.link}>
            +61 400 000 000
          </a>
        </Text>
      </Section>

      {/* Next Steps */}
      <Section style={styles.stepsSection}>
        <Heading style={styles.sectionTitle}>What to expect</Heading>
        <Text style={styles.listItem}>• You'll receive SMS reminders 24 hours and 2 hours before your appointment</Text>
        <Text style={styles.listItem}>• If you need to reschedule, use the link above or reply to this email</Text>
        <Text style={styles.listItem}>• We'll send a calendar invite shortly</Text>
      </Section>

      {/* Contact */}
      <Section style={styles.contactSection}>
        <Text style={styles.paragraph}>
          Questions? Reply to this email or contact us at{" "}
          <a href="mailto:bookings@rockywebstudio.com.au" style={styles.link}>
            bookings@rockywebstudio.com.au
          </a>
        </Text>
      </Section>
    </EmailLayout>
  );
}

function createBookingConfirmationStyles(theme: ReturnType<typeof getEmailThemeSync>) {
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
    ctaSection: {
      textAlign: "center" as const,
      margin: "32px 0",
    },
    ctaSpacer: {
      display: "inline-block",
      width: "12px",
      margin: "0",
    },
    sectionTitle: {
      color: theme.foreground,
      fontSize: "20px",
      fontWeight: "bold",
      marginTop: "0",
      marginBottom: "12px",
    },
    listItem: {
      fontSize: "16px",
      lineHeight: "1.8",
      color: theme.mutedForeground,
      marginBottom: "8px",
    },
    infoBox: {
      background: theme.brandSoft,
      borderLeft: `4px solid ${theme.primary}`,
      padding: "20px",
      margin: "24px 0",
      borderRadius: "4px",
    },
    infoText: {
      margin: "0",
      color: theme.foreground,
      fontSize: "14px",
      lineHeight: "24px",
    },
    stepsSection: {
      marginTop: "32px",
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

