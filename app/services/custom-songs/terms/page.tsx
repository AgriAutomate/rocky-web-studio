import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function CustomSongsTermsPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/services/custom-songs"
            className="inline-flex items-center text-primary hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Custom Songs
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
              <p className="text-muted-foreground">Custom AI Songs Service</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
        </div>

        {/* Terms Content */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8">
          {/* 1. Service Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Service Description</h2>
            <p className="text-muted-foreground mb-3">
              Rocky Web Studio provides custom song creation services using Suno AI technology with human creative direction and curation by Diamonds McFly. Our service creates personalized songs for special occasions including weddings, birthdays, anniversaries, and other celebrations.
            </p>
            <p className="text-muted-foreground">
              <strong>AI Disclosure:</strong> All songs are generated using artificial intelligence (Suno AI) and refined through human curation. While we strive for exceptional quality, AI-generated content may have limitations inherent to the technology.
            </p>
          </section>

          {/* 2. Ordering & Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Ordering & Pricing</h2>
            <p className="text-muted-foreground mb-3">Our packages include:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-3">
              <li><strong>Express Personal ($49):</strong> 24-48 hour delivery, single custom song, MP3 format, 1 revision round</li>
              <li><strong>Standard Occasion ($29):</strong> 3-5 day delivery, single custom song, MP3 + lyric sheet, 2 revision rounds</li>
              <li><strong>Wedding Trio ($149):</strong> 5-7 day delivery, 3 custom songs, MP3 + WAV formats, 3 revision rounds</li>
              <li><strong>Commercial License Add-on (+$49):</strong> For YouTube monetization, business use, or extended rights</li>
            </ul>
            <p className="text-muted-foreground">Payment is due in full at the time of order. Prices are in Australian Dollars (AUD).</p>
          </section>

          {/* 3. Production & Delivery */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Production & Delivery</h2>
            <p className="text-muted-foreground mb-3">
              Upon receiving your order, Diamonds McFly will review your story details and begin crafting your custom song. Delivery timeframes begin from order confirmation and are estimates only.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Songs are delivered via email in the specified formats</li>
              <li>Standard songs are 2-3 minutes in duration</li>
              <li>We may contact you for clarification on your requirements</li>
            </ul>
          </section>

          {/* 4. Revisions */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Revisions Policy</h2>
            <p className="text-muted-foreground mb-3">
              Each package includes revision rounds as specified. Revisions must be requested within 7 days of delivery and are limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Minor lyric adjustments</li>
              <li>Tempo or energy level changes</li>
              <li>Genre modifications within the same style family</li>
            </ul>
            <p className="text-muted-foreground mt-3">Major changes (e.g., complete style overhaul, new subject matter) may require a new order.</p>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property & Licensing</h2>
            <p className="text-muted-foreground mb-3">
              <strong>Personal Use License (Standard):</strong> You receive a broad personal use license for your custom song, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">
              <li>Playing at private events and celebrations</li>
              <li>Sharing with friends and family</li>
              <li>Personal archival and storage</li>
              <li>Non-monetized social media sharing</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              <strong>Commercial License (Add-on):</strong> Required for YouTube monetization, business use, advertising, or public commercial distribution.
            </p>
            <p className="text-muted-foreground">
              <strong>Attribution:</strong> As per Suno AI requirements, commercial use requires appropriate attribution to Suno AI.
            </p>
          </section>

          {/* 6. Refunds */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Refund Policy</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Before production:</strong> Full refund if cancelled before work begins</li>
              <li><strong>During production:</strong> 50% refund if cancelled after work has commenced</li>
              <li><strong>After delivery:</strong> No refunds once song is delivered, as digital products cannot be "returned"</li>
              <li><strong>Quality issues:</strong> If the delivered song significantly differs from agreed specifications, we will work with you to resolve the issue through additional revisions</li>
            </ul>
          </section>

          {/* 7. Content Guidelines */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Content Guidelines</h2>
            <p className="text-muted-foreground mb-3">We reserve the right to decline orders containing:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Hate speech, discrimination, or harmful content</li>
              <li>Defamatory or libelous material</li>
              <li>Content promoting illegal activities</li>
              <li>Sexually explicit material</li>
              <li>Content violating third-party rights</li>
            </ul>
          </section>

          {/* 8. Disclaimers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Disclaimers</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Songs are for personal enjoyment; we make no guarantees of commercial success</li>
              <li>AI-generated music may have inherent limitations</li>
              <li>Copyright protection for AI-generated works is legally uncertain in Australia</li>
              <li>Delivery timeframes are estimates and may vary based on demand</li>
            </ul>
          </section>

          {/* 9. Liability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by Australian Consumer Law, Rocky Web Studio's liability is limited to the amount paid for the service. We are not liable for indirect, consequential, or incidental damages arising from use of our services.
            </p>
          </section>

          {/* 10. Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Privacy & Data</h2>
            <p className="text-muted-foreground">
              Your personal information and story details are handled in accordance with our Privacy Policy. We may use anonymized song examples for promotional purposes with your consent.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of Queensland, Australia. Any disputes shall be resolved through good faith negotiation, and if necessary, the courts of Queensland.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              Questions about these terms? Contact us at{" "}
              <a href="mailto:hello@rockywebstudio.com.au" className="text-primary hover:underline">
                hello@rockywebstudio.com.au
              </a>
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="bg-muted rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-3">Acknowledgment</h2>
            <p className="text-muted-foreground">
              By placing an order for our Custom AI Songs service, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/services/custom-songs/order"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Ready to Order? Start Here
          </Link>
        </div>
      </div>
    </div>
  );
}
