/**
 * Diagnostic script to test route imports and identify the error
 */

console.log("🔍 Diagnosing route import errors...\n");

const tests = [
  {
    name: "Import env",
    test: () => {
      try {
        const { env } = require("../lib/env.ts");
        console.log("✅ env imported successfully");
        try {
          const key = env.RESEND_API_KEY;
          console.log("✅ env.RESEND_API_KEY accessed:", key ? "SET" : "NOT SET");
        } catch (e) {
          console.log("❌ env.RESEND_API_KEY access failed:", e.message);
        }
      } catch (e) {
        console.log("❌ env import failed:", e.message);
      }
    }
  },
  {
    name: "Import logger",
    test: () => {
      try {
        const { logger } = require("../lib/utils/logger.ts");
        console.log("✅ logger imported successfully");
      } catch (e) {
        console.log("❌ logger import failed:", e.message);
      }
    }
  },
  {
    name: "Import challenge library",
    test: () => {
      try {
        const { getChallengeDetails } = require("../lib/utils/pain-point-mapping.ts");
        console.log("✅ challenge library imported successfully");
      } catch (e) {
        console.log("❌ challenge library import failed:", e.message);
      }
    }
  },
  // PDF generation moved to n8n workflow - test removed
  // {
  //   name: "Import PDF generator",
  //   test: () => {
  //     try {
  //       const { generatePdfReport } = require("../lib/pdf/generateClientReport.ts");
  //       console.log("✅ PDF generator imported successfully");
  //     } catch (e) {
  //       console.log("❌ PDF generator import failed:", e.message);
  //     }
  //   }
  // },
];

tests.forEach(({ name, test }) => {
  console.log(`\n📦 Testing: ${name}`);
  test();
});

console.log("\n✅ Diagnostic complete");
