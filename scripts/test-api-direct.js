/**
 * Direct API Test - Tests the API route directly to see raw error
 * 
 * Usage: node scripts/test-api-direct.js
 */

const testFormData = {
  q1: "Test Business Pty Ltd",
  q2: "https://testbusiness.com.au",
  q3: ["reduce-operating-costs", "increase-online-visibility"],
  q4: ["operating-costs", "cash-flow", "digital-transformation"],
  sector: "professional-services",
  q5: ["professional-services", "retail-trade"],
  q21: "5k-10k",
  q22: "60-90",
  q23: "test@example.com",
  q24: "0412345678",
};

async function testAPI() {
  console.log("Testing API route directly...");
  console.log("URL: http://localhost:3000/api/questionnaire/submit");
  console.log("");

  try {
    const response = await fetch("http://localhost:3000/api/questionnaire/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testFormData),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const contentType = response.headers.get("content-type");
    console.log(`Content-Type: ${contentType}`);
    console.log("");

    // Assert Content-Type is JSON
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ ERROR: Expected Content-Type to include 'application/json'");
      console.error(`   Received: ${contentType || "(none)"}`);
      console.error("\n❌ Non-JSON Response (HTML Error Page):");
      console.error(text.substring(0, 500));
      console.error("");
      console.error("Full response length:", text.length);
      throw new Error(`Expected JSON response but got ${contentType || "unknown content type"}`);
    }
    
    // Content-Type is JSON, parse and display
    const result = await response.json();
    console.log("✅ JSON Response:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAPI();
