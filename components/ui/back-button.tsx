"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type BackButtonProps = {
  /**
   * Hide the button for these exact paths.
   * Defaults to hiding on the landing page ("/").
   */
  hideOnPaths?: string[]
  className?: string
}

export function BackButton({ hideOnPaths = ["/"], className }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (!pathname) return null
  if (hideOnPaths.includes(pathname)) return null

  return (
    <div className={cn("fixed left-4 top-4 z-50", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => router.back()}
        aria-label="Go back"
        className={cn(
          "bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50",
          "border-border/40 shadow-sm hover:bg-card/80"
        )}
      >
        <ArrowLeft className="size-4" />
      </Button>
    </div>
  )
}

