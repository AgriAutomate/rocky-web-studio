/**
 * End-to-End Questionnaire Workflow Test Script
 * 
 * This script tests the complete questionnaire → PDF → Email → Supabase workflow.
 * 
 * Usage:
 *   npm run test:workflow
 *   or
 *   tsx scripts/test-questionnaire-workflow.ts
 * 
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - Environment variables set (.env.local)
 *   - Supabase credentials configured
 *   - Resend API key configured
 */

// Test script for questionnaire workflow

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

interface TestResult {
  step: string;
  success: boolean;
  error?: string;
  data?: any;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Test Step 1: Submit questionnaire form
 */
async function testFormSubmission(): Promise<TestResult> {
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
 * Test Step 2: Verify Supabase record
 */
async function testSupabaseRecord(clientId: string): Promise<TestResult> {
  const start = Date.now();
  try {
    console.log("\n💾 Step 2: Verifying Supabase record...");

    // Check if Supabase client is available
    const { createServerSupabaseClient } = await import("@/lib/supabase/client");
    const supabase = createServerSupabaseClient(true);

    const { data, error } = await (supabase as any)
      .from("questionnaire_responses")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (error) {
      return {
        step: "Supabase Record",
        success: false,
        error: error.message,
        duration: Date.now() - start,
      };
    }

    if (!data) {
      return {
        step: "Supabase Record",
        success: false,
        error: "No record found with client_id",
        duration: Date.now() - start,
      };
    }

    console.log("✅ Supabase record found");
    console.log(`   ID: ${data.id}`);
    console.log(`   Business: ${data.business_name}`);
    console.log(`   PDF URL: ${data.pdf_url || "NULL"}`);
    console.log(`   PDF Generated At: ${data.pdf_generated_at || "NULL"}`);
    console.log(`   Email Sent At: ${data.email_sent_at || "NULL"}`);

    return {
      step: "Supabase Record",
      success: true,
      data: {
        id: data.id,
        businessName: data.business_name,
        pdfUrl: data.pdf_url,
        pdfGeneratedAt: data.pdf_generated_at,
        emailSentAt: data.email_sent_at,
      },
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      step: "Supabase Record",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Test Step 3: Verify PDF in storage
 */
async function testPdfStorage(pdfUrl: string | null): Promise<TestResult> {
  const start = Date.now();
  try {
    console.log("\n📄 Step 3: Verifying PDF in storage...");

    if (!pdfUrl) {
      return {
        step: "PDF Storage",
        success: false,
        error: "PDF URL is null - PDF was not uploaded",
        duration: Date.now() - start,
      };
    }

    // Try to fetch the PDF URL
    const response = await fetch(pdfUrl, { method: "HEAD" });

    if (!response.ok) {
      return {
        step: "PDF Storage",
        success: false,
        error: `PDF URL returned ${response.status} ${response.statusText}`,
        data: { pdfUrl, status: response.status },
        duration: Date.now() - start,
      };
    }

    const contentType = response.headers.get("content-type");
    if (contentType !== "application/pdf") {
      return {
        step: "PDF Storage",
        success: false,
        error: `Expected application/pdf but got ${contentType}`,
        data: { pdfUrl, contentType },
        duration: Date.now() - start,
      };
    }

    console.log("✅ PDF found in storage");
    console.log(`   URL: ${pdfUrl}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Size: ${response.headers.get("content-length") || "unknown"} bytes`);

    return {
      step: "PDF Storage",
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
      step: "PDF Storage",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Test Step 4: Verify challenge library
 */
async function testChallengeLibrary(): Promise<TestResult> {
  const start = Date.now();
  try {
    console.log("\n📚 Step 4: Verifying challenge library...");

    const { getChallengeDetails, getAllChallengeIds } = await import(
      "@/lib/data/challenges"
    );

    const allIds = getAllChallengeIds();
    console.log(`   Found ${allIds.length} challenges in library`);

    if (allIds.length === 0) {
      return {
        step: "Challenge Library",
        success: false,
        error: "Challenge library is empty",
        duration: Date.now() - start,
      };
    }

    // Test getting challenge details for test form selections
    const testChallengeIds = [1, 2, 4]; // Based on test form q4 selections
    const details = getChallengeDetails(testChallengeIds);

    if (details.length === 0) {
      return {
        step: "Challenge Library",
        success: false,
        error: "getChallengeDetails returned empty array",
        duration: Date.now() - start,
      };
    }

    console.log("✅ Challenge library working");
    console.log(`   Test challenges retrieved: ${details.length}`);
    details.forEach((challenge) => {
      console.log(`   - Challenge ${challenge.number}: ${challenge.title}`);
    });

    return {
      step: "Challenge Library",
      success: true,
      data: {
        totalChallenges: allIds.length,
        testChallengesRetrieved: details.length,
        challengeTitles: details.map((c) => c.title),
      },
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      step: "Challenge Library",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🧪 Questionnaire Workflow Test");
  console.log("=" .repeat(50));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log("=" .repeat(50));

  // Test challenge library first (doesn't require API call)
  const challengeTest = await testChallengeLibrary();
  results.push(challengeTest);

  // Test form submission
  const submissionTest = await testFormSubmission();
  results.push(submissionTest);

  if (!submissionTest.success) {
    console.log("\n❌ Form submission failed - stopping tests");
    printResults();
    process.exit(1);
  }

  const clientId = submissionTest.data?.clientId;
  if (!clientId) {
    console.log("\n⚠️  No client ID returned - cannot verify Supabase record");
    printResults();
    process.exit(1);
  }

  // Wait a moment for async operations to complete
  console.log("\n⏳ Waiting 2 seconds for async operations...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test Supabase record
  const supabaseTest = await testSupabaseRecord(clientId);
  results.push(supabaseTest);

  // Test PDF storage if URL exists
  const pdfUrl = supabaseTest.data?.pdfUrl;
  if (pdfUrl) {
    const storageTest = await testPdfStorage(pdfUrl);
    results.push(storageTest);
  } else {
    results.push({
      step: "PDF Storage",
      success: false,
      error: "PDF URL is null in Supabase record",
    });
  }

  // Print summary
  printResults();
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

// Run tests if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error("Fatal error running tests:", error);
    process.exit(1);
  });
}

export { runTests, testFormSubmission, testSupabaseRecord, testPdfStorage, testChallengeLibrary };
