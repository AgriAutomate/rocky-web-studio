/**
 * AI Assistant Setup Diagnostic Script
 * 
 * Run this in Node.js to check if all required environment variables are set
 * Usage: node scripts/test-ai-assistant-setup.js
 */

require('dotenv').config({ path: '.env.local' });

const checks = {
  anthropic: {
    name: 'ANTHROPIC_API_KEY',
    value: process.env.ANTHROPIC_API_KEY,
    required: true,
    description: 'Claude API key for AI Assistant',
  },
  supabaseUrl: {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    required: true,
    description: 'Supabase project URL',
  },
  supabaseAnonKey: {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    required: true,
    description: 'Supabase anonymous key',
  },
  supabaseServiceRole: {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    required: true,
    description: 'Supabase service role key (for server-side access)',
  },
};

console.log('🔍 AI Assistant Setup Diagnostic\n');
console.log('=' .repeat(50));

let allPassed = true;

for (const [key, check] of Object.entries(checks)) {
  const isSet = !!check.value;
  const isValid = isSet && check.value.length > 10;
  
  if (check.required && !isSet) {
    console.log(`❌ ${check.name}: NOT SET`);
    console.log(`   ${check.description}`);
    console.log(`   ⚠️  This is REQUIRED for AI Assistant to work\n`);
    allPassed = false;
  } else if (check.required && !isValid) {
    console.log(`⚠️  ${check.name}: SET BUT INVALID`);
    console.log(`   Value appears to be too short or invalid\n`);
    allPassed = false;
  } else if (check.required) {
    const masked = check.value.substring(0, 10) + '...' + check.value.substring(check.value.length - 4);
    console.log(`✅ ${check.name}: SET`);
    console.log(`   Value: ${masked}\n`);
  } else {
    const status = isSet ? '✅ SET' : '⚠️  NOT SET (optional)';
    console.log(`${status} ${check.name}\n`);
  }
}

console.log('=' .repeat(50));

if (allPassed) {
  console.log('\n✅ All required environment variables are set!');
  console.log('   Your local environment is configured correctly.');
  console.log('\n⚠️  Remember: These must also be set in Vercel production!');
  console.log('   Go to: Vercel → Project → Settings → Environment Variables\n');
} else {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Add missing variables to .env.local');
  console.log('   2. Add the same variables to Vercel production');
  console.log('   3. Redeploy after adding to Vercel\n');
  console.log('📖 See docs/VERCEL_API_KEY_SETUP.md for detailed instructions\n');
}

// Additional checks
console.log('\n🔍 Additional Checks:\n');

// Check if Supabase tables might exist (we can't verify without connection)
console.log('📋 Supabase Tables:');
console.log('   ⚠️  Verify these tables exist in Supabase Dashboard:');
console.log('      - ai_assistant_conversations');
console.log('      - ai_assistant_messages');
console.log('   📄 Migration file: supabase/migrations/20250125_create_ai_assistant_tables.sql\n');

console.log('🌐 Production Checklist:');
console.log('   [ ] ANTHROPIC_API_KEY set in Vercel');
console.log('   [ ] NEXT_PUBLIC_SUPABASE_URL set in Vercel');
console.log('   [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel');
console.log('   [ ] SUPABASE_SERVICE_ROLE_KEY set in Vercel');
console.log('   [ ] Supabase migration run (tables exist)');
console.log('   [ ] Project redeployed after adding variables\n');

process.exit(allPassed ? 0 : 1);

