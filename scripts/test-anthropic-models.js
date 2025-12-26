/**
 * Test Anthropic API Models
 * 
 * Tests different model names to find which one works
 */

require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const modelsToTest = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-sonnet',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing model: ${modelName}`);
    const response = await client.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Hi',
        },
      ],
    });
    console.log(`✅ ${modelName} - SUCCESS`);
    return true;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.log(`❌ ${modelName} - ${error.status}: ${error.message}`);
    } else {
      console.log(`❌ ${modelName} - Error: ${error.message}`);
    }
    return false;
  }
}

async function testAllModels() {
  console.log('🔍 Testing Anthropic API Models');
  console.log('==================================================\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }

  console.log('✅ API Key is set\n');

  const results = [];
  for (const model of modelsToTest) {
    const success = await testModel(model);
    results.push({ model, success });
  }

  console.log('\n==================================================');
  console.log('📊 Results Summary:');
  console.log('==================================================');
  const workingModels = results.filter(r => r.success);
  if (workingModels.length > 0) {
    console.log('\n✅ Working models:');
    workingModels.forEach(r => console.log(`   - ${r.model}`));
  } else {
    console.log('\n❌ No working models found');
    console.log('   This might indicate:');
    console.log('   - API key is invalid');
    console.log('   - API key doesn\'t have access to these models');
    console.log('   - Network/connectivity issues');
  }
}

testAllModels().catch(console.error);

