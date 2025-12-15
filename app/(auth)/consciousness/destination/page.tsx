import type { Metadata } from "next";

import { DestinationPageClient } from "./destination-page-client";

export const metadata: Metadata = {
  title: "Destination",
};

export default function DestinationPage() {
  return <DestinationPageClient />;
}

