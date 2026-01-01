"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/campaign-constants";

interface HeroProps {
  onOpenForm: () => void;
}

const Hero = ({ onOpenForm }: HeroProps) => {
  const quickBenefits = [
    "No Brisbane prices",
    "Local CQ partner",
    "AI-first efficiency",
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Pattern - More vibrant */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-cream to-secondary/50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-light/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container-wide py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/15 to-orange/15 text-primary rounded-full text-sm font-medium mb-6 animate-fade-in border border-primary/20">
              <span className="w-2 h-2 bg-orange rounded-full animate-pulse" />
              Central Queensland's Local Web Partner
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-in-up">
              {COPY.hero.headline}
              <span className="block text-gradient mt-2">
                {COPY.hero.subheadline}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {COPY.hero.description}
            </p>

            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {quickBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-foreground/80 bg-card px-3 py-1.5 rounded-full border border-border/50 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" onClick={onOpenForm} className="shimmer animate-pulse-glow">
                {COPY.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
                {/* Mock website preview */}
                <div className="h-full flex flex-col">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="h-6 bg-background rounded-md max-w-xs" />
                    </div>
                  </div>
                  {/* Content preview */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="h-8 bg-primary/20 rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-full" />
                    <div className="h-4 bg-secondary rounded w-5/6" />
                    <div className="h-4 bg-secondary rounded w-4/6" />
                    <div className="mt-6 h-10 bg-primary/30 rounded-lg w-1/2" />
                    <div className="grid grid-cols-3 gap-3 mt-8">
                      <div className="aspect-square bg-secondary rounded-lg" />
                      <div className="aspect-square bg-secondary rounded-lg" />
                      <div className="aspect-square bg-secondary rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-card p-3 rounded-xl shadow-lg border border-border animate-bounce" style={{ animationDuration: "3s" }}>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  Lead captured!
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card p-3 rounded-xl shadow-lg border border-border">
                <div className="text-sm">
                  <div className="font-medium text-foreground">Page Views</div>
                  <div className="text-2xl font-bold text-primary">+127%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
