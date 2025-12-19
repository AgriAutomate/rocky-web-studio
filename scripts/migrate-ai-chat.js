#!/usr/bin/env node

/**
 * Rocky Web Studio / AI Chat Support Migration Script
 * 
 * This script helps verify and run the AI chat support database migration.
 * 
 * Usage:
 *   node scripts/migrate-ai-chat.js verify  - Check if tables exist
 *   node scripts/migrate-ai-chat.js info    - Show migration info
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20251219_create_ai_chat_support.sql');

function showInfo() {
  console.log('========================================');
  console.log('  AI Chat Support Migration');
  console.log('  Rocky Web Studio');
  console.log('========================================');
  console.log('');
  console.log('Migration File:', MIGRATION_FILE);
  console.log('');
  
  if (fs.existsSync(MIGRATION_FILE)) {
    const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
    const tables = [
      'faq_knowledge_base',
      'chat_conversations',
      'chat_messages',
      'chat_escalations'
    ];
    
    console.log('Tables to be created:');
    tables.forEach(table => {
      const exists = sql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`);
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    });
    
    console.log('');
    console.log('To run migration:');
    console.log('  1. Open Supabase Dashboard → SQL Editor');
    console.log('  2. Copy contents of:', MIGRATION_FILE);
    console.log('  3. Paste and execute');
    console.log('');
    console.log('Or use psql:');
    console.log(`  psql "$DATABASE_URL" -f ${MIGRATION_FILE}`);
  } else {
    console.log('❌ Migration file not found:', MIGRATION_FILE);
  }
}

function showVerify() {
  console.log('========================================');
  console.log('  Verify AI Chat Tables');
  console.log('========================================');
  console.log('');
  console.log('Run this SQL in Supabase SQL Editor:');
  console.log('');
  console.log(`
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('faq_knowledge_base', 'chat_conversations', 'chat_messages', 'chat_escalations')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('faq_knowledge_base', 'chat_conversations', 'chat_messages', 'chat_escalations')
ORDER BY table_name;
  `);
  console.log('');
  console.log('Expected result: 4 rows, all with status "✓ EXISTS"');
}

const command = process.argv[2] || 'info';

switch (command) {
  case 'verify':
    showVerify();
    break;
  case 'info':
  default:
    showInfo();
    break;
}
