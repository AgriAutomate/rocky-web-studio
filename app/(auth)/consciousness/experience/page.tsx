import type { Metadata } from "next";

import { ExperiencePageClient } from "./experience-page-client";

export const metadata: Metadata = {
  title: "Experience",
};

export default function ExperiencePage() {
  return <ExperiencePageClient />;
}

