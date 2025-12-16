import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-brand-from rounded-3xl px-8 py-12 lg:px-16 lg:py-20 relative overflow-hidden">
          {/* Transparent Logo - Top Right */}
          <div className="absolute top-8 right-8 lg:top-12 lg:right-12 pointer-events-none select-none">
            <Image
              src="/images/rws-logo-transparent.png"
              alt="Rocky Web Studio"
              width={200}
              height={200}
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain mix-blend-multiply opacity-95"
              priority
            />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <p className="text-brand-foreground/80 text-sm font-medium uppercase tracking-wider">
                Full-stack digital products for ambitious brands
              </p>

              {/* Company Name */}
              <p className="text-brand-foreground/70 text-sm font-medium tracking-[0.3em] uppercase">
                ROCKY WEB STUDIO
              </p>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-foreground leading-[1.1] text-balance">
                We craft bold web experiences that turn browsers into believers.
              </h1>

              {/* Subheadline */}
              <p className="text-brand-foreground/85 text-lg leading-relaxed max-w-xl">
                Strategy, design, and engineering in one team anchored in Rockhampton. Our
                AI-assisted workflow and modern technology stacks keep launches thoughtful,
                measurable, and resilient.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-card text-primary hover:bg-card/90 font-medium"
                >
                  <Link href="/questionnaire">Start a project</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-brand-foreground/30 bg-transparent text-brand-foreground hover:bg-brand-foreground/10 font-medium"
                >
                  <Link href="#services">View capabilities</Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Empty space for logo visibility */}
            <div className="flex items-center justify-center lg:justify-end">
              {/* This space is intentionally left for the absolute positioned logo */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
