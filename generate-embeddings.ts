/**
 * Generate Embeddings Script
 * 
 * This script generates embeddings for content using Supabase.
 * 
 * Usage:
 * 1. Copy your Supabase service_role key from the Supabase dashboard
 * 2. Set environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * 3. Set environment variable HUGGINGFACE_API_KEY for Hugging Face API
 * 4. Run: npx ts-node generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Use environment variables only!
const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Hugging Face configuration - Use environment variables only!
const HUGGINGFACE_API_KEY: string | undefined = process.env.HUGGINGFACE_API_KEY;
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// Initialize Supabase client with service role key (has admin privileges)
const supabase = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generateEmbedding(text: string): Promise<any> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY environment variable is not set');
  }

  // Truncate text if too long (HF free tier has limits)
  const truncatedText = text.substring(0, 5000);
  
  const response = await fetch(
    `https://router.huggingface.co/models/${EMBEDDING_MODEL}`,
    {
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: truncatedText,
        options: { wait_for_model: true }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
}

async function processGenres(): Promise<void> {
  console.log('Starting embedding generation...');
  console.log(`Using model: ${EMBEDDING_MODEL}`);
  console.log(`Using new HF Router API\n`);

  // Fetch all genres
  const { data: genres, error } = await supabase
    .from('rws_genre_library')
    .select('id, genre_name, content');

  if (error) {
    console.error('Error fetching genres:', error);
    return;
  }

  if (!genres) {
    console.error('No genres found');
    return;
  }

  console.log(`Found ${genres.length} genres to process\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const genre of genres) {
    try {
      console.log(`Processing: ${genre.genre_name}...`);
      
      // Generate embedding from the content
      const embedding = await generateEmbedding(genre.content);
      
      // Update the row with the embedding
      const { error: updateError } = await supabase
        .from('rws_genre_library')
        .update({ embedding })
        .eq('id', genre.id);

      if (updateError) {
        console.error(`❌ Error updating ${genre.genre_name}:`, updateError);
        errorCount++;
      } else {
        console.log(`✓ Successfully updated ${genre.genre_name}`);
        successCount++;
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Error processing ${genre.genre_name}:`, errorMessage);
      errorCount++;
      // Wait longer on error
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n=== Embedding Generation Summary ===');
  console.log(`✓ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`Total: ${genres.length}`);
}

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.log('\n📋 Setup instructions:');
  console.log('1. Get your Supabase URL and service_role key from the dashboard');
  console.log('2. Set environment variables:');
  console.log('   export SUPABASE_URL=your_supabase_url');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('   export HUGGINGFACE_API_KEY=your_huggingface_api_key');
  console.log('\n⚠️  Note: Never commit your API keys to version control!');
  console.log('   Use .env.local file (already in .gitignore)');
  process.exit(1);
}

if (!HUGGINGFACE_API_KEY) {
  console.error('❌ Error: Missing HUGGINGFACE_API_KEY environment variable');
  console.log('Set it with: export HUGGINGFACE_API_KEY=your_api_key');
  process.exit(1);
}

processGenres()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Script failed:', errorMessage);
    process.exit(1);
  });
