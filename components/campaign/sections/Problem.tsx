"use client";

import { Clock, TrendingDown, DollarSign } from "lucide-react";
import { COPY } from "@/lib/campaign-constants";

const iconMap = {
  Clock,
  TrendingDown,
  DollarSign,
};

const Problem = () => {
  return (
    <section id="problem" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {COPY.problem.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            If you're nodding along to any of these, you're in the right place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {COPY.problem.painPoints.map((point, index) => {
            const Icon = iconMap[point.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className="group relative bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 rounded-l-2xl" />
                
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {point.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Problem;
