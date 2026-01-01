"use client";

import { Layout, MapPin, BarChart3, Percent } from "lucide-react";
import { COPY } from "@/lib/campaign-constants";
import Image from "next/image";

const iconMap = {
  Layout,
  MapPin,
  BarChart3,
  Percent,
};

const Solution = () => {
  return (
    <section id="solution" className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              The Solution
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {COPY.solution.headline}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {COPY.solution.intro}
            </p>

            {/* Benefits list */}
            <div className="space-y-4">
              {COPY.solution.benefits.map((benefit, index) => {
                const Icon = iconMap[benefit.icon as keyof typeof iconMap];
                return (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl transform -rotate-2" />
              
              {/* Main card */}
              <div className="relative bg-card rounded-3xl p-8 lg:p-10 border border-border shadow-lg">
                <div className="text-center mb-8">
                  <Image src="/images/rws-logo-transparent.png" alt="Rocky Web Studio" width={96} height={96} className="mx-auto mb-4 object-contain" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Rocky Web Studio
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    AI-First • Local CQ • Affordable
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">15-25%</div>
                    <div className="text-xs text-muted-foreground mt-1">Under Brisbane</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">CQ</div>
                    <div className="text-xs text-muted-foreground mt-1">Based Locally</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground mt-1">First Approach</div>
                  </div>
                </div>

                {/* AVOB Badge */}
                <div className="mt-8 flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Image src="/images/avob-logo-transparent.png" alt="Australian Veteran Owned Business" width={48} height={48} className="object-contain" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Veteran Owned</div>
                    <div className="text-muted-foreground">Australian Veteran Owned Business</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
