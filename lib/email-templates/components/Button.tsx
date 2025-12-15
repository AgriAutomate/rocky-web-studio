import { Link } from "@react-email/components";
import { getEmailThemeSync } from "@/lib/email-templates/theme";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const theme = getEmailThemeSync("light");

  return (
    <Link
      href={href}
      style={
        variant === "primary"
          ? {
              backgroundColor: theme.primary,
              borderRadius: "6px",
              color: theme.primaryForeground,
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              textAlign: "center" as const,
              display: "inline-block",
              padding: "12px 24px",
              lineHeight: "1.5",
            }
          : {
              backgroundColor: "transparent",
              borderRadius: "6px",
              color: theme.primary,
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              textAlign: "center" as const,
              display: "inline-block",
              padding: "12px 24px",
              lineHeight: "1.5",
              border: `2px solid ${theme.primary}`,
            }
      }
    >
      {children}
    </Link>
  );
}

