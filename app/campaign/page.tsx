"use client";

import { useState } from "react";
import Navigation from "@/components/campaign/sections/Navigation";
import Hero from "@/components/campaign/sections/Hero";
import Problem from "@/components/campaign/sections/Problem";
import Solution from "@/components/campaign/sections/Solution";
import Features from "@/components/campaign/sections/Features";
import TargetAudience from "@/components/campaign/sections/TargetAudience";
import CTA from "@/components/campaign/sections/CTA";
import Footer from "@/components/campaign/sections/Footer";
import FormModal from "@/components/campaign/forms/FormModal";

export default function CampaignPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onOpenForm={openForm} />
      
      <main>
        <Hero onOpenForm={openForm} />
        <Problem />
        <Solution />
        <Features />
        <TargetAudience />
        <CTA onOpenForm={openForm} />
      </main>

      <Footer />
      
      <FormModal isOpen={isFormOpen} onClose={closeForm} />
    </div>
  );
}
