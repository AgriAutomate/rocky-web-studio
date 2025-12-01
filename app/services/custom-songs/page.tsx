import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";

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

  const pricingTiers = [
    {
      name: "Standard Occasion",
      price: "$29",
      description: "Perfect for personal occasions (3-5 days)",
      features: [
        "Single custom song",
        "MP3 + lyric sheet",
        "2 revision rounds",
        "Basic consultation",
      ],
    },
    {
      name: "Express Personal",
      price: "$49",
      description: "Fast delivery for urgent needs (24-48 hours)",
      features: [
        "Single custom song",
        "MP3 format",
        "1 revision round",
        "Priority processing",
      ],
    },
    {
      name: "Wedding Trio",
      price: "$149",
      description: "Complete wedding package (5-7 days)",
      features: [
        "3 custom songs",
        "MP3 + WAV formats",
        "3 revision rounds",
        "Extended consultation",
      ],
      highlighted: true,
    },
  ];

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

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Portfolio</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((song, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
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
                <h3 className="font-semibold text-slate-900 mb-1">{song.title}</h3>
                <p className="text-sm text-slate-600">{song.occasion}</p>
                <p className="text-sm text-slate-600">{song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to create your custom song?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Share your vision and we'll bring it to life with original music.
          </p>
          <a
            href="/book"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Book Free Consultation
          </a>
        </div>
      </section>
    </>
  );
}
