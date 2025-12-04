export type AVOBLogoVariant = "standard" | "defense-force";

export type AVOBBadgeSize = "small" | "medium" | "large";

export interface AVOBBadgeProps {
  variant?: AVOBLogoVariant;
  size?: AVOBBadgeSize;
  className?: string;
  link?: boolean;
}

