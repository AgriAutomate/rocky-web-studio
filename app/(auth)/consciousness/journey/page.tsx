import type { Metadata } from "next";

import { JourneyPageClient } from "./journey-page-client";

export const metadata: Metadata = {
  title: "Journey",
};

export default function JourneyPage() {
  return <JourneyPageClient />;
}

