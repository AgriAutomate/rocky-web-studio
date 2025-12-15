import type { Metadata } from "next";

import { ProgressPageClient } from "./progress-page-client";

export const metadata: Metadata = {
  title: "Progress",
};

export default function ProgressPage() {
  return <ProgressPageClient />;
}

