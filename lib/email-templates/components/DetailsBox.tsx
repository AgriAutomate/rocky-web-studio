import { Section, Heading, Hr } from "@react-email/components";

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
  const BRAND_CREAM = "#fcfcf9";

  return (
    <Section
      style={{
        backgroundColor: BRAND_CREAM,
        borderRadius: "8px",
        padding: "20px",
        margin: "20px 0",
      }}
    >
      <Heading
        style={{
          color: "#218081",
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
            borderColor: "#cbd5e1",
            margin: "16px 0",
          }}
        />
      )}
    </Section>
  );
}

