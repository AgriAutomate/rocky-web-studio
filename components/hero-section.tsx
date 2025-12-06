"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden rounded-[40px] border border-[#208290]/20 bg-gradient-to-br from-[#208290] via-[#1a6b77] to-[#1F2121] px-6 py-16 shadow-2xl sm:px-12 md:py-24"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(32,130,144,0.3),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(252,252,249,0.05),_transparent_50%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        {/* Badge */}
        <div
          className={`flex flex-wrap items-center gap-3 text-sm font-medium text-[#FCFCF9]/80 transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Sparkles className="size-4 text-[#208290]" />
          Full-stack digital products for ambitious brands
        </div>

        {/* Main content grid - side-by-side on desktop, stacked on mobile */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Text content */}
          <div
            className={`flex flex-col justify-center space-y-8 transition-all duration-700 delay-100 ${
              isLoaded ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            }`}
          >
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-[#FCFCF9]/60">
                Rocky Web Studio
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#FCFCF9] md:text-5xl lg:text-6xl">
                We craft bold web experiences that turn browsers into believers.
              </h1>
              <p className="text-lg leading-relaxed text-[#FCFCF9]/70 md:text-xl">
                Strategy, design, and engineering in one team anchored in
                Rockhampton. Our AI-assisted workflow and modern technology stacks
                keep launches thoughtful, measurable, and resilient.
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-4 border-l-2 border-[#208290]/40 pl-6">
              {heroHighlights.map((highlight, index) => (
                <div
                  key={highlight.title}
                  className={`space-y-1 transition-all duration-500`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#208290]">
                    {highlight.title}
                  </p>
                  <p className="text-base text-[#FCFCF9]/70">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-3 text-[#FCFCF9]">
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#208290] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#208290]"></span>
              </div>
              <span className="text-sm font-medium">
                Accepting three new partners for Q1 2026
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-14 rounded-full bg-[#208290] px-8 text-lg font-semibold text-[#FCFCF9] shadow-lg shadow-[#208290]/20 transition-all hover:bg-[#1a6b77] hover:shadow-xl hover:shadow-[#208290]/30"
              >
                <a href="#contact" className="flex items-center gap-2">
                  Start a project
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-14 rounded-full border-2 border-[#FCFCF9]/20 bg-[#FCFCF9]/5 px-8 text-lg font-medium text-[#FCFCF9] backdrop-blur-sm transition-all hover:border-[#FCFCF9]/40 hover:bg-[#FCFCF9]/10"
              >
                <a href="#services">View capabilities</a>
              </Button>
            </div>
          </div>

          {/* Right column - Logo */}
          <div
            className={`relative flex items-center justify-center transition-all duration-700 delay-200 ${
              isLoaded ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div className="relative h-[400px] w-full max-w-md lg:h-[500px]">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#208290]/30 to-transparent blur-3xl" />

              {/* Logo container with teal filter emphasis */}
              <div className="relative h-full w-full rounded-3xl bg-[#1F2121]/40 p-8 backdrop-blur-sm">
                <div className="relative h-full w-full">
                  <Image
                    src="/images/rws-logo.png"
                    alt="Rocky Web Studio Logo"
                    fill
                    className="object-contain brightness-110 contrast-125 saturate-150 hue-rotate-[-5deg]"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(32, 130, 144, 0.4))",
                    }}
                    priority
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#208290]/20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-[#FCFCF9]/10 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}