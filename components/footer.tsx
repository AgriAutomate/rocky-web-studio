import { AVOBBadge } from "@/components/ui";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-foreground py-8 text-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-12">
        {/* Main footer content */}
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-soft">
            Rocky Web Studio
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>Rockhampton, QLD</span>
            <span className="hidden h-4 w-px bg-background/20 sm:block" />
            <span>ABN 62 948 405 693</span>
            <span className="hidden h-4 w-px bg-background/20 sm:block" />
            <a
              href="mailto:martin@rockywebstudio.com.au"
              className="text-background hover:text-brand-soft"
            >
              martin@rockywebstudio.com.au
            </a>
            <span className="hidden h-4 w-px bg-background/20 sm:block" />
            <span>© {currentYear} All rights reserved.</span>
          </div>
        </div>

        {/* AVOB Certification Section */}
        <div className="flex flex-col items-center gap-4 border-t border-background/20 pt-6">
          <p className="text-sm text-background/70">
            <a
              href="https://www.avob.org.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Certified Australian Veteran Owned Business
            </a>
          </p>
          <AVOBBadge variant="standard" size="small" link={true} />
          <p className="text-xs text-background/60">
            <a
              href="https://www.avob.org.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-soft underline transition-colors"
            >
              Verify our certification
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

