type EmailThemeMode = "light" | "dark";

export type EmailTheme = {
  mode: EmailThemeMode;

  // Base surfaces / text
  background: string;
  card: string;
  foreground: string;
  mutedForeground: string;
  border: string;

  // Brand + actions
  primary: string;
  primaryForeground: string;
  destructive: string;

  // Brand gradient tokens
  brandFrom: string;
  brandTo: string;
  brandSoft: string;
  brandForeground: string;
};

const FALLBACK_THEME: EmailTheme = {
  mode: "light",
  background: "#f1f5f9",
  card: "#ffffff",
  foreground: "#0f172a",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  primary: "#14b8a6",
  primaryForeground: "#f8fafc",
  destructive: "#f43f5e",
  brandFrom: "#0f766e",
  brandTo: "#059669",
  brandSoft: "#ccfbf1",
  brandForeground: "#ffffff",
};

let cached: Record<EmailThemeMode, EmailTheme> | null = null;

function stripQuotes(value: string) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function normalizeColor(value: string) {
  const v = stripQuotes(value.trim());
  // Most of our tokens are hex. If it's not, just return as-is (best-effort).
  return v;
}

function parseCssVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const re = /--([A-Za-z0-9_-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(block))) {
    const name = m[1];
    if (!name) continue;
    vars[name] = normalizeColor(m[2] ?? "");
  }
  return vars;
}

function extractBlock(cssText: string, selector: ":root" | ".dark") {
  const re = selector === ":root"
    ? /:root\s*\{([\s\S]*?)\}/m
    : /\.dark\s*\{([\s\S]*?)\}/m;
  const match = cssText.match(re);
  return match?.[1] ?? "";
}

function toTheme(vars: Record<string, string>, mode: EmailThemeMode): EmailTheme {
  const t = { ...FALLBACK_THEME, mode } as EmailTheme;

  // Base
  t.background = vars.background ?? t.background;
  t.card = vars.card ?? t.card;
  t.foreground = vars.foreground ?? t.foreground;
  t.mutedForeground = vars["muted-foreground"] ?? t.mutedForeground;
  t.border = vars.border ?? t.border;

  // Primary/actions
  t.primary = vars.primary ?? t.primary;
  t.primaryForeground = vars["primary-foreground"] ?? t.primaryForeground;
  t.destructive = vars.destructive ?? t.destructive;

  // Brand gradient
  t.brandFrom = vars["brand-from"] ?? t.brandFrom;
  t.brandTo = vars["brand-to"] ?? t.brandTo;
  t.brandSoft = vars["brand-soft"] ?? t.brandSoft;
  t.brandForeground = vars["brand-foreground"] ?? t.brandForeground;

  return t;
}

function readGlobalsCss(): string | null {
  try {
    // Intentionally sync: templates are rendered synchronously.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path") as typeof import("node:path");
    const globalsPath = path.join(process.cwd(), "app", "globals.css");
    return fs.readFileSync(globalsPath, "utf8");
  } catch {
    return null;
  }
}

/**
 * Email HTML uses inline styles and is not guaranteed to support CSS variables.
 * We therefore *read* your CSS variables from `app/globals.css` and inline the
 * computed values into email templates.
 */
export async function getEmailTheme(mode: EmailThemeMode = "light"): Promise<EmailTheme> {
  return getEmailThemeSync(mode);
}

export function getEmailThemeSync(mode: EmailThemeMode = "light"): EmailTheme {
  if (cached?.[mode]) return cached[mode];

  const cssText = readGlobalsCss();
  if (!cssText) {
    cached = cached ?? {
      light: FALLBACK_THEME,
      dark: { ...FALLBACK_THEME, mode: "dark" },
    };
    return cached[mode];
  }

  const rootVars = parseCssVars(extractBlock(cssText, ":root"));
  const darkVars = parseCssVars(extractBlock(cssText, ".dark"));

  const lightTheme = toTheme(rootVars, "light");
  const darkTheme = toTheme({ ...rootVars, ...darkVars }, "dark");

  cached = { light: lightTheme, dark: darkTheme };
  return cached[mode];
}

