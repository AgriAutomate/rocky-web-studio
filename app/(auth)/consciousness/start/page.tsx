import type { Metadata } from "next";

import { StartPageClient } from "./start-page-client";

export const metadata: Metadata = {
  title: "Start",
};

export default function StartPage() {
  return <StartPageClient />;
}

