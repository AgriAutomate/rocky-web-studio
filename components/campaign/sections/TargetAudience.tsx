"use client";

import { Laptop, Facebook, CheckCircle } from "lucide-react";
import { COPY } from "@/lib/campaign-constants";

const iconMap = {
  Laptop,
  Facebook,
};

const TargetAudience = () => {
  return (
    <section id="audience" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Who We Help
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {COPY.audience.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This landing page is specifically for these two types of CQ business owners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {COPY.audience.personas.map((persona, index) => {
            const Icon = iconMap[persona.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className="relative bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{persona.title}</h3>
                      <p className="text-primary-foreground/80 text-sm">
                        {persona.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Pain Points
                    </h4>
                    <ul className="space-y-3">
                      {persona.painPoints.map((point, pointIndex) => (
                        <li
                          key={pointIndex}
                          className="flex items-start gap-3 text-foreground"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 shrink-0" />
                          <span className="text-sm leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      What You Need
                    </h4>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-foreground text-sm leading-relaxed">
                        {persona.need}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
