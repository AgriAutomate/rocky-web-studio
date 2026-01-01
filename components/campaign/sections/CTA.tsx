"use client";

import { ArrowRight, Phone, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/campaign-constants";

interface CTAProps {
  onOpenForm: () => void;
}

const CTA = ({ onOpenForm }: CTAProps) => {
  const trustSignals = [
    { icon: Phone, text: "Free 20-min call" },
    { icon: Shield, text: "No sales pressure" },
    { icon: MapPin, text: "Local CQ partner" },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary via-teal-light to-primary relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "0.5s" }} />

      <div className="container-narrow relative">
        <div className="text-center">
          {/* Attention grabber */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/20 text-primary-foreground rounded-full text-sm font-semibold mb-6 border border-orange/30 animate-bounce-subtle">
            <span className="w-2 h-2 bg-orange rounded-full animate-pulse" />
            Limited Spots Available This Month
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            {COPY.cta.headline}
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            {COPY.cta.description}
          </p>

          {/* CTA Button - FLASHY */}
          <Button
            onClick={onOpenForm}
            variant="flashy"
            size="xl"
            className="shimmer text-lg px-12 py-7 h-auto rounded-xl font-bold"
          >
            {COPY.cta.button}
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {trustSignals.map((signal, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-primary-foreground bg-primary-foreground/10 px-4 py-2 rounded-full border border-primary-foreground/20"
              >
                <signal.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{signal.text}</span>
              </div>
            ))}
          </div>

          <p className="text-primary-foreground/80 text-sm mt-8 italic">
            {COPY.cta.subtext}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
