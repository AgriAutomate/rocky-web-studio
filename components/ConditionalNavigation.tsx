"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Hide main navigation on campaign page (it has its own navigation)
  if (pathname?.startsWith("/campaign")) {
    return null;
  }
  
  return <Navigation />;
}
