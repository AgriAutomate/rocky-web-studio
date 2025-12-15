import type { Metadata } from "next";
import Link from "next/link";

import { FooterNav, Stepper, UserMenu } from "./shell";

export const metadata: Metadata = {
  title: {
    default: "Music Therapy Portal",
    template: "%s | Music Therapy Portal",
  },
  description: "Where are you? Where do you want to go?",
};

// This wizard is authenticated + client-driven; don't try to SSG prerender it at build time.
export const dynamic = "force-dynamic";

export default function ConsciousnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-from/15 via-brand-soft to-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-10">
        <header className="rounded-3xl border border-border bg-card/80 px-5 py-5 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link href="/consciousness" className="inline-flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  Music Therapy
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Where are you? Where do you want to go?
              </p>
            </div>

            <UserMenu />
          </div>

          <div className="mt-4">
            <Stepper />
          </div>
        </header>

        <main className="mt-6 flex-1">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            {children}
          </div>
        </main>

        <footer className="mt-6">
          <div className="rounded-3xl border border-border bg-card/80 px-5 py-4 shadow-sm backdrop-blur">
            <FooterNav />
          </div>
        </footer>
      </div>
    </div>
  );
}

