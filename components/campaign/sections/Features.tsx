"use client";

import { Monitor, Search, Megaphone, Settings, Users, CreditCard } from "lucide-react";
import { COPY } from "@/lib/campaign-constants";

const iconMap = {
  Monitor,
  Search,
  Megaphone,
  Settings,
  Users,
  CreditCard,
};

const Features = () => {
  return (
    <section id="features" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Everything Included
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {COPY.features.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete package to get your business online properly—no surprise extras.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {COPY.features.items.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
