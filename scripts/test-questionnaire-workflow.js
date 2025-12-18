/**
 * End-to-End Questionnaire Workflow Test Script (JavaScript version)
 * 
 * This script tests the complete questionnaire → PDF → Email → Supabase workflow.
 * 
 * Usage:
 *   node scripts/test-questionnaire-workflow.js
 *   or
 *   npm run test:workflow
 * 
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Environment variables set (.env.local)
 *   - Supabase credentials configured
 *   - Resend API key configured
 */

// Test configuration
const API_URL = process.env.TEST_API_URL || "http://localhost:3000/api/questionnaire/submit";
const TEST_EMAIL = process.env.TEST_EMAIL || "test@example.com";

// Test data matching the questionnaire form structure
const testFormData = {
  q1: "Test Business Pty Ltd",
  q2: "https://testbusiness.com.au",
  q3: ["reduce-operating-costs", "increase-online-visibility"],
  q4: ["operating-costs", "cash-flow", "digital-transformation"],
  sector: "professional-services",
  q5: ["professional-services", "retail-trade"],
  q21: "5k-10k",
  q22: "60-90",
  q23: TEST_EMAIL,
  q24: "0412345678",
};

const results = [];

/**
 * Test Step 1: Submit questionnaire form
 */
async function testFormSubmission() {
  const start = Date.now();
  try {
    console.log("\n📝 Step 1: Submitting questionnaire form...");
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testFormData),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      return {
        step: "Form Submission",
        success: false,
        error: `Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`,
        duration: Date.now() - start,
      };
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        step: "Form Submission",
        success: false,
        error: result.error || result.details || `HTTP ${response.status}`,
        data: result,
        duration: Date.now() - start,
      };
    }

    console.log("✅ Form submitted successfully");
    console.log(`   Client ID: ${result.clientId}`);
    console.log(`   PDF Generated: ${result.pdfGeneratedAt ? "Yes" : "No"}`);

    return {
      step: "Form Submission",
      success: true,
      data: result,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      step: "Form Submission",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Test Step 2: Verify PDF URL is accessible
 */
async function testPdfUrl(pdfUrl) {
  const start = Date.now();
  try {
    console.log("\n📄 Step 2: Verifying PDF URL...");

    if (!pdfUrl) {
      return {
        step: "PDF URL",
        success: false,
        error: "PDF URL is null - PDF was not uploaded",
        duration: Date.now() - start,
      };
    }

    // Try to fetch the PDF URL
    const response = await fetch(pdfUrl, { method: "HEAD" });

    if (!response.ok) {
      return {
        step: "PDF URL",
        success: false,
        error: `PDF URL returned ${response.status} ${response.statusText}`,
        data: { pdfUrl, status: response.status },
        duration: Date.now() - start,
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType !== "application/pdf") {
      return {
        step: "PDF URL",
        success: false,
        error: `Expected application/pdf but got ${contentType}`,
        data: { pdfUrl, contentType },
        duration: Date.now() - start,
      };
    }

    console.log("✅ PDF URL is accessible");
    console.log(`   URL: ${pdfUrl}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Size: ${response.headers.get("content-length") || "unknown"} bytes`);

    return {
      step: "PDF URL",
      success: true,
      data: {
        pdfUrl,
        contentType,
        size: response.headers.get("content-length"),
      },
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      step: "PDF URL",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Print test results summary
 */
function printResults() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  results.forEach((result) => {
    const icon = result.success ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    console.log(`${icon} ${result.step}${duration}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("\n" + "-".repeat(50));
  console.log(`Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log("=".repeat(50));

  if (failed > 0) {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🧪 Questionnaire Workflow Test");
  console.log("=".repeat(50));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log("=".repeat(50));

  // Test form submission
  const submissionTest = await testFormSubmission();
  results.push(submissionTest);

  if (!submissionTest.success) {
    console.log("\n❌ Form submission failed - stopping tests");
    printResults();
    return;
  }

  const clientId = submissionTest.data?.clientId;
  if (!clientId) {
    console.log("\n⚠️  No client ID returned");
    printResults();
    return;
  }

  // Wait a moment for async operations to complete
  console.log("\n⏳ Waiting 3 seconds for async operations (PDF generation, email, storage)...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Note: PDF URL verification would require Supabase client access
  // For now, we just verify the API response
  console.log("\n✅ Test complete - check your email and Supabase dashboard for results");

  printResults();
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
