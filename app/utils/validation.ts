export type Validator = (value: any) => boolean;

export const isPresent: Validator = (value) =>
  value !== undefined && value !== null && String(value).trim().length > 0;

export const isBusinessName: Validator = (value) => {
  const s = String(value ?? "").trim();
  return s.length >= 2 && s.length <= 100;
};

export const isEmail: Validator = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());

// Basic AU phone validation: allows +61 or 0 prefixes, 8–12 digits total.
export const isPhoneAU: Validator = (value) => {
  if (!value) return true; // optional
  const s = String(value ?? "").trim();
  return /^(\+?61|0)[0-9]{8,10}$/.test(s.replace(/\s+/g, ""));
};

export const isBudget: Validator = isPresent;
export const isTimeline: Validator = isPresent;

export function requireAll(values: Record<string, any>, keys: string[]): boolean {
  return keys.every((k) => isPresent(values[k]));
}
