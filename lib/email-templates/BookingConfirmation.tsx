import {
  Section,
  Text,
  Heading,
} from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { DetailsBox } from "./components/DetailsBox";

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
      <Section style={heroSection}>
        <Heading style={heroTitle}>📅 Booking Confirmed!</Heading>
        <Text style={heroText}>
          Your appointment with Rocky Web Studio has been confirmed. We're looking forward to meeting you!
        </Text>
      </Section>

      {/* Booking Details */}
      <DetailsBox title="Booking Details">
        <table style={detailTable}>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Booking ID:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{bookingId}</Text>
            </td>
          </tr>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Service:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{serviceType}</Text>
            </td>
          </tr>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Date:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{formattedDate}</Text>
            </td>
          </tr>
          <tr>
            <td style={detailLabelCell}>
              <Text style={detailLabel}>Time:</Text>
            </td>
            <td style={detailValueCell}>
              <Text style={detailValue}>{appointmentTime}</Text>
            </td>
          </tr>
        </table>
      </DetailsBox>

      {/* CTA Buttons */}
      <Section style={ctaSection}>
        <Button href={`${baseUrl}/bookings/${bookingId}`}>
          View Booking Details
        </Button>
        <Text style={ctaSpacer}>&nbsp;</Text>
        <Button href={`${baseUrl}/bookings/${bookingId}/cancel`} variant="secondary">
          Cancel Booking
        </Button>
      </Section>

      {/* Location & Contact */}
      <Section style={infoBox}>
        <Heading style={sectionTitle}>Location & Contact</Heading>
        <Text style={infoText}>
          <strong>Location:</strong> Rocky Web Studio HQ
          <br />
          <strong>Email:</strong>{" "}
          <a href="mailto:bookings@rockywebstudio.com.au" style={link}>
            bookings@rockywebstudio.com.au
          </a>
          <br />
          <strong>Phone:</strong>{" "}
          <a href="tel:+61400000000" style={link}>
            +61 400 000 000
          </a>
        </Text>
      </Section>

      {/* Next Steps */}
      <Section style={stepsSection}>
        <Heading style={sectionTitle}>What to expect</Heading>
        <Text style={listItem}>• You'll receive SMS reminders 24 hours and 2 hours before your appointment</Text>
        <Text style={listItem}>• If you need to reschedule, use the link above or reply to this email</Text>
        <Text style={listItem}>• We'll send a calendar invite shortly</Text>
      </Section>

      {/* Contact */}
      <Section style={contactSection}>
        <Text style={paragraph}>
          Questions? Reply to this email or contact us at{" "}
          <a href="mailto:bookings@rockywebstudio.com.au" style={link}>
            bookings@rockywebstudio.com.au
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

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const ctaSpacer = {
  display: "inline-block",
  width: "12px",
  margin: "0",
};

const sectionTitle = {
  color: "#334155",
  fontSize: "20px",
  fontWeight: "bold",
  marginTop: "0",
  marginBottom: "12px",
};

const listItem = {
  fontSize: "16px",
  lineHeight: "1.8",
  color: "#475569",
  marginBottom: "8px",
};

const infoBox = {
  background: "#f0fdfa",
  borderLeft: "4px solid #14b8a6",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const infoText = {
  margin: "0",
  color: BRAND_TEAL,
  fontSize: "14px",
  lineHeight: "24px",
};

const stepsSection = {
  marginTop: "32px",
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

