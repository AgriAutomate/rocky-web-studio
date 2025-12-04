import { Link } from "@react-email/components";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const BRAND_TEAL = "#218081";

  return (
    <Link
      href={href}
      style={
        variant === "primary"
          ? {
              backgroundColor: BRAND_TEAL,
              borderRadius: "6px",
              color: "#ffffff",
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
              color: BRAND_TEAL,
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              textAlign: "center" as const,
              display: "inline-block",
              padding: "12px 24px",
              lineHeight: "1.5",
              border: `2px solid ${BRAND_TEAL}`,
            }
      }
    >
      {children}
    </Link>
  );
}

