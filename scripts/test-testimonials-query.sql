-- Quick test query to verify testimonials table exists and is accessible
-- Run this in Supabase SQL Editor to test

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'testimonials'
) AS table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'testimonials'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'testimonials';

-- 4. Try a simple query (should work if RLS is set up correctly)
SELECT * FROM testimonials WHERE published = true LIMIT 1;


