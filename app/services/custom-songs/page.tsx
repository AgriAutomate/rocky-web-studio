import ServiceHero from "@/components/services/ServiceHero";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServicePricing from "@/components/services/ServicePricing";
import Link from "next/link";

export default function CustomSongsPage() {
  const features = [
    {
      icon: "⚡",
      title: "Quick Turnaround",
      description: "24-48 hours for rush orders. 3-7 days for standard packages.",
    },
    {
      icon: "🎵",
      title: "Professional Quality",
      description: "Refined AI technology with human curation ensures exceptional results.",
    },
    {
      icon: "💝",
      title: "Emotion-Focused",
      description: "Personalized songs designed for emotional impact, not commercial success.",
    },
    {
      icon: "🎤",
      title: "Custom Lyrics",
      description: "Tell us your story and we craft meaningful lyrics that capture your moment.",
    },
    {
      icon: "🎧",
      title: "Multiple Formats",
      description: "Receive your song as MP3, WAV, and optional video with lyrics.",
    },
    {
      icon: "🔄",
      title: "Revisions Included",
      description: "We work with you until your song is perfect. 2-3 revision rounds included.",
    },
  ];

  const pricingTiers = [
    {
      name: "Express Personal",
      price: "$49",
      description: "24-48 hour delivery",
      features: [
        "Single custom song",
        "2-3 minutes duration",
        "MP3 delivery",
        "Personal use license",
        "1 revision round",
        "Rush priority processing",
      ],
    },
    {
      name: "Standard Occasion",
      price: "$29",
      description: "3-5 day delivery",
      features: [
        "Single custom song",
        "Up to 3 minutes",
        "MP3 + lyric sheet",
        "Personal use license",
        "2 revision rounds",
        "Email support",
      ],
      highlighted: true,
    },
    {
      name: "Wedding Trio",
      price: "$149",
      description: "5-7 day delivery",
      features: [
        "3 custom songs",
        "Ceremony + First Dance + Parent Dance",
        "MP3 + WAV formats",
        "Personal use license",
        "3 revision rounds",
        "Priority support",
      ],
    },
  ];

  return (
    <>
      <ServiceHero
        icon={<span className="text-4xl">🎵</span>}
        subtitle="Services"
        title="Custom AI Songs for Central Queensland"
        description="Your special moment deserves a custom song. AI-crafted, personally curated songs for weddings, birthdays, anniversaries, and unforgettable celebrations. Fast turnaround. Emotional impact. Rockhampton-based."
      />

      <ServiceFeatures features={features} />

            {/* Portfolio Section */}
      <section id="portfolio" className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-600 mb-2">Portfolio</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Hear Our Work</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Sample songs from Diamonds McFly. Each custom song is uniquely crafted to capture your special moment.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
              [
                { title: "Wheel of Fortune (McFly's Vindication)", occasion: "Personal", genre: "Liquid DnB", videoUrl: "/Wheel of Fortune (McFly's Vindication).mp4" },
                { title: "Loved Out Loud (Portia's Bday DnB Assault)", occasion: "Birthday", genre: "Heavy DnB", videoUrl: "/Loved Out Loud (Portia's DnB Assault).mp4" },
                { title: "Home, Downunder (Poetry into Music)", occasion: "Poetry", genre: "Spoken Word", videoUrl: "/Home, Down Under.mp4" },
                          ].map((song, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">{song.title}</h3>
                <p className="text-sm text-teal-600 mb-1">{song.occasion}</p>
                <p className="text-xs text-slate-500">{song.genre}</p>
                                {song.videoUrl && (
                  <video 
                    className="w-full rounded-lg mb-3" 
                    controls 
                    preload="metadata"
                  >
                    <source src={song.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            Want to hear more? <Link href="/services/custom-songs/order" className="text-teal-600 hover:underline">Contact us</Link> for additional samples or a personalized demo.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: "1", title: "Share Your Story", description: "Tell us about your special occasion, the people involved, and the emotions you want to capture." },
              { step: "2", title: "We Create Your Song", description: "Using advanced AI music generation (Suno AI) combined with human creative direction, we craft a unique song." },
              { step: "3", title: "Review & Refine", description: "Listen to your custom song and request any adjustments. Revision rounds included." },
              { step: "4", title: "Receive & Celebrate", description: "Download your finished song in multiple formats, ready for your special event." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-xl">{item.step}</div>
                <div><h3 className="text-xl font-semibold mb-2">{item.title}</h3><p className="text-gray-600">{item.description}</p></div>
              </div>
            ))}
          </div>
        </di116
          v>
      </section>

      <ServicePricing tiers={pricingTiers} />

      <section className="py-16 px-6 bg-gradient-to-br from-teal-500 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Custom Song?</h2>
          <p className="text-xl mb-8 opacity-90">Tell us about your special moment and we will craft a song you will treasure forever.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services/custom-songs/order" className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Create Your Song</Link>
            <Link href="#portfolio" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">Hear Our Work</Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <p><strong>Transparency Notice:</strong> Our songs are created using Suno AI technology with human creative direction and curation by Diamonds McFly. Songs are licensed for personal use unless commercial license is purchased.</p>
        </div>
      </section>
    </>
  );
}
