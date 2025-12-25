import Link from "next/link";
import { Music, ArrowRight, Star } from "lucide-react";

export function CustomSongsBanner() {
  return (
    <section className="space-y-6 rounded-[32px] bg-gradient-to-br from-background via-brand-soft to-accent p-8 shadow-sm border border-border">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Left Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
              <Star className="size-3 fill-primary text-primary" />
              New Service
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Custom AI Songs for Your Special Moments
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            Celebrate weddings, birthdays, and anniversaries with personalized songs 
            crafted using AI technology and curated by a Central Queensland musician.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              24-48 hour turnaround
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              From $29
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Rockhampton based
            </span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/services/custom-songs"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Learn More
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/services/custom-songs/order"
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground/20 bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Create Your Song
            </Link>
          </div>
        </div>
        {/* Right Icon */}
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-3xl bg-gradient-to-br from-brand-from to-brand-to p-6 shadow-lg">
            <Music className="size-16 text-brand-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
}
