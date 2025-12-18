/**
 * Test script to check if route imports are failing
 * Run: node scripts/test-imports.js
 */

console.log("🔍 Testing route imports...\n");

async function testImports() {
  const tests = [
    {
      name: "Import NextRequest/NextResponse",
      test: async () => {
        try {
          const { NextRequest, NextResponse } = await import("next/server");
          console.log("✅ NextRequest/NextResponse imported");
          return true;
        } catch (e) {
          console.log("❌ NextRequest/NextResponse import failed:", e.message);
          return false;
        }
      }
    },
    {
      name: "Import Resend",
      test: async () => {
        try {
          const { Resend } = await import("resend");
          console.log("✅ Resend imported");
          return true;
        } catch (e) {
          console.log("❌ Resend import failed:", e.message);
          return false;
        }
      }
    },
    {
      name: "Import validators",
      test: async () => {
        try {
          // Use dynamic import with file path
          const validators = await import("../lib/utils/validators.ts");
          console.log("✅ Validators imported");
          return true;
        } catch (e) {
          console.log("❌ Validators import failed:", e.message);
          console.log("   Stack:", e.stack?.split("\n").slice(0, 3).join("\n"));
          return false;
        }
      }
    },
    {
      name: "Import env",
      test: async () => {
        try {
          const { env } = await import("../lib/env.ts");
          console.log("✅ Env imported");
          // Try accessing a property
          try {
            const key = env.RESEND_API_KEY;
            console.log("   RESEND_API_KEY:", key ? "SET" : "NOT SET");
          } catch (e) {
            console.log("   ❌ Env access failed:", e.message);
          }
          return true;
        } catch (e) {
          console.log("❌ Env import failed:", e.message);
          console.log("   Stack:", e.stack?.split("\n").slice(0, 3).join("\n"));
          return false;
        }
      }
    },
    {
      name: "Import challenge library",
      test: async () => {
        try {
          const { getChallengeDetails } = await import("../lib/utils/pain-point-mapping.ts");
          console.log("✅ Challenge library imported");
          return true;
        } catch (e) {
          console.log("❌ Challenge library import failed:", e.message);
          console.log("   Stack:", e.stack?.split("\n").slice(0, 5).join("\n"));
          return false;
        }
      }
    },
    {
      name: "Import PDF generator",
      test: async () => {
        try {
          const { generatePdfReport } = await import("../lib/pdf/generateClientReport.ts");
          console.log("✅ PDF generator imported");
          return true;
        } catch (e) {
          console.log("❌ PDF generator import failed:", e.message);
          console.log("   Stack:", e.stack?.split("\n").slice(0, 3).join("\n"));
          return false;
        }
      }
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    console.log(`\n📦 Testing: ${name}`);
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n==========================================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("==========================================");
}

testImports().catch(console.error);
