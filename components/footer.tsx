import { AVOBBadge } from "@/components/ui";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-slate-900 py-8 text-gray-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-12">
        {/* Main footer content */}
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">
            Rocky Web Studio
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>Rockhampton, QLD</span>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <span>ABN 62 948 405 693</span>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <a
              href="mailto:martin@rockywebstudio.com.au"
              className="text-white hover:text-teal-300"
            >
              martin@rockywebstudio.com.au
            </a>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <span>© {currentYear} All rights reserved.</span>
          </div>
        </div>

        {/* AVOB Certification Section */}
        <div className="flex flex-col items-center gap-4 border-t border-slate-700 pt-6">
          <p className="text-sm text-gray-400">
            Certified Australian Veteran Owned Business
          </p>
          <AVOBBadge variant="standard" size="small" link={true} />
          <p className="text-xs text-gray-500">
            <a
              href="https://avob.org.au"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-300 underline transition-colors"
            >
              Verify our certification
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

