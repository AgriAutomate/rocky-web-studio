import { Section, Heading, Hr } from "@react-email/components";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

interface DetailsBoxProps {
  title: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

export function DetailsBox({
  title,
  children,
  showDivider = false,
}: DetailsBoxProps) {
  const theme = getEmailThemeSync("light");

  return (
    <Section
      style={{
        backgroundColor: theme.background,
        borderRadius: "8px",
        padding: "20px",
        margin: "20px 0",
      }}
    >
      <Heading
        style={{
          color: theme.primary,
          fontSize: "18px",
          fontWeight: "bold",
          marginTop: "0",
          marginBottom: "16px",
        }}
      >
        {title}
      </Heading>
      {children}
      {showDivider && (
        <Hr
          style={{
            borderColor: theme.border,
            margin: "16px 0",
          }}
        />
      )}
    </Section>
  );
}

