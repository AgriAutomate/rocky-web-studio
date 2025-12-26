import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Rocky Web Studio? | 48-Hour AI Deployment vs DIY Breaking Point",
  description: "DIY websites break at 18-24 months, costing A$15K-A$50K to migrate. RWS deploys custom AI in 48 hours. See the 5-year cost comparison.",
  openGraph: {
    title: "Why Rocky Web Studio? | 48-Hour AI Deployment",
    description: "Skip the DIY trap. Get custom AI-powered websites that scale. Local CQ presence, AVOB certified.",
  },
};

export default function ValuePropositionPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcfcf9' }}>
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Section 1: The Problem */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#134252' }}>
              Your DIY Website Will Break at 18–24 Months
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Then you'll pay A$15,000–A$50,000 to migrate to a real platform. We've seen it happen dozens of times.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#134252' }}>18–24 Month Breaking Point</h3>
              <p className="text-gray-600 text-sm">
                DIY platforms (Wix, Squarespace) fail when you scale. Traffic spikes, custom needs, or integrations break everything.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#134252' }}>A$15K–A$50K Migration Cost</h3>
              <p className="text-gray-600 text-sm">
                When DIY breaks, you pay premium rates to rebuild on a real platform. Plus downtime, lost revenue, and stress.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#134252' }}>40+ Hours Learning Curve</h3>
              <p className="text-gray-600 text-sm">
                DIY requires constant learning, troubleshooting, and maintenance. Your time is worth A$50/hour = A$2,000+ value lost.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border-2" style={{ borderColor: '#208084' }}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#134252' }}>
                  The Hidden Cost of DIY
                </h3>
                <p className="text-gray-700 mb-4">
                  Over 5 years, DIY costs <strong>A$15,000–A$18,000+</strong> when you factor in platform fees, your labor time, and the inevitable migration. That's <strong>2–3x more</strong> than building right the first time.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">Year 1–2:</div>
                    <div className="text-gray-600">Platform fees + your time = A$3,000–A$5,000</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Year 2–3:</div>
                    <div className="text-gray-600">Migration crisis = A$15,000–A$50,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The RWS Solution */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#134252' }}>
              Deploy Custom AI in 48 Hours
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Not weeks. Not months. <strong>48 hours</strong>. That's our competitive advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">⚡</div>
                <h3 className="text-2xl font-bold" style={{ color: '#208084' }}>48-Hour Deployment</h3>
              </div>
              <p className="text-gray-700 mb-4">
                We deploy production-ready, custom-branded AI chat widgets in 48 hours. Competitors take weeks. DIY platforms lock you into generic templates.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Custom branding & knowledge base</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Full data ownership (no platform lock-in)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Unlimited scalability</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🎯</div>
                <h3 className="text-2xl font-bold" style={{ color: '#208084' }}>71–92% Margins</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Our reusable AI template means we can deliver premium features at competitive prices. You get enterprise-quality AI without enterprise pricing.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>DIY AI chatbot: A$300–A$500/month (generic)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>RWS custom AI: A$3,500–A$5,000 one-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Break-even in 7–10 months, then pure savings</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border-2" style={{ borderColor: '#208084' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#134252' }}>Why We're Different</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="font-semibold mb-2" style={{ color: '#208084' }}>vs. DIY Platforms</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full data ownership</li>
                  <li>• Unlimited scalability</li>
                  <li>• Custom AI (not generic)</li>
                  <li>• No platform lock-in</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2" style={{ color: '#208084' }}>vs. Local CQ Agencies</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 48-hour deployment (vs. weeks)</li>
                  <li>• AI-first stack (vs. WordPress)</li>
                  <li>• Modern tech (Next.js/React)</li>
                  <li>• AVOB certified</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2" style={{ color: '#208084' }}>vs. Brisbane Premium</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Local CQ presence</li>
                  <li>• Competitive pricing</li>
                  <li>• SME-focused (not enterprise)</li>
                  <li>• Faster delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 5-Year Cost Comparison */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#134252' }}>
              The 5-Year Math
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              RWS costs less over 5 years than DIY. Here's the breakdown.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#208084', backgroundColor: '#fcfcf9' }}>
                    <th className="text-left p-6 font-semibold" style={{ color: '#134252' }}>Cost Category</th>
                    <th className="text-right p-6 font-semibold" style={{ color: '#134252' }}>DIY Platform</th>
                    <th className="text-right p-6 font-semibold" style={{ color: '#134252' }}>RWS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-700">Initial Build</td>
                    <td className="p-6 text-right text-gray-700">A$0–A$500</td>
                    <td className="p-6 text-right font-semibold" style={{ color: '#208084' }}>A$4,000–A$8,000</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-700">Platform Fees (5 years)</td>
                    <td className="p-6 text-right text-gray-700">A$3,000–A$5,000</td>
                    <td className="p-6 text-right font-semibold" style={{ color: '#208084' }}>A$0</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-700">Your Labor Time (40 hrs @ A$50/hr)</td>
                    <td className="p-6 text-right text-gray-700">A$2,000</td>
                    <td className="p-6 text-right font-semibold" style={{ color: '#208084' }}>A$0</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-700">Migration at 18–24 Months</td>
                    <td className="p-6 text-right text-gray-700">A$15,000–A$50,000</td>
                    <td className="p-6 text-right font-semibold" style={{ color: '#208084' }}>A$0</td>
                  </tr>
                  <tr className="border-b-2" style={{ borderColor: '#208084' }}>
                    <td className="p-6 font-bold" style={{ color: '#134252' }}>Total 5-Year Cost</td>
                    <td className="p-6 text-right font-bold text-red-600">A$20,000–A$57,500</td>
                    <td className="p-6 text-right font-bold text-2xl" style={{ color: '#208084' }}>A$4,000–A$8,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              <strong style={{ color: '#134252' }}>RWS saves you A$12,000–A$49,500 over 5 years.</strong>
            </p>
            <p className="text-sm text-gray-600">
              Plus you get unlimited scalability, full data ownership, and custom AI—not generic templates.
            </p>
          </div>
        </section>

        {/* Section 4: CTA */}
        <section className="text-center">
          <div className="bg-white p-12 rounded-lg shadow-lg border-2" style={{ borderColor: '#208084' }}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#134252' }}>
              Ready to Build Right the First Time?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Skip the DIY trap. Get a custom AI-powered website that scales with your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/questionnaire"
                className="px-8 py-4 rounded-lg font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: '#208084' }}
              >
                Start Your Project
              </Link>
              <Link
                href="/book"
                className="px-8 py-4 rounded-lg font-semibold border-2 transition hover:bg-gray-50"
                style={{ borderColor: '#208084', color: '#208084' }}
              >
                Book a Consultation
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              <strong>Local CQ presence</strong> • <strong>AVOB Certified</strong> • <strong>48-hour AI deployment</strong>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}

