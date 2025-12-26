import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import ServiceCtaBand from "@/components/services/ServiceCtaBand";
import { getPricingTiers } from "@/lib/config/pricing";

export default function CustomSongsPage() {
  const features = [
    {
      icon: "🎵",
      title: "Custom Compositions",
      description:
        "Original music compositions tailored to your occasion, style, and preferences.",
    },
    {
      icon: "🎸",
      title: "Multiple Genres",
      description:
        "From DnB to spoken word, we create music across a wide range of genres.",
    },
    {
      icon: "🎬",
      title: "Video Integration",
      description:
        "Seamless video integration to showcase your custom songs with visual storytelling.",
    },
  ];

  // Get pricing from centralized configuration
  const pricingTiers = getPricingTiers('custom-songs');

  const portfolio = [
    { title: "Wheel of Fortune (McFlys Vindication)", occasion: "Personal", genre: "Liquid DnB", videoUrl: "/wheel-of-fortune.mp4" },
    { title: "Loved Out Loud (Portias Bday DnB Assault)", occasion: "Birthday", genre: "Heavy DnB", videoUrl: "/loved-out-loud.mp4" },
    { title: "Home Downunder (Poetry into Music)", occasion: "Poetry", genre: "Spoken Word", videoUrl: "/home-down-under.mp4" },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🎵</span>}
        subtitle="Services"
        title="Custom Songs"
        description="Original music compositions created specifically for your occasion, event, or creative project."
      />

      <ServiceFeatures features={features} />

      <ServicePricing tiers={pricingTiers} />

      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Portfolio</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((song, index) => (
              <div
                key={index}
                className="rounded-xl bg-card p-6 shadow-sm border border-border"
              >
                {song.videoUrl && (
                  <video 
                    className="w-full rounded-lg mb-4" 
                    controls 
                    preload="metadata"
                  >
                    <source src={song.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <h3 className="font-semibold text-foreground mb-1">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.occasion}</p>
                <p className="text-sm text-muted-foreground">{song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceCtaBand
        title="Ready to create your custom song?"
        description="Share your vision and we'll bring it to life with original music."
      />
    </>
  );
}
