import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const heroHighlights = [
  {
    title: "AI-assisted workflow",
    description: "Pairing seasoned product thinking with responsible automation.",
  },
  {
    title: "Efficient development timelines",
    description: "Transparent sprints keep momentum without overpromising.",
  },
  {
    title: "Competitive regional pricing",
    description: "Rockhampton-based team with proposals calibrated to scope.",
  },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-900 px-6 py-16 text-white shadow-2xl sm:px-12 md:py-24"
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-x-10 inset-y-0 bg-gradient-to-br from-cyan-300/20 via-teal-200/30 to-blue-400/30 blur-[110px]" />
      </div>
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-teal-100">
          <Sparkles className="size-4" />
          Full-stack digital products for ambitious brands
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-white/70">
              Rocky Web Studio
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              We craft bold web experiences that turn browsers into believers.
            </h1>
            <p className="text-lg text-white/70 md:text-xl">
              Strategy, design, and engineering in one team anchored in
              Rockhampton. Our AI-assisted workflow and modern technology stacks
              keep launches thoughtful, measurable, and resilient.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-2 text-white">
                <div className="h-2 w-2 rounded-full bg-[#06b6d4]" />
                Accepting three new partners for Q1 2026
              </div>
              <div className="hidden h-px flex-1 bg-white/20 md:block" />
              <div className="flex flex-wrap items-start gap-6 text-white">
                {heroHighlights.map((highlight) => (
                  <div key={highlight.title} className="max-w-[180px] space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
                      {highlight.title}
                    </p>
                    <p className="text-base text-white/80">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-center text-white/80 sm:flex-row sm:text-left lg:flex-col">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white text-lg font-semibold text-black hover:bg-white/90"
            >
              <a href="#contact">
                Start a project
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full border border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
            >
              <a href="#services">View capabilities</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}