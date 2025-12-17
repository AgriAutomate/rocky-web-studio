import { AVOBBadge } from "@/components/ui";

export function VeteranOwnedCallout() {
  return (
    <section
      aria-label="Australian veteran owned badge"
      className="rounded-3xl bg-foreground p-8 text-background shadow-2xl sm:p-10"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 md:max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-soft">
            <span className="h-1 w-6 rounded-full bg-brand-soft" />
            Trust badge
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-background sm:text-4xl">
            Proudly Australian Veteran Owned
          </h2>
          <p className="text-base text-background/80 sm:text-lg">
            Founded by a Royal Australian Navy veteran (2009-2015), Rocky Web Studio brings
            military-grade discipline and precision to every digital project. We understand
            accountability, timelines, and delivering under pressure.
          </p>
          <ul className="space-y-2 text-background/80 sm:text-base">
            <li className="flex items-center gap-2">
              <span className="text-brand-soft font-bold">✓</span>
              <span>Licensed AVOB certification</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-soft font-bold">✓</span>
              <span>Commitment to veteran employment</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-soft font-bold">✓</span>
              <span>Supporting Central Queensland veterans</span>
            </li>
          </ul>
          <a
            href="https://www.avob.org.au/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-soft underline decoration-brand-soft decoration-2 underline-offset-4 hover:text-background transition-colors"
          >
            Learn more about AVOB certification
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="mx-auto flex flex-col items-center gap-3 md:mx-0">
          <div className="flex items-center justify-center rounded-lg border border-brand-soft/30 bg-background/10 p-4 shadow-inner backdrop-blur-sm">
            <AVOBBadge variant="standard" size="large" link={true} />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/70 text-center">
            Certified AVOB
          </p>
        </div>
      </div>
    </section>
  );
}

