export function VeteranOwnedCallout() {
  return (
    <section
      aria-label="Australian veteran owned badge"
      className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#001F3F] to-slate-800 p-8 text-white shadow-2xl sm:p-10"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 md:max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-200">
            <span className="h-1 w-6 rounded-full bg-teal-300" />
            Trust badge
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Proudly Australian Veteran Owned
          </h2>
          <p className="text-base text-slate-200 sm:text-lg">
            Founded by a Royal Australian Navy veteran (2009-2015), Rocky Web Studio brings
            military-grade discipline and precision to every digital project. We understand
            accountability, timelines, and delivering under pressure.
          </p>
          <a
            href="https://www.avob.org.au/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200 underline decoration-teal-300 decoration-2 underline-offset-4 hover:text-teal-100"
          >
            Learn more about AVOB certification
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="mx-auto flex flex-col items-center gap-3 md:mx-0">
          <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full border border-teal-500/50 bg-white/5 p-4 shadow-inner shadow-slate-900/40">
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-teal-200 text-center text-xs font-semibold uppercase tracking-wide text-teal-100">
              AVOB Logo
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Placeholder
          </p>
        </div>
      </div>
    </section>
  );
}

