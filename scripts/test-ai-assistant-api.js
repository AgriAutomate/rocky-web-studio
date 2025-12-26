/**
 * Test AI Assistant API Endpoint
 * 
 * Tests the /api/ai-assistant endpoint directly to diagnose errors
 */

require('dotenv').config({ path: '.env.local' });

async function testAIAssistant() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/ai-assistant`;

  console.log('🧪 Testing AI Assistant API');
  console.log('==================================================\n');
  console.log(`📍 Endpoint: ${apiUrl}\n`);

  // Check environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set in .env.local');
    process.exit(1);
  }

  console.log('✅ ANTHROPIC_API_KEY: SET');
  console.log(`   Key length: ${process.env.ANTHROPIC_API_KEY.length} characters\n`);

  // Test request
  const testMessage = {
    messages: [
      {
        role: 'user',
        content: 'Hello, what services do you offer?',
      },
    ],
  };

  try {
    console.log('📤 Sending test request...\n');
    console.log('Request body:', JSON.stringify(testMessage, null, 2), '\n');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}\n`);

    // Check headers
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');

    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        console.error('❌ Error Response:');
        console.error(JSON.stringify(errorData, null, 2));
      } catch (e) {
        const text = await response.text();
        console.error('❌ Error Response (text):');
        console.error(text);
      }
      process.exit(1);
    }

    // Handle streaming response
    if (response.body) {
      console.log('📡 Streaming response...\n');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                process.stdout.write(parsed.chunk);
                fullResponse += parsed.chunk;
              }
              if (parsed.done) {
                console.log('\n\n✅ Response completed successfully!');
                console.log(`📊 Total response length: ${fullResponse.length} characters`);
                process.exit(0);
              }
              if (parsed.error) {
                console.error(`\n\n❌ Error in stream: ${parsed.error}`);
                process.exit(1);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } else {
      console.error('❌ No response body');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Request failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run test
testAIAssistant().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

