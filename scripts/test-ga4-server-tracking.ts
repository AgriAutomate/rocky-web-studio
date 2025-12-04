/**
 * Test script for GA4 server-side tracking
 * 
 * Usage:
 *   npx ts-node scripts/test-ga4-server-tracking.ts
 * 
 * Or with environment variables:
 *   GA4_API_SECRET=your_secret npx ts-node scripts/test-ga4-server-tracking.ts
 */

import {
  trackPaymentConfirmedServer,
  trackSongRequestPurchasedServer,
} from "../lib/analytics/server";

async function testServerTracking() {
  console.log("🧪 Testing GA4 Server-Side Tracking\n");

  // Check environment variables
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  console.log("📋 Configuration:");
  console.log(`  NEXT_PUBLIC_GA_MEASUREMENT_ID: ${measurementId ? "✅ Set" : "❌ Missing"}`);
  console.log(`  GA4_API_SECRET: ${apiSecret ? "✅ Set" : "❌ Missing"}\n`);

  if (!measurementId || !apiSecret) {
    console.error("❌ Missing required environment variables!");
    console.error("   Set NEXT_PUBLIC_GA_MEASUREMENT_ID and GA4_API_SECRET");
    process.exit(1);
  }

  // Test 1: Payment Confirmed Event
  console.log("📤 Test 1: Sending payment_confirmed event...");
  try {
    await trackPaymentConfirmedServer({
      transaction_id: `test_pi_${Date.now()}`,
      amount: 5000, // $50.00 in cents
      service_type: "custom_song",
      currency: "AUD",
      order_id: `test_order_${Date.now()}`,
    });
    console.log("  ✅ payment_confirmed event sent\n");
  } catch (error) {
    console.error("  ❌ Failed to send payment_confirmed event:", error);
  }

  // Test 2: Song Request Purchased Event
  console.log("📤 Test 2: Sending song_request_purchased event...");
  try {
    await trackSongRequestPurchasedServer({
      order_id: `test_order_${Date.now()}`,
      package_type: "standard",
      price: 5000, // $50.00 in cents
      occasion: "Birthday",
      currency: "AUD",
    });
    console.log("  ✅ song_request_purchased event sent\n");
  } catch (error) {
    console.error("  ❌ Failed to send song_request_purchased event:", error);
  }

  console.log("✅ Test complete!");
  console.log("\n📊 Next steps:");
  console.log("  1. Check GA4 Dashboard → Reports → Realtime");
  console.log("  2. Look for 'payment_confirmed' and 'song_request_purchased' events");
  console.log("  3. Verify event properties are correct");
  console.log("  4. Check Vercel logs for any errors");
}

// Run tests
testServerTracking()
  .then(() => {
    console.log("\n✨ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

